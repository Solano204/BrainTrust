import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Import from the internal lib path to avoid pdf-parse's test harness, which
// reads from the filesystem at module load time and crashes in Vercel serverless.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return (data.text as string) || '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name?.toLowerCase() ?? '';
    const isPdf = file.type.includes('pdf') || filename.endsWith('.pdf');
    console.log(`[PDF Extract] file="${file.name}" type="${file.type}" size=${file.size} isPdf=${isPdf}`);

    if (!isPdf) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await extractTextFromPDF(buffer);

    console.log(`[PDF Extract] result: ${text.length} chars | preview: "${text.slice(0, 200)}"`);

    return NextResponse.json({ text, success: true });
  } catch (error) {
    console.error('[PDF Extract] Error extracting PDF text:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF text' },
      { status: 500 }
    );
  }
}
