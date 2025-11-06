"use client"

import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { Button } from "@components/common/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/common/ui/dialog"
import { Input } from "@components/common/ui/input"
import { Label } from "@components/common/ui/label"
import { useState } from "react"
import { Plus, Trash2, Edit, Eye, Search, GraduationCap, BookOpen } from "lucide-react"

interface Profesor {
  id: number
  nombre: string
  apellido: string
  email: string
  especialidad: string
}

export default function GestionProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([
    { id: 1, nombre: "Ana", apellido: "Martínez", email: "ana@example.com", especialidad: "Matemáticas" },
    { id: 2, nombre: "Pedro", apellido: "Sánchez", email: "pedro@example.com", especialidad: "Física" },
    { id: 3, nombre: "Laura", apellido: "Rodríguez", email: "laura@example.com", especialidad: "Química" },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create")
  const [selectedProfesor, setSelectedProfesor] = useState<Profesor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    especialidad: "",
  })

  const handleOpenDialog = (mode: "create" | "edit" | "view" | "delete", profesor?: Profesor) => {
    setDialogMode(mode)
    if (profesor) {
      setSelectedProfesor(profesor)
      setFormData({
        nombre: profesor.nombre,
        apellido: profesor.apellido,
        email: profesor.email,
        especialidad: profesor.especialidad,
      })
    } else {
      setSelectedProfesor(null)
      setFormData({ nombre: "", apellido: "", email: "", especialidad: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (dialogMode === "create") {
      const newProfesor: Profesor = {
        id: Math.max(...profesores.map((p) => p.id), 0) + 1,
        ...formData,
      }
      setProfesores([...profesores, newProfesor])
    } else if (dialogMode === "edit" && selectedProfesor) {
      setProfesores(profesores.map((p) => (p.id === selectedProfesor.id ? { ...p, ...formData } : p)))
    } else if (dialogMode === "delete" && selectedProfesor) {
      setProfesores(profesores.filter((p) => p.id !== selectedProfesor.id))
    }
    setIsDialogOpen(false)
  }

  const getDialogTitle = () => {
    switch (dialogMode) {
      case "create":
        return "Agregar Nuevo Profesor"
      case "edit":
        return "Modificar Profesor"
      case "view":
        return "Consultar Profesor"
      case "delete":
        return "Eliminar Profesor"
    }
  }

  const filteredProfesores = profesores.filter(
    (profesor) =>
      profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesor.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtener especialidades únicas para estadísticas
  const especialidadesUnicas = new Set(profesores.map(p => p.especialidad)).size

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <AdminHeader />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header con animación */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestión de Profesores
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Administra el cuerpo docente y sus especialidades
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Profesores</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{profesores.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Especialidades</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{especialidadesUnicas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Encontrados</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{filteredProfesores.length}</p>
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <Input
                    placeholder="Buscar por nombre, apellido, email o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                    if (profesores.length > 0) {
                      handleOpenDialog("delete", profesores[0])
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Baja
                </Button>

                <Button
                  onClick={() => {
                    if (profesores.length > 0) {
                      handleOpenDialog("edit", profesores[0])
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Modificar
                </Button>

                <Button
                  onClick={() => {
                    if (profesores.length > 0) {
                      handleOpenDialog("view", profesores[0])
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Consultar
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Registro de Docentes
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filteredProfesores.length} {filteredProfesores.length === 1 ? 'profesor encontrado' : 'profesores encontrados'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">ID</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Nombre</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Apellido</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Email</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Especialidad</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfesores.map((profesor, index) => (
                    <TableRow 
                      key={profesor.id} 
                      className="hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    >
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                          {profesor.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">{profesor.nombre}</TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">{profesor.apellido}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{profesor.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                          <BookOpen className="w-3.5 h-3.5" />
                          {profesor.especialidad}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog("view", profesor)}
                            className="hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-700 dark:hover:text-pink-300 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog("edit", profesor)}
                            className="hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog("delete", profesor)}
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

            {filteredProfesores.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No se encontraron profesores
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                      <p className="text-slate-600 dark:text-slate-400">
                        Estás a punto de eliminar al profesor{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedProfesor?.nombre} {selectedProfesor?.apellido}
                        </span>
                        . Esta acción no se puede deshacer.
                      </p>
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
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="especialidad" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Especialidad
                  </Label>
                  <Input
                    id="especialidad"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    disabled={dialogMode === "view"}
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                  className={`font-semibold ${
                    dialogMode === "delete"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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