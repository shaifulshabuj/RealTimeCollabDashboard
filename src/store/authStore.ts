import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User, UserRole, UserStatus } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, _password: string) => Promise<void>;
  logout: () => void;
  register: (
    name: string, 
    email: string, 
    password: string
  ) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUserPreferences: (
    preferences: Partial<User['preferences']>
  ) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Mock implementations for now - will connect to actual APIs later
const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        login: async (email, _password) => {
          set({ isLoading: true, error: null });
          try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate successful login
            const mockUser: User = {
              id: 'user-1',
              name: 'John Doe',
              email,
              avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
              role: UserRole.MANAGER,
              department: 'Logistics',
              position: 'Team Lead',
              status: UserStatus.ONLINE,
              lastActive: new Date().toISOString(),
              preferences: {
                theme: 'light',
                notifications: true,
                emailNotifications: true,
                language: 'en',
                timeFormat: '24h',
                autoSave: true,
                showPresence: true
              }
            };
            
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: (error as Error).message, 
              isLoading: false, 
              isAuthenticated: false 
            });
          }
        },
        
        logout: () => {
          set({ user: null, isAuthenticated: false });
        },
        
        register: async (name, email, _password) => {
          set({ isLoading: true, error: null });
          try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate successful registration
            const mockUser: User = {
              id: `user-${Date.now()}`,
              name,
              email,
              role: UserRole.EDITOR,
              status: UserStatus.ONLINE,
              lastActive: new Date().toISOString(),
              preferences: {
                theme: 'light',
                notifications: true,
                emailNotifications: true,
                language: 'en',
                timeFormat: '24h',
                autoSave: true,
                showPresence: true
              }
            };
            
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: (error as Error).message, 
              isLoading: false 
            });
          }
        },
        
        updateProfile: async (updates) => {
          set({ isLoading: true, error: null });
          try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set(state => {
              if (state.user) {
                state.user = { ...state.user, ...updates };
              }
              state.isLoading = false;
            });
          } catch (error) {
            set({ 
              error: (error as Error).message, 
              isLoading: false 
            });
          }
        },
        
        updateUserPreferences: async (preferences) => {
          set({ isLoading: true, error: null });
          try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set(state => {
              if (state.user) {
                state.user.preferences = { 
                  ...state.user.preferences, 
                  ...preferences 
                };
              }
              state.isLoading = false;
            });
          } catch (error) {
            set({ 
              error: (error as Error).message, 
              isLoading: false 
            });
          }
        },
        
        checkAuth: async () => {
          set({ isLoading: true });
          try {
            // Mock API call to validate token
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulate checking if user is authenticated
            const isAuthenticated = !!localStorage.getItem('auth_token');
            
            set({ isAuthenticated, isLoading: false });
            return isAuthenticated;
          } catch (error) {
            set({ 
              isAuthenticated: false, 
              isLoading: false 
            });
            return false;
          }
        }
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
);

export default useAuthStore;
