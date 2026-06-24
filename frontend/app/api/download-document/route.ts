import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Se requiere el parámetro url' }, { status: 400 });
  }

  const publicId = extractPublicIdFromCloudinaryUrl(url);
  if (!publicId) {
    return NextResponse.redirect(url);
  }

  const dotIndex = publicId.lastIndexOf('.');
  const format = dotIndex !== -1 ? publicId.slice(dotIndex + 1) : 'pdf';
  const publicIdWithoutFormat = dotIndex !== -1 ? publicId.slice(0, dotIndex) : publicId;

  // private_download_url generates a signed API call that bypasses delivery restrictions
  const signedUrl = cloudinary.utils.private_download_url(
    publicIdWithoutFormat,
    format,
    { resource_type: 'raw', attachment: true }
  );

  return NextResponse.redirect(signedUrl);
}

function extractPublicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const afterUpload = parts.slice(uploadIndex + 1);
    const startIdx = afterUpload[0]?.match(/^v\d+$/) ? 1 : 0;
    return afterUpload.slice(startIdx).join('/');
  } catch {
    return null;
  }
}
