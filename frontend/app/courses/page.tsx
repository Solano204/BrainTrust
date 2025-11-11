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
import { useParams } from "next/navigation";
import { ResourceTypeSelector } from "@/components/submission-detail";
import { CourseDashboard } from "@/components/courses-main";

type CourseView =
  | "overview"
  | "gradebook"
  | "tasks"
  | "students"
  | "groups"
  | "calendar";

export default function CoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
