import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Phone login schema
const phoneLoginSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[0-9]{10}$/, "Phone number must be in format +91XXXXXXXXXX")
});

type PhoneLoginValues = z.infer<typeof phoneLoginSchema>;

const LoginForm: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // Phone form
  const phoneForm = useForm<PhoneLoginValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "+91",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: PhoneLoginValues) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      
      // Check if this is a new user or profile is incomplete
      if (data.isNewUser || !data.user.isProfileComplete) {
        toast({
          title: data.isNewUser ? "New Account Created" : "Login Successful",
          description: "Please complete your profile information",
          variant: "default",
        });
        // Redirect to profile completion page
        setLocation("/profile/complete");
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default",
        });
        setLocation("/");
      }
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PhoneLoginValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg border p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {/* Phone Login Form */}
      <Form {...phoneForm}>
        <form onSubmit={phoneForm.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={phoneForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+91XXXXXXXXXX" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your phone number with country code (+91)
                </p>
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-primary text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Verifying..." : "Login with Phone"}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => setLocation("/register")}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;