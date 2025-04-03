import React, { useState } from "react";
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
import GoogleLoginButton from "./google-login-button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Username/password login schema
const usernameLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type UsernameLoginValues = z.infer<typeof usernameLoginSchema>;

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
  const [loginMode, setLoginMode] = useState<"username" | "phone">("username");

  // Username/password form
  const usernameForm = useForm<UsernameLoginValues>({
    resolver: zodResolver(usernameLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Phone form
  const phoneForm = useForm<PhoneLoginValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "+91",
    },
  });

  // Common login mutation for both login methods
  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
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

  // Submit handlers for different login methods
  const onUsernameSubmit = (data: UsernameLoginValues) => {
    loginMutation.mutate(data);
  };

  const onPhoneSubmit = (data: PhoneLoginValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg border p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {/* Google Login Button */}
      <div className="mb-4">
        <GoogleLoginButton />
      </div>
      
      {/* Separator */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-xs text-gray-500">OR</span>
        </div>
      </div>
      
      {/* Login Tabs */}
      <Tabs defaultValue="username" onValueChange={(value) => setLoginMode(value as "username" | "phone")}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="username">Username</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        
        {/* Username/Password Login Form */}
        <TabsContent value="username">
          <Form {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
              <FormField
                control={usernameForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={usernameForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        {/* Phone Login Form */}
        <TabsContent value="phone">
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
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
        </TabsContent>
      </Tabs>
      
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