
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "./apiProxy";

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

// Direct API call for authentication with simplified error handling
export const loginUser = async (username: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with username:', username);
    
    const { data, error, success, status } = await apiRequest<User>(
      '/api/auth/login', 
      'POST', 
      { username, password }
    );
    
    if (!success || !data) {
      const errorMessage = error || 'Falha na autenticação';
      console.error('Login failed:', errorMessage);
      toast({ 
        title: 'Erro no login', 
        description: errorMessage,
        variant: 'destructive'
      });
      throw new Error(errorMessage);
    }
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Login process error:', error);
    toast({ 
      title: 'Erro no login', 
      description: (error as Error).message || 'Falha ao conectar com o servidor de autenticação',
      variant: 'destructive'
    });
    throw error;
  }
};

// Check if a user is authenticated
export const isAuthenticated = (): boolean => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;
    
    const user = JSON.parse(userJson);
    return Boolean(user && user.id && user.username);
  } catch {
    return false;
  }
};

// Get the current authenticated user
export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    if (!user || !user.id || !user.username) {
      localStorage.removeItem('user');
      return null;
    }
    
    return user;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

// Logout function
export const logoutUser = (): void => {
  localStorage.removeItem('user');
  // Redirect to login page if needed
  window.location.href = '/login';
};
