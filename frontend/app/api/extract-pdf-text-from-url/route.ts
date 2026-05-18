import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const text = await extractTextFromPDF(buffer);
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
  }
}
