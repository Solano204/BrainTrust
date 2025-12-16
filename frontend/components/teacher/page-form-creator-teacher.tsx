"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, Paperclip, LinkIcon } from "lucide-react";
import { Page } from "@/app/domain/entities/CourseEntities";
import { Document } from "@/app/domain/valueObjects/CourseValues";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const PAGE_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PAGE_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
];

// Zod validation schema
const pageFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  sectionContent: z
    .string()
    .min(20, "Content must be at least 20 characters")
    .max(10000, "Content must not exceed 10,000 characters")
    .trim(),
  urlsSupport: z.array(z.string().url("Invalid URL format")).default([]),
  attachments: z.array(z.any()).default([]),
});

type PageFormData = z.infer<typeof pageFormSchema>;

// URL validation schema for individual URL input
const urlSchema = z
  .string()
  .min(1, "URL cannot be empty")
  .url("Please enter a valid URL (e.g., https://example.com)")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, "URL must start with http:// or https://");

// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];

// For PageCreator - Documents and Images
export const PAGE_ACCEPTED_FORMATS = {
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  // Archives
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
};

interface PageCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (page: any, files?: File[]) => void;
  unitId: string;
  courseId: string;
}

export function PageCreator({
  open,
  onClose,
  onSave,
  unitId,
  courseId,
}: PageCreatorProps) {
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      sectionContent:
        "Create engaging content for your students here. You can include:\n\n• Learning objectives\n• Key concepts\n• Examples and explanations\n• Study tips\n• Additional resources",
      attachments: [],
      urlsSupport: [],
    },
  });

  const watchedValues = watch();
  const wordCount = watchedValues.sectionContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const handleSave = (data: PageFormData) => {
    const page: Page = {
      ...data,
      id: `page-${Date.now()}`,
      courseId: courseId,
      unitId: unitId,
      createdAt: new Date().toISOString(),
    };

    onSave(page, attachmentFiles);
    handleClose();
  };

  const handleClose = () => {
    reset({
      title: "",
      sectionContent:
        "Create engaging content for your students here. You can include:\n\n• Learning objectives\n• Key concepts\n• Examples and explanations\n• Study tips\n• Additional resources",
      attachments: [],
      urlsSupport: [],
    });
    setAttachmentFiles([]);
    setNewUrl("");
    setUrlError("");
    setFileError("");
    onClose();
  };

  // ============================================
  // FILE VALIDATION FUNCTION
  // ============================================

  function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): string | null {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds ${maxSize / (1024 * 1024)}MB limit`;
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      return `File "${
        file.name
      }" has an unsupported format. Allowed: ${getAllowedExtensions(
        allowedTypes
      )}`;
    }

    // Additional check for file extension (some browsers don't set MIME type correctly)
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = getAllowedExtensionsArray(allowedTypes);

    if (extension && !allowedExtensions.includes(extension)) {
      return `File extension ".${extension}" is not allowed`;
    }

    return null;
  }

  function getAllowedExtensions(mimeTypes: string[]): string {
    const extensionMap: Record<string, string> = {
      "application/pdf": "PDF",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
      "application/vnd.ms-powerpoint": "PPT",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "PPTX",
      "image/jpeg": "JPG/JPEG",
      "image/png": "PNG",
      "image/gif": "GIF",
      "image/webp": "WEBP",
      "text/plain": "TXT",
      "application/zip": "ZIP",
      "application/x-zip-compressed": "ZIP",
    };

    return mimeTypes.map((type) => extensionMap[type] || type).join(", ");
  }

  function getAllowedExtensionsArray(mimeTypes: string[]): string[] {
    const extensionMap: Record<string, string[]> = {
      "application/pdf": ["pdf"],
      "application/msword": ["doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ["docx"],
      "application/vnd.ms-powerpoint": ["ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ["pptx"],
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/gif": ["gif"],
      "image/webp": ["webp"],
      "text/plain": ["txt"],
      "application/zip": ["zip"],
      "application/x-zip-compressed": ["zip"],
    };

    return mimeTypes.flatMap((type) => extensionMap[type] || []);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const fileArray = Array.from(files);

    // ✅ FIX: Pass all 3 required parameters
    for (const file of fileArray) {
      const error = validateFile(file, PAGE_ALLOWED_FILE_TYPES, PAGE_MAX_FILE_SIZE);
      if (error) {
        setFileError(error);
        e.target.value = ""; // Reset input
        return;
      }
    }

    setFileError("");
    setAttachmentFiles((prev) => [...prev, ...fileArray]);

    const newDocuments: Document[] = fileArray.map((file) => ({
      name: file.name,
      storagePath: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    }));

    const currentAttachments = watchedValues.attachments || [];
    setValue("attachments", [...currentAttachments, ...newDocuments], {
      shouldValidate: true,
    });

    // Reset input to allow same file again if needed
    e.target.value = "";
  }
};


  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    const currentAttachments = watchedValues.attachments || [];
    setValue(
      "attachments",
      currentAttachments.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
    setFileError("");
  };

  const addUrl = () => {
    const trimmedUrl = newUrl.trim();

    // Validate URL
    const validation = urlSchema.safeParse(trimmedUrl);

    if (!validation.success) {
      setUrlError(validation.error.errors[0].message);
      return;
    }

    // Check for duplicates
    const currentUrls = watchedValues.urlsSupport || [];
    if (currentUrls.includes(trimmedUrl)) {
      setUrlError("This URL has already been added");
      return;
    }

    setUrlError("");
    setValue("urlsSupport", [...currentUrls, trimmedUrl], {
      shouldValidate: true,
    });
    setNewUrl("");
  };

  const removeUrl = (index: number) => {
    const currentUrls = watchedValues.urlsSupport || [];
    setValue(
      "urlsSupport",
      currentUrls.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
    setUrlError("");
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUrl();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-[95vw] md:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Create Information Page
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-6 py-4">
          {/* Page Title */}
          <div className="space-y-2">
            <Label htmlFor="page-title">Page Title *</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="page-title"
                  placeholder="Enter page title (e.g., Introduction to JavaScript)"
                  className={`text-lg font-medium ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A clear, descriptive title helps students understand what this
              page is about.
            </p>
          </div>

          {/* Preview Card */}
          <Card className="p-6 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  PREVIEW
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b pb-2">
                {watchedValues.title || "Page Title Preview"}
              </h2>

              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {watchedValues.sectionContent ||
                    "Content will appear here..."}
                </div>
              </div>

              {((watchedValues.attachments?.length || 0) > 0 ||
                (watchedValues.urlsSupport?.length || 0) > 0) && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">
                    Support Materials Preview:
                  </h4>

                  {(watchedValues.attachments?.length || 0) > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Files:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.attachments
                          ?.slice(0, 3)
                          .map((file: Document, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                            >
                              <Paperclip className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">
                                {file.name}
                              </span>
                            </div>
                          ))}
                        {(watchedValues.attachments?.length || 0) > 3 && (
                          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            +{(watchedValues.attachments?.length || 0) - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(watchedValues.urlsSupport?.length || 0) > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Links:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.urlsSupport
                          ?.slice(0, 3)
                          .map((url: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                            >
                              <LinkIcon className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">
                                {url.replace(/^https?:\/\//, "")}
                              </span>
                            </div>
                          ))}
                        {(watchedValues.urlsSupport?.length || 0) > 3 && (
                          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            +{(watchedValues.urlsSupport?.length || 0) - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Content Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="section-content"
                className="text-lg font-semibold"
              >
                Content *
              </Label>
              <span className="text-xs text-muted-foreground">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Write your content here. You can use markdown-style formatting:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>Use blank lines to separate paragraphs</li>
                <li>Start lines with • for bullet points</li>
                <li>Use **bold** or *italic* for emphasis</li>
                <li>Add links: [text](https://example.com)</li>
              </ul>
            </div>
            <Controller
              name="sectionContent"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="section-content"
                  placeholder="Write your content here... You can include learning objectives, explanations, examples, study tips, etc."
                  rows={12}
                  className={`font-mono text-sm resize-y min-h-[200px] ${
                    errors.sectionContent ? "border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.sectionContent && (
              <p className="text-sm text-red-500">
                {errors.sectionContent.message}
              </p>
            )}
          </div>

          {/* Support Materials */}
          <div className="space-y-6 border-t pt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Support Materials</h3>
              <p className="text-sm text-muted-foreground">
                Add files and links to support your content. These will be
                available to students.
              </p>
            </div>

            {/* Uploaded Files */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Files ({watchedValues.attachments?.length || 0})</Label>
                {(watchedValues.attachments?.length || 0) > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setValue("attachments", [], { shouldValidate: true });
                      setAttachmentFiles([]);
                      setFileError("");
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove All
                  </Button>
                )}
              </div>

              {fileError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fileError}
                  </p>
                </div>
              )}

              {(watchedValues.attachments?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {watchedValues.attachments?.map(
                    (file: Document, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-4 w-4 text-blue-500" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Added{" "}
                              {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-muted-foreground">
                    No files uploaded yet
                  </p>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium mb-1">Click to upload files</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, images, text files, ZIP (Max: 10MB each)
                    </p>
                  </div>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip"
                  className="hidden"
                />
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Links ({watchedValues.urlsSupport?.length || 0})</Label>
                {(watchedValues.urlsSupport?.length || 0) > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setValue("urlsSupport", [], { shouldValidate: true });
                      setUrlError("");
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove All
                  </Button>
                )}
              </div>

              {(watchedValues.urlsSupport?.length || 0) > 0 && (
                <div className="space-y-2">
                  {watchedValues.urlsSupport?.map(
                    (url: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <LinkIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                            >
                              {url}
                            </a>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrl(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="new-url">Add a link</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="new-url"
                      value={newUrl}
                      onChange={(e) => {
                        setNewUrl(e.target.value);
                        setUrlError("");
                      }}
                      placeholder="https://example.com/learning-resource"
                      onKeyDown={handleUrlKeyDown}
                      className={urlError ? "border-red-500" : ""}
                    />
                    {urlError && (
                      <p className="text-sm text-red-500 mt-1">{urlError}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={addUrl}
                    variant="outline"
                    disabled={!newUrl.trim()}
                  >
                    Add Link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add links to external resources, documentation, or related
                  materials.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
            >
              Create Page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
