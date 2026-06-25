import { NextRequest, NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullText = '';

    new PdfReader().parseBuffer(buffer, (err: any, item: any) => {
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await extractTextFromPDF(buffer);

    return NextResponse.json({ text, success: true });
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF text' },
      { status: 500 }
    );
  }
}