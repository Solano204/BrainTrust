"use client"

import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { Button } from "@components/common/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/common/ui/dialog"
import { Input } from "@components/common/ui/input"
import { Label } from "@components/common/ui/label"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Eye, Search, Filter, Download, Users, Calendar, Building, BookOpen, Clock, UserCheck } from "lucide-react"

interface ProfesorMateria {
    id: number
    profesor: string
    materia: string
    horario: string
    aula: string
}

export default function GestionProfesoresAcademicaPage() {
    const [asignaciones, setAsignaciones] = useState<ProfesorMateria[]>([
        { id: 1, profesor: "Ana Martínez", materia: "Calculo I", horario: "Lun-Mie 8:00-10:00", aula: "A101" },
        { id: 2, profesor: "Pedro Sánchez", materia: "Fisica I", horario: "Mar-Jue 10:00-12:00", aula: "B202" },
        { id: 3, profesor: "Laura Rodríguez", materia: "Programacion", horario: "Lun-Vie 14:00-16:00", aula: "C303" },
    ])

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create")
    const [selectedAsignacion, setSelectedAsignacion] = useState<ProfesorMateria | null>(null)
    const [formData, setFormData] = useState({
        profesor: "",
        materia: "",
        horario: "",
        aula: "",
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleOpenDialog = (mode: "create" | "edit" | "view" | "delete", asignacion?: ProfesorMateria) => {
        setDialogMode(mode)
        if (asignacion) {
            setSelectedAsignacion(asignacion)
            setFormData({
                profesor: asignacion.profesor,
                materia: asignacion.materia,
                horario: asignacion.horario,
                aula: asignacion.aula,
            })
        } else {
            setSelectedAsignacion(null)
            setFormData({ profesor: "", materia: "", horario: "", aula: "" })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = () => {
        if (dialogMode === "create") {
            const newAsignacion: ProfesorMateria = {
                id: Math.max(...asignaciones.map((a) => a.id), 0) + 1,
                ...formData,
            }
            setAsignaciones([...asignaciones, newAsignacion])
        } else if (dialogMode === "edit" && selectedAsignacion) {
            setAsignaciones(asignaciones.map((a) => (a.id === selectedAsignacion.id ? { ...a, ...formData } : a)))
        } else if (dialogMode === "delete" && selectedAsignacion) {
            setAsignaciones(asignaciones.filter((a) => a.id !== selectedAsignacion.id))
        }
        setIsDialogOpen(false)
    }

    const getDialogTitle = () => {
        switch (dialogMode) {
            case "create":
                return "Asignar Profesor a Materia"
            case "edit":
                return "Modificar Asignación"
            case "view":
                return "Consultar Asignación"
            case "delete":
                return "Remover Asignación"
        }
    }

    const filteredAsignaciones = asignaciones.filter(asignacion =>
        asignacion.profesor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asignacion.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asignacion.aula.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const profesoresUnicos = [...new Set(asignaciones.map(a => a.profesor))].length
    const materiasUnicas = [...new Set(asignaciones.map(a => a.materia))].length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <AdminHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Header con animación */}
                <div className={`text-center mb-12 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        Asignación de Profesores
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Gestiona las asignaciones de profesores a materias y horarios.
                    </p>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transform transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Asignaciones</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                                    {asignaciones.length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                <UserCheck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Profesores Activos</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                                    {profesoresUnicos}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Materias Asignadas</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                                    {materiasUnicas}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <BookOpen className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda y acciones principales */}
                <div className={`max-w-6xl mx-auto mb-8 transform transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar profesor, materia o aula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => handleOpenDialog("create")}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Asignación
                            </Button>

                            <Button variant="outline" className="border-slate-300 dark:border-slate-600">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrar
                            </Button>

                            <Button variant="outline" className="border-slate-300 dark:border-slate-600">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabla de asignaciones */}
                <div className={`max-w-6xl mx-auto transform transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                <UserCheck className="w-6 h-6 text-orange-600" />
                                Asignaciones Activas
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                {filteredAsignaciones.length} asignaciones encontradas
                            </p>
                        </div>

                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">ID</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Profesor</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Materia</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Horario</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Aula</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAsignaciones.map((asignacion, index) => (
                                    <TableRow
                                        key={asignacion.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                {asignacion.id}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                {asignacion.profesor}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-purple-500" />
                                                {asignacion.materia}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-green-500" />
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full">
                                                    {asignacion.horario}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-orange-500" />
                                                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm font-medium rounded-full">
                                                    {asignacion.aula}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("view", asignacion)}
                                                    className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("edit", asignacion)}
                                                    className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("delete", asignacion)}
                                                    className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filteredAsignaciones.length === 0 && (
                            <div className="text-center py-12">
                                <UserCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg">No se encontraron asignaciones</p>
                                <Button
                                    onClick={() => handleOpenDialog("create")}
                                    className="mt-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear primera asignación
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de acción específicos (manteniendo la funcionalidad original) */}
                <div className={`max-w-6xl mx-auto mt-8 flex flex-wrap justify-center gap-4 transform transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <Button
                        onClick={() => handleOpenDialog("create")}
                        variant="outline"
                        className="w-48 h-12 font-bold border-2 border-orange-600 hover:bg-orange-600 hover:text-white bg-transparent transition-all duration-300"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Asignar
                    </Button>
                    <Button
                        onClick={() => {
                            if (asignaciones.length > 0) {
                                handleOpenDialog("delete", asignaciones[0])
                            }
                        }}
                        variant="outline"
                        className="w-48 h-12 font-bold border-2 border-red-600 hover:bg-red-600 hover:text-white bg-transparent transition-all duration-300"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Remover
                    </Button>
                    <Button
                        onClick={() => {
                            if (asignaciones.length > 0) {
                                handleOpenDialog("edit", asignaciones[0])
                            }
                        }}
                        variant="outline"
                        className="w-48 h-12 font-bold border-2 border-green-600 hover:bg-green-600 hover:text-white bg-transparent transition-all duration-300"
                    >
                        <Edit className="w-5 h-5 mr-2" />
                        Modificar
                    </Button>
                    <Button
                        onClick={() => {
                            if (asignaciones.length > 0) {
                                handleOpenDialog("view", asignaciones[0])
                            }
                        }}
                        variant="outline"
                        className="w-48 h-12 font-bold border-2 border-blue-600 hover:bg-blue-600 hover:text-white bg-transparent transition-all duration-300"
                    >
                        <Eye className="w-5 h-5 mr-2" />
                        Consultar
                    </Button>
                </div>

                {/* Dialog (sin cambios en la funcionalidad) */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                {getDialogTitle()}
                            </DialogTitle>
                        </DialogHeader>

                        {dialogMode === "delete" ? (
                            <div className="py-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-lg text-center text-slate-700 dark:text-slate-300">
                                    ¿Está seguro que desea remover la asignación de{" "}
                                    <span className="font-bold text-red-600 dark:text-red-400">{selectedAsignacion?.profesor}</span> a{" "}
                                    <span className="font-bold text-red-600 dark:text-red-400">{selectedAsignacion?.materia}</span>?
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                                    Horario: <span className="font-mono">{selectedAsignacion?.horario}</span> • Aula: {selectedAsignacion?.aula}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="profesor" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Profesor
                                    </Label>
                                    <Input
                                        id="profesor"
                                        value={formData.profesor}
                                        onChange={(e) => setFormData({ ...formData, profesor: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="materia" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Materia
                                    </Label>
                                    <Input
                                        id="materia"
                                        value={formData.materia}
                                        onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="horario" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Horario
                                    </Label>
                                    <Input
                                        id="horario"
                                        value={formData.horario}
                                        onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="aula" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Aula
                                    </Label>
                                    <Input
                                        id="aula"
                                        value={formData.aula}
                                        onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="border-slate-300 dark:border-slate-600"
                            >
                                Cancelar
                            </Button>
                            {dialogMode !== "view" && (
                                <Button
                                    onClick={handleSubmit}
                                    className={
                                        dialogMode === "delete"
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                                    }
                                >
                                    {dialogMode === "delete" ? "Remover" : "Guardar"}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}