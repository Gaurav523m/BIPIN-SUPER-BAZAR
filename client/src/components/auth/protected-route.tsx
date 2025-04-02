import { ReactNode, useEffect } from "react";
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
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    // If admin-only route and user is not an admin, redirect to home
    if (adminOnly && user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user, adminOnly, setLocation]);
  
  // Show loading indicator while checking auth status
  if (!isAuthenticated) {
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