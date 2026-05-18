import { z } from 'zod';

export const VALIDATION_RULES = {
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ],
  maxFiles: 5,
  minContentLength: 10,
  maxContentLength: 10000
} as const;

export const taskSubmissionSchema = z.object({
  content: z.string()
    .min(VALIDATION_RULES.minContentLength, {
      message: `Content must be at least ${VALIDATION_RULES.minContentLength} characters when no files are attached`
    })
    .max(VALIDATION_RULES.maxContentLength, {
      message: `Content must not exceed ${VALIDATION_RULES.maxContentLength} characters`
    })
    .optional(),
  attachments: z.array(z.instanceof(File)).optional()
}).refine((data) => 
  (data.content && data.content.trim().length >= VALIDATION_RULES.minContentLength) || 
  (data.attachments && data.attachments.length > 0), {
  message: 'Either written content or file attachments are required',
  path: ['global']
});

export type TaskSubmissionFormData = z.infer<typeof taskSubmissionSchema>;

export const validateFile = (file: File): string | null => {
  if (file.size > VALIDATION_RULES.maxFileSize) {
    return `File "${file.name}" exceeds maximum size of ${VALIDATION_RULES.maxFileSize / 1024 / 1024}MB`;
  }
  
  
  return null;
};