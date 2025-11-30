import { useState, useEffect, useCallback } from 'react';
import { User, AuthCredentials } from '@/types/game';
import { authApi } from '@/services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setLoading(true);
    setError(null);
    
    const response = await authApi.login(credentials);
    
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      setError(response.error);
    }
    
    setLoading(false);
    return response;
  }, []);

  const signup = useCallback(async (credentials: AuthCredentials) => {
    setLoading(true);
    setError(null);
    
    const response = await authApi.signup(credentials);
    
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      setError(response.error);
    }
    
    setLoading(false);
    return response;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await authApi.logout();
    setUser(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
}
