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

interface TeamFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (
        teamData: Omit<Team, "courseId" | "leaderId" | "members" | "createdAt">,
        teamName?: string
    ) => void;
    isSaving?: boolean;
}

export function TeamFormModal({
    open,
    onClose,
    onSave,
    isSaving = false,
}: TeamFormModalProps) {
    const [formData, setFormData] = React.useState({
        name: "",
        description: "",
        maxMembers: 4,
        active: true,
    });

    React.useEffect(() => {
        if (!open) {
            // Reset form when modal closes
            setFormData({
                name: "",
                description: "",
                maxMembers: 4,
                active: true,
            });
        }
    }, [open]);

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
        onSave(formData);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
                <form onSubmit={handleFormSubmit}>
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-primary">
                            <Users className="h-6 w-6" /> Create New Team
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
                        {/* Team Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-semibold">
                                Team Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                                placeholder="Enter team name"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-semibold">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the team's purpose or focus..."
                                disabled={isSaving}
                            />
                        </div>

                        {/* Max Members */}
                        <div className="space-y-2">
                            <Label htmlFor="maxMembers" className="font-semibold">
                                Maximum Members
                            </Label>
                            <Input
                                id="maxMembers"
                                type="number"
                                min="1"
                                max="20"
                                value={formData.maxMembers}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                            <p className="text-sm text-muted-foreground">
                                Maximum number of students allowed in this team
                            </p>
                        </div>

                        {/* Active Status */}
                        <div className="space-y-2">
                            <Label htmlFor="active" className="font-semibold flex items-center gap-2">
                                <input
                                    id="active"
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    disabled={isSaving}
                                    className="rounded"
                                />
                                Active Team
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Inactive teams won't be available for new assignments
                            </p>
                        </div>

                        {/* Creation Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
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
                    </div>

                    {/* Footer / Save Button */}
                    <div className="flex justify-end p-6 border-t border-border bg-gray-50 dark:bg-gray-800">
                        <Button
                            type="submit"
                            disabled={isSaving || !formData.name.trim()}
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