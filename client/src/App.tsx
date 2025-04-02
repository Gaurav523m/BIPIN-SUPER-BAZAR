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
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  return (
    <Switch>
      {/* Customer Routes - Make sure to use exact matching for paths that might conflict */}
      <Route path="/category/:categoryId" component={Category} />
      <Route path="/categories" component={Categories} />
      <Route path="/search" component={Search} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/account" component={Account} />
      <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
      <Route path="/cart" component={Checkout} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      {/* Home route - Has to come after other specific routes */}
      <Route path="/" component={Home} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
