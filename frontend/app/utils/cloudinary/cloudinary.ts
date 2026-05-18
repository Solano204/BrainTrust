
export async function uploadImageFile(
  file: File, 
  path: string = "units"
): Promise<string> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', path);
    
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cloudinary upload failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } else {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}


export async function deleteImageFromCloudinary(cloudinaryUrl: string): Promise<boolean> {
  try {
    const publicId = extractPublicIdFromImageUrl(cloudinaryUrl);
    if (!publicId) {
      throw new Error('Could not extract public ID from URL');
    }
    
    console.log('Deleting image with public ID:', publicId);
    
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/delete-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Delete failed: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

export function extractPublicIdFromImageUrl(url: string): string | null {
  try {
    if (!url.includes('cloudinary.com')) {
      return null;
    }

    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    let pathParts: string[];
    
    if (urlParts[uploadIndex + 1]?.match(/^v\d+$/)) {
      pathParts = urlParts.slice(uploadIndex + 2);
    } else {
      pathParts = urlParts.slice(uploadIndex + 1);
    }
    
    const fullPath = pathParts.join('/');
    const publicId = fullPath.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}