// File: src/app/features/courses/components/team-member-limit-modal.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Save, Users, Loader2, AlertTriangle } from "lucide-react";
import { Team } from "@/app/domain/entities/CourseEntities";

interface TeamMemberLimitModalProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  onSave: (teamName: string, maxMembers: number) => void;
  isSaving?: boolean;
}

export function TeamMemberLimitModal({
  open,
  onClose,
  team,
  onSave,
  isSaving = false,
}: TeamMemberLimitModalProps) {
  const [maxMembers, setMaxMembers] = React.useState(team.maxMembers);

  React.useEffect(() => {
    setMaxMembers(team.maxMembers);
  }, [team]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(team.name, maxMembers);
  };

  const exceedsLimit = team.members.size > maxMembers;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl dark:bg-gray-900">
        <form onSubmit={handleFormSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-3 text-primary">
              <Users className="h-5 w-5" /> Update Member Limit
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="font-semibold">
                Maximum Members
              </Label>
              <Input
                id="maxMembers"
                type="number"
                min="1"
                max="20"
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value) || 1)}
                disabled={isSaving}
              />
            </div>

            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">
                <strong>Current members:</strong> {team.members.size}
              </p>
              <p className="text-sm">
                <strong>New limit:</strong> {maxMembers}
              </p>
            </div>

            {exceedsLimit && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Current members ({team.members.size}) exceed the new limit ({maxMembers}). 
                  You'll need to remove some members before applying this change.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-border bg-gray-50 dark:bg-gray-800">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || exceedsLimit}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Updating..." : "Update Limit"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}