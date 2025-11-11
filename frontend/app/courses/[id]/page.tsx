"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CourseOverview } from "@/components/course-overview";
import { UnitDetail } from "@/components/unit-detail";
import { CourseGradebook } from "@/components/course-gradebook";
import { CourseTaskInventory } from "@/components/course-task-inventory";
import { CourseStudents } from "@/components/course-students";
import { CourseGroups } from "@/components/course-groups";
import { useParams, useRouter } from "next/navigation";
import { ResourceTypeSelector } from "@/components/submission-detail";
import { CourseTaskOverview } from "@/components/CourseTaskOverview";

type CourseView =
  | "overview"
  | "gradebook"
  | "tasks"
  | "students"
  | "groups"

export default function CoursePage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null); // Changed to string to match UnitId
  const [currentView, setCurrentView] = useState<CourseView>("overview");
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(
    null
  );

  const params = useParams();
  const courseId = params.id as string;

  const handleViewChange = (view: CourseView) => {
    setCurrentView(view);
    setSelectedUnit(null);
    setSelectedSubmission(null);
  };

  // Function to handle unit selection from CourseOverview
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnit(unitId);
    console.info("Selected Unit ID:", unitId);
    setCurrentView("overview"); // Keep overview as base view
  };

  // Function to handle back from UnitDetail
  const handleBackFromUnit = () => {
    setSelectedUnit(null);
  };


  const handleEnterCourse = () => {
    router.push(`/courses/`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
          {selectedUnit !== null ? (
            <UnitDetail
             key={`unit-${selectedUnit}`} // Add this key
              idCourse={courseId}
              idUnit={selectedUnit}
              onBack={handleBackFromUnit}
            />
          ) : currentView === "overview" ? (
            <CourseOverview
              key={`overview-${selectedUnit}`}
              courseId={courseId}
              onSelectUnit={handleSelectUnit}
            />
          ) : currentView === "gradebook" ? (
            <CourseGradebook courseId={courseId} />
          ) : currentView === "tasks" ? (
            <CourseTaskOverview
              courseId={courseId}
              // onViewSubmission={(submissionId: string) => setSelectedSubmission(Number(submissionId))}
            />
          ) : currentView === "students" ? (
            <CourseStudents courseId={courseId} />
          ) : currentView === "groups" ? (
            <CourseGroups courseId={courseId} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
