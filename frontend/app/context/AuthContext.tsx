// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  UserSession, 
  AuthState, 
  UserRole, 
  ROLE_PERMISSIONS,
  AUTH_CONFIG 
} from '@/app/types/authentication';
import { authService } from '@/app/domain/services/authService';
import { JWTUtils } from '@/app/utils/jwt';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { email: string; password: string; name: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  // Mock control methods
  enableMock: (mockUser?: Partial<UserSession>) => void;
  disableMock: () => void;
  isMockActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const createMockUser = (overrides?: Partial<UserSession>): UserSession => ({
  id: 'mock-user-id',
  email: 'mock@example.com',
  name: 'Mock User',
  role: 'USER' as UserRole,
  permissions: ROLE_PERMISSIONS.student,
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



  
  const [isMockActive, setIsMockActive] = useState(false);
  const [mockUser, setMockUser] = useState<Partial<UserSession>>({});


  
  // Initialize auth state from cookies and validate tokens
  const initializeAuth = useCallback(async () => {
    // Skip API call if mock is active
    if (isMockActive) {
      setAuthState({
        user: createMockUser(mockUser),
        isAuthenticated: false,
        isLoading: false,
        accessToken: MOCK_TOKENS.accessToken,
        refreshToken: MOCK_TOKENS.refreshToken,
      });
      return;
    }

    try {
      // In a real app, you'd get tokens from HttpOnly cookies via server action
      // For now, we'll use a server action to get initial state
      const response = await fetch('/api/auth/initialize', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const { user, accessToken, refreshToken } = await response.json();
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          accessToken,
          refreshToken,
        });
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

  // Token refresh interval
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.accessToken) return;

    // Skip token refresh logic if mock is active
    if (isMockActive) return;

    const tokenPayload = JWTUtils.decodeToken(authState.accessToken);
    if (!tokenPayload) return;

    // Set up token refresh 1 minute before expiry
    const expiresIn = tokenPayload.exp * 1000 - Date.now();
    const refreshTime = Math.max(expiresIn - 60000, 5000); // Refresh 1 min before expiry

    const refreshTimer = setTimeout(() => {
      refreshTokens();
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [authState.accessToken, authState.isAuthenticated, isMockActive]);

  const login = async (email: string, password: string) => {
    // Skip API call if mock is active
    console.log("MOCK ACTIVE:", isMockActive);
    if (isMockActive) {
      setAuthState({
        user: createMockUser({ ...mockUser, email, name: email.split('@')[0] }),
        isAuthenticated: true,
        isLoading: false,
        accessToken: MOCK_TOKENS.accessToken,
        refreshToken: MOCK_TOKENS.refreshToken,
      });
      return { success: true };
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const tokenResponse = await authService.login({ email, password });
      
      // Store tokens via server action
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

      console.log('Login successful', authState);

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
    // Skip API call if mock is active
    if (isMockActive) {
      setAuthState({
        user: createMockUser({ ...mockUser, ...userData }),
        isAuthenticated: true,
        isLoading: false,
        accessToken: MOCK_TOKENS.accessToken,
        refreshToken: MOCK_TOKENS.refreshToken,
      });
      return { success: true };
    }

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
    // Skip API call if mock is active
    if (isMockActive) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        refreshToken: null,
      });
      return;
    }

    try {
      if (authState.accessToken && authState.refreshToken) {
        await authService.logout(authState.accessToken, authState.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens via server action
      await fetch('/api/auth/clear-tokens', { method: 'POST' });
      
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
    // Skip API call if mock is active
    if (isMockActive) {
      setAuthState(prev => ({
        ...prev,
        accessToken: MOCK_TOKENS.accessToken,
        refreshToken: MOCK_TOKENS.refreshToken,
      }));
      return true;
    }

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

  // Mock control methods
  const enableMock = (userOverrides?: Partial<UserSession>) => {
    const user = createMockUser(userOverrides);
    setMockUser(userOverrides || {});
    setIsMockActive(true);
    setAuthState({
      user,
      isAuthenticated: false,
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
  console.log(context);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

