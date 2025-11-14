// app/calendar/page.tsx
"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CalendarView } from "@/components/teacher-student/calendar-teacher-student";
import { RouteGuard } from "../auth/RouteGuard";
import { useAuth } from "../context/AuthContext";

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <RouteGuard>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)} activeView={""} onNavigate={() => {}} userRole={user?.role }        />
        <div className="flex-1 flex flex-col lg:ml-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1">
            <CalendarView 
              userId={user?.id || "user-001"} 
              userType={user?.role === 'teacher' ? 'teacher' : 'student'}  
            />
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}