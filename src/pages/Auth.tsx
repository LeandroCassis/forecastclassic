
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center">S&OP GRUPO CLASSIC</CardTitle>
          <CardDescription className="text-center">
            Login to access the forecast management system
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 mx-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
