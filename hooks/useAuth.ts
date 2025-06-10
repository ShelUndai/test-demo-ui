// hooks/useAuth.ts - React hook for authentication
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    isLoading: true,
  });

  const updateAuthState = useCallback(() => {
    const isAuthenticated = authService.isAuthenticated();
    const username = authService.getUsername();
    
    setAuthState({
      isAuthenticated,
      username,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    // Initial auth check
    authService.validateSession().then(() => {
      updateAuthState();
    });

    // Listen for auth events
    const handleLogout = () => updateAuthState();
    const handleSessionExpired = () => {
      updateAuthState();
      // Optional: show notification
      console.warn('Session expired. Please log in again.');
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, [updateAuthState]);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        updateAuthState();
        return { success: true, username: result.username };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: result.error || `${result.status}: ${result.statusText}` 
        };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, [updateAuthState]);

  const logout = useCallback(() => {
    authService.logout();
    updateAuthState();
  }, [updateAuthState]);

  return {
    ...authState,
    login,
    logout,
  };
};
