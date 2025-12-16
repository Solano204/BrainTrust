// app/api/delete-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// app/api/delete-documents-batch/route.ts
export async function DELETE(request: NextRequest) {
  try {
    const { publicIds } = await request.json();

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'No publicIds provided' },
        { status: 400 }
      );
    }

    console.log(`Batch deleting ${publicIds.length} documents from Cloudinary`);

    // Delete multiple resources
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'raw',
      invalidate: true,
    });

    console.log('Batch delete result:', result);

    const deleted = Object.values(result.deleted).filter(
      (status) => status === 'deleted'
    ).length;
    const failed = publicIds.length - deleted;

    return NextResponse.json({ 
      success: true,
      deleted,
      failed,
      details: result.deleted
    });
  } catch (error) {
    console.error('Error batch deleting documents from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to batch delete documents' },
      { status: 500 }
    );
  }
}
