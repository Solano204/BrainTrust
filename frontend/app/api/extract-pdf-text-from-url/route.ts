
import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

//pdfjsLib.GlobalWorkerOptions.workerSrc = false as any;

pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const typedArray = new Uint8Array(buffer);

  const loadingTask = pdfjsLib.getDocument({
    data: typedArray,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    const pdfResponse = await fetch(url);
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF from URL');
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await extractTextFromPDF(buffer);

    return NextResponse.json({
      text,
      success: true,
    });
  } catch (error) {
    console.error('Error extracting PDF text from URL:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF text from URL' },
      { status: 500 }
    );
  }
}