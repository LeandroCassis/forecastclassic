
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, isAuthenticated, getCurrentUser, loginUser, logoutUser } from '@/services/authService';

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
    // Check if user is already authenticated on mount
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await loginUser(username, password);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
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
