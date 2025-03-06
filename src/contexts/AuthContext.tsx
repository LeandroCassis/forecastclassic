
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, isAuthenticated, getCurrentUser, login, logout } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await login(username, password);
      setUser(loggedInUser);
      toast({
        title: "Login realizado com sucesso",
        description: `Bem vindo, ${loggedInUser.name || loggedInUser.username}!`
      });
    } catch (error) {
      console.error('Login error in context:', error);
      // Error is already handled in the auth service
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login: handleLogin,
        logout: handleLogout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
