// utils/tokenManager.ts
'use server';

import { cookies } from 'next/headers';
import { UserSession } from '@/app/types/authentication';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const USER_DATA_COOKIE = 'user_data';

export async function setTokens(
  accessToken: string, 
  refreshToken: string, 
  userId: string, 
  userData: UserSession
) {
  const cookieStore = await cookies();
  
  // Set access token (short-lived)
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });
  
  // Set refresh token (long-lived)
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  
  // Store user data (not HttpOnly so client can read)
  cookieStore.set(USER_DATA_COOKIE, JSON.stringify(userData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

export async function getUserData(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get(USER_DATA_COOKIE)?.value;
  return userData ? JSON.parse(userData) : null;
}

export async function clearTokens() {
  const cookieStore = await cookies();
  
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_DATA_COOKIE);
}