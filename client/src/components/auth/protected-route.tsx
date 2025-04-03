import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * A wrapper component that ensures users are authenticated before accessing the wrapped route.
 * If user is not authenticated, they are redirected to the login page.
 * If adminOnly is true, it will also check if the user has the admin role.
 */
export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, isLoading, checkSession } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  // Check for active session on first render
  useEffect(() => {
    const verifySession = async () => {
      await checkSession();
      setIsChecking(false);
    };
    
    verifySession();
  }, [checkSession]);
  
  useEffect(() => {
    // Only redirect after we've checked the session
    if (!isChecking && !isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    // If admin-only route and user is not an admin, redirect to home
    if (!isChecking && isAuthenticated && adminOnly && user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user, adminOnly, setLocation, isChecking]);
  
  // Show loading indicator while checking auth status
  if (isChecking || isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If admin route but user is not admin
  if (adminOnly && user?.role !== "admin") {
    return null; // Will redirect in the useEffect
  }
  
  // User is authenticated (and has admin role if required)
  return <>{children}</>;
}