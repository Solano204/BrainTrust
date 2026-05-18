"use client"

import { 
  Home, 
  Calendar, 
  Settings, 
  BookOpen, 
  X, 
  Users, 
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from "@/app/context/AuthContext"
import { PERMISSIONS } from "@/app/types/authentication"


function normalizeRole(role: string | undefined): string {
  if (!role) return 'student';
  
  const roleStr = String(role).toLowerCase().trim();
  
  const roleMap: { [key: string]: string } = {
    'admin': 'admin',
    'ADMIN': 'ADMIN',
    'administrator': 'admin',
    'administrador': 'admin',
    'teacher': 'teacher',
    'profesor': 'teacher',
    'student': 'student',
    'estudiante': 'student',
    'alumno': 'student'
  };
  
  return roleMap[roleStr] || 'student';
}


const getNavigationItems = (normalizedRole: string) => {
  
  const standardItems = [
    { name: "Dashboard", icon: Home, href: "/", permission: null },
    { name: "Calendar", icon: Calendar, href: "/calendar", permission: null },
    { name: "Courses", icon: BookOpen, href: "/courses", permission: null },
    { name: "Settings", icon: Settings, href: "/settings", permission: null },
  ];

  const adminItems = [
    { 
      name: "Gestión de Cursos", 
      icon: BookOpen, 
      href: "/admin/courses", 
      permission: PERMISSIONS.COURSE_MANAGEMENT 
    },
    { 
      name: "Gestión de Datos Personales", 
      icon: BookOpen, 
      href: "/admin/personal", 
      permission: PERMISSIONS.PERSONAL_DATA_MANAGEMENT 
    },
   

    { 
      name: "Gestión de Usuarios", 
      icon: Users, 
      href: "/admin/users", 
      permission: PERMISSIONS.USER_MANAGEMENT 
    },
     { 
      name: "Gestión de  Actividades", 
      icon: BookOpen, 
      href: "/admin/activities", 
      permission: PERMISSIONS.ACTIVITIES 
    },
    { 
      name: "Gestión de Catálogos", 
      icon: BarChart3, 
      href: "/admin/catalogs", 
      permission: PERMISSIONS.CATALOG_MANAGEMENT 
    },
    { 
      name: "Settings", 
      icon: Settings, 
      href: "/settings", 
      permission: null 
    },
  ];

  if (normalizedRole === 'admin') {
    return adminItems;
  }

  return standardItems;
}

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeView: string
  onNavigate: (view: string) => void
  userRole?: string
}

export function DashboardSidebar({ 
  isOpen, 
  onClose, 
  activeView, 
  onNavigate,
  userRole 
}: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission, user } = useAuth()

  const rawRole = user?.role || userRole;
  const currentRole = normalizeRole(rawRole);

  console.log('=== SIDEBAR ROLE ===', currentRole);

  const navigation = getNavigationItems(currentRole).filter(item => {
    console.log(`Checking permission for ${item.name}:`, item.permission);
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handleNavClick = (href: string, name: string) => {

   console.log(`Navigating to ${name} (${href})`);
    onNavigate(name)
    router.push(href)
    onClose()
  }

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href === '/') return false
    return pathname.startsWith(href)
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

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
                  <button
                    onClick={() => handleNavClick(item.href, item.name)}
                    className={cn(
                      "group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive(item.href) ? "text-primary" : "text-sidebar-foreground/60",
                      )}
                    />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {currentRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6 py-6">
          <div className="flex h-12 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">EduLMS</span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item.href, item.name)}
                    className={cn(
                      "group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive(item.href) ? "text-primary" : "text-sidebar-foreground/60",
                      )}
                    />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info Desktop */}
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {currentRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}