import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@shared/schema';

interface CartState {
  cart: (CartItem & { product: Product })[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  calculateTotals: () => { subtotal: number; total: number };
}

// In a real app, this would use the actual user ID from auth
const USER_ID = 1;

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (product: Product, quantity: number = 1) => {
        const { cart } = get();
        const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantity;
          set({ cart: updatedCart });
        } else {
          // Add new item
          const newItem: CartItem & { product: Product } = {
            id: Date.now(),
            userId: USER_ID,
            productId: product.id,
            quantity,
            product
          };
          set({ cart: [...cart, newItem] });
        }
      },
      
      updateQuantity: (id: number, quantity: number) => {
        const { cart } = get();
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          set({ cart: cart.filter(item => item.id !== id) });
        } else {
          // Update quantity
          const updatedCart = cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          );
          set({ cart: updatedCart });
        }
      },
      
      removeFromCart: (id: number) => {
        const { cart } = get();
        set({ cart: cart.filter(item => item.id !== id) });
      },
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      calculateTotals: () => {
        const { cart } = get();
        
        const subtotal = cart.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (price * item.quantity);
        }, 0);
        
        // In this app, total equals subtotal because delivery is free
        const total = subtotal;
        
        return { subtotal, total };
      }
    }),
    {
      name: 'quickcart-cart-store'
    }
  )
);

export default useCartStore;
