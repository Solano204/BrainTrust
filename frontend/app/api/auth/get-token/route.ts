// app/api/auth/get-token/route.ts
import { getAccessToken } from '@/app/utils/tokenManager';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json({ accessToken: null });
    }
    
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Get token error:', error);
    return NextResponse.json({ accessToken: null });
  }
}