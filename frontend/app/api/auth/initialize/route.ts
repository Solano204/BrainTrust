// app/api/auth/initialize/route.ts
import { authService } from '@/app/domain/services/authService';
import { clearTokens, getAccessToken, getRefreshToken } from '@/app/utils/tokenManager';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    
    console.log('accessToken:', accessToken);
    if (!accessToken) {
      return NextResponse.json({ authenticated: false }, { status: 400 });
    }

    // Validate the token
    const user = await authService.validateToken(accessToken);
    
    if (!user) {
      await clearTokens();
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const refreshToken = await getRefreshToken();
    
    return NextResponse.json({
      authenticated: true,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    await clearTokens();
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}