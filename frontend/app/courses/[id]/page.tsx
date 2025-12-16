// File: src/app/courses/[id]/page.tsx
"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CourseOverview } from "@/components/teacher-student/course-overview-units-teacher-student";
import { UnitDetail } from "@/components/teacher-student/unit-detail-student-teacher";
import { CourseStudents } from "@/components/teacher-student/course-section-enrollment-teacher-student";
import { CourseGroups } from "@/components/teacher-student/course-section-groups-student-teacher";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { CourseTaskOverview } from "@/components/teacher-student/course-submission-student-teacher";
import { useGradebook } from "@/components/teacher-student/hooks/gradebooks-hooks";
import { GradebookUnitDetail } from "@/components/teacher-student/gradebook-unit-detail";
import { GradebookUnitsView } from "@/components/teacher-student/gradebook-units-view";
import { GradebookCourseView } from "@/components/teacher-student/gradebook-student-teacher-course-view";

type CourseView = "overview" | "gradebook" | "tasks" | "students" | "groups";
type GradebookView = "units" | "course";

export default function CoursePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CourseView>("overview");
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  
  // Gradebook specific state
  const [gradebookView, setGradebookView] = useState<GradebookView>("units");
  const [selectedGradebookUnit, setSelectedGradebookUnit] = useState<string | null>(null);

  const params = useParams();
  const courseId = params.id as string;

  // Use the gradebook hook - FIXED: Added proper error handling
  const {
    gradebook,
    courseGradebooks,
    loading: gradebookLoading,
    error: gradebookError,
    isStudent,
    isTeacher,
    assignFinalGrade,
    assignUnitFinalGrade,
    refresh: refreshGradebook
  } = useGradebook(courseId);

  const handleViewChange = (view: CourseView) => {
    setCurrentView(view);
    setSelectedUnit(null);
    setSelectedSubmission(null);
    // Reset gradebook state when switching away from gradebook
    if (view !== "gradebook") {
      setGradebookView("units");
      setSelectedGradebookUnit(null);
    } else {
      // Refresh gradebook data when switching to gradebook view
      refreshGradebook();
    }
  };

  // Function to handle unit selection from CourseOverview
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnit(unitId);
    setCurrentView("overview");
  };

  // Function to handle back from UnitDetail
  const handleBackFromUnit = () => {
    setSelectedUnit(null);
  };

  // Gradebook navigation functions
  const handleGradebookViewChange = (view: GradebookView) => {
    setGradebookView(view);
    setSelectedGradebookUnit(null);
  };

  const handleSelectGradebookUnit = (unitId: string) => {
    setSelectedGradebookUnit(unitId);
  };

  const handleBackFromGradebookUnit = () => {
    setSelectedGradebookUnit(null);
  };

  const handleEnterCourse = () => {
    router.push(`/courses/`);
  };

  // Render the appropriate gradebook component based on current state
  const renderGradebookContent = () => {
    if (selectedGradebookUnit) {
      return (
        <GradebookUnitDetail
          courseId={courseId}
          unitId={selectedGradebookUnit}
          onBack={handleBackFromGradebookUnit}
          isTeacher={isTeacher}
          onAssignUnitGrade={assignUnitFinalGrade}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Gradebook View Toggle */}
        <div className="flex border-b border-border">
          <button
            onClick={() => handleGradebookViewChange("units")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              gradebookView === "units"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            By Units
          </button>
          <button
            onClick={() => handleGradebookViewChange("course")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              gradebookView === "course"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Course Overview
          </button>
        </div>

        {/* Show loading or error state */}
        {gradebookLoading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading gradebook...</span>
          </div>
        ) : gradebookError ? (
          <div className="text-center text-destructive p-6">
            <p>Error loading gradebook: {gradebookError}</p>
            <button 
              onClick={refreshGradebook} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (
          // Gradebook Content
          gradebookView === "units" ? (
            <GradebookUnitsView
              courseId={courseId}
              onSelectUnit={handleSelectGradebookUnit}
              isTeacher={isTeacher}
              studentGradebook={isStudent ? gradebook : undefined}
              courseGradebooks={isTeacher ? courseGradebooks : undefined}
              onAssignFinalGrade={assignFinalGrade}
            />
          ) : (
            <GradebookCourseView
              courseId={courseId}
              isTeacher={isTeacher}
              studentGradebook={isStudent ? gradebook : undefined}
              courseGradebooks={isTeacher ? courseGradebooks : undefined}
            />
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={currentView}
        onNavigate={(view) => handleViewChange(view as CourseView)}
        userRole={user?.role}
      />

      <div className="flex-1 flex flex-col lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          {/* Navigation Header */}
          <div className="bg-card border-b border-border sticky top-16 z-10">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleEnterCourse()}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-colors border-b-2 text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
                  currentView === "overview" && selectedUnit === null
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Regresar a Cursos
              </button>
              <button
                onClick={() => handleViewChange("overview")}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-colors border-b-2 text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
                  currentView === "overview" && selectedUnit === null
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => handleViewChange("gradebook")}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-colors border-b-2 text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
                  currentView === "gradebook"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Gradebook
              </button>
              <button
                onClick={() => handleViewChange("tasks")}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-colors border-b-2 text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
                  currentView === "tasks"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => handleViewChange("students")}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-colors border-b-2 text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
                  currentView === "students"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => handleViewChange("groups")}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-colors border-b-2 text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
                  currentView === "groups"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Groups
              </button>
            </div>
          </div>

          {/* Conditional Rendering - Only ONE component renders at a time */}
          <div className="container mx-auto p-6">
            {selectedUnit !== null ? (
              <UnitDetail
                key={`unit-${selectedUnit}`}
                idCourse={courseId}
                idUnit={selectedUnit}
                onBack={handleBackFromUnit}
                // showStudentGrades={true} // FIX: Added prop to show student grades
              />
            ) : currentView === "overview" ? (
              <CourseOverview
                key={`overview-${selectedUnit}`}
                courseId={courseId}
                onSelectUnit={handleSelectUnit}
              />
            ) : currentView === "gradebook" ? (
              renderGradebookContent()
            ) : currentView === "tasks" ? (
              <CourseTaskOverview courseId={courseId} />
            ) : currentView === "students" ? (
              <CourseStudents courseId={courseId} />
            ) : currentView === "groups" ? (
              <CourseGroups courseId={courseId} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}