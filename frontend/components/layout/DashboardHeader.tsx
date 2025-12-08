// import { Menu, Bell, Search, LogOut } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Badge } from "@/components/ui/badge"
// import { useAuth } from "@/app/context/AuthContext"
// import { useRouter } from "next/navigation"

// interface DashboardHeaderProps {
//     onMenuClick: () => void
//     userRole?: string
// }

// export function DashboardHeader({ onMenuClick, userRole = 'student' }: DashboardHeaderProps) {
//     const { user, logout } = useAuth()
//     const router = useRouter()

//     const handleLogout = async () => {
//         await logout()
//         router.push('/login')
//     }

//     const getRoleBadge = (role: string) => {
//         const badges = {
//             admin: { label: 'Administrador', variant: 'destructive' as const },
//             teacher: { label: 'Profesor', variant: 'default' as const },
//             student: { label: 'Estudiante', variant: 'secondary' as const }
//         }
//         return badges[role as keyof typeof badges] || badges.student
//     }

//     const roleBadge = getRoleBadge(userRole)

//     return (
//         <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
//             {/* Mobile menu button */}
//             <Button
//                 variant="ghost"
//                 size="icon"
//                 className="lg:hidden"
//                 onClick={onMenuClick}
//             >
//                 <Menu className="h-6 w-6" />
//                 <span className="sr-only">Open sidebar</span>
//             </Button>

//             {/* Separator */}
//             <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

//             {/* Search bar - Desktop only */}
//             <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
//                 <div className="relative flex flex-1 items-center">
//                     <div className="hidden md:block w-full max-w-lg">
//                         <div className="relative">
//                             {user?.role}
//                             <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                             <Input
//                                 type="search"
//                                 placeholder="Buscar cursos, estudiantes, tareas..."
//                                 className="w-full pl-10 pr-4"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right side */}
//                 <div className="flex items-center gap-x-4 lg:gap-x-6">
//                     {/* Notifications */}
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="relative">
//                                 <Bell className="h-5 w-5" />
//                                 <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
//                                     3
//                                 </span>
//                                 <span className="sr-only">View notifications</span>
//                             </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-80">
//                             <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
//                             <DropdownMenuSeparator />
//                             <div className="max-h-96 overflow-y-auto">
//                                 <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
//                                     <div className="flex w-full items-center justify-between">
//                                         <span className="font-medium">Nueva tarea asignada</span>
//                                         <Badge variant="secondary" className="text-xs">Nuevo</Badge>
//                                     </div>
//                                     <span className="text-xs text-muted-foreground">
//                                         Matemáticas Avanzadas - Tarea 5
//                                     </span>
//                                     <span className="text-xs text-muted-foreground">Hace 2 horas</span>
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
//                                     <div className="flex w-full items-center justify-between">
//                                         <span className="font-medium">Calificación publicada</span>
//                                         <Badge variant="secondary" className="text-xs">Nuevo</Badge>
//                                     </div>
//                                     <span className="text-xs text-muted-foreground">
//                                         Programación Web - Examen Final
//                                     </span>
//                                     <span className="text-xs text-muted-foreground">Hace 5 horas</span>
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
//                                     <span className="font-medium">Recordatorio de entrega</span>
//                                     <span className="text-xs text-muted-foreground">
//                                         Física Cuántica - Proyecto Final
//                                     </span>
//                                     <span className="text-xs text-muted-foreground">Hace 1 día</span>
//                                 </DropdownMenuItem>
//                             </div>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem className="text-center text-primary cursor-pointer">
//                                 Ver todas las notificaciones
//                             </DropdownMenuItem>
//                         </DropdownMenuContent>
//                     </DropdownMenu>

//                     {/* Separator */}
//                     <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

//                     {/* User menu */}
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" className="gap-2 px-2">
//                                 <div className="flex items-center gap-2">
//                                     <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
//                                         {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
//                                     </div>
//                                     <div className="hidden lg:block text-left">
//                                         <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
//                                         <Badge variant={roleBadge.variant} className="text-xs mt-0.5">
//                                             {roleBadge.label}
//                                         </Badge>
//                                     </div>
//                                 </div>
//                             </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-56">
//                             <DropdownMenuLabel>
//                                 <div className="flex flex-col space-y-1">
//                                     <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
//                                     <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
//                                 </div>
//                             </DropdownMenuLabel>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem onClick={() => router.push('/profile')}>
//                                 Mi Perfil
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => router.push('/settings')}>
//                                 Configuración
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => router.push('/help')}>
//                                 Ayuda y Soporte
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                                 onClick={handleLogout}
//                                 className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
//                             >
//                                 <LogOut className="mr-2 h-4 w-4" />
//                                 Cerrar Sesión
//                             </DropdownMenuItem>
//                         </DropdownMenuContent>
//                     </DropdownMenu>
//                 </div>
//             </div>
//         </header>
//     )
// }