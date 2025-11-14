// File: utils/tokenManager.ts
'use server';

import { cookies } from 'next/headers';
import { AUTH_CONFIG } from '../types/authentication';

// --- Server Action Functions (Must be async) ---

export async function setTokens(
  accessToken: string, 
  refreshToken: string, 
  userId: string,
  userData?: any
): Promise<void> {
  const cookieStore = cookies(); // cookies() is now guaranteed to be available
  const accessTokenExpires = new Date(Date.now() + AUTH_CONFIG.ACCESS_TOKEN_EXPIRY);
  const refreshTokenExpires = new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY);

  // HttpOnly cookies for security
  (await
        // HttpOnly cookies for security
        cookieStore).set('accessToken', accessToken, {
    expires: accessTokenExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  (await cookieStore).set('refreshToken', refreshToken, {
    expires: refreshTokenExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  (await cookieStore).set('userId', userId, {
    expires: refreshTokenExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  if (userData) {
    (await cookieStore).set('userData', JSON.stringify(userData), {
      expires: refreshTokenExpires,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  return (await cookieStore).get('accessToken')?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = cookies();
  return (await cookieStore).get('refreshToken')?.value || null;
}

export async function getUserId(): Promise<string | null> {
  const cookieStore = cookies();
  return (await cookieStore).get('userId')?.value || null;
}

export async function getUserData(): Promise<any> {
  const cookieStore = cookies();
  const userData = (await cookieStore).get('userData')?.value;
  return userData ? JSON.parse(userData) : null;
}

export async function clearTokens(): Promise<void> {
  const cookieStore = cookies();
  
  (await cookieStore).delete('accessToken');
  (await cookieStore).delete('refreshToken');
  (await cookieStore).delete('userId');
  (await cookieStore).delete('userData');
}

// 💡 The previously non-async function must now be async
export async function isAuthenticated(): Promise<boolean> {
  const accessToken = await getAccessToken(); // Use the exported function
  return !!accessToken;
}