"use client"

import { Bell, MessageSquare, Menu, LogOut, User, Settings, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      window.location.href = '/auth/login'
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex lg:h-28 xl:h-20 items-center gap-4 px-4 md:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-semibold text-foreground">
              Bienvenido de nuevo, <span className="text-primary">{user?.name || 'Usuario'}</span>
            </h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              {user?.role === 'teacher'
                ? "Esto es lo que está pasando con tus cursos hoy"
                : "Este es tu progreso de aprendizaje de hoy"
              }
            </p>
          </div>

          <div className="flex items-center gap-2">

            {/* Cambiar tema Oscuro/Claro */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Cambiar tema"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambiar tema</span>
            </Button>

            {/* Notificaciones */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
                3
              </Badge>
            </Button>

            {/* Mensajes */}
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                1
              </Badge>
            </Button>

            {/* Configuración */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfileModal(true)}
              title="Configuración del Perfil"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Menú desplegable del Perfil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role === 'teacher' ? 'Profesor' : user?.role === 'admin' ? 'Administrador' : 'Estudiante'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Configuración del Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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