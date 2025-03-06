
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
      
      // Verificar o content type da resposta
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server did not return JSON. Content-Type:', contentType);
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 500)); // Log parte da resposta para diagnóstico
        
        return {
          error: 'Server did not return JSON data',
          status: response.status,
          success: false
        };
      }
      
      // Obter resposta como JSON
      const data = await response.json();
      
      return {
        data,
        status: response.status,
        success: response.ok
      };
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
  return apiRequest('/auth/login', 'POST', { username, password }, 3);
}
