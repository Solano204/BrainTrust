"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TimelineSection } from "@/components/timeline-section"
import { CoursesSection } from "@/components/courses-section"
import { GeneralCalendar } from "@/components/general-calendar"
import { GradesView } from "@/components/grades-view"
import { AllCoursesView } from "@/components/all-courses-view"
import { PrivateFilesView } from "@/components/private-files-view"
import { SettingsView } from "@/components/settings-view"
import { useState } from "react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState("Dashboard")

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
                  <TimelineSection userId={"user-001"} userType={"teacher"} />
                </div>
                <div className="lg:col-span-1">
                  <CoursesSection teacherId="user-001" key={"isajdhlksdfhlsd"} />
                </div>
              </div>
            </>
          )}

          {activeView === "Calendar" && <GeneralCalendar />}
          {activeView === "Grades" && <GradesView />}
          {activeView === "Courses" && <AllCoursesView />}
          {activeView === "Private Files" && <PrivateFilesView />}
          {activeView === "Settings" && <SettingsView />}
        </main>
      </div>
    </div>
  )
}
