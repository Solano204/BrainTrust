// utils/jwt.ts
import { UserRole } from "@/app/types/authentication";

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export class JWTUtils {
  static decodeToken(token: string): JwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    return Date.now() >= payload.exp * 1000;
  }

  static getTokenExpiry(token: string): number | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;
    
    return payload.exp * 1000; // Convert to milliseconds
  }
}