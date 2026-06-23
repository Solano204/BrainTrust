'use client';

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    Users,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    Shield,
    X,
    Save,
    Eye,
    Download,
    BarChart3
} from "lucide-react"


type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: UserRole
    status: UserStatus
    createdAt: string
    lastLogin: string | null
    coursesCount: number
    avatarUrl: string
}


const mockUsers: User[] = [
    {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@universidad.edu',
        phone: '+52 961 123 4567',
        role: 'TEACHER',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00',
        lastLogin: '2025-01-18T14:22:00',
        coursesCount: 3,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan'
    },
    {
        id: '2',
        firstName: 'María',
        lastName: 'López Hernández',
        email: 'maria.lopez@universidad.edu',
        phone: '+52 961 234 5678',
        role: 'STUDENT',
        status: 'ACTIVE',
        createdAt: '2024-02-20T09:15:00',
        lastLogin: '2025-01-19T08:45:00',
        coursesCount: 5,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    },
    {
        id: '3',
        firstName: 'Carlos',
        lastName: 'Ramírez Torres',
        email: 'carlos.ramirez@universidad.edu',
        phone: '+52 961 345 6789',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: '2023-09-10T12:00:00',
        lastLogin: '2025-01-19T16:30:00',
        coursesCount: 0,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    {
        id: '4',
        firstName: 'Ana',
        lastName: 'Martínez Silva',
        email: 'ana.martinez@universidad.edu',
        phone: '+52 961 456 7890',
        role: 'STUDENT',
        status: 'INACTIVE',
        createdAt: '2024-03-05T11:20:00',
        lastLogin: '2024-12-15T10:00:00',
        coursesCount: 2,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
    },
    {
        id: '5',
        firstName: 'Luis',
        lastName: 'González Ruiz',
        email: 'luis.gonzalez@universidad.edu',
        phone: '+52 961 567 8901',
        role: 'TEACHER',
        status: 'SUSPENDED',
        createdAt: '2024-01-22T14:45:00',
        lastLogin: '2025-01-10T09:30:00',
        coursesCount: 2,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis'
    }
]


function UserStatsCards({ users }: { users: User[] }) {
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        inactive: users.filter(u => u.status === 'INACTIVE').length,
        teachers: users.filter(u => u.role === 'TEACHER').length,
        students: users.filter(u => u.role === 'STUDENT').length,
        admins: users.filter(u => u.role === 'ADMIN').length
    }), [users])

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">

        </div>
    )
}


interface UserFormModalProps {
    open: boolean
    onClose: () => void
    initialData?: User
    onSave: (userData: Partial<User>) => void
    isSaving?: boolean
}

function UserFormModal({ open, onClose, initialData, onSave, isSaving }: UserFormModalProps) {
    const isEditMode = !!initialData
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        role: initialData?.role || 'STUDENT' as UserRole,
        status: initialData?.status || 'ACTIVE' as UserStatus
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    if (!open) return null
return (
  <div className="modal-overlay">
    <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="icon-badge">
              <Users className="w-4 h-4 text-primary" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditMode ? 'Actualiza los datos del usuario' : 'Completa los datos del nuevo usuario'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="icon-btn transition-all disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-semibold text-foreground">
                Nombre *
              </label>
              <input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isSaving}
                placeholder="Ej: Juan"
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-xs font-semibold text-foreground">
                Apellidos *
              </label>
              <input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isSaving}
                placeholder="Ej: Pérez García"
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-foreground">
              Correo Electrónico *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSaving}
              placeholder="usuario@universidad.edu"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-semibold text-foreground">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="+52 961 123 4567"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-xs font-semibold text-foreground">
                Rol *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isSaving}
                className="input-field"
              >
                <option value="STUDENT">Estudiante</option>
                <option value="TEACHER">Profesor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-foreground">
                Estado *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSaving}
                className="input-field"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="SUSPENDED">Suspendido</option>
              </select>
            </div>
          </div>

        </div>

        <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />{isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}</>
              }
            </button>
          </div>
        </div>

      </form>
    </div>
  </div>
);}
function UserDetailModal({ user, open, onClose }: { user: User | null, open: boolean, onClose: () => void }) {
    if (!open || !user) return null

    const formatDate = (date: string | null) => {
        if (!date) return 'Nunca'
        return new Date(date).toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }

    return (
  <div className="modal-overlay">
    <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

      <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <span className="icon-badge">
            <Eye className="w-4 h-4 text-primary" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Detalles del Usuario
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Información completa del perfil
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="icon-btn transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 space-y-6">

        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <img
            src={user.avatarUrl}
            alt={user.firstName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-border object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold ${
            user.status === 'ACTIVE'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {user.status === 'ACTIVE' ? 'Activo' : user.status === 'INACTIVE' ? 'Inactivo' : 'Suspendido'}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="section-label flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            Información de Contacto
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Correo Electrónico',     value: user.email },
              { label: 'Teléfono', value: user.phone },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-2xl px-4 py-3 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="section-label flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Información de la Cuenta
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Rol',           value: user.role === 'ADMIN' ? 'Administrador' : user.role === 'TEACHER' ? 'Profesor' : 'Estudiante' },
              { label: 'Estado',        value: user.status === 'ACTIVE' ? 'Activo' : user.status === 'INACTIVE' ? 'Inactivo' : 'Suspendido' },
              { label: 'Creado',        value: formatDate(user.createdAt) },
              { label: 'Último acceso', value: formatDate(user.lastLogin) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-2xl px-4 py-3 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="section-label flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Estadísticas
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{user.coursesCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cursos</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tareas</p>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-accent-foreground">87%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rendimiento</p>
            </div>
          </div>
        </div>

      </div>

      <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
        <button
          onClick={onClose}
          className="btn-ghost w-full"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
);
}

export default function AdminUsersModule() {
    const [users] = useState<User[]>(mockUsers)
    const [isLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesTab =
                activeTab === 'all' ||
                user.role.toLowerCase() === activeTab.toLowerCase()

            return matchesSearch && matchesTab
        })
    }, [users, searchTerm, activeTab])

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setShowFormModal(true)
    }

    const handleView = (user: User) => {
        setSelectedUser(user)
        setShowDetailModal(true)
    }

    const handleSave = (userData: Partial<User>) => {
        setIsSaving(true)
        setTimeout(() => {
            console.log('Guardando:', userData)
            setIsSaving(false)
            setShowFormModal(false)
            setSelectedUser(null)
        }, 1500)
    }

    const handleExport = () => {
        console.log('Exportando usuarios...')
    }

    const getRoleBadge = (role: UserRole) => {
        const colors = {
            ADMIN: 'bg-red-100 text-red-800',
            TEACHER: 'bg-purple-100 text-purple-800',
            STUDENT: 'bg-blue-100 text-blue-800'
        }
        return colors[role]
    }

    const getStatusBadge = (status: UserStatus) => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-800',
            INACTIVE: 'bg-gray-100 text-gray-800',
            SUSPENDED: 'bg-red-100 text-red-800'
        }
        return colors[status]
    }

    return (
  <div className="page-container">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra todos los usuarios del sistema
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
        <button
          onClick={() => { setSelectedUser(null); setShowFormModal(true); }}
          className="btn-primary shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>
    </div>

    <UserStatsCards users={users} />

    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        placeholder="Buscar por nombre, apellido o correo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      />
    </div>

    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
      <TabsList className="w-full grid grid-cols-4 rounded-2xl bg-muted/50 p-1 h-auto">
        {[
          { value: 'all',     label: 'Todos',       count: users.length },
          { value: 'student', label: 'Estudiantes', count: users.filter(u => u.role === 'STUDENT').length },
          { value: 'teacher', label: 'Profesores',  count: users.filter(u => u.role === 'TEACHER').length },
          { value: 'admin',   label: 'Admins',      count: users.filter(u => u.role === 'ADMIN').length },
        ].map(({ value, label, count }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-xl py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
          >
            {label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold hidden sm:inline">
              {count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="space-y-4">

        {isLoading ? (
          <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm">Cargando usuarios...</p>
          </div>

        ) : filteredUsers.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center text-sm text-muted-foreground">
            No se encontraron usuarios
          </div>

        ) : (
          <>
            <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    {[
                      { label: 'Usuario',       align: 'left'   },
                      { label: 'Contacto',      align: 'left'   },
                      { label: 'Rol',           align: 'left'   },
                      { label: 'Estado',        align: 'left'   },
                      { label: 'Último Acceso', align: 'left'   },
                      { label: 'Acciones',      align: 'center' },
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-${align}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group">

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl}
                            alt={user.firstName}
                            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.coursesCount} cursos</p>
                          </div>
                        </div>
                       </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                       </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getRoleBadge(user.role)}`}>
                          {user.role === 'ADMIN' ? 'Administrador' : user.role === 'TEACHER' ? 'Profesor' : 'Estudiante'}
                        </span>
                       </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getStatusBadge(user.status)}`}>
                          {user.status === 'ACTIVE' ? 'Activo' : user.status === 'INACTIVE' ? 'Inactivo' : 'Suspendido'}
                        </span>
                       </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('es-MX')
                          : 'Nunca'}
                       </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleView(user)}
                            className="icon-btn-primary transition-all"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="icon-btn-primary transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="icon-btn-destructive transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                       </td>

                     </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-card rounded-2xl border border-border p-4 space-y-4">

                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getRoleBadge(user.role)}`}>
                          {user.role === 'ADMIN' ? 'Administrador' : user.role === 'TEACHER' ? 'Profesor' : 'Estudiante'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getStatusBadge(user.status)}`}>
                          {user.status === 'ACTIVE' ? 'Activo' : user.status === 'INACTIVE' ? 'Inactivo' : 'Suspendido'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Teléfono', value: user.phone },
                      { label: 'Cursos',   value: user.coursesCount },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      className="p-2 rounded-xl border border-border text-destructive hover:bg-destructive/10 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>

    <UserFormModal
      open={showFormModal}
      onClose={() => { setShowFormModal(false); setSelectedUser(null); }}
      initialData={selectedUser || undefined}
      onSave={handleSave}
      isSaving={isSaving}
    />
    <UserDetailModal
      user={selectedUser}
      open={showDetailModal}
      onClose={() => { setShowDetailModal(false); setSelectedUser(null); }}
    />

  </div>
);
}