"use client"

import {
  Home,
  Calendar,
  Settings,
  BookOpen,
  X,
  Users,
  BarChart3,
  TrendingUp,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from "@/app/context/AuthContext"
import { PERMISSIONS } from "@/app/types/authentication"

function normalizeRole(role: string | undefined): string {
  if (!role) return 'student'
  const r = String(role).toLowerCase().trim()
  if (r === 'admin' || r === 'administrator' || r === 'administrador') return 'admin'
  if (r === 'teacher' || r === 'profesor') return 'teacher'
  return 'student'
}

const getNavigationItems = (role: string) => {
  const standard = [
    { name: "Tablero",      icon: Home,     href: "/",         permission: null },
    { name: "Calendario",   icon: Calendar, href: "/calendar", permission: null },
    { name: "Cursos",       icon: BookOpen, href: "/courses",  permission: null },
    { name: "Configuración",icon: Settings, href: "/settings", permission: null },
  ]
  const admin = [
    { name: "Gestión de Cursos",          icon: BookOpen,    href: "/admin/courses",     permission: PERMISSIONS.COURSE_MANAGEMENT },
    { name: "Datos Personales",           icon: Users,       href: "/admin/personal",    permission: PERMISSIONS.PERSONAL_DATA_MANAGEMENT },
    { name: "Gestión de Usuarios",        icon: Users,       href: "/admin/users",       permission: PERMISSIONS.USER_MANAGEMENT },
    { name: "Actividades",                icon: BookOpen,    href: "/admin/activities",  permission: PERMISSIONS.ACTIVITIES },
    { name: "Catálogos",                  icon: BarChart3,   href: "/admin/catalogs",    permission: PERMISSIONS.CATALOG_MANAGEMENT },
    { name: "Gráficos y Estadísticas",    icon: TrendingUp,  href: "/admin/statistics",  permission: PERMISSIONS.CATALOG_MANAGEMENT },
    { name: "Configuración",              icon: Settings,    href: "/settings",          permission: null },
  ]
  return role === 'admin' ? admin : standard
}

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeView: string
  onNavigate: (view: string) => void
  userRole?: string
}

function SidebarContent({ onClose, showClose }: { onClose: () => void; showClose: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission, user } = useAuth()

  const role = normalizeRole(user?.role)
  const navigation = getNavigationItems(role).filter(item =>
    !item.permission || hasPermission(item.permission)
  )

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href === '/') return false
    return pathname.startsWith(href)
  }

  const handleNav = (href: string, name: string) => {
    router.push(href)
    onClose()
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
  const roleLabel = role === 'admin' ? 'Administrador' : role === 'teacher' ? 'Profesor' : 'Estudiante'

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">

      <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-bold text-sidebar-foreground tracking-tight">BrainTrust</span>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest font-medium">LMS</p>
          </div>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-3 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
          Menú
        </p>
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNav(item.href, item.name)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.name}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-sidebar-accent/40">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ isOpen, onClose, activeView, onNavigate, userRole }: DashboardSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={onClose} showClose />
      </aside>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col z-30">
        <SidebarContent onClose={onClose} showClose={false} />
      </aside>
    </>
  )
}
