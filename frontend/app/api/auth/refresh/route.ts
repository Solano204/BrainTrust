
import { getRefreshToken, setTokens } from '@/app/utils/tokenManager';
import { authService } from '@/app/domain/services/authService';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token available' },
        { status: 401 }
      );
    }
    
    const tokenResponse = await authService.refreshTokens(refreshToken);

    await setTokens(
      tokenResponse.accessToken,
      tokenResponse.refreshToken,
      tokenResponse.userId,
      tokenResponse.user
    );
    
    return NextResponse.json({
      success: true,
      accessToken: tokenResponse.accessToken,
      user: tokenResponse.user,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Token refresh failed' },
      { status: 401 }
    );
  }
}