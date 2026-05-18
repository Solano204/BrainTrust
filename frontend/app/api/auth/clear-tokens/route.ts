
import { clearTokens } from '@/app/utils/tokenManager';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await clearTokens();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear tokens error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}