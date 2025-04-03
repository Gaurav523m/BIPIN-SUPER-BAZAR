import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Category from "@/pages/category";
import Categories from "@/pages/categories";
import Search from "@/pages/search";
import Checkout from "@/pages/checkout";
import Account from "@/pages/account";
import OrderConfirmation from "@/pages/order-confirmation";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import CompleteProfile from "@/pages/profile/complete";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      {/* Public Customer Routes */}
      <Route path="/category/:categoryId" component={Category} />
      <Route path="/categories" component={Categories} />
      <Route path="/search" component={Search} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Customer Routes */}
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path="/account">
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      </Route>
      <Route path="/order-confirmation/:orderId">
        <ProtectedRoute>
          <OrderConfirmation />
        </ProtectedRoute>
      </Route>
      <Route path="/cart">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path="/profile/complete">
        <ProtectedRoute>
          <CompleteProfile />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Home route - Has to come after other specific routes */}
      <Route path="/" component={Home} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const { checkSession } = useAuth();
  
  // Check for active session when the app first loads
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show header/footer/mobilenav on customer routes */}
      {!isAdminRoute && <Header />}
      <main className={`flex-grow ${!isAdminRoute ? 'container mx-auto px-3 py-4 lg:px-6 lg:py-6' : ''}`}>
        <Router />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileNav />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
