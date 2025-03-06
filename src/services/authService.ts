
import { toast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

// Store the current authenticated user
let currentUser: User | null = null;
let serverStartAttempted = false;
let isServerStarting = false;
let autoRefreshCount = 0;
const MAX_AUTO_REFRESH = 3;

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

// Function to check if server is running
const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) return false;
    
    // Check if we got HTML instead of JSON (server not running)
    const responseText = await response.text();
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      return false;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Server health check:', data);
      return true;
    } catch (e) {
      console.error('Invalid JSON in health check:', e);
      return false;
    }
  } catch (e) {
    console.error('Server health check failed:', e);
    return false;
  }
};

// Wait for server to be ready with limited retries
const waitForServer = async (maxAttempts = 5, interval = 2000): Promise<boolean> => {
  if (isServerStarting) {
    return new Promise(resolve => {
      // Check every interval until server responds or max attempts reached
      let attempts = 0;
      const checkInterval = setInterval(async () => {
        attempts++;
        const isRunning = await checkServerStatus();
        
        if (isRunning || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          isServerStarting = false;
          resolve(isRunning);
        }
      }, interval);
    });
  }
  
  return checkServerStatus();
};

// Login function using API
export const login = async (username: string, password: string): Promise<User> => {
  try {
    // Check server status first
    const isServerRunning = await checkServerStatus();
    
    if (!isServerRunning && !serverStartAttempted) {
      serverStartAttempted = true;
      isServerStarting = true;
      
      toast({
        title: "Iniciando servidor",
        description: "Aguarde enquanto o servidor é iniciado automaticamente...",
        variant: "default"
      });
      
      // Wait for server to start with limited attempts
      const serverReady = await waitForServer(5, 2000);
      
      if (!serverReady) {
        toast({
          title: "Servidor não iniciou",
          description: "O servidor não respondeu em tempo hábil. Verifique o console para mais detalhes.",
          variant: "destructive"
        });
        throw new Error('Server failed to start');
      }
    }
    
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
        description: "O servidor está iniciando. Por favor, aguarde alguns segundos e tente novamente.",
        variant: "destructive"
      });
      throw new Error('Server is starting');
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      toast({
        title: "Erro de dados",
        description: "Resposta inválida do servidor. Por favor, aguarde alguns segundos e tente novamente.",
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
    if (error.message !== 'Server is starting' && error.message !== 'Invalid server response') {
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

// Reset the auto-refresh counter
export const resetAutoRefresh = (): void => {
  autoRefreshCount = 0;
};

// Try to auto-refresh, but with a limit
export const shouldAutoRefresh = (): boolean => {
  if (autoRefreshCount < MAX_AUTO_REFRESH) {
    autoRefreshCount++;
    return true;
  }
  return false;
};
