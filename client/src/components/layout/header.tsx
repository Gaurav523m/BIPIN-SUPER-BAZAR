import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CartIcon from "@/components/ui/cart-icon";
import CartSidebar from "@/components/cart/cart-sidebar";
import LocationModal from "@/components/location/location-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const Header: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch categories
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
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
            <Link href="/" className="flex items-center gap-2">
              <span className="text-primary text-3xl"><i className='bx bx-cart'></i></span>
              <span className="text-xl font-bold">QuickCart</span>
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
          
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-grow mx-8 max-w-2xl">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for groceries, vegetables, fruits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-300"
                />
                <Button 
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <i className='bx bx-search text-xl'></i>
                </Button>
              </div>
            </form>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-6">
            <button 
              className="hidden md:flex items-center gap-1 text-gray-700 hover:text-primary"
              onClick={handleUserMenuClick}
            >
              <i className='bx bx-user text-xl'></i>
              <span className="text-sm font-medium">Account</span>
            </button>
            
            <button 
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <CartIcon />
            </button>
          </div>
        </div>
        
        {/* Mobile Search (Only visible on mobile) */}
        <div className="md:hidden px-3 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-300"
              />
              <Button 
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <i className='bx bx-search text-xl'></i>
              </Button>
            </div>
          </form>
        </div>
        
        {/* Category Navigation */}
        <nav className="bg-white border-t overflow-x-auto whitespace-nowrap px-3 py-2 scrollbar-hide">
          <div className="flex gap-6">
            {isLoading ? (
              // Skeleton loading state
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="h-6 w-24 animate-pulse bg-gray-200 rounded"></div>
              ))
            ) : (
              categories?.map((category) => (
                <Link 
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="flex flex-col items-center gap-1 min-w-fit pb-1 border-b-2 border-transparent hover:border-primary"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              ))
            )}
          </div>
        </nav>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
      
      {/* Location Modal */}
      <LocationModal isOpen={isLocationModalOpen} onClose={toggleLocationModal} />
    </header>
  );
};

export default Header;
