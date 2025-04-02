import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import useCart from "@/hooks/use-cart";
import useAddress from "@/hooks/use-address";
import { useToast } from "@/hooks/use-toast";
import LocationModal from "@/components/location/location-modal";
import { Skeleton } from "@/components/ui/skeleton";

const CheckoutPage: React.FC = () => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  // Initialize from localStorage if available, otherwise use default
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const savedMethod = typeof window !== 'undefined' ? localStorage.getItem('selectedPaymentMethod') : null;
    return savedMethod || "card";
  });
  const { cart, calculateTotals, clearCart } = useCart();
  const { selectedAddress, savedAddresses } = useAddress();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { subtotal, total } = calculateTotals();
  
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed!",
        variant: "success",
      });
      setLocation(`/order-confirmation/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to Place Order",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }
    
    if (!cart || cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add some items before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    // Create order data
    const orderData = {
      order: {
        userId: 1, // In a real app, this would be the logged-in user's ID
        addressId: selectedAddress.id,
        totalAmount: total,
        paymentMethod: paymentMethod,
        estimatedDeliveryTime: 10, // 10 minutes delivery
      },
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price
      }))
    };
    
    createOrderMutation.mutate(orderData);
  };
  
  if (createOrderMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Processing Your Order</h2>
        <p className="text-gray-600">Please wait while we process your order...</p>
      </div>
    );
  }
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Delivery Address */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Delivery Address</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  Change
                </Button>
              </div>
              
              {selectedAddress ? (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-1">
                      <i className={`bx ${selectedAddress.type === 'home' ? 'bx-home' : 'bx-building-house'} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {selectedAddress.type === 'home' ? 'Home' : 
                         selectedAddress.type === 'office' ? 'Office' : 'Custom Address'}
                      </h3>
                      <p className="text-gray-600">{selectedAddress.address}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-4 text-center">
                  <p className="text-gray-500 mb-3">No delivery address selected</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    <i className='bx bx-plus mr-2'></i>
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  // Save to localStorage to maintain consistency between screens
                  localStorage.setItem('selectedPaymentMethod', value);
                }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-primary">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-grow cursor-pointer">
                    <div className="flex items-center">
                      <i className='bx bx-credit-card text-lg mr-2'></i>
                      <span>Credit/Debit Card</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-primary">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex-grow cursor-pointer">
                    <div className="flex items-center">
                      <i className='bx bx-mobile text-lg mr-2'></i>
                      <span>UPI Payment</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-primary">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-grow cursor-pointer">
                    <div className="flex items-center">
                      <i className='bx bx-money text-lg mr-2'></i>
                      <span>Cash on Delivery</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Order Items */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold mb-4">Order Items</h2>
              
              {cart && cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                        <span className="absolute top-0 right-0 bg-gray-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-xs text-gray-500">{item.product.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold">
                          ${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${(item.product.discountPrice || item.product.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Your cart is empty</p>
                  <Button 
                    variant="link" 
                    onClick={() => setLocation("/")}
                    className="mt-2"
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2 mb-6">
                <i className='bx bx-time text-green-600 text-xl'></i>
                <div>
                  <p className="font-medium text-green-800">Delivery in 10 minutes</p>
                  <p className="text-xs text-green-700">Lightning fast delivery to your doorstep</p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary text-white py-6 font-medium hover:bg-primary/90"
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || !cart || cart.length === 0}
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Location Modal */}
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};

export default CheckoutPage;
