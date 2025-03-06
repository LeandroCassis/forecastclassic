
import { toast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  name: string;
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
    console.log('Attempting login with:', { username });
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login response not OK:', response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    // Try to parse as JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse login response as JSON:', e);
      throw new Error('Invalid server response format');
    }
    
    if (!responseData || !responseData.id) {
      console.error('Invalid user data in response:', responseData);
      throw new Error('Invalid user data in response');
    }
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(responseData));
    currentUser = responseData;
    
    return responseData;
  } catch (error) {
    console.error('Login error details:', error);
    toast({ 
      title: 'Login failed', 
      description: error.message || 'Unable to connect to the server',
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
