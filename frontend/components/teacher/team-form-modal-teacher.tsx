// File: src/app/features/courses/components/team-form-modal.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Plus, Users, Loader2 } from "lucide-react";
import { Team } from "@/app/domain/entities/CourseEntities";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod validation schema
const teamFormSchema = z.object({
  name: z.string()
    .min(2, "Team name must be at least 2 characters")
    .max(100, "Team name must not exceed 100 characters")
    .trim()
    .refine((name) => {
      // No special characters except spaces, hyphens, and underscores
      return /^[a-zA-Z0-9\s\-_]+$/.test(name)
    }, "Team name can only contain letters, numbers, spaces, hyphens, and underscores"),
  description: z.string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  maxMembers: z.number()
    .min(1, "Team must have at least 1 member")
    .max(20, "Team cannot exceed 20 members")
    .int("Maximum members must be a whole number"),
  active: z.boolean().default(true)
});

type TeamFormData = z.infer<typeof teamFormSchema>;

interface TeamFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    teamData: Omit<Team, "courseId" | "leaderId" | "members" | "createdAt">
  ) => void;
  isSaving?: boolean;
}

export function TeamFormModal({
  open,
  onClose,
  onSave,
  isSaving = false,
}: TeamFormModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      maxMembers: 4,
      active: true,
    }
  });

  React.useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      reset({
        name: "",
        description: "",
        maxMembers: 4,
        active: true,
      });
    }
  }, [open, reset]);

  const onSubmit = (data: TeamFormData) => {
    onSave(data );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-primary">
              <Users className="h-6 w-6" /> Create New Team
            </h2>
            <Button
              type="button"
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
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Team Name *
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    disabled={isSaving}
                    placeholder="Enter team name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use letters, numbers, spaces, hyphens, or underscores
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                Description
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    rows={3}
                    placeholder="Describe the team's purpose or focus..."
                    disabled={isSaving}
                    className={errors.description ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Max Members */}
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="font-semibold">
                Maximum Members *
              </Label>
              <Controller
                name="maxMembers"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="maxMembers"
                    type="number"
                    min="1"
                    max="20"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    disabled={isSaving}
                    className={errors.maxMembers ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.maxMembers && (
                <p className="text-sm text-red-500">{errors.maxMembers.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Maximum number of students allowed in this team (1-20)
              </p>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Label htmlFor="active" className="font-semibold flex items-center gap-2">
                    <input
                      id="active"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSaving}
                      className="rounded"
                    />
                    Active Team
                  </Label>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Inactive teams won't be available for new assignments
              </p>
            </div>

            {/* Creation Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Team Creation Information
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Team will be created with no members initially</li>
                <li>• You can add members after creation</li>
                <li>• Team leader can be assigned later</li>
                <li>• Team name must be unique within the course</li>
              </ul>
            </div>

            {/* Form-level validation summary */}
            {Object.keys(errors).length > 0 && !isValid && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  {errors.name && <li>• {errors.name.message}</li>}
                  {errors.description && <li>• {errors.description.message}</li>}
                  {errors.maxMembers && <li>• {errors.maxMembers.message}</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Footer / Save Button */}
          <div className="flex justify-end gap-3 p-6 border-t border-border bg-gray-50 dark:bg-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !isValid}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSaving ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}