'use client'


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  UserSession, 
  AuthState, 
  UserRole, 
  ROLE_PERMISSIONS,
  AUTH_CONFIG 
  } from '@/app/auth/types/authentication';
import { authService } from '@/app/domain/services/authService';
import { JWTUtils } from '@/app/utils/jwt';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { email: string; password: string; name: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;

  enableMock: (mockUser?: Partial<UserSession>) => void;
  disableMock: () => void;
  isMockActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createMockUser = (overrides?: Partial<UserSession>): UserSession => ({
  id: 'mock-user-id',
  email: 'mock@example.com',
  name: 'Mock User',
  role: 'student',
  permissions: ROLE_PERMISSIONS.student,
  active: true,
  createdAt: new Date().toISOString(),
  ...overrides
});

const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token'
};



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    refreshToken: null,
  });

  const [isMockActive, setIsMockActive] = useState(AUTH_CONFIG.MOCK_MODE);
  const [mockUser, setMockUser] = useState<Partial<UserSession>>({});

  const initializeAuth = useCallback(async () => {

    // if (isMockActive) {
    //   setAuthState({
    //     user: createMockUser(mockUser),
    //     isAuthenticated: true,
    //     isLoading: false,
    //     accessToken: MOCK_TOKENS.accessToken,
    //     refreshToken: MOCK_TOKENS.refreshToken,
    //   });
    //   return;
    // }

    try {
      const response = await fetch('/api/auth/initialize', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user && data.accessToken) {
          setAuthState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
            refreshToken: null,
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isMockActive, mockUser]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.accessToken || isMockActive) return;

    const tokenExpiry = JWTUtils.getTokenExpiry(authState.accessToken);
    if (!tokenExpiry) return;

    const refreshTime = Math.max(tokenExpiry - Date.now() - 60000, 5000);

    const refreshTimer = setTimeout(() => {
      refreshTokens();
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [authState.accessToken, authState.isAuthenticated, isMockActive]);

  const login = async (email: string, password: string) => {

    // if (isMockActive) {
    //   setAuthState({
    //     user: createMockUser({ ...mockUser, email, name: email.split('@')[0] }),
    //     isAuthenticated: true,
    //     isLoading: false,
    //     accessToken: MOCK_TOKENS.accessToken,
    //     refreshToken: MOCK_TOKENS.refreshToken,
    //   });
    //   return { success: true };
    // }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const tokenResponse = await authService.login({ email, password });

      await fetch('/api/auth/set-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userId: tokenResponse.userId,
          userData: tokenResponse.user,
        }),
      });

      setAuthState({
        user: tokenResponse.user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      });

      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role: UserRole }) => {

    // if (isMockActive) {
    //   setAuthState({
    //     user: createMockUser({ ...mockUser, ...userData }),
    //     isAuthenticated: true,
    //     isLoading: false,
    //     accessToken: MOCK_TOKENS.accessToken,
    //     refreshToken: MOCK_TOKENS.refreshToken,
    //   });
    //   return { success: true };
    // }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const tokenResponse = await authService.register(userData);
      
      await fetch('/api/auth/set-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userId: tokenResponse.userId,
          userData: tokenResponse.user,
        }),
      });

      setAuthState({
        user: tokenResponse.user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      });

      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
  try {

    if (authState.accessToken && authState.refreshToken) {
      await authService.logout(authState.accessToken, authState.refreshToken);
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {

    try {
      await fetch('/api/auth/clear-tokens', { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
    

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
    });
  }
};

  const refreshTokens = async (): Promise<boolean> => {

    // if (isMockActive) {
    //   setAuthState(prev => ({
    //     ...prev,
    //     accessToken: MOCK_TOKENS.accessToken,
    //     refreshToken: MOCK_TOKENS.refreshToken,
    //   }));
    //   return true;
    // }

    if (!authState.refreshToken) return false;

    try {
      const tokenResponse = await authService.refreshTokens(authState.refreshToken);
      
      await fetch('/api/auth/set-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userId: tokenResponse.userId,
          userData: tokenResponse.user,
        }),
      });

      setAuthState(prev => ({
        ...prev,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        user: tokenResponse.user,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {

    if (!authState.user) return false;
    return authState.user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const enableMock = (userOverrides?: Partial<UserSession>) => {
    const user = createMockUser(userOverrides);
    setMockUser(userOverrides || {});
    setIsMockActive(true);
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: MOCK_TOKENS.accessToken,
      refreshToken: MOCK_TOKENS.refreshToken,
    });
  };

  const disableMock = () => {
    setIsMockActive(false);
    setMockUser({});
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshTokens,
    hasPermission,
    hasRole,
    // Mock controls
    enableMock,
    disableMock,
    isMockActive,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        accessToken: null,
        refreshToken: null,
        login: async () => ({ success: false, error: 'Not initialized' }),
        register: async () => ({ success: false, error: 'Not initialized' }),
        logout: async () => {},
        refreshTokens: async () => false,
        hasPermission: () => false,
        hasRole: () => false,
        enableMock: () => {},
        disableMock: () => {},
        isMockActive: false,
      } as AuthContextType;
    }

    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};