"use client"

import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { Button } from "@components/common/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/common/ui/dialog"
import { Input } from "@components/common/ui/input"
import { Label } from "@components/common/ui/label"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Eye, Search, Filter, Download, TrendingUp, Award, Users, BookOpen } from "lucide-react"

interface Calificacion {
    id: number
    alumno: string
    materia: string
    calificacion: number
    periodo: string
}

export default function CalificacionesPage() {
    const [calificaciones, setCalificaciones] = useState<Calificacion[]>([
        { id: 1, alumno: "Juan Pérez", materia: "Cálculo I", calificacion: 85, periodo: "2024-1" },
        { id: 2, alumno: "María García", materia: "Programación", calificacion: 92, periodo: "2024-1" },
        { id: 3, alumno: "Carlos López", materia: "Física I", calificacion: 78, periodo: "2024-1" },
    ])

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create")
    const [selectedCalificacion, setSelectedCalificacion] = useState<Calificacion | null>(null)
    const [formData, setFormData] = useState({
        alumno: "",
        materia: "",
        calificacion: 0,
        periodo: "",
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleOpenDialog = (mode: "create" | "edit" | "view" | "delete", calificacion?: Calificacion) => {
        setDialogMode(mode)
        if (calificacion) {
            setSelectedCalificacion(calificacion)
            setFormData({
                alumno: calificacion.alumno,
                materia: calificacion.materia,
                calificacion: calificacion.calificacion,
                periodo: calificacion.periodo,
            })
        } else {
            setSelectedCalificacion(null)
            setFormData({ alumno: "", materia: "", calificacion: 0, periodo: "" })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = () => {
        if (dialogMode === "create") {
            const newCalificacion: Calificacion = {
                id: Math.max(...calificaciones.map((c) => c.id), 0) + 1,
                ...formData,
            }
            setCalificaciones([...calificaciones, newCalificacion])
        } else if (dialogMode === "edit" && selectedCalificacion) {
            setCalificaciones(calificaciones.map((c) => (c.id === selectedCalificacion.id ? { ...c, ...formData } : c)))
        } else if (dialogMode === "delete" && selectedCalificacion) {
            setCalificaciones(calificaciones.filter((c) => c.id !== selectedCalificacion.id))
        }
        setIsDialogOpen(false)
    }

    const getDialogTitle = () => {
        switch (dialogMode) {
            case "create":
                return "Agregar Nueva Calificación"
            case "edit":
                return "Modificar Calificación"
            case "view":
                return "Consultar Calificación"
            case "delete":
                return "Eliminar Calificación"
        }
    }

    const filteredCalificaciones = calificaciones.filter(cal =>
        cal.alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cal.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cal.periodo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const promedioGeneral = calificaciones.length > 0
        ? calificaciones.reduce((sum, cal) => sum + cal.calificacion, 0) / calificaciones.length
        : 0

    const aprobados = calificaciones.filter(cal => cal.calificacion >= 70).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <AdminHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Header con animación */}
                <div className={`text-center mb-12 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Gestión de Calificaciones
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Administra y consulta las calificaciones académicas de los estudiantes
                    </p>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transform transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Promedio General</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                                    {promedioGeneral.toFixed(1)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Estudiantes Aprobados</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                                    {aprobados}/{calificaciones.length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Registros</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                                    {calificaciones.length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda y acciones */}
                <div className={`max-w-6xl mx-auto mb-8 transform transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar alumno, materia o período..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => handleOpenDialog("create")}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Calificación
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

                {/* Tabla de calificaciones */}
                <div className={`max-w-6xl mx-auto transform transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                <Users className="w-6 h-6 text-blue-600" />
                                Registro de Calificaciones
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                {filteredCalificaciones.length} registros encontrados
                            </p>
                        </div>

                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">ID</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Alumno</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Materia</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Calificación</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Periodo</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCalificaciones.map((cal, index) => (
                                    <TableRow
                                        key={cal.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <TableCell className="font-medium">{cal.id}</TableCell>
                                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                                            {cal.alumno}
                                        </TableCell>
                                        <TableCell>{cal.materia}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`font-bold text-lg ${cal.calificacion >= 90
                                                            ? "text-green-600 dark:text-green-400"
                                                            : cal.calificacion >= 70
                                                                ? "text-blue-600 dark:text-blue-400"
                                                                : "text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {cal.calificacion}
                                                </span>
                                                {cal.calificacion >= 90 && (
                                                    <Award className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                                                {cal.periodo}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("view", cal)}
                                                    className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("edit", cal)}
                                                    className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog("delete", cal)}
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

                        {filteredCalificaciones.length === 0 && (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg">No se encontraron calificaciones</p>
                                <Button
                                    onClick={() => handleOpenDialog("create")}
                                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar primera calificación
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialog (sin cambios en la funcionalidad) */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {getDialogTitle()}
                            </DialogTitle>
                        </DialogHeader>

                        {dialogMode === "delete" ? (
                            <div className="py-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-lg text-center text-slate-700 dark:text-slate-300">
                                    ¿Está seguro que desea eliminar la calificación de{" "}
                                    <span className="font-bold text-red-600 dark:text-red-400">{selectedCalificacion?.alumno}</span> en{" "}
                                    <span className="font-bold text-red-600 dark:text-red-400">{selectedCalificacion?.materia}</span>?
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                                    Esta acción no se puede deshacer
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="alumno" className="font-semibold text-slate-700 dark:text-slate-300">
                                        Alumno
                                    </Label>
                                    <Input
                                        id="alumno"
                                        value={formData.alumno}
                                        onChange={(e) => setFormData({ ...formData, alumno: e.target.value })}
                                        disabled={dialogMode === "view"}
                                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="materia" className="font-semibold text-slate-700 dark:text-slate-300">
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
                                    <Label htmlFor="calificacion" className="font-semibold text-slate-700 dark:text-slate-300">
                                        Calificación
                                    </Label>
                                    <Input
                                        id="calificacion"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.calificacion}
                                        onChange={(e) => setFormData({ ...formData, calificacion: Number.parseInt(e.target.value) || 0 })}
                                        disabled={dialogMode === "view"}
                                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="periodo" className="font-semibold text-slate-700 dark:text-slate-300">
                                        Periodo
                                    </Label>
                                    <Input
                                        id="periodo"
                                        value={formData.periodo}
                                        onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
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
                                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    }
                                >
                                    {dialogMode === "delete" ? "Eliminar" : "Guardar"}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}