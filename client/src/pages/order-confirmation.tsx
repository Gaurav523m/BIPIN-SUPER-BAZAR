import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams();
  const [_, setLocation] = useLocation();
  
  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
  });
  
  const handleContinueShopping = () => {
    setLocation("/");
  };
  
  const handleViewOrder = () => {
    setLocation("/account");
  };
  
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto mb-6" />
            
            <div className="space-y-4 mb-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
            
            <div className="flex justify-center gap-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-6 text-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-500 text-5xl mb-4">
              <i className='bx bx-error-circle'></i>
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
            <Button onClick={() => setLocation("/")}>
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className='bx bx-check text-green-600 text-3xl'></i>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your order #{order.id} has been placed successfully and will be delivered in approximately {order.estimatedDeliveryTime} minutes.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-left mb-4">
              <h2 className="text-sm font-medium text-gray-500">DELIVERY DETAILS</h2>
              <p className="font-medium">Estimated Delivery Time: {order.estimatedDeliveryTime} minutes</p>
              <p>
                Status: <span className="capitalize">{order.status}</span>
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-left mb-4">
              <h2 className="text-sm font-medium text-gray-500">ORDER SUMMARY</h2>
              <div className="space-y-2 my-2">
                {order.items && order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity} x {item.product.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total Amount</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-left">
              <h2 className="text-sm font-medium text-gray-500">PAYMENT INFORMATION</h2>
              <p>Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                        order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                        'UPI Payment'}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
            <Button onClick={handleViewOrder}>
              View Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;
