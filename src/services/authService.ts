
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

// Function to get API base URL
const getApiBaseUrl = (): string => {
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3005';
  }
  
  // For production - use relative path to leverage proxy
  return '';
};

// Login function using API
export const login = async (username: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with username:', username);
    
    const baseUrl = getApiBaseUrl();
    const apiUrl = `${baseUrl}/api/auth/login`;
    
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
      const errorText = await response.text();
      console.error('Login failed with status:', response.status);
      console.error('Response body:', errorText);
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error('Invalid content type:', contentType);
      throw new Error("Login failed: Server did not return JSON data");
    }

    const user = await response.json();
    console.log('Login successful:', user);
    
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
