"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CourseOverview } from "@/components/teacher-student/course-overview-units-teacher-student";
import { UnitDetail } from "@/components/teacher-student/unit-detail-student-teacher";
import { CourseTaskInventory } from "@/components/course-task-inventory";
import { CourseStudents } from "@/components/teacher-student/course-section-enrollment-teacher-student";
import { CourseGroups } from "@/components/teacher-student/course-section-groups-student-teacher";
import { useParams } from "next/navigation";
import { ResourceTypeSelector } from "@/components/submission-detail";
import { CourseDashboard } from "@/components/teacher-student/courses-dashboard-main-student-teacher";
import { useAuth } from "@/app/context/AuthContext"; // Add this import

type CourseView =
  | "overview"
  | "gradebook"
  | "tasks"
  | "students"
  | "groups"
  | "calendar";

export default function CoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("Courses");
  const { user } = useAuth(); // Get user from auth context

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={setActiveView}
        userRole={user?.role} // Pass user role to sidebar
      />
      <div className="flex-1 flex flex-col lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1">
          <CourseDashboard />
        </main>
      </div>
    </div>
  );
}