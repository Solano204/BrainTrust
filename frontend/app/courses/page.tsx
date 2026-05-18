"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CourseDashboard } from "@/components/teacher-student/courses-dashboard-main-student-teacher";
import { useAuth } from "@/app/context/AuthContext";

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
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={setActiveView}
        userRole={user?.role}
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