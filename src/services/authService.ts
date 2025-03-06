
import { toast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

// API base URL helper
const getApiBaseUrl = (): string => {
  return window.location.hostname === 'localhost' ? 'http://localhost:3005' : '';
};

// Direct API call for authentication
export const loginUser = async (username: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with username:', username);
    
    const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Login error response:', error);
      throw new Error(`Login failed: ${response.status} ${error || 'Unknown error'}`);
    }
    
    // Try to parse the response as JSON
    let userData: User;
    const responseText = await response.text();
    
    try {
      userData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse login response as JSON:', e, 'Response was:', responseText);
      throw new Error('Invalid response format from server');
    }
    
    // Validate the user data
    if (!userData || typeof userData !== 'object' || !userData.id || !userData.username) {
      console.error('Invalid user data received:', userData);
      throw new Error('Invalid user data received from server');
    }
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
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
