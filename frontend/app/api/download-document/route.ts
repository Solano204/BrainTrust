import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Se requiere el parámetro url' }, { status: 400 });
  }

  let downloadUrl = url;
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
  }

  return NextResponse.redirect(downloadUrl);
}
