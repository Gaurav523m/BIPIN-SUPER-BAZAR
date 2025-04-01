import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import useCart from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  if (!product) return null;
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to your cart`,
        variant: "success",
      });
      onClose();
    }
  };
  
  const calculateSavePercentage = () => {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return null;
  };
  
  const savePercentage = calculateSavePercentage();
  
  const nutritionInfo = product.nutritionInfo as Record<string, string> | null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-1/2 relative">
            <button 
              className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md text-gray-500 hover:text-gray-700 z-10"
              onClick={onClose}
            >
              <i className='bx bx-x text-xl'></i>
            </button>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="md:w-1/2 p-6 flex flex-col max-h-[90vh] md:overflow-y-auto">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  {product.isOrganic && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Organic</span>
                  )}
                  <h2 className="text-2xl font-bold mt-2">{product.name}</h2>
                </div>
                <button 
                  className="text-gray-700 hover:text-primary"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Save to favorites feature will be available soon!",
                      variant: "default",
                    });
                  }}
                >
                  <i className='bx bx-heart text-2xl'></i>
                </button>
              </div>
              <p className="text-gray-500 mt-1">{product.quantity}</p>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="text-2xl font-bold">${product.discountPrice ?? product.price}</div>
              {product.discountPrice && (
                <>
                  <div className="text-sm text-gray-500 line-through">${product.price}</div>
                  <div className="bg-green-100 text-green-800 text-xs font-bold py-1 px-2 rounded ml-2">
                    SAVE {savePercentage}%
                  </div>
                </>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">About</h3>
              <p className="text-gray-600 text-sm">
                {product.description}
              </p>
            </div>
            
            {nutritionInfo && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Nutritional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(nutritionInfo).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Delivery Information</h3>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                <i className='bx bx-time text-xl'></i>
                <div>
                  <p className="font-medium">10 Minute Delivery</p>
                  <p className="text-sm">Order now for quick delivery</p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    onClick={decrementQuantity}
                  >
                    <i className='bx bx-minus'></i>
                  </button>
                  <span className="w-10 text-center">{quantity}</span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    onClick={incrementQuantity}
                  >
                    <i className='bx bx-plus'></i>
                  </button>
                </div>
                
                <Button 
                  className="flex-grow bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  onClick={handleAddToCart}
                >
                  Add to Cart - ${((product.discountPrice ?? product.price) * quantity).toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
