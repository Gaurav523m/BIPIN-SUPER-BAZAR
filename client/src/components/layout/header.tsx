import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CartIcon from "@/components/ui/cart-icon";
import CartSidebar from "@/components/cart/cart-sidebar";
import LocationModal from "@/components/location/location-modal";
import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import { Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const Header: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if we're on the cart or account page
  const isCartPage = location === "/cart";
  const isAccountPage = location === "/account" || location.startsWith("/account/");

  // Fetch categories
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    onSuccess: (data) => {
      console.log("Categories loaded:", data);
    },
    onError: (error) => {
      console.error("Error loading categories:", error);
    }
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setLocation(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleLocationModal = () => {
    setIsLocationModalOpen(!isLocationModalOpen);
  };

  const handleUserMenuClick = () => {
    setLocation("/account");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 lg:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-primary text-3xl"><i className='bx bx-cart'></i></span>
              <span className="text-xl font-bold">BIPIN SUPER BAZAR</span>
            </Link>
          </div>
          
          {/* Location Selector (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="font-medium">Deliver to:</span>
            <button 
              className="flex items-center gap-1 text-primary font-medium"
              onClick={toggleLocationModal}
            >
              <i className='bx bx-map'></i> 123 Main St, New York
              <i className='bx bx-chevron-down'></i>
            </button>
          </div>
          
          {/* Search Bar (Desktop) - Hide on cart and account pages */}
          {!isCartPage && !isAccountPage && (
            <div className="hidden md:block flex-grow mx-8 max-w-2xl">
              <Search 
                placeholder="Search for groceries, vegetables, fruits..."
                onSearch={handleSearch}
              />
            </div>
          )}
          
          {/* User Actions */}
          <div className="flex items-center gap-6">
            <button 
              className="hidden md:flex items-center gap-1 text-gray-700 hover:text-primary"
              onClick={handleUserMenuClick}
            >
              <i className='bx bx-user text-xl'></i>
              <span className="text-sm font-medium">Account</span>
            </button>
            
            <CartIcon onClick={toggleCart} />
          </div>
        </div>
        
        {/* Mobile Search (Only visible on mobile and not on cart or account page) */}
        {!isCartPage && !isAccountPage && (
          <div className="md:hidden px-3 pb-3">
            <Search 
              placeholder="Search for groceries..."
              onSearch={handleSearch}
            />
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
      
      {/* Location Modal */}
      <LocationModal isOpen={isLocationModalOpen} onClose={toggleLocationModal} />
    </header>
  );
};

export default Header;
