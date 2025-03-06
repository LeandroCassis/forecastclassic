
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

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Serviço de autenticação não encontrado. Verifique sua conexão com o servidor.');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro no login: ${response.status}`);
      }
    }

    const user = await response.json();
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(user));
    currentUser = user;
    
    return user;
  } catch (error) {
    toast({ 
      title: 'Erro no login', 
      description: error.message || 'Não foi possível conectar ao servidor', 
      variant: "destructive" 
    });
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('user');
  currentUser = null;
};
