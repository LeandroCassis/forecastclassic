
import { toast } from "@/hooks/use-toast";
import { loginRequest } from "./apiProxy";

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

// Interface for API response data
interface UserResponse {
  id: number;
  username: string;
  nome?: string;
  role?: string;
  [key: string]: any; // For any other properties that might be returned
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
    
    // Usar o loginRequest do apiProxy que é mais robusto
    const response = await loginRequest(username, password);
    
    // Verificar se a requisição foi bem-sucedida
    if (!response.success || !response.data) {
      const errorMsg = response.error || `Erro ${response.status}`;
      console.error('Login failed:', errorMsg);
      throw new Error(`Login failed: ${errorMsg}`);
    }
    
    // Type assertion to help TypeScript understand the structure
    const userData = response.data as UserResponse;
    console.log('Login successful:', userData);
    
    // Verificar se os campos necessários estão presentes
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data received (not an object):', userData);
      throw new Error("Login failed: Invalid user data format received from server");
    }
    
    if (!userData.id || !userData.username) {
      console.error('Invalid user data received (missing required fields):', userData);
      throw new Error("Login failed: Invalid user data received from server");
    }
    
    // Garantir que todos os campos estão presentes, mesmo com valores padrão
    const normalizedUser: User = {
      id: userData.id,
      username: userData.username,
      nome: userData.nome || username, // Use o username se nome estiver ausente
      role: userData.role || 'user'
    };
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    currentUser = normalizedUser;
    
    return normalizedUser;
  } catch (error) {
    console.error('Login error:', error);
    toast({ 
      title: 'Login falhou', 
      description: (error as Error).message || 'Falha ao conectar com o servidor de autenticação',
      variant: 'destructive'
    });
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('user');
  currentUser = null;
};
