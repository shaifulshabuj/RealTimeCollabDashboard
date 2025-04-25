import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { User } from '@/types/user';

interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const storeIsLoading = useAuthStore(state => state.isLoading);
  const storeError = useAuthStore(state => state.error);
  const storeLogin = useAuthStore(state => state.login);
  const storeLogout = useAuthStore(state => state.logout);
  const storeRegister = useAuthStore(state => state.register);
  const storeUpdateProfile = useAuthStore(state => state.updateProfile);
  const storeUpdatePreferences = useAuthStore(state => state.updateUserPreferences);
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        await checkAuth();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, [checkAuth]);
  
  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    
    try {
      await storeLogin(email, password);
      
      // Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [storeLogin, location.state, navigate]);
  
  // Logout handler
  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);
  
  // Register handler
  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    
    try {
      await storeRegister(name, email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [storeRegister, navigate]);
  
  // Update profile handler
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    setError(null);
    
    try {
      await storeUpdateProfile(updates);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [storeUpdateProfile]);
  
  // Update preferences handler
  const updatePreferences = useCallback(async (preferences: Partial<User['preferences']>) => {
    setError(null);
    
    try {
      await storeUpdatePreferences(preferences);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [storeUpdatePreferences]);
  
  return {
    user,
    isAuthenticated,
    isLoading: isLoading || storeIsLoading,
    error: error || storeError,
    login,
    logout,
    register,
    updateProfile,
    updatePreferences
  };
}
