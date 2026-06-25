export async function uploadDocumentFile(
  file: File,
  folder: string = "documents",
): Promise<{ url: string; publicId: string; format: string }> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      throw new Error("Cloudinary cloud name not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    if (uploadPreset) {
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Cloudinary upload failed: ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
      };
    } else {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const response = await fetch(`${baseUrl}/api/upload-document`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        url: data.url,
        publicId: data.publicId,
        format: data.format,
      };
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export async function getPdfContent(file: File): Promise<string> {
  // Extract PDF text client-side in the browser using pdfjs-dist.
  // Avoids server/Lambda limitations entirely.
  const pdfjsLib = await import("pdfjs-dist");

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).href;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");
    pages.push(pageText);
  }

  pdf.cleanup();
  return pages.join("\n").trim();
}

export async function getPdfContentFromUrl(pdfUrl: string): Promise<string> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/extract-pdf-text-from-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: pdfUrl }),
    });

    if (!response.ok) {
      throw new Error(`PDF extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF content from URL:", error);
    throw error;
  }
}

export async function deleteDocumentFromCloudinary(
  publicId: string,
): Promise<boolean> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/delete-document`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting document from Cloudinary:", error);
    throw error;
  }
}

export async function deleteDocumentByUrl(
  cloudinaryUrl: string,
): Promise<boolean> {
  try {
    const publicId = extractPublicIdFromUrl(cloudinaryUrl);
    if (!publicId) {
      throw new Error("Could not extract public ID from URL");
    }

    return await deleteDocumentFromCloudinary(publicId);
  } catch (error) {
    console.error("Error deleting document by URL:", error);
    throw error;
  }
}

export async function deleteMultipleDocuments(
  publicIds: string[],
): Promise<{ success: number; failed: number }> {
  try {
    const response = await fetch("/api/delete-documents-batch", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicIds }),
    });

    if (!response.ok) {
      throw new Error(`Batch delete failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: data.deleted, failed: data.failed };
  } catch (error) {
    console.error("Error deleting multiple documents:", error);
    throw error;
  }
}

export function getCloudinaryDownloadUrl(url: string): string {
  if (!url) return url;
  let downloadUrl = url;
  if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('fl_attachment')) {
    downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
  }
  return downloadUrl.replace(/ /g, '%20');
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    const pathParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
    const fullPath = pathParts.join("/");

    const publicId = fullPath.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}
