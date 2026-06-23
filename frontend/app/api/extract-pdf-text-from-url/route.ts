import { NextRequest, NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullText = '';
    new PdfReader().parseBuffer(buffer, (err: unknown, item: { text?: string } | null) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(fullText.trim());
      } else if (item.text) {
        fullText += item.text + ' ';
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json() as { url?: string };

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF from URL' }, { status: 400 });
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('pdf')) {
      return NextResponse.json({ error: 'URL does not point to a PDF' }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractTextFromBuffer(buffer);

    return NextResponse.json({ text, success: true });
  } catch (error) {
    console.error('Error extracting PDF text from URL:', error);
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
  }
}
