// File: src/app/features/courses/components/unit-form-modal.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Plus, BookOpen, Loader2 } from "lucide-react";
import { CourseUnit } from "@/app/domain/entities/CourseEntities";

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: CourseUnit;
  onSave: (
    unitData: Omit<CourseUnit, "id" | "courseId" | "resources">,
    unitId?: string
  ) => void;
  isSaving?: boolean;
}

export function UnitFormModal({
  open,
  onClose,
  initialData,
  onSave,
  isSaving = false,
}: UnitFormModalProps) {
  const isEditMode = !!initialData;
  const title = isEditMode ? "Edit Unit" : "Create New Unit";
  const submitButtonText = isEditMode ? "Save Changes" : "Create Unit";

  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    numUnity: initialData?.numUnity || 1,
    urlImage: initialData?.urlImage || "",
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        numUnity: initialData.numUnity,
        urlImage: initialData.urlImage || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        numUnity: 1,
        urlImage: "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [id]: type === 'number' ? parseInt(value) || 1 : value 
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, initialData?.id);
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
            {/* Unit Number */}
            <div className="space-y-2">
              <Label htmlFor="numUnity" className="font-semibold">
                Unit Number *
              </Label>
              <Input
                id="numUnity"
                type="number"
                min="1"
                value={formData.numUnity}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </div>

            {/* Unit Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Unit Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSaving}
                placeholder="Enter unit title"
              />
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
                placeholder="Describe what students will learn in this unit..."
                disabled={isSaving}
              />
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
                placeholder="Paste an image URL for the unit"
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
              disabled={isSaving || !formData.name || !formData.numUnity}
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