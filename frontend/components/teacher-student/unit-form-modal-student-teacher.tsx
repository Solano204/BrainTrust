// File: src/app/features/courses/components/unit-form-modal-student-teacher.tsx
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { CourseUnit } from "@/app/domain/entities/CourseEntities";
import { ImageUploadWithValidation } from './image-upload-with-validation';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod validation schema
const unitFormSchema = z.object({
  name: z.string()
    .min(3, "Unit name must be at least 3 characters")
    .max(150, "Unit name must not exceed 150 characters")
    .trim(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .trim(),
  numUnity: z.number()
    .min(1, "Unit number must be at least 1")
    .max(100, "Unit number cannot exceed 100")
    .int("Unit number must be a whole number"),
  urlImage: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: CourseUnit;
  onSave: (unitData: Omit<CourseUnit, "id" | "courseId" | "resources">, unitId?: string, imageFile?: File | null) => void;
  isSaving: boolean;
}

export function UnitFormModal({ open, onClose, initialData, onSave, isSaving }: UnitFormModalProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>(initialData?.urlImage || "");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      numUnity: initialData?.numUnity || 1,
      urlImage: initialData?.urlImage || "",
    }
  });

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
          numUnity: initialData.numUnity,
          urlImage: initialData.urlImage || "",
        });
        setImagePreview(initialData.urlImage || "");
        setImageFile(null);
      } else {
        reset({
          name: "",
          description: "",
          numUnity: 1,
          urlImage: "",
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

  const onSubmit = (data: UnitFormData) => {
    const unitData = {
      name: data.name,
      description: data.description,
      numUnity: data.numUnity,
      urlImage: data.urlImage || "",
    };

    // Pass the unitData AND the raw imageFile to the parent
    onSave(unitData, initialData?.id, imageFile);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Unit" : "Create New Unit"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the unit information below." 
              : "Fill in the details to create a new unit for this course."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Unit Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Unit Name *</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="e.g., Module 1: Introduction to JavaScript"
                  disabled={isSaving}
                  className={errors.name ? "border-red-500" : ""}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Unit Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Describe what students will learn in this unit..."
                  rows={4}
                  disabled={isSaving}
                  className={errors.description ? "border-red-500" : ""}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Unit Number (Optional - auto-assigned if creating) */}
          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="numUnity">Unit Number</Label>
              <Controller
                name="numUnity"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="numUnity"
                    type="number"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    min={1}
                    disabled={isSaving}
                    className={errors.numUnity ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.numUnity && (
                <p className="text-sm text-red-500">{errors.numUnity.message}</p>
              )}
            </div>
          )}

          {/* Image Upload Component */}
          <ImageUploadWithValidation
            currentImageUrl={imagePreview}
            onImageChange={handleImageChange}
            label="Unit Cover Image"
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
                initialData ? "Update Unit" : "Create Unit"
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