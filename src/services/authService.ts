import { toast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

// Store the current authenticated user
let currentUser: User | null = null;

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (currentUser) return true;
  
  // Check if we have user info in localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return true;
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  return false;
};

// Get the current user
export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return currentUser;
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  return null;
};

// Login function using API
export const login = async (username: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with username:', username);
    
    // Always use /api prefix for consistency
    const apiUrl = '/api/auth/login';
    
    console.log('Login request to API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
      cache: 'no-cache',
    });

    if (!response.ok) {
      // Tentar ler a resposta, independentemente do formato
      let errorMessage;
      try {
        // Primeiro, tenta como JSON
        const errorData = await response.json();
        errorMessage = errorData.error || `Erro ${response.status}`;
      } catch (e) {
        // Se falhar, tenta como texto
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Erro ${response.status}`;
        } catch (textError) {
          // Se ambos falharem, usa o código de status
          errorMessage = `Erro ${response.status}`;
        }
      }
      
      console.error('Login failed with status:', response.status);
      console.error('Error message:', errorMessage);
      throw new Error(`Login failed: ${errorMessage}`);
    }

    // Obter o tipo de conteúdo, mas não lançar erro imediato se não for JSON
    const contentType = response.headers.get("content-type");
    console.log('Response content type:', contentType);
    
    // Tenta analisar como JSON, com fallback para que seja mais robusto
    let user;
    try {
      user = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      
      // Tentar obter o texto e analisar como JSON
      try {
        const text = await response.text();
        console.log('Response text:', text);
        user = JSON.parse(text);
      } catch (textError) {
        console.error('Failed to parse response text as JSON:', textError);
        throw new Error("Login failed: Server did not return valid user data");
      }
    }
    
    console.log('Login successful:', user);
    
    // Verificar se os campos necessários estão presentes
    if (!user || !user.id || !user.username) {
      console.error('Invalid user data received:', user);
      throw new Error("Login failed: Invalid user data received from server");
    }
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(user));
    currentUser = user;
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    toast({ 
      title: 'Login falhou', 
      description: error.message || 'Falha ao conectar com o servidor de autenticação'
    });
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('user');
  currentUser = null;
};
