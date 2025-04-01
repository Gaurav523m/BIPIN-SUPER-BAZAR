import React from "react";
import { useLocation } from "wouter";
import useCart from "@/hooks/use-cart";

interface CartIconProps {
  className?: string;
  showCount?: boolean;
  isMobile?: boolean;
}

const CartIcon: React.FC<CartIconProps> = ({ 
  className = "",
  showCount = true,
  isMobile = false
}) => {
  const { cart } = useCart();
  const [_, setLocation] = useLocation();
  
  const itemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  return (
    <button 
      onClick={() => setLocation(isMobile ? "/cart" : "/")}
      className={`relative ${className}`}
      aria-label="View cart"
    >
      <i className='bx bx-shopping-bag text-2xl'></i>
      {showCount && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
