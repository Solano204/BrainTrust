import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Dynamic import avoids ESM/CJS issues with pdf-parse
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to extract PDF text' },
      { status: 500 }
    );
  }
}