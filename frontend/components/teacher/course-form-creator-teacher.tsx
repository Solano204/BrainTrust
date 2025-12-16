// File: src/app/features/courses/teacher/course-form-creator-teacher.tsx
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Course } from "@/app/domain/entities/CourseEntities";
import { ImageUploadWithValidation } from '../teacher-student/image-upload-with-validation';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod validation schema
const courseFormSchema = z.object({
  name: z.string()
    .min(3, "Course name must be at least 3 characters")
    .max(100, "Course name must not exceed 100 characters")
    .trim(),
  code: z.string()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must not exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Course code can only contain letters, numbers, and hyphens")
    .trim()
    .transform(val => val.toUpperCase()),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .trim(),
  grade: z.string()
    .min(1, "Grade level is required")
    .max(50, "Grade level must not exceed 50 characters")
    .trim(),
  group: z.string()
    .min(1, "Group is required")
    .max(50, "Group must not exceed 50 characters")
    .trim(),
  urlImage: z.string().optional(),
  active: z.boolean().default(true),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Course;
  onSave: (courseData: Omit<Course, "id" | "teacherId">, courseId?: string, imageFile?: File | null) => void;
  isSaving: boolean;
}

export function CourseFormModal({ open, onClose, initialData, onSave, isSaving }: CourseFormModalProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>(initialData?.urlImage || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      grade: initialData?.grade || "Beginner",
      group: initialData?.group || "Default Group",
      urlImage: initialData?.urlImage || "",
      active: initialData?.active ?? true,
    }
  });

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description,
          grade: initialData.grade,
          group: initialData.group,
          urlImage: initialData.urlImage || "",
          active: initialData.active,
        });
        setImagePreview(initialData.urlImage || "");
        setImageFile(null);
      } else {
        reset({
          name: "",
          code: "",
          description: "",
          grade: "Beginner",
          group: "Default Group",
          urlImage: "",
          active: true,
        });
        setImagePreview("");
        setImageFile(null);
      }
    }
  }, [initialData, open, reset]);

  const handleImageChange = (imageData: { file: File; previewUrl: string; validationType: string } | null) => {
    if (imageData) {
      setImageFile(imageData.file);
      setImagePreview(imageData.previewUrl);
      setValue("urlImage", imageData.previewUrl, { shouldValidate: true });
    } else {
      setImageFile(null);
      setImagePreview("");
      setValue("urlImage", "", { shouldValidate: true });
    }
  };

  const onSubmit = (data: CourseFormData) => {
    const courseData = {
      name: data.name,
      code: data.code,
      description: data.description,
      grade: data.grade,
      group: data.group,
      urlImage: data.urlImage || "",
      active: data.active,
      enrollments: initialData?.enrollments || [],
      units: initialData?.units || []
    };

    onSave(courseData, initialData?.id, imageFile);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the course information below." 
              : "Fill in the details to create a new course."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Introduction to JavaScript"
              disabled={isSaving}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Course Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Course Code *</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="e.g., JS-101"
              disabled={isSaving}
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* Course Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe what students will learn in this course..."
              rows={4}
              disabled={isSaving}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Grade and Group in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level *</Label>
              <Input
                id="grade"
                {...register("grade")}
                placeholder="e.g., Beginner"
                disabled={isSaving}
                className={errors.grade ? "border-red-500" : ""}
              />
              {errors.grade && (
                <p className="text-sm text-red-500">{errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group *</Label>
              <Input
                id="group"
                {...register("group")}
                placeholder="e.g., Section A"
                disabled={isSaving}
                className={errors.group ? "border-red-500" : ""}
              />
              {errors.group && (
                <p className="text-sm text-red-500">{errors.group.message}</p>
              )}
            </div>
          </div>

          {/* Image Upload Component */}
          <ImageUploadWithValidation
            currentImageUrl={imagePreview}
            onImageChange={handleImageChange}
            label="Course Cover Image"
            disabled={isSaving}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSaving || !isValid}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : (
                initialData ? "Update Course" : "Create Course"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}