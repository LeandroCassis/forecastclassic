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
  // Verificar se estamos em ambiente de produção (como Lovable.dev)
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  // Verificar se estamos especificamente no Lovable.dev
  const isLovableDev = window.location.hostname.includes('lovable.dev');
  
  if (isLovableDev) {
    // No Lovable.dev, é importante usar o próprio domínio como base
    return '';
  } else if (isProduction) {
    // Em outros ambientes de produção
    return '';
  } else {
    // Em desenvolvimento local
    return 'http://localhost:3005';
  }
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
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
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
    mode: 'cors'
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
      
      // Verificar headers para diagnóstico
      console.log('Response headers:', 
        Array.from(response.headers.entries())
          .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})
      );
      
      // Obter resposta como texto primeiro para diagnóstico
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Processar resposta
      if (responseText) {
        try {
          // Tentar converter para JSON
          const data = JSON.parse(responseText);
          
          return {
            data,
            status: response.status,
            success: response.ok
          };
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          
          // Se não for JSON, retornar o texto como erro
          return {
            error: responseText,
            status: response.status,
            success: false
          };
        }
      } else {
        // Resposta vazia
        return {
          status: response.status,
          success: response.ok,
          error: response.ok ? undefined : 'Empty response'
        };
      }
    } catch (error) {
      console.error(`Network error (attempt ${attempt})`, error);
      
      // Na última tentativa, propagar o erro
      if (attempt === maxRetries) {
        return {
          error: (error as Error).message,
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
export async function loginRequest(username: string, password: string) {
  return apiRequest('/api/auth/login', 'POST', { username, password }, 3);
}