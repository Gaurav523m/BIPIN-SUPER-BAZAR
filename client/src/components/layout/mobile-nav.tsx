import React from "react";
import { Link, useLocation } from "wouter";
import CartIcon from "@/components/ui/cart-icon";

const MobileNav: React.FC = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path ? "text-primary" : "text-gray-500 hover:text-primary";
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-4 py-2">
      <div className="flex justify-between items-center">
        <Link href="/" className={`flex flex-col items-center ${isActive("/")}`}>
          <i className='bx bx-home-alt text-xl'></i>
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link href="/categories" className={`flex flex-col items-center ${isActive("/categories")}`}>
          <i className='bx bx-category text-xl'></i>
          <span className="text-xs mt-1">Categories</span>
        </Link>
        
        <Link href="/search" className={`flex flex-col items-center ${isActive("/search")}`}>
          <i className='bx bx-search text-xl'></i>
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-primary">
          <div className="relative">
            <CartIcon isMobile={true} />
          </div>
          <span className="text-xs mt-1">Cart</span>
        </Link>
        
        <Link href="/account" className={`flex flex-col items-center ${isActive("/account")}`}>
          <i className='bx bx-user text-xl'></i>
          <span className="text-xs mt-1">Account</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
