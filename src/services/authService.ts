
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
    console.log('Attempting login with:', { username, password });
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login response error:', errorText);
      throw new Error('Login failed: ' + errorText);
    }

    const responseText = await response.text();
    console.log('Login response text:', responseText);
    
    // Try to parse the response as JSON
    let user;
    try {
      user = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid server response format');
    }
    
    if (!user || !user.id) {
      throw new Error('Invalid user data received');
    }
    
    // Map the server response to our User interface
    const userData: User = {
      id: user.id,
      username: user.username,
      name: user.nome || user.name || '',
      role: user.role || 'user',
    };
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(userData));
    currentUser = userData;
    
    return userData;
  } catch (error) {
    console.error('Login error details:', error);
    toast({ 
      title: 'Login failed', 
      description: error.message || 'An error occurred during login' 
    });
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('user');
  currentUser = null;
};
