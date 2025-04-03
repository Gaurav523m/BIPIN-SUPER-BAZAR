import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import useCartStore from '@/store/cart-store';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// This is a wrapper around the cart store that adds API integration
const useCart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Local cart state from store
  const { 
    cart, 
    addToCart: addToCartLocal,
    updateQuantity: updateQuantityLocal,
    removeFromCart: removeFromCartLocal,
    clearCart: clearCartLocal,
    calculateTotals
  } = useCartStore();
  
  // In a real application, this would fetch from a cart endpoint
  // For simplicity, we're just using the local store directly
  
  // Add to cart mutation for API integration
  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number; }) => {
      // In a real app with authentication, this would use the actual user ID
      const userId = 1;
      const payload = {
        userId,
        productId: data.productId,
        quantity: data.quantity
      };
      
      const response = await apiRequest('/api/cart', 'POST', {
        body: JSON.stringify(payload)
      });
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Error Adding to Cart',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });
  
  // Update cart quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async (data: { id: number; quantity: number; }) => {
      const response = await apiRequest(`/api/cart/${data.id}`, 'PATCH', {
        body: JSON.stringify({
          quantity: data.quantity
        })
      });
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Cart',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });
  
  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/cart/${id}`, 'DELETE');
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Error Removing from Cart',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });
  
  // Public methods
  const addToCart = (product: Product, quantity: number = 1) => {
    // Add to local store immediately for UI responsiveness
    addToCartLocal(product, quantity);
    
    // Then sync with backend
    addToCartMutation.mutate({ productId: product.id, quantity });
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    updateQuantityLocal(id, quantity);
    updateQuantityMutation.mutate({ id, quantity });
  };
  
  const removeFromCart = (id: number) => {
    removeFromCartLocal(id);
    removeFromCartMutation.mutate(id);
  };
  
  const clearCart = () => {
    clearCartLocal();
    // Call API endpoint to clear the cart
    fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error('Failed to clear cart on server:', error);
    });
  };
  
  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateTotals,
    isLoading: addToCartMutation.isPending || 
               updateQuantityMutation.isPending || 
               removeFromCartMutation.isPending
  };
};

export default useCart;
