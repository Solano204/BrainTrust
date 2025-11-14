import { AUTH_CONFIG, UserRole } from "../types/authentication";

// utils/jwt.ts
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export class JWTUtils {
  // In production, this would verify with your backend or use a proper secret
  static async verifyToken(token: string): Promise<JwtPayload | null> {
    if (AUTH_CONFIG.MOCK_MODE) {
      try {
        // For mock mode, we'll use a simple base64 decode
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload as JwtPayload;
      } catch {
        return null;
      }
    }
    
    // In real mode, verify with your backend
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  static isTokenExpired(payload: JwtPayload): boolean {
    return Date.now() >= payload.exp * 1000;
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}