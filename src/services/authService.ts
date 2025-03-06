
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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    // Check if we received HTML instead of JSON (server not running)
    const responseText = await response.text();
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      toast({
        title: "Erro de conexão",
        description: "O servidor não está rodando. Por favor, execute 'npm start' no terminal.",
        variant: "destructive"
      });
      throw new Error('Server is not running');
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      toast({
        title: "Erro de dados",
        description: "Resposta inválida do servidor. Por favor, verifique se o servidor está rodando corretamente.",
        variant: "destructive"
      });
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(data));
    currentUser = data;
    
    return data;
  } catch (error) {
    if (error.message !== 'Server is not running' && error.message !== 'Invalid server response') {
      toast({ 
        title: 'Erro no login', 
        description: error.message,
        variant: "destructive"
      });
    }
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('user');
  currentUser = null;
};
