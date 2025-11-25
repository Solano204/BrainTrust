// File: src/app/features/courses/components/CoursesSection.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Course } from "@/app/domain/entities/CourseEntities"
import { CourseId } from "@/app/domain/valueObjects/CourseValues"
import { useCoursesByTeacher } from "@/components/teacher/hooks/courses-hooks"

const getCourseColor = (id: CourseId): string => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
        "bg-blue-600", "bg-purple-600", "bg-teal-600", "bg-indigo-600", "bg-rose-600",
    ];
    return colors[hash % colors.length];
};

interface CoursesSectionProps {
  teacherId: string;
}

export function CoursesSectionTeacher({ teacherId }: CoursesSectionProps) {
    // Carousel States
    const [currentIndex, setCurrentIndex] = useState(0);
    const initialItemsPerView = 2;
    
    // Toggle full view
    const [showAllCourses, setShowAllCourses] = useState(false); 

    // REAL API CALL with teacher ID
    const { 
        data: courses = [], 
        isLoading, 
        error 
    } = useCoursesByTeacher(teacherId);
    
    // --- Carousel Logic ---
    const itemsPerView = showAllCourses ? courses.length : initialItemsPerView;
    
    const canScrollUp = currentIndex > 0 && !showAllCourses;
    const canScrollDown = currentIndex < courses.length - initialItemsPerView && !showAllCourses;

    const scrollUp = () => {
        if (canScrollUp) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const scrollDown = () => {
        if (canScrollDown) {
            setCurrentIndex(currentIndex + 1);
        }
    };
    
    // Determine which courses to show based on the mode
    const visibleCourses = showAllCourses ? courses : courses.slice(currentIndex, currentIndex + initialItemsPerView);

    // Button Handler
    const handleViewAllClick = () => {
        setShowAllCourses(prev => !prev);
        if (!showAllCourses) {
            setCurrentIndex(0);
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-primary font-medium">Loading courses...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6 h-40 flex flex-col items-center justify-center space-y-3">
                <div className="text-destructive text-center">
                    <p className="font-semibold">Error loading courses</p>
                    <p className="text-sm mt-1">Please try again later</p>
                </div>
                <button 
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </Card>
        );
    }

    if (courses.length === 0) {
        return (
            <Card className="p-6 h-40 flex flex-col items-center justify-center space-y-3">
                <p className="text-muted-foreground font-semibold">No active courses found.</p>
                <button className="text-sm font-medium text-primary hover:underline">
                    View Archived Courses
                </button>
            </Card>
        );
    }

    // Dynamic height calculation
    const carouselHeight = showAllCourses ? 'auto' : 'h-[20rem]';
    const transformStyle = showAllCourses ? 'none' : `translateY(-${currentIndex * (200 + 16)}px)`;

    // Calculate course statistics
    const totalStudents = courses.reduce((total, course) => {
        return total + (course.enrollments?.length || 0);
    }, 0);

    const activeCourses = courses.filter(course => course.active).length;

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
                <p className="text-sm text-muted-foreground mt-1">Active this semester</p>
                
                {/* Course Statistics */}
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{activeCourses} active courses</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{totalStudents} total students</span>
                    </div>
                </div>
            </div>

            <div className="relative">
                
                {/* Up Arrow (Only visible in carousel mode) */}
                {!showAllCourses && (
                    <button
                        onClick={scrollUp}
                        disabled={!canScrollUp}
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 h-8 w-8 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center transition-all ${
                            canScrollUp ? "hover:bg-primary hover:text-primary-foreground cursor-pointer opacity-100" : "opacity-30 "
                        }`}
                        aria-label="Scroll up"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                )}

                {/* Carousel Content */}
                <div className={`overflow-hidden ${carouselHeight}`}>
                    <div
                        className={`transition-transform duration-500 ease-out space-y-4 ${showAllCourses ? 'grid grid-cols-1 sm:grid-cols-1 gap-4' : ''}`}
                        style={{
                            transform: transformStyle,
                        }}
                    >
                        {visibleCourses.map((course) => {
                            const courseColor = getCourseColor(course.id);
                            const studentsCount = course.enrollments?.length || 0;
                            const lastAccessTime = "Recently active"; // You can calculate this from course data

                            return (
                                <Link key={course.id} href={`/courses/${course.id}`} className="block">
                                    <div 
                                        className="group relative p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                        style={{ minHeight: '10rem' }} 
                                    >
                                        {/* Course Status Indicator */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${courseColor}`} />
                                        
                                        {/* Active/Inactive Badge */}
                                        {!course.active && (
                                            <Badge variant="secondary" className="absolute top-3 right-3 bg-gray-500">
                                                Archived
                                            </Badge>
                                        )}

                                        <div className="flex items-start gap-4">
                                            <div className={`h-12 w-12 rounded-lg ${courseColor} flex items-center justify-center shrink-0`}>
                                                <BookOpen className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <Badge variant="secondary" className="mb-2 text-xs">
                                                            {course.code} • {course.grade}
                                                        </Badge>
                                                        <h3 className="font-semibold text-base text-foreground leading-tight">
                                                            {course.name}
                                                        </h3>
                                                        {course.description && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                {course.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-4 w-4" />
                                                        <span>{studentsCount} students</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span>{course.units?.length || 0} units</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{lastAccessTime}</span>
                                                    {course.group && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Group: {course.group}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Down Arrow (Only visible in carousel mode) */}
                {!showAllCourses && (
                    <button
                        onClick={scrollDown}
                        disabled={!canScrollDown}
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 h-8 w-8 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center transition-all ${
                            canScrollDown ? "hover:bg-primary hover:text-primary-foreground cursor-pointer opacity-100" : "opacity-30 "
                        }`}
                        aria-label="Scroll down"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                )}

                {/* Indicators (Only visible in carousel mode) */}
                {!showAllCourses && courses.length > initialItemsPerView && (
                    <div className="flex justify-center gap-1.5 mt-6">
                        {courses.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(Math.min(index, courses.length - initialItemsPerView))}
                                className={`h-1.5 rounded-full transition-all ${
                                    index >= currentIndex && index < currentIndex + initialItemsPerView
                                        ? "w-6 bg-primary"
                                        : "w-1.5 bg-border hover:bg-primary/50"
                                }`}
                                aria-label={`Go to course ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* View All Toggle Button */}
            {courses.length > initialItemsPerView && (
                <button 
                    onClick={handleViewAllClick}
                    className="w-full mt-6 p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-all"
                >
                    {showAllCourses ? (
                        `Show Less (${initialItemsPerView} courses)`
                    ) : (
                        `View All Courses (${courses.length})`
                    )}
                </button>
            )}
        </Card>
    );
}