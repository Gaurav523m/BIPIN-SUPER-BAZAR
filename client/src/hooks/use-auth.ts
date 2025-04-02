import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@shared/schema";

// Zustand store for authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: "quickcart-auth",
    }
  )
);

// Helper functions to use outside of components
export const getAuthToken = () => useAuth.getState().token;
export const isUserLoggedIn = () => useAuth.getState().isAuthenticated;
export const getCurrentUser = () => useAuth.getState().user;