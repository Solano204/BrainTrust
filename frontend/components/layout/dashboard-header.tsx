"use client"

import { Bell, Menu, LogOut, User, Settings, Sun, Moon, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/context/AuthContext"
import { ProfileModal } from "../auth/profile-modal"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await logout()
      await new Promise(resolve => setTimeout(resolve, 100))
      window.location.href = '/auth/login'
    } catch {
      window.location.href = '/auth/login'
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
  const roleLabel = user?.role === 'teacher' ? 'Profesor' : user?.role === 'admin' ? 'Administrador' : 'Estudiante'

  return (
    <>
      <header className="sticky top-0 z-40 h-16 flex items-center gap-4 px-4 sm:px-6 lg:px-8 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">

        <button
          onClick={onMenuClick}
          className="icon-btn lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
            Bienvenido,{" "}
            <span className="text-primary font-bold">{user?.name?.split(' ')[0] || 'Usuario'}</span>
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block leading-tight mt-0.5">
            {user?.role === 'teacher'
              ? "Gestiona tus cursos y estudiantes"
              : user?.role === 'admin'
              ? "Panel de administración"
              : "Tu progreso de aprendizaje"}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="icon-btn relative"
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          <button className="icon-btn relative" aria-label="Notificaciones">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted/50 transition-all duration-150 focus:outline-none">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'Usuario'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{roleLabel}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 rounded-2xl border-border shadow-lg" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowProfileModal(true)}
                className="gap-2 rounded-xl mx-1 cursor-pointer"
              >
                <User className="h-4 w-4" />
                Perfil y configuración
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowProfileModal(true)}
                className="gap-2 rounded-xl mx-1 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Ajustes de cuenta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 rounded-xl mx-1 mb-1 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  )
}
