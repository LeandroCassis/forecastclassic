
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, isAuthenticated, getCurrentUser, login, logout } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    try {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err instanceof Error ? err : new Error('Authentication error'));
      toast({
        title: 'Authentication Error',
        description: 'Failed to restore your session. Please log in again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await login(username, password);
      setUser(loggedInUser);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${loggedInUser.name}!`,
      });
    } catch (err) {
      console.error('Login error in context:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login: handleLogin,
        logout: handleLogout,
        loading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
