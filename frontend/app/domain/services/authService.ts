// services/authService.ts
import { ROLE_PERMISSIONS } from '@/app/types/authentication';
import { 
  LoginRequest, 
  RegisterRequest, 
  TokenResponse, 
  UserSession,
  AUTH_CONFIG 
} from '@/app/types/authentication';

class AuthService {
  private baseURL = AUTH_CONFIG.API_BASE_URL;

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    if (AUTH_CONFIG.MOCK_MODE) {
      return this.mockLogin(credentials);
    }
    return this.realLogin(credentials);
  }

  async register(userData: RegisterRequest): Promise<TokenResponse> {
    if (AUTH_CONFIG.MOCK_MODE) {
      return this.mockRegister(userData);
    }
    return this.realRegister(userData);
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    if (AUTH_CONFIG.MOCK_MODE) {
      return this.mockRefreshTokens(refreshToken);
    }
    return this.realRefreshTokens(refreshToken);
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    if (AUTH_CONFIG.MOCK_MODE) {
      return this.mockLogout();
    }
    return this.realLogout(accessToken, refreshToken);
  }

  async validateToken(accessToken: string): Promise<UserSession | null> {
    if (AUTH_CONFIG.MOCK_MODE) {
      return this.mockValidateToken(accessToken);
    }
    return this.realValidateToken(accessToken);
  }

  // Mock implementations
  private async mockLogin(credentials: LoginRequest): Promise<TokenResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUsers: Record<string, { password: string; user: UserSession }> = {
      'admin@school.com': {
        password: 'admin123',
        user: {
          id: '1',
          email: 'admin@school.com',
          name: 'System Administrator',
          role: 'admin',
          avatar: '/avatars/admin.png',
          permissions: ['admin:dashboard', 'admin:users', 'admin:settings', 'admin:courses'],
        },
      },
      'teacher@school.com': {
        password: 'teacher123',
        user: {
          id: 'user-001',
          email: 'teacher@school.com',
          name: 'John Mathematics Teacher',
          role: 'teacher',
          avatar: '/avatars/teacher.png',
          permissions: ['teacher:dashboard', 'teacher:classes', 'teacher:students', 'teacher:grades'],
        },
      },
      'student@school.com': {
        password: 'student123',
        user: {
          id: 'student-001',
          email: 'student@school.com',
          name: 'Alice Johnson Student',
          role: 'student',
          avatar: '/avatars/student.png',
          permissions: ['student:dashboard', 'student:courses', 'student:submit', 'student:grades'],
        },
      },
    };

    const userCreds = mockUsers[credentials.email];
    
    if (!userCreds || userCreds.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Generate mock tokens
    const accessToken = this.generateMockToken(userCreds.user, AUTH_CONFIG.ACCESS_TOKEN_EXPIRY);
    const refreshToken = this.generateMockToken(userCreds.user, AUTH_CONFIG.REFRESH_TOKEN_EXPIRY);

    return {
      accessToken,
      refreshToken,
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY / 1000,
      userId: userCreds.user.id,
      user: userCreds.user,
    };
  }

  private async mockRegister(userData: RegisterRequest): Promise<TokenResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: UserSession = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: `/avatars/${userData.role}.png`,
      permissions: ROLE_PERMISSIONS[userData.role],
    };

    const accessToken = this.generateMockToken(newUser, AUTH_CONFIG.ACCESS_TOKEN_EXPIRY);
    const refreshToken = this.generateMockToken(newUser, AUTH_CONFIG.REFRESH_TOKEN_EXPIRY);

    return {
      accessToken,
      refreshToken,
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY / 1000,
      userId: newUser.id,
      user: newUser,
    };
  }

  private async mockRefreshTokens(refreshToken: string): Promise<TokenResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const payload = JSON.parse(atob(refreshToken.split('.')[1]));
    const user: UserSession = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      avatar: payload.avatar,
      permissions: payload.permissions,
    };

    const newAccessToken = this.generateMockToken(user, AUTH_CONFIG.ACCESS_TOKEN_EXPIRY);
    const newRefreshToken = this.generateMockToken(user, AUTH_CONFIG.REFRESH_TOKEN_EXPIRY);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY / 1000,
      userId: user.id,
      user,
    };
  }

  private async mockValidateToken(accessToken: string): Promise<UserSession | null> {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      
      // Check if token is expired
      if (Date.now() >= payload.exp * 1000) {
        return null;
      }

      return {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        avatar: payload.avatar,
        permissions: payload.permissions,
      };
    } catch {
      return null;
    }
  }

  private async mockLogout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Real API implementations
  private async realLogin(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  private async realRegister(userData: RegisterRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  private async realRefreshTokens(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  private async realLogout(accessToken: string, refreshToken: string): Promise<void> {
    await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  private async realValidateToken(accessToken: string): Promise<UserSession | null> {
    const response = await fetch(`${this.baseURL}/auth/validate`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  // Helper method to generate mock JWT tokens
  private generateMockToken(user: UserSession, expiresIn: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + expiresIn) / 1000),
    }));
    const signature = btoa('mock-signature');

    return `${header}.${payload}.${signature}`;
  }
}

export const authService = new AuthService();