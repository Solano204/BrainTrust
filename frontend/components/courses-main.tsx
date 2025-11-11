// File: src/app/features/courses/components/CourseDashboard.tsx
"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Edit, Trash2, ArrowRight, Check, X, Zap, ChevronRight, GraduationCap, BookOpen } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Course } from '@/app/domain/entities/CourseEntities';
import { CourseId } from '@/app/domain/valueObjects';
import { CourseFormModal } from './course-creator';
import { useCourseMutations, useCourses } from '@/app/presentation/hooks/course/hooks';

export function CourseDashboard() {
    const router = useRouter();
    
    // Data fetching with React Query
    const { 
        data: courses = [], 
        isLoading, 
        error: fetchError,
        refetch 
    } = useCourses();
    
    // Mutations
    const { 
        createCourse, 
        updateCourse, 
        deleteCourse 
    } = useCourseMutations();

    // Local state
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<CourseId | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
    const [courseToEdit, setCourseToEdit] = React.useState<Course | undefined>(undefined);

    // Event handlers
    const handleCreateCourse = () => {
        setCourseToEdit(undefined);
        setIsFormModalOpen(true);
    };

    const handleUpdateCourse = (courseId: CourseId) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            setCourseToEdit(course);
            setIsFormModalOpen(true);
        }
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCourseToEdit(undefined);
    };

    const handleSaveCourse = (formData: Omit<Course, 'id' | 'teacherId'>, courseId?: string) => {
        if (courseId) {
            // Update existing course
            updateCourse.mutate({
                courseId,
                courseData: formData
            }, {
                onSuccess: () => {
                    handleCloseFormModal();
                }
            });
        } else {
            // Create new course
            createCourse.mutate(formData, {
                onSuccess: () => {
                    handleCloseFormModal();
                }
            });
        }
    };

    const handleEnterCourse = (courseId: CourseId) => {
        router.push(`/courses/${courseId}`);
    };
    
    const handleDeleteConfirmed = (courseId: CourseId) => {
        deleteCourse.mutate(courseId, {
            onSuccess: () => {
                setDeleteConfirmId(null);
            }
        });
    };

    // Course Card Component
    const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
        const displayColor = "bg-primary";
        const isPendingDelete = deleteConfirmId === course.id;

        return (
            <Card 
                className={`flex flex-col border-l-4 ${displayColor} bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 hover:scale-[1.02] overflow-hidden`}
                style={{ borderColor: 'var(--tw-colors-blue-600)' }}
            >
                {/* Image/Visual Effect Section */}
                <div className="relative h-32 w-full bg-cover bg-center overflow-hidden" 
                    style={{ backgroundImage: course.urlImage ? `url(${course.urlImage})` : 'none' }}>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <p className="text-white text-center italic text-sm font-semibold opacity-80 backdrop-blur-[1px]">
                            {course.description.substring(0, 75)}...
                        </p>
                    </div>
                    {/* Active/Grade Badge */}
                    <div className="absolute top-2 right-2 flex gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500 text-black shadow-lg uppercase flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> {course.grade + " - " + course.group}
                        </span>
                    </div>
                </div>

                {/* CARD BODY CONTENT */}
                <div className="p-6 flex flex-col space-y-4">
                    <div className="space-y-1">
                        <p className={`text-xs font-semibold uppercase tracking-wider text-blue-600`}>
                            {course.code} ({course.group})
                        </p>
                        <h3 className="text-xl font-extrabold text-foreground">{course.name}</h3>
                        <p className="text-sm text-muted-foreground pt-1 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border/50">
                        {isPendingDelete ? (
                            <div className="flex gap-2 w-full justify-between">
                                <Button 
                                    variant="destructive" 
                                    className="flex-1 gap-2 shadow-sm" 
                                    onClick={() => handleDeleteConfirmed(course.id)}
                                    disabled={deleteCourse.isPending}
                                >
                                    {deleteCourse.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    {deleteCourse.isPending ? "Deleting..." : "Confirm Delete"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="gap-2" 
                                    onClick={() => setDeleteConfirmId(null)}
                                    disabled={deleteCourse.isPending}
                                >
                                    <X className="h-4 w-4" /> Cancel
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button 
                                    variant="default" 
                                    className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all" 
                                    onClick={() => handleEnterCourse(course.id)}
                                >
                                    Enter Course <ChevronRight className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50" 
                                    onClick={() => handleUpdateCourse(course.id)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="text-red-600 border-red-300 hover:bg-red-100 dark:hover:bg-red-900/50" 
                                    onClick={() => setDeleteConfirmId(course.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    // Error display
    const error = fetchError as Error;

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="flex justify-between items-center pb-4 border-b border-border">
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    <Zap className="h-7 w-7 text-primary" /> MIS CURSOS
                </h1>
                <Button 
                    onClick={handleCreateCourse} 
                    className="bg-green-600 hover:bg-green-700 gap-2 shadow-md"
                    disabled={createCourse.isPending}
                >
                    <Plus className="h-4 w-4" /> 
                    {createCourse.isPending ? "Creating..." : "Create Course"}
                </Button>
            </header>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                    <span className="text-lg font-medium text-muted-foreground">Loading courses...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error.message || "Failed to load courses. Please check your network connection."}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-4"
                            onClick={() => refetch()}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Course List Grid */}
            {!isLoading && !error && courses.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </section>
            )}

            {/* Empty State */}
            {!isLoading && !error && courses.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No courses found</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first course.</p>
                    <Button onClick={handleCreateCourse} className="gap-2">
                        <Plus className="h-4 w-4" /> Create Your First Course
                    </Button>
                </div>
            )}

            {/* Course Form Modal */}
            <CourseFormModal 
                open={isFormModalOpen}
                onClose={handleCloseFormModal}
                initialData={courseToEdit}
                onSave={handleSaveCourse}
                isSaving={createCourse.isPending || updateCourse.isPending}
            />
        </div>
    );
}