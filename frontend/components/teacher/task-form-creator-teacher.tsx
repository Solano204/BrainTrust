"use client";

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, LinkIcon, X, Users, User, Monitor, BookOpen } from "lucide-react"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"


export function generateAcceptString(formats: Record<string, string[]>): string {
  const extensions = Object.values(formats).flat();
  return extensions.join(',');
}

const TASK_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TASK_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain'
];

export const TASK_ACCEPTED_FORMATS = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],

  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],

  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const taskFormSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .trim(),
  instructions: z.string()
    .min(10, "Instructions must be at least 10 characters")
    .max(5000, "Instructions must not exceed 5000 characters")
    .trim(),
  deliveryMode: z.enum(["INDIVIDUAL", "TEAM"], {
    required_error: "Please select a delivery mode"
  }),
  submissionFormat: z.enum(["DIGITAL", "NOTEBOOK"], {
    required_error: "Please select a submission format"
  }),
  maxPoints: z.number()
    .min(1, "Maximum points must be at least 1")
    .max(1000, "Maximum points cannot exceed 1000")
    .int("Maximum points must be a whole number"),
  dueDate: z.string()
    .min(1, "Due date is required"),
  allowLateSubmissions: z.boolean().default(true),
  attachments: z.array(z.object({
    name: z.string(),
    storagePath: z.string(),
    createdAt: z.string()
  })).default([]),
  urls: z.array(z.string().url("Invalid URL format")).default([])
}).refine((data) => {
  const dueDateTime = new Date(data.dueDate)
  return dueDateTime > new Date()
}, {
  message: "Due date must be in the future",
  path: ["dueDate"]
})

type TaskFormData = z.infer<typeof taskFormSchema>

const urlSchema = z.string()
  .min(1, "URL cannot be empty")
  .url("Please enter a valid URL (e.g., https://example.com)")
  .refine((url) => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }, "URL must start with http:// or https://")

interface TaskCreatorProps {
  open: boolean
  onClose: () => void
  onSave: (task: any, files?: File[]) => void
  idCourse: string
  idUnit: string
}

export function TaskCreator({ open, onClose, onSave, idCourse, idUnit }: TaskCreatorProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      deliveryMode: "INDIVIDUAL",
      submissionFormat: "DIGITAL",
      maxPoints: 100,
      dueDate: "",
      allowLateSubmissions: true,
      attachments: [],
      urls: []
    }
  })


  
  const watchedValues = watch()

function validateFile(file: File, allowedTypes: string[], maxSize: number): string | null {
  if (file.size > maxSize) {
    return `File "${file.name}" exceeds ${maxSize / (1024 * 1024)}MB limit`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File "${file.name}" has an unsupported format. Allowed: ${getAllowedExtensions(allowedTypes)}`;
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = getAllowedExtensionsArray(allowedTypes);
  
  if (extension && !allowedExtensions.includes(extension)) {
    return `File extension ".${extension}" is not allowed`;
  }
  
  return null;
}

function getAllowedExtensions(mimeTypes: string[]): string {
  const extensionMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'image/jpeg': 'JPG/JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP',
    'text/plain': 'TXT',
    'application/zip': 'ZIP',
    'application/x-zip-compressed': 'ZIP'
  };
  
  return mimeTypes.map(type => extensionMap[type] || type).join(', ');
}

function getAllowedExtensionsArray(mimeTypes: string[]): string[] {
  const extensionMap: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'text/plain': ['txt'],
    'application/zip': ['zip'],
    'application/x-zip-compressed': ['zip']
  };
  
  return mimeTypes.flatMap(type => extensionMap[type] || []);
}
const onSubmit = (data: TaskFormData) => {
  const currentFormValues = watch()
  
  const task = {
    title: data.title,
    description: data.description,
    deliveryMode: data.deliveryMode,
    submissionFormat: data.submissionFormat,
    maxScore: { 
      value: 0, 
      maxPoints: data.maxPoints
    },
    dueDate: data.dueDate,
    allowLateSubmissions: data.allowLateSubmissions,
    instructions: data.instructions,
    attachments: data.attachments,
    urls: currentFormValues.urls || [], // Use currentFormValues instead of data
  }
  
  console.log("task", task)
  console.log("URLs from form data:", data.urls)
  console.log("URLs from watched values:", currentFormValues.urls)
  onSave(task, uploadedFiles)
  handleClose()
}

  const handleClose = () => {
    reset({
      title: "",
      description: "",
      instructions: "",
      deliveryMode: "INDIVIDUAL",
      submissionFormat: "DIGITAL",
      maxPoints: 100,
      dueDate: "",
      allowLateSubmissions: true,
      attachments: [],
      urls: []
    })
    setUploadedFiles([])
    setNewUrl("")
    setUrlError("")
    setFileError("")
    onClose()
  }

  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
   const files = Array.from(e.target.files || []);
  
  if (files.length === 0) return;
  
  for (const file of files) {
    const error = validateFile(file, TASK_ALLOWED_FILE_TYPES, TASK_MAX_FILE_SIZE);
    if (error) {
      setFileError(error);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
  }
  
  setFileError("");
  setUploadedFiles(prev => [...prev, ...files]);
  
  const newAttachments = files.map(file => ({
    name: file.name,
    storagePath: `/assignments/${Date.now()}_${file.name}`,
    createdAt: new Date().toISOString()
  }));
  
  const currentAttachments = watchedValues.attachments || [];
  setValue("attachments", [...currentAttachments, ...newAttachments], { 
    shouldValidate: true 
  });
  
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

const handleAddUrl = () => {
  const trimmedUrl = newUrl.trim()
  
  const validation = urlSchema.safeParse(trimmedUrl)
  
  if (!validation.success) {
    setUrlError(validation.error.errors[0].message)
    return
  }
  
  const currentUrls = watchedValues.urls || []
  if (currentUrls.includes(trimmedUrl)) {
    setUrlError("This URL has already been added")
    return
  }
  
  setUrlError("")
  
  setValue("urls", [...currentUrls, trimmedUrl], {
    shouldValidate: true,
    shouldDirty: true,
    shouldTouch: true 
  })
  setNewUrl("")
}

  const removeFile = (index: number) => {
    const fileName = watchedValues.attachments[index].name
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
    const currentAttachments = watchedValues.attachments || []
    setValue("attachments", currentAttachments.filter((_, i) => i !== index), { shouldValidate: true })
    setFileError("")
  }

const removeUrl = (index: number) => {
  const currentUrls = watchedValues.urls || []
  setValue("urls", currentUrls.filter((_, i) => i !== index), { 
    shouldValidate: true,
    shouldDirty: true,
    shouldTouch: true 
  })
  setUrlError("")
}

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddUrl()
    }
  } 

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        // onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div>
            <Label className="font-bold mb-2 block">Assignment Title *</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ex. Assignment 1: Research Paper"
                  className={errors.title ? "border-red-500" : ""}
                />
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label className="font-bold mb-2 block">Description *</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Provide a detailed description of the assignment..."
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label className="font-bold mb-2 block">Instructions *</Label>
            <Controller
              name="instructions"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Provide detailed instructions for students..."
                  rows={4}
                  className={errors.instructions ? "border-red-500" : ""}
                />
              )}
            />
            {errors.instructions && (
              <p className="text-sm text-red-500 mt-1">{errors.instructions.message}</p>
            )}
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <Label className="font-bold">Delivery Mode *</Label>
            <Controller
              name="deliveryMode"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => field.onChange("INDIVIDUAL")}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      field.value === "INDIVIDUAL" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <User className="h-8 w-8" />
                    <span className="font-medium">Individual</span>
                    <p className="text-sm text-muted-foreground text-center">
                      Each student submits their own work
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => field.onChange("TEAM")}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      field.value === "TEAM" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Users className="h-8 w-8" />
                    <span className="font-medium">Group</span>
                    <p className="text-sm text-muted-foreground text-center">
                      Teams submit one assignment together
                    </p>
                  </button>
                </div>
              )}
            />
            {errors.deliveryMode && (
              <p className="text-sm text-red-500">{errors.deliveryMode.message}</p>
            )}
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <Label className="font-bold">Submission Format *</Label>
            <Controller
              name="submissionFormat"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => field.onChange("DIGITAL")}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      field.value === "DIGITAL" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Monitor className="h-8 w-8" />
                    <span className="font-medium">Digital</span>
                    <p className="text-sm text-muted-foreground text-center">
                      Submit files and text online
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => field.onChange("NOTEBOOK")}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      field.value === "NOTEBOOK" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <BookOpen className="h-8 w-8" />
                    <span className="font-medium">Notebook</span>
                    <p className="text-sm text-muted-foreground text-center">
                      Physical notebook submission
                    </p>
                  </button>
                </div>
              )}
            />
            {errors.submissionFormat && (
              <p className="text-sm text-red-500">{errors.submissionFormat.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-bold mb-2 block">Maximum Points *</Label>
              <Controller
                name="maxPoints"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    min="1"
                    className={errors.maxPoints ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.maxPoints && (
                <p className="text-sm text-red-500 mt-1">{errors.maxPoints.message}</p>
              )}
            </div>
            
            <div>
              <Label className="font-bold mb-2 block">Due Date *</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="datetime-local"
                    {...field}
                    className={errors.dueDate ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="font-bold">Allow Late Submissions</Label>
              <p className="text-sm text-muted-foreground">
                Students can submit after the deadline (with potential penalties)
              </p>
            </div>
            <Controller
              name="allowLateSubmissions"
              control={control}
              render={({ field }) => (
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <Label className="font-bold">Support Materials</Label>

            <div>
              <Label className="text-sm mb-2 block">Upload Files</Label>
              
              {fileError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
                </div>
              )}
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input 
  ref={fileInputRef}
  type="file" 
  multiple 
  onChange={handleFileUpload}
  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt"
  className="hidden" 
  id="file-upload-task" 
/>
                <label htmlFor="file-upload-task" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, PPT, PPTX, images, TXT (Max 10MB each)
                  </p>
                  {uploadedFiles.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      {uploadedFiles.length} file(s) selected
                    </p>
                  )}
                </label>
              </div>
              
              {(watchedValues.attachments?.length || 0) > 0 && (
                <div className="mt-3 space-y-2">
                  {watchedValues.attachments?.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {uploadedFiles[index] && 
                            `(${Math.round(uploadedFiles[index].size / 1024)} KB)`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URLs */}
            <div>
              <Label className="text-sm mb-2 block">Add URLs</Label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Input
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value)
                      setUrlError("")
                    }}
                    placeholder="https://example.com"
                    onKeyDown={handleUrlKeyDown}
                    className={urlError ? "border-red-500" : ""}
                  />
                  {urlError && (
                    <p className="text-sm text-red-500 mt-1">{urlError}</p>
                  )}
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddUrl} 
                  variant="outline"
                  disabled={!newUrl.trim()}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {(watchedValues.urls?.length || 0) > 0 && (
                <div className="space-y-2">
                  {watchedValues.urls?.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {url}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeUrl(index)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!isValid}
            >
              Create Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}