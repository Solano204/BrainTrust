
import { 
  LoginRequest, 
  RegisterRequest, 
  TokenResponse, 
  UserSession,
  AUTH_CONFIG,
  AuthenticationResult,
  CompleteUserDTO,
  UserRole,
  ROLE_PERMISSIONS
} from '@/app/auth/types/authentication';

class AuthService {
  private baseURL = AUTH_CONFIG.API_BASE_URL;

  async login(credentials: LoginRequest): Promise<TokenResponse> {
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

  }

  async validateToken(accessToken: string): Promise<UserSession | null> {
    if (AUTH_CONFIG.MOCK_MODE) {
      return this.mockValidateToken(accessToken);
    }
    return this.realValidateToken(accessToken);
  }

  private async realLogin(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/api/users/authenticate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const result: AuthenticationResult = await response.json();
    
    if (!result.success || !result.user || !result.accessToken || !result.refreshToken) {
      throw new Error(result.failureReason || 'Login failed');
    }

    const userSession: UserSession = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.person?.fullName || result.user.email.split('@')[0],
      role: this.mapRoleStringToUserRole(result.user.role),
      avatar: result.user.person?.imagePath,
      permissions: ROLE_PERMISSIONS[this.mapRoleStringToUserRole(result.user.role)],
      active: result.user.active,
      createdAt: result.user.createdAt,
      studentId: result.user.studentId,
      person: result.user.person,
    };

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn || 900, // 15 minutes default
      userId: result.user.id,
      user: userSession,
    };
  }

  private async realRegister(userData: RegisterRequest): Promise<TokenResponse> {
    const [firstName, ...lastNameParts] = userData.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'Unknown';
    
    const completeUserCommand = {
      firstName,
      lastName,
      gender: userData.gender || 'OTHER',
      phone: userData.phone || '',
      addressStreet: userData.addressStreet || '',
      addressColony: userData.addressColony || '',
      addressMunicipality: userData.addressMunicipality || '',
      addressState: userData.addressState || '',
      addressPostalCode: userData.addressPostalCode || '',
      email: userData.email,
      password: userData.password,
      role: userData.role.toUpperCase() as 'STUDENT' | 'TEACHER' | 'ADMIN',
      userId: '', // Only needed for STUDENT role in your backend
    };

    const response = await fetch(`${this.baseURL}/api/users/register/complete`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(completeUserCommand),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const completeUser: CompleteUserDTO = await response.json();

    return this.realLogin({
      email: userData.email,
      password: userData.password,
    });
  }

  private async realRefreshTokens(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/api/users/refresh-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    const result: AuthenticationResult = await response.json();
    
    if (!result.success || !result.user || !result.accessToken || !result.refreshToken) {
      throw new Error(result.failureReason || 'Token refresh failed');
    }

    const userSession: UserSession = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.person?.fullName || result.user.email.split('@')[0],
      role: this.mapRoleStringToUserRole(result.user.role),
      avatar: result.user.person?.imagePath,
      permissions: ROLE_PERMISSIONS[this.mapRoleStringToUserRole(result.user.role)],
      active: result.user.active,
      createdAt: result.user.createdAt,
      studentId: result.user.studentId,
      person: result.user.person,
    };

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn || 900,
      userId: result.user.id,
      user: userSession,
    };
  }

  private async realLogout(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/users/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }

  private async realValidateToken(accessToken: string): Promise<UserSession | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${this.getUserIdFromToken(accessToken)}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();
      
      return {
        id: userData.id,
        email: userData.email,
        name: userData.person?.fullName || userData.email.split('@')[0],
        role: this.mapRoleStringToUserRole(userData.role),
        avatar: userData.person?.imagePath,
        permissions: ROLE_PERMISSIONS[this.mapRoleStringToUserRole(userData.role)],
        active: userData.active,
        createdAt: userData.createdAt,
        studentId: userData.studentId,
        person: userData.person,
      };
    } catch {
      return null;
    }
  }

  private getUserIdFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub;
    } catch {
      return '';
    }
  }

  private mapRoleStringToUserRole(role: string): UserRole {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'teacher':
        return 'teacher';
      case 'student':
        return 'student';
      default:
        return 'guest';
    }
  }

  private async mockLogin(credentials: LoginRequest): Promise<TokenResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers: Record<string, { password: string; user: UserSession }> = {
      'admin@school.com': {
        password: 'admin123',
        user: {
          id: 'user_001',
          email: 'admin@school.com',
          name: 'System Administrator',
          role: 'admin',
          avatar: 'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=',
          permissions: ['admin:dashboard', 'admin:users', 'admin:settings', 'admin:courses'],
          active: true,
          createdAt: new Date().toISOString(),
        },
      },
      'teacher@school.com': {
        password: 'teacher123',
        user: {
          id: 'user_001',
          email: 'teacher@school.com',
          name: 'John Mathematics Teacher',
          role: 'teacher',
          avatar: 'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=',
          permissions: ['teacher:dashboard', 'teacher:classes', 'teacher:students', 'teacher:grades'],
          active: true,
          createdAt: new Date().toISOString(),
        },
      },
      'student@school.com': {
        password: 'student123',
        user: {
          id: 'user_002',
          email: 'student@school.com',
          name: 'Alice Johnson Student',
          role: 'student',
          avatar: 'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=',
          permissions: ['student:dashboard', 'student:courses', 'student:submit', 'student:grades'],
          active: true,
          createdAt: new Date().toISOString(),
        },
      },
    };

    const userCreds = mockUsers[credentials.email];
    
    if (!userCreds || userCreds.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

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
      active: true,
      createdAt: new Date().toISOString(),
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
      active: true,
      createdAt: new Date().toISOString(),
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
        active: true,
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  private async mockLogout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

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
