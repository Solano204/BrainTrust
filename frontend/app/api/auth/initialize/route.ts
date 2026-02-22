
import { authService } from '@/app/domain/services/authService';
import { getUserData, getAccessToken, getRefreshToken } from '@/app/utils/tokenManager';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await authService.validateToken(accessToken);
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const refreshToken = await getRefreshToken();
    const userData = await getUserData();
    
    return NextResponse.json({
      authenticated: true,
      user: userData || user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    return NextResponse.json({ authenticated: false });
  }
}