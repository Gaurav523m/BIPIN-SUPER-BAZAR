import React from "react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
      variant: "success",
    });
  };

  const handleClick = () => {
    onViewDetails(product);
  };

  const calculateDiscountPercentage = () => {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return null;
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={product.image}
          alt={product.name} 
          className="w-full h-40 object-cover"
        />
        {product.isOrganic && (
          <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
            Organic
          </span>
        )}
        <button 
          className="absolute top-2 right-2 text-gray-700 hover:text-primary bg-white rounded-full p-1.5 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            toast({
              title: "Feature Coming Soon",
              description: "Save to favorites feature will be available soon!",
              variant: "default",
            });
          }}
        >
          <i className='bx bx-heart'></i>
        </button>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-sm">{product.name}</h3>
          <div className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
            <i className='bx bx-time text-xs'></i> 10 min
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-2">{product.quantity}</p>

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold">₹{(product.discountPrice ?? product.price).toFixed(2)}</span>
            {product.discountPrice && (
              <span className="text-xs text-gray-500 line-through ml-1">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <Button
            size="icon"
            className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors"
            onClick={handleAddToCart}
          >
            <i className='bx bx-plus'></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;