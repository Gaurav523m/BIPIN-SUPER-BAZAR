import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, checkSession, isLoading } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for active session on component mount
  useEffect(() => {
    const verifySession = async () => {
      await checkSession();
      setIsCheckingSession(false);
    };
    
    verifySession();
  }, [checkSession]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isCheckingSession && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation, isCheckingSession]);

  // Show loading while checking session
  if (isCheckingSession || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-primary text-3xl"><i className='bx bx-cart'></i></span>
            <span className="text-2xl font-bold">QuickCart</span>
          </div>
          <p className="text-center text-gray-600">
            Log in to access your account and start shopping
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;