import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@shared/schema";

// Zustand store for authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token?: string | null) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  needsProfileCompletion: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      
      login: (user, token) => set({ 
        isAuthenticated: true, 
        user, 
        token: token || null,
      }),
      
      setUser: (user) => set({
        user
      }),
      
      needsProfileCompletion: () => {
        const user = get().user;
        return !!user && user.isProfileComplete === false;
      },
      
      logout: async () => {
        try {
          // Call the server-side logout endpoint for session-based auth
          const response = await fetch('/api/auth/logout', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            // Clear local state
            set({ 
              isAuthenticated: false, 
              user: null, 
              token: null 
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state even if server request fails
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null 
          });
        }
      },
      
      checkSession: async () => {
        // Don't check if already authenticated with token
        if (get().isAuthenticated && get().token) {
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/user', {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
              set({ 
                isAuthenticated: true, 
                user: data.user,
                isLoading: false 
              });
              return;
            }
          }
          
          // If we get here, not authenticated
          set({ 
            isAuthenticated: false, 
            user: null, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Session check error:', error);
          set({ 
            isAuthenticated: false, 
            user: null, 
            isLoading: false 
          });
        }
      }
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