import React from "react";
import useCart from "@/hooks/use-cart";

interface CartIconProps {
  className?: string;
  showCount?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ 
  className = "",
  showCount = true,
  isMobile = false,
  onClick
}) => {
  const { cart } = useCart();
  
  const itemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer ${className}`}
      aria-label="View cart"
      role="button"
      tabIndex={0}
    >
      <i className='bx bx-shopping-bag text-2xl'></i>
      {showCount && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;
