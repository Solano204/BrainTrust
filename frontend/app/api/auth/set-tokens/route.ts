// app/api/auth/set-tokens/route.ts
import { setTokens } from '@/app/utils/tokenManager';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, userId, userData } = await request.json();
    
    await setTokens(accessToken, refreshToken, userId, userData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set tokens error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}