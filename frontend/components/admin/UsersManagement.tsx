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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Users className="h-6 w-6" />
                            {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="font-semibold">Nombre *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    placeholder="Ej: Juan"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="font-semibold">Apellidos *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    placeholder="Ej: Pérez García"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                                placeholder="usuario@universidad.edu"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="font-semibold">Teléfono</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={isSaving}
                                placeholder="+52 961 123 4567"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="font-semibold">Rol *</Label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2"
                                    disabled={isSaving}
                                >
                                    <option value="STUDENT">Estudiante</option>
                                    <option value="TEACHER">Profesor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="font-semibold">Estado *</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2"
                                    disabled={isSaving}
                                >
                                    <option value="ACTIVE">Activo</option>
                                    <option value="INACTIVE">Inactivo</option>
                                    <option value="SUSPENDED">Suspendido</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 dark:bg-gray-800">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}


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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Eye className="h-6 w-6" />
                        Detalles del Usuario
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Avatar y nombre */}
                    <div className="flex items-center gap-4 pb-4 border-b">
                        <img
                            src={user.avatarUrl}
                            alt={user.firstName}
                            className="w-20 h-20 rounded-full border-4 border-primary/50"
                        />
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold">{user.firstName} {user.lastName}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {user.status}
                        </Badge>
                    </div>

                    {/* Información de contacto */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Información de Contacto
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Teléfono</p>
                                <p className="font-medium">{user.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Información de Cuenta
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Rol</p>
                                <p className="font-medium">{user.role}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Estado</p>
                                <p className="font-medium">{user.status}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Creado</p>
                                <p className="font-medium">{formatDate(user.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Último acceso</p>
                                <p className="font-medium">{formatDate(user.lastLogin)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Estadísticas
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="p-4 text-center">
                                <p className="text-2xl font-bold text-primary">{user.coursesCount}</p>
                                <p className="text-xs text-muted-foreground">Cursos</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">24</p>
                                <p className="text-xs text-muted-foreground">Tareas</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-2xl font-bold text-blue-600">87%</p>
                                <p className="text-xs text-muted-foreground">Rendimiento</p>
                            </Card>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t">
                    <Button onClick={onClose} className="w-full">
                        Cerrar
                    </Button>
                </div>
            </Card>
        </div>
    )
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
        // Simular guardado
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
        <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra todos los usuarios del sistema
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                    <Button onClick={() => {
                        setSelectedUser(null)
                        setShowFormModal(true)
                    }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>
            </div>

            <UserStatsCards users={users} />

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, apellido o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                        Todos ({users.length})
                    </TabsTrigger>
                    <TabsTrigger value="student">
                        Estudiantes ({users.filter(u => u.role === 'STUDENT').length})
                    </TabsTrigger>
                    <TabsTrigger value="teacher">
                        Profesores ({users.filter(u => u.role === 'TEACHER').length})
                    </TabsTrigger>
                    <TabsTrigger value="admin">
                        Admins ({users.filter(u => u.role === 'ADMIN').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                    {isLoading ? (
                        <Card className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p>Cargando usuarios...</p>
                        </Card>
                    ) : filteredUsers.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            No se encontraron usuarios
                        </Card>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <Card className="hidden lg:block overflow-hidden shadow-lg">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Usuario</th>
                                            <th className="px-6 py-4 text-left font-semibold">Contacto</th>
                                            <th className="px-6 py-4 text-left font-semibold">Rol</th>
                                            <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                            <th className="px-6 py-4 text-left font-semibold">Último Acceso</th>
                                            <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.avatarUrl}
                                                            alt={user.firstName}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                            <p className="text-sm text-muted-foreground">{user.coursesCount} cursos</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{user.email}</p>
                                                        <p className="text-muted-foreground">{user.phone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={getRoleBadge(user.role)}>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={getStatusBadge(user.status)}>
                                                        {user.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {user.lastLogin
                                                        ? new Date(user.lastLogin).toLocaleDateString('es-MX')
                                                        : 'Nunca'
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleView(user)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>

                            <div className="lg:hidden space-y-4">
                                {filteredUsers.map((user) => (
                                    <Card key={user.id} className="p-4">
                                        <div className="flex items-start gap-3 mb-4">
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.firstName}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg truncate">
                                                    {user.firstName} {user.lastName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge className={getRoleBadge(user.role)}>
                                                        {user.role}
                                                    </Badge>
                                                    <Badge className={getStatusBadge(user.status)}>
                                                        {user.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Teléfono</p>
                                                <p className="font-medium">{user.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Cursos</p>
                                                <p className="font-medium">{user.coursesCount}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleView(user)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            <UserFormModal
                open={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedUser(null)
                }}
                initialData={selectedUser || undefined}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <UserDetailModal
                user={selectedUser}
                open={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false)
                    setSelectedUser(null)
                }}
            />
        </div>
    )
}