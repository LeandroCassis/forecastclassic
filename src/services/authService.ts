
import { toast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

// Store the current authenticated user
let currentUser: User | null = null;

// Mock user database for testing
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    name: 'Administrador',
    role: 'admin',
    password: 'admin'
  },
  {
    id: 2,
    username: 'leandro.assis@grupoclassic.com.br',
    name: 'Leandro Assis',
    role: 'user',
    password: '840722aA'
  }
];

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

// Mock login function instead of API call
export const login = async (username: string, password: string): Promise<User> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user in mock database
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Usuário ou senha inválidos');
    }
    
    // Create a sanitized user object without the password
    const userData: User = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };
    
    // Store user info in localStorage and memory
    localStorage.setItem('user', JSON.stringify(userData));
    currentUser = userData;
    
    return userData;
  } catch (error) {
    toast({
      title: "Erro de autenticação",
      description: (error as Error).message || "Falha ao realizar login",
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
