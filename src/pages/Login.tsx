
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset error when fields change
    if (error) setError(null);
  }, [username, password]);

  useEffect(() => {
    // Redirect to home if already logged in
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Preencha o usuário e senha para continuar");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await login(username, password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema de S&OP"
      });
      navigate('/');
    } catch (error) {
      // Display the error in the form
      setError(error.message || "Erro ao conectar com o servidor");
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">S&OP GRUPO CLASSIC</h1>
            <p className="text-gray-500 mt-2">Faça login para acessar o sistema</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-800 rounded p-3 mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
