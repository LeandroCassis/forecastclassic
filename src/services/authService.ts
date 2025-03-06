
import { toast } from "@/hooks/use-toast";
import { loginRequest } from "./apiProxy";

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

interface UserResponse {
  id: number | string;
  username: string;
  nome?: string;
  role?: string;
}

// Constants
const USER_STORAGE_KEY = 'user';

// Store the current authenticated user
let currentUser: User | null = null;

// Helper function to safely parse stored user data
const parseStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;
    
    const parsedUser = JSON.parse(storedUser);
    
    // Validate that the parsed object has required fields
    if (
      typeof parsedUser !== 'object' || 
      !parsedUser ||
      typeof parsedUser.id === 'undefined' || 
      typeof parsedUser.username !== 'string'
    ) {
      console.error('Invalid user data in localStorage:', parsedUser);
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    
    return {
      id: Number(parsedUser.id),
      username: String(parsedUser.username),
      nome: String(parsedUser.nome || parsedUser.username),
      role: String(parsedUser.role || 'user')
    };
  } catch (e) {
    console.error('Error parsing stored user:', e);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (currentUser) return true;
  
  // Try to get user from localStorage
  const user = parseStoredUser();
  if (user) {
    currentUser = user;
    return true;
  }
  
  return false;
};

// Get the current user
export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  // Try to get user from localStorage
  const user = parseStoredUser();
  if (user) {
    currentUser = user;
    return user;
  }
  
  return null;
};

// Login function using API
export const login = async (username: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with username:', username);
    
    // Use loginRequest from apiProxy for robust handling
    const response = await loginRequest(username, password);
    
    // Log the full response for debugging
    console.log('Login API response:', JSON.stringify(response, null, 2));
    
    // Check if the request was successful
    if (!response.success || !response.data) {
      const errorMsg = response.error || `Error ${response.status}`;
      console.error('Login failed:', errorMsg);
      throw new Error(`Login failed: ${errorMsg}`);
    }
    
    // Verify if the user data is a valid object
    if (!response.data || typeof response.data !== 'object') {
      console.error('Invalid user data received (not an object):', response.data);
      throw new Error("Login failed: Invalid user data format received from server");
    }
    
    // Extract properties with safe checks
    const userData = response.data as Record<string, any>;
    
    if (userData.id === undefined || userData.username === undefined) {
      console.error('Invalid user data received (missing required fields):', userData);
      throw new Error("Login failed: Invalid user data received from server");
    }
    
    // Ensure all fields are present, even with default values
    const normalizedUser: User = {
      id: Number(userData.id),
      username: String(userData.username),
      nome: userData.nome ? String(userData.nome) : String(userData.username), // Use username if nome is absent
      role: userData.role ? String(userData.role) : 'user'
    };
    
    console.log('Normalized user data:', normalizedUser);
    
    // Store user info in localStorage and memory
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
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
  localStorage.removeItem(USER_STORAGE_KEY);
  currentUser = null;
};
