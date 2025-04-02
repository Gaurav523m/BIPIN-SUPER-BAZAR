import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import useCart from "@/hooks/use-cart";
import { useLocation } from "wouter";
import GroceryBounce from "@/components/ui/grocery-bounce";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, calculateTotals } = useCart();
  const [_, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const { subtotal, total } = calculateTotals();

  useEffect(() => {
    // Add or remove overflow hidden from body when cart is open/closed
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Load payment method from localStorage if available
      const savedMethod = localStorage.getItem('selectedPaymentMethod');
      if (savedMethod) {
        setPaymentMethod(savedMethod);
      }
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate a short delay before redirecting to checkout
    setTimeout(() => {
      onClose();
      setLocation("/checkout");
    }, 1500);
  };
  
  const incrementQuantity = (id: number, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };
  
  const decrementQuantity = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    } else {
      removeFromCart(id);
    }
  };
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-lg z-50"
            >
              <div className="flex flex-col h-full">
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 border-b flex items-center justify-between"
                >
                  <h2 className="text-lg font-bold">
                    Your Cart ({cart?.reduce((total, item) => total + item.quantity, 0) || 0} items)
                  </h2>
                  <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                    <i className='bx bx-x text-2xl'></i>
                  </button>
                </motion.div>
          
                <div className="flex-grow overflow-y-auto p-4">
                  {cart && cart.length > 0 ? (
                    cart.map((item) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 mb-4 pb-4 border-b"
                      >
                        <img 
                          src={item.product.image || ""} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-grow">
                          <h3 className="text-sm font-medium">{item.product.name}</h3>
                          <p className="text-xs text-gray-500">{item.product.quantity}</p>
                          <div className="mt-1 text-primary text-sm font-bold">
                            ${(item.product.discountPrice || item.product.price).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex items-center border rounded-full overflow-hidden">
                          <button 
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            onClick={() => decrementQuantity(item.id, item.quantity)}
                          >
                            <i className='bx bx-minus'></i>
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            onClick={() => incrementQuantity(item.id, item.quantity)}
                          >
                            <i className='bx bx-plus'></i>
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-gray-400 text-5xl mb-4"
                      >
                        <i className='bx bx-cart'></i>
                      </motion.div>
                      <p className="text-gray-500 mb-1">Your cart is empty</p>
                      <p className="text-sm text-gray-400 mb-4">Add items to get started</p>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="my-4"
                      >
                        <GroceryBounce isOpen={true} />
                      </motion.div>
                      
                      <Button 
                        className="mt-4 bg-primary text-white"
                        onClick={() => {
                          onClose();
                          setLocation("/");
                        }}
                      >
                        Browse Products
                      </Button>
                    </div>
                  )}
                  
                  {cart && cart.length > 0 && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4"
                      >
                        <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                          <i className='bx bx-check-circle text-green-500 text-xl'></i>
                          <div>
                            <p className="text-sm font-medium text-green-800">Free delivery on this order!</p>
                            <p className="text-xs text-green-700">Delivery in 10 minutes</p>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Payment Method Section */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 pb-2"
                      >
                        <h3 className="text-md font-bold mb-3">Payment Method</h3>
                        
                        <RadioGroup 
                          value={paymentMethod} 
                          onValueChange={(value) => {
                            setPaymentMethod(value);
                            // Save to localStorage to maintain consistency between screens
                            localStorage.setItem('selectedPaymentMethod', value);
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-2 cursor-pointer hover:border-primary">
                            <RadioGroupItem value="card" id="cart-card" />
                            <Label htmlFor="cart-card" className="flex-grow cursor-pointer">
                              <div className="flex items-center">
                                <i className='bx bx-credit-card text-lg mr-2'></i>
                                <span className="text-sm">Credit/Debit Card</span>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border rounded-lg p-2 cursor-pointer hover:border-primary">
                            <RadioGroupItem value="upi" id="cart-upi" />
                            <Label htmlFor="cart-upi" className="flex-grow cursor-pointer">
                              <div className="flex items-center">
                                <i className='bx bx-mobile text-lg mr-2'></i>
                                <span className="text-sm">UPI Payment</span>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border rounded-lg p-2 cursor-pointer hover:border-primary">
                            <RadioGroupItem value="cod" id="cart-cod" />
                            <Label htmlFor="cart-cod" className="flex-grow cursor-pointer">
                              <div className="flex items-center">
                                <i className='bx bx-money text-lg mr-2'></i>
                                <span className="text-sm">Cash on Delivery</span>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </motion.div>
                    </>
                  )}
                </div>
                
                {cart && cart.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 border-t bg-gray-50"
                  >
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {isCheckingOut ? (
                      <div className="flex flex-col items-center py-2">
                        <p className="text-primary font-medium mb-2">Getting your groceries ready...</p>
                        <GroceryBounce isOpen={true} />
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;
