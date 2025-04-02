import { create } from 'zustand';
import { User, Product, Category, Order, Offer } from '@shared/schema';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

interface AdminState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Dashboard stats
  dashboardStats: DashboardStats;
  setDashboardStats: (stats: DashboardStats) => void;
  
  // Selected items for editing
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  
  selectedOffer: Offer | null;
  setSelectedOffer: (offer: Offer | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Dashboard stats
  dashboardStats: {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  },
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  
  // Selected items
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  
  selectedOffer: null,
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
}));