import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Se requiere el parámetro url' }, { status: 400 });
  }

  return NextResponse.redirect(url);
}
