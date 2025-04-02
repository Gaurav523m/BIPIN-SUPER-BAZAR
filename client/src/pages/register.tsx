import React, { useEffect } from "react";
import { useLocation } from "wouter";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";

const RegisterPage: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-primary text-3xl"><i className='bx bx-cart'></i></span>
            <span className="text-2xl font-bold">QuickCart</span>
          </div>
          <p className="text-center text-gray-600">
            Create an account to enjoy fast delivery and exclusive offers
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;