import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') ?? 'documento';

  if (!url) {
    return NextResponse.json({ error: 'Se requiere el parámetro url' }, { status: 400 });
  }

  const upstream = await fetch(url);

  if (!upstream.ok) {
    return NextResponse.json({ error: 'No se pudo obtener el archivo' }, { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
