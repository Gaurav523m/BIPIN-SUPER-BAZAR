import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';

const GoogleLoginButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 mt-2"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <FcGoogle size={20} />
      <span>{isLoading ? 'Redirecting...' : 'Continue with Google'}</span>
    </Button>
  );
};

export default GoogleLoginButton;