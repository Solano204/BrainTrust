// File: src/app/features/courses/components/CourseOverview.tsx
"use client";

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, Users, BookOpen, Loader2, AlertTriangle, Plus, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import Image from "next/image"
import { CourseId } from "@/app/domain/valueObjects/CourseValues"
import { UnitFormModal } from "./unit-form-modal-student-teacher"
import { useCourseAllUnits } from "@/app/presentation/hooks/course/hooks";
import { useUnitMutations } from "@/app/presentation/hooks/course/unit-hooks";
import { useAuth } from "@/app/context/AuthContext"; // Add auth context

// Component placeholders
const ComponentTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => <h2 className={className} {...props}>{children}</h2>;
const ComponentNumber: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-3xl font-extrabold text-white">{children}</span>;
const ComponentDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;

interface CourseOverviewProps {
  courseId: CourseId 
  onSelectUnit: (unitId: string) => void
}

export function CourseOverview({ courseId, onSelectUnit }: CourseOverviewProps) {
    // Use React Query to fetch the entire course with units
    const { 
        data: courseData, 
        isLoading, 
        error: fetchError,
        refetch 
    } = useCourseAllUnits(courseId);
    
    // Auth context
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    
    // Unit management state - only for teachers
    const [isUnitModalOpen, setIsUnitModalOpen] = React.useState(false);
    const [unitToEdit, setUnitToEdit] = React.useState<any>(undefined);
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

    // Unit mutations - only for teachers
    const { 
        createUnit, 
        updateUnit, 
        deleteUnit,
    } = useUnitMutations();

    // Event handlers for units - restricted for students
    const handleCreateUnit = () => {
        if (isStudent) return;
        setUnitToEdit(undefined);
        setIsUnitModalOpen(true);
    };

    const handleEditUnit = (unit: any) => {
        if (isStudent) return;
        setUnitToEdit(unit);
        setIsUnitModalOpen(true);
    };

    const handleCloseUnitModal = () => {
        setIsUnitModalOpen(false);
        setUnitToEdit(undefined);
    };

    const handleSaveUnit = (unitData: any, unitId?: string) => {
        if (isStudent) return;
        
        if (unitId) {
            // Update existing unit
            updateUnit.mutate({
                unitId,
                unitData
            }, {
                onSuccess: () => {
                    handleCloseUnitModal();
                    refetch(); // Refetch the entire course to get updated units
                }
            });
        } else {
            // Create new unit
            createUnit.mutate({
                courseId,
                unitData: {
                    ...unitData,
                    numUnity: (courseData?.units?.length || 0) + 1 // Auto-assign next unit number
                }
            }, {
                onSuccess: () => {
                    handleCloseUnitModal();
                    refetch(); // Refetch the entire course to get updated units
                }
            });
        }
    };

    const handleDeleteUnit = (unitId: string) => {
        if (isStudent) return;
        deleteUnit.mutate(unitId, {
            onSuccess: () => {
                setDeleteConfirmId(null);
                refetch(); // Refetch the entire course to get updated units
            }
        });
    };

    // Loading and Error States
    if (isLoading) {
        return (
            <Card className="p-8 h-80 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">
                    Loading Course...
                </p>
            </Card>
        );
    }
    
    if (fetchError || !courseData) {
        return (
            <Card className="p-8 h-80 flex flex-col items-center justify-center space-y-4 bg-red-50 dark:bg-red-900/10 border-red-500">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <h3 className="text-xl font-bold text-destructive">Error Loading Course</h3>
                <p className="text-muted-foreground">
                    {fetchError?.message || 'Course data unavailable.'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                    Try Again
                </Button>
            </Card>
        );
    }

    // Calculate UI values from course data
    const studentCount = courseData.enrollments.length;
    const courseDuration = "12 weeks";
    const units = courseData.units || [];

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Course Header with Image */}
            <div className="relative">
                <Card className="overflow-hidden">
                    {/* TITLE SECTION*/}
                    <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-blue-500 to-blue-700">
                        <Image
                            src={courseData.urlImage || "https://placehold.co/800x300/4F46E5/FFFFFF?text=Course+Image+Missing"} 
                            alt={courseData.name}
                            fill
                            className="object-cover opacity-20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white p-4 sm:p-6">
                                <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                                    {courseData.code}
                                </Badge>
                                <ComponentTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-balance px-2">
                                    {courseData.name}
                                </ComponentTitle>
                                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto text-balance px-2">
                                    {courseData.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* COURSE STATS */}
                    <div className="bg-card border-t border-border p-4 sm:p-6">
                        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-sm sm:text-base">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium">{studentCount} Students</span> 
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium">{courseDuration}</span> 
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <ComponentDescription>{units.length} Units</ComponentDescription>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* UNITS SECTION */}
            <Card className="p-6 sm:p-8 lg:p-10">
                <div className="flex justify-between items-center mb-6">
                    <ComponentTitle className="text-2xl font-bold">
                        {isStudent ? "Course Units" : "Course Units"}
                    </ComponentTitle>
                    
                    {/* Only show Add Unit button for teachers */}
                    {!isStudent && (
                        <Button 
                            onClick={handleCreateUnit}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            disabled={createUnit.isPending}
                        >
                            <Plus className="h-4 w-4" />
                            {createUnit.isPending ? "Creating..." : "Add Unit"}
                        </Button>
                    )}
                </div>

                {/* Units Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {units.map((unit) => (
                        <UnitCard
                            key={unit.id}
                            unit={unit}
                            onSelect={onSelectUnit}
                            onEdit={handleEditUnit}
                            onDelete={handleDeleteUnit}
                            deleteConfirmId={deleteConfirmId}
                            setDeleteConfirmId={setDeleteConfirmId}
                            isDeleting={deleteUnit.isPending}
                            isStudent={isStudent}
                        />
                    ))}
                </div>

                {/* Empty state */}
                {units.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                            {isStudent ? "No units available" : "No units yet"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {isStudent ? "Check back later for course content" : "Start by creating your first unit"}
                        </p>
                        {/* Only show Create button for teachers */}
                        {!isStudent && (
                            <Button onClick={handleCreateUnit} className="gap-2">
                                <Plus className="h-4 w-4" /> Create First Unit
                            </Button>
                        )}
                    </div>
                )}
            </Card>

            {/* Unit Form Modal - Only for teachers */}
            {!isStudent && (
                <UnitFormModal
                    open={isUnitModalOpen}
                    onClose={handleCloseUnitModal}
                    initialData={unitToEdit}
                    onSave={handleSaveUnit}
                    isSaving={createUnit.isPending || updateUnit.isPending}
                />
            )}
        </div>
    );
}

// Updated Unit Card Component with Student Restrictions
interface UnitCardProps {
    unit: any;
    onSelect: (unitId: string) => void;
    onEdit: (unit: any) => void;
    onDelete: (unitId: string) => void;
    deleteConfirmId: string | null;
    setDeleteConfirmId: (id: string | null) => void;
    isDeleting: boolean;
    isStudent: boolean;
}

const UnitCard: React.FC<UnitCardProps> = ({ 
    unit, 
    onSelect, 
    onEdit, 
    onDelete, 
    deleteConfirmId, 
    setDeleteConfirmId,
    isDeleting,
    isStudent 
}) => {
    const isPendingDelete = deleteConfirmId === unit.id;

    return (
        <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
            {/* Unit Number Circle */}
            <div className="relative h-32 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-blue-950/20 dark:to-gray-950/20 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ComponentNumber>{unit.numUnity}</ComponentNumber>
                </div>
                
                {/* Actions Dropdown - Only for teachers */}
                {!isStudent && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(unit)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setDeleteConfirmId(unit.id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Unit Content */}
            <div className="p-6 space-y-4">
                <div>
                    <ComponentTitle 
                        className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => onSelect(unit.id)}
                    >
                        {unit.name}
                    </ComponentTitle>
                    <ComponentDescription>{unit.description}</ComponentDescription>
                </div>

                {/* Delete Confirmation - Only for teachers */}
                {!isStudent && isPendingDelete ? (
                    <div className="flex gap-2 pt-2">
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => onDelete(unit.id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Trash2 className="h-3 w-3" />
                            )}
                            {isDeleting ? "Deleting..." : "Confirm"}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="default" 
                        className="w-full gap-2"
                        onClick={() => onSelect(unit.id)}
                    >
                        {isStudent ? (
                            <>
                                <Eye className="h-4 w-4" />
                                View Unit
                            </>
                        ) : (
                            <>
                                Enter Unit
                                <BookOpen className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </Card>
    );
};