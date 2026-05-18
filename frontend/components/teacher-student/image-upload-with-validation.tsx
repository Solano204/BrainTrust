"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, AlertCircle, Check } from 'lucide-react';


const validateImageSignature = (file: File): Promise<{ valid: boolean; type: string }> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).toUpperCase().padStart(2, '0');
      }

      let type = "unknown";
      
      switch (header) {
        case "89504E47": // PNG
          type = "image/png";
          break;
        case "FFD8FFDB":
        case "FFD8FFE0":
        case "FFD8FFEE":
        case "FFD8FFE1":
          type = "image/jpeg";
          break;
        case "47494638":
          type = "image/gif";
          break;
        default:
          if (header.startsWith("52494646")) {
            type = "image/webp";
          }
          break;
      }

      if (type !== "unknown") {
        resolve({ valid: true, type });
      } else {
        resolve({ valid: false, type: "unknown" });
      }
    };

    fileReader.onerror = () => reject(new Error("Failed to read file"));
    fileReader.readAsArrayBuffer(file.slice(0, 4));
  });
};


interface ImageUploadWithValidationProps {
  currentImageUrl?: string;
  onImageChange: (imageData: { file: File; previewUrl: string; validationType: string } | null) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUploadWithValidation({ 
  currentImageUrl = "", 
  onImageChange,
  label = "Unit Image",
  className = "",
  disabled = false
}: ImageUploadWithValidationProps) {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    setError("");
    setValidationStatus(null);
    setIsValidating(true);

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      setIsValidating(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("File must be an image");
      setIsValidating(false);
      return;
    }

    try {
      const validation = await validateImageSignature(file);
      
      if (!validation.valid) {
        setError("Invalid or corrupted image file");
        setValidationStatus("invalid");
        setIsValidating(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        setValidationStatus("valid");
        setIsValidating(false);
        
        if (onImageChange) {
          onImageChange({ 
            file, 
            previewUrl: dataUrl,
            validationType: validation.type 
          });
        }
      };
      reader.readAsDataURL(file);

    } catch (err) {
      setError("Failed to validate image");
      setValidationStatus("invalid");
      setIsValidating(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setValidationStatus(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onImageChange) {
      onImageChange(null);
    }
  };

  const handleClickUpload = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Preview Area */}
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              {!disabled && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleClickUpload}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {/* Validation Badge */}
            {validationStatus === "valid" && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                <Check className="h-3 w-3" />
                Verified Image
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClickUpload}
            disabled={disabled}
            className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
              <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Click to upload image
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, GIF, WEBP up to 5MB
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/gif, image/webp"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />

      {/* Validation Status */}
      {isValidating && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          Validating image...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {error}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Please select a valid image file
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Images are validated using binary signatures for security
      </p>
    </div>
  );
}