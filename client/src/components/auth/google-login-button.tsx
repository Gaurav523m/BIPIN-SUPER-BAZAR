import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const GoogleLoginButton: React.FC = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleGoogleLogin = () => {
    // Simulate Google login with mock user data
    const mockGoogleUser = {
      id: 999,
      username: 'googleuser',
      password: 'encrypted-password-not-visible', // This is needed for TypeScript
      name: 'Google User',
      email: 'user@gmail.com',
      phone: null,
      role: 'customer',
      createdAt: new Date(),
    };
    
    // Generate a mock token
    const mockToken = 'google-auth-token-' + Math.random().toString(36).substring(2);
    
    // Log in the user
    auth.login(mockGoogleUser, mockToken);
    
    toast({
      title: 'Google Login Successful',
      description: 'Welcome, Google User!',
      variant: 'default',
    });
    
    // Redirect to homepage
    setLocation('/');
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 mt-2"
      onClick={handleGoogleLogin}
    >
      <FcGoogle size={20} />
      <span>Continue with Google</span>
    </Button>
  );
};

export default GoogleLoginButton;