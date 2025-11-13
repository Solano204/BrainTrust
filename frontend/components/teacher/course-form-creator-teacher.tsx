// File: src/app/features/courses/components/course-creator.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Plus, BookOpen, Loader2 } from "lucide-react";
import { Course } from "@/app/domain/entities/CourseEntities";
import { useCourseForm } from "@/app/presentation/hooks/course/hooks";

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Course;
  onSave: (
    courseData: Omit<Course, "id" | "teacherId">,
    courseId?: string
  ) => void;
  isSaving?: boolean;
}

export function CourseFormModal({
  open,
  onClose,
  initialData,
  onSave,
  isSaving = false,
}: CourseFormModalProps) {
  const isEditMode = !!initialData;
  const title = isEditMode ? "Edit Course Details" : "Create New Course";
  const submitButtonText = isEditMode ? "Save Changes" : "Create Course";

  const { formData, handleChange } = useCourseForm(initialData);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const completeFormData = {
      ...formData,
      enrollments: initialData?.enrollments || [],
      units: initialData?.units || [],
    };
    onSave(completeFormData, initialData?.id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
        <form onSubmit={handleFormSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-primary">
              <BookOpen className="h-6 w-6" /> {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            {/* Name and Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  Course Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="font-semibold">
                  Course Code *
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe the course content..."
                disabled={isSaving}
              />
            </div>

            {/* Grade and Group */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade" className="font-semibold">
                  Level / Grade
                </Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="e.g., Beginner, Advanced"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group" className="font-semibold">
                  Section / Group
                </Label>
                <Input
                  id="group"
                  value={formData.group}
                  onChange={handleChange}
                  placeholder="e.g., Section A, 2025 Spring"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="urlImage" className="font-semibold">
                Image URL (Optional)
              </Label>
              <Input
                id="urlImage"
                value={formData.urlImage || ""}
                onChange={handleChange}
                placeholder="Paste an image URL for the course card"
                disabled={isSaving}
              />
              {formData.urlImage && (
                <p className="text-xs text-muted-foreground italic">
                  Preview: {formData.urlImage.substring(0, 50)}...
                </p>
              )}
            </div>
          </div>

          {/* Footer / Save Button */}
          <div className="flex justify-end p-6 border-t border-border bg-gray-50 dark:bg-gray-800">
            <Button
              type="submit"
              disabled={isSaving || !formData.name || !formData.code}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}