
/**
 * API Proxy para lidar com ambientes específicos como Lovable.dev
 * Este arquivo contém funções para facilitar a comunicação com o backend
 * em diferentes ambientes de execução.
 */

// Tipos de requisição suportados
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Interface para o resultado de uma requisição
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

/**
 * Determina a URL base da API com base no ambiente atual
 */
export function getApiBaseUrl(): string {
  // No ambiente de desenvolvimento Lovable o endpoint da API é relativo
  return '/api';
}

/**
 * Função para realizar requisições HTTP com suporte a retry e tratamento de erros
 */
export async function apiRequest<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: any,
  maxRetries: number = 2
): Promise<ApiResponse<T>> {
  // Garantir que o endpoint começa com / se necessário
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${getApiBaseUrl()}${normalizedEndpoint}`;
  
  // Log verboso da requisição para diagnóstico
  console.log(`API Request: ${method} ${url}`, body ? { body } : '');
  
  // Configuração básica da requisição
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    cache: 'no-cache',
  };
  
  // Adicionar corpo se necessário
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  // Realizar tentativas de requisição
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        // Aumentar o tempo de espera exponencialmente
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
      
      const response = await fetch(url, options);
      console.log(`API Response: ${response.status} from ${url}`);
      
      // Log do corpo da resposta para debug
      let responseText = '';
      try {
        responseText = await response.clone().text();
        console.log(`Response body: ${responseText.substring(0, 1000)}`);
      } catch (e) {
        console.error('Error reading response text:', e);
      }
      
      // Verificar se o corpo está vazio
      if (!responseText.trim()) {
        console.warn('Empty response body');
        return {
          status: response.status,
          success: response.ok,
          error: response.ok ? undefined : 'Empty response from server'
        };
      }
      
      // Tentar analisar como JSON
      try {
        const data = JSON.parse(responseText);
        return {
          data,
          status: response.status,
          success: response.ok,
          error: !response.ok ? (data.error || `Error ${response.status}`) : undefined
        };
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Se não for JSON válido e a resposta não estiver OK, retornar erro
        if (!response.ok) {
          return {
            error: `Invalid JSON response: ${responseText.substring(0, 100)}...`,
            status: response.status,
            success: false
          };
        }
        
        // Se não for JSON válido, mas a resposta estiver OK, tentar retornar como texto
        return {
          data: { text: responseText } as any,
          status: response.status,
          success: true
        };
      }
    } catch (networkError) {
      console.error(`Network error (attempt ${attempt}):`, networkError);
      
      // Na última tentativa, propagar o erro
      if (attempt === maxRetries) {
        return {
          error: `Network error: ${(networkError as Error).message}`,
          status: 0, // Código 0 indica erro de rede
          success: false
        };
      }
    }
  }
  
  // Nunca deve chegar aqui, mas o TypeScript precisa
  return {
    error: 'Request failed after retries',
    status: 0,
    success: false
  };
}

/**
 * Função específica para autenticação que lida com casos especiais
 */
export async function loginRequest(username: string, password: string): Promise<ApiResponse<any>> {
  console.log(`Attempting login for user: ${username}`);
  
  try {
    const response = await apiRequest('/auth/login', 'POST', { username, password }, 2);
    
    console.log('Login response:', response);
    
    // Garantir que sempre retornamos um objeto com a mesma estrutura
    return {
      data: response.data,
      error: response.error,
      status: response.status,
      success: response.success
    };
  } catch (error) {
    console.error('Login request error:', error);
    return {
      error: `Login failed: ${(error as Error).message}`,
      status: 0,
      success: false
    };
  }
}
