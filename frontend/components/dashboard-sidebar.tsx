"use client"

import { Home, Calendar,  Settings, BookOpen, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// 🔥 NEW IMPORTS
import { usePathname, useRouter } from 'next/navigation'

// Define the navigation items and map their names to corresponding URL paths
const navigation = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Calendar", icon: Calendar, href: "/calendar" },
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "Settings", icon: Settings, href: "/settings" },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  // 🗑️ REMOVED: activeView: string
  // 🗑️ REMOVED: onNavigate: (view: string) => void
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname() // Get the current URL path

  // 🔥 NEW: Handle Navigation and Close Sidebar
  const handleNavClick = (href: string) => {
    // 1. Redirect to the new page
    router.push(href)
    // 2. Close the mobile sidebar after navigation
    onClose()
  }
  
  // Helper to determine if the current path matches the item's href (for styling)
  const isActive = (href: string) => {
    // Check for exact match, or if it's the dashboard/courses, check for partial match if needed
    // Simple path matching:
    if (href === '/dashboard' && pathname === '/') return true; // Handle root being dashboard
    return pathname.startsWith(href)
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">EduLMS</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  {/* 🔥 Call handleNavClick with item.href */}
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all",
                      isActive(item.href) // 🔥 Use isActive check
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive(item.href) ? "text-primary" : "text-sidebar-foreground/60", // 🔥 Use isActive check
                      )}
                    />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info (omitted for brevity) */}
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                SG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Sam Green</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Professor</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar (Only changes are in the map function) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6 py-6">
          {/* Logo (omitted for brevity) */}
          <div className="flex h-12 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">EduLMS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  {/* 🔥 Call router.push directly for desktop, no need to close */}
                  <button
                    onClick={() => router.push(item.href)} // 🔥 Direct navigation using router
                    className={cn(
                      "group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all",
                      isActive(item.href) // 🔥 Use isActive check
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive(item.href) ? "text-primary" : "text-sidebar-foreground/60", // 🔥 Use isActive check
                      )}
                    />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info (omitted for brevity) */}
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                SG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Sam Green</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Professor</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}