// app/dashboard/page.tsx
"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { TimelineSection } from "@/components/teacher-student/timeline-section-student-teacher"
import { CoursesSectionTeacher } from "@/components/teacher/courses-section-teacher"
import { useState, useEffect } from "react"
import { useAuth } from "./context/AuthContext";
import { RouteGuard } from "./auth/RouteGuard";
import { PERMISSIONS } from "./types/authentication";
import { CoursesSectionStudent } from "@/components/student/courses-section-student";
// import { GeneralCalendar } from "@/components/general-calendar";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState("Dashboard")
  const { user, isAuthenticated, isLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // This will be handled by RouteGuard, but we add extra protection
      window.location.href = '/auth/login'
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <RouteGuard>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onNavigate={setActiveView}
          userRole={user?.role}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        
          {/* Dashboard Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 lg:pt-20 space-y-6">
            {activeView === "Dashboard" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TimelineSection 
                      userId={user?.id || "user-001"} 
                      userType={user?.role === 'teacher' ? 'teacher' : 'student'} 
                    />
                    {user?.id}
                  </div>
                  <div className="lg:col-span-1">
                    {user?.role === 'teacher' ? (
                      <CoursesSectionTeacher teacherId={user.id} key={user.id} />
                    ) : (
                      <CoursesSectionStudent studentId={user?.id || "user-001"}  />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* {activeView === "Calendar" && (
              <GeneralCalendar 
              />
            )} */}

          </main>
        </div>
      </div>
    </RouteGuard>
  )
}