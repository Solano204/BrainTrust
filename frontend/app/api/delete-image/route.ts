
// Optional: Delete image endpoint

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'No publicId provided' },
        { status: 400 }
      );
    }

    console.log('Deleting image from Cloudinary:', publicId);

    // Delete from Cloudinary (for images, use 'image' resource type)
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image', // For images
      invalidate: true, // Invalidate CDN cache
    });

    console.log('Cloudinary delete result:', result);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({ 
        success: true, 
        result: result.result,
        message: result.result === 'ok' 
          ? 'Image deleted successfully' 
          : 'Image not found (may already be deleted)'
      });
    }

    return NextResponse.json(
      { error: 'Failed to delete image', result },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
