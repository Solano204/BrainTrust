"use client"

import { AdminHeader } from "@/src/presentation/components/layout/AdminHeader/AdminHeader"
import { Button } from "@/src/presentation/components/common/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/presentation/components/common/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/presentation/components/common/ui/dialog"
import { Input } from "@/src/presentation/components/common/ui/input"
import { Label } from "@/src/presentation/components//common/ui/label"
import { useState } from "react"
import { Plus, Trash2, Edit, Eye, Search, Shield, Crown, Settings } from "lucide-react"

interface Administrador {
    id: number
    nombre: string
    apellido: string
    email: string
    rol: string
}

export default function GestionAdministradoresPage() {
    const [administradores, setAdministradores] = useState<Administrador[]>([
        { id: 1, nombre: "Roberto", apellido: "Fernández", email: "roberto@example.com", rol: "Director" },
        { id: 2, nombre: "Sofia", apellido: "Torres", email: "sofia@example.com", rol: "Subdirector" },
    ])

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create")
    const [selectedAdmin, setSelectedAdmin] = useState<Administrador | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        rol: "",
    })

    const handleOpenDialog = (mode: "create" | "edit" | "view" | "delete", admin?: Administrador) => {
        setDialogMode(mode)
        if (admin) {
            setSelectedAdmin(admin)
            setFormData({
                nombre: admin.nombre,
                apellido: admin.apellido,
                email: admin.email,
                rol: admin.rol,
            })
        } else {
            setSelectedAdmin(null)
            setFormData({ nombre: "", apellido: "", email: "", rol: "" })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = () => {
        if (dialogMode === "create") {
            const newAdmin: Administrador = {
                id: Math.max(...administradores.map((a) => a.id), 0) + 1,
                ...formData,
            }
            setAdministradores([...administradores, newAdmin])
        } else if (dialogMode === "edit" && selectedAdmin) {
            setAdministradores(administradores.map((a) => (a.id === selectedAdmin.id ? { ...a, ...formData } : a)))
        } else if (dialogMode === "delete" && selectedAdmin) {
            setAdministradores(administradores.filter((a) => a.id !== selectedAdmin.id))
        }
        setIsDialogOpen(false)
    }

    const getDialogTitle = () => {
        switch (dialogMode) {
            case "create":
                return "Agregar Nuevo Administrador"
            case "edit":
                return "Modificar Administrador"
            case "view":
                return "Consultar Administrador"
            case "delete":
                return "Eliminar Administrador"
        }
    }

    const filteredAdministradores = administradores.filter(
        (admin) =>
            admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.rol.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Obtener roles únicos para estadísticas
    const rolesUnicos = new Set(administradores.map(a => a.rol)).size

    // Función para obtener el ícono del rol
    const getRolIcon = (rol: string) => {
        if (rol.toLowerCase().includes('director')) {
            return <Crown className="w-3.5 h-3.5" />
        } else if (rol.toLowerCase().includes('subdirector')) {
            return <Shield className="w-3.5 h-3.5" />
        }
        return <Settings className="w-3.5 h-3.5" />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/10 rounded-full blur-3xl"></div>
            </div>

            <AdminHeader />

            <main className="container mx-auto px-4 py-8 relative z-10">
                {/* Header con animación */}
                <div className="text-center mb-12 animate-fade-in-down">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-600 to-rose-600 bg-clip-text text-transparent">
                            Gestión de Administradores
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Administra roles y permisos del sistema
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Administradores</p>
                                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{administradores.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Roles Activos</p>
                                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{rolesUnicos}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                                    <Search className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Encontrados</p>
                                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{filteredAdministradores.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                    Área de Alta Seguridad
                                </h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Los cambios en esta sección afectan los permisos y accesos del sistema. Procede con precaución.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                        {/* Search Bar */}
                        <div className="flex-grow w-full lg:w-auto">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                                <Input
                                    placeholder="Buscar por nombre, apellido, email o rol..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Action Buttons Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
                            <Button
                                onClick={() => handleOpenDialog("create")}
                                className="h-12 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Alta
                            </Button>

                            <Button
                                onClick={() => {
                                    if (administradores.length > 0) {
                                        handleOpenDialog("delete", administradores[0])
                                    }
                                }}
                                className="h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Baja
                            </Button>

                            <Button
                                onClick={() => {
                                    if (administradores.length > 0) {
                                        handleOpenDialog("edit", administradores[0])
                                    }
                                }}
                                className="h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Modificar
                            </Button>

                            <Button
                                onClick={() => {
                                    if (administradores.length > 0) {
                                        handleOpenDialog("view", administradores[0])
                                    }
                                }}
                                className="h-12 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <Eye className="w-5 h-5 mr-2" />
                                Consultar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="p-6 bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-blue-500/10 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    Panel de Administración
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {filteredAdministradores.length} {filteredAdministradores.length === 1 ? 'administrador encontrado' : 'administradores encontrados'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">ID</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Nombre</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Apellido</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Email</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Rol</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAdministradores.map((admin, index) => (
                                    <TableRow
                                        key={admin.id}
                                        className="hover:bg-purple-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 animate-fade-in-up"
                                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                                    >
                                        <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 font-bold text-sm">
                                                {admin.id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">{admin.nombre}</TableCell>
                                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">{admin.apellido}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400">{admin.email}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                                                {getRolIcon(admin.rol)}
                                                {admin.rol}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("view", admin)}
                                                    className="hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-200"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("edit", admin)}
                                                    className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("delete", admin)}
                                                    className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredAdministradores.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                No se encontraron administradores
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                                Intenta con otros términos de búsqueda
                            </p>
                        </div>
                    )}
                </div>

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[550px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {getDialogTitle()}
                            </DialogTitle>
                        </DialogHeader>

                        {dialogMode === "delete" ? (
                            <div className="py-6">
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                                ¿Confirmar eliminación?
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-400 mb-3">
                                                Estás a punto de eliminar al administrador{" "}
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    {selectedAdmin?.nombre} {selectedAdmin?.apellido}
                                                </span>
                                                . Esta acción no se puede deshacer.
                                            </p>
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                                <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                                    <Shield className="w-4 h-4" />
                                                    Esta acción podría afectar los permisos del sistema
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="nombre" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Nombre
                                    </Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="apellido" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Apellido
                                    </Label>
                                    <Input
                                        id="apellido"
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="rol" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Rol
                                    </Label>
                                    <Input
                                        id="rol"
                                        value={formData.rol}
                                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="Ej: Director, Subdirector, Coordinador..."
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="border-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancelar
                            </Button>
                            {dialogMode !== "view" && (
                                <Button
                                    onClick={handleSubmit}
                                    className={`font-semibold ${dialogMode === "delete"
                                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        } text-white shadow-lg hover:shadow-xl transition-all`}
                                >
                                    {dialogMode === "delete" ? "Eliminar" : "Guardar"}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>

            <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>
        </div>
    )
}