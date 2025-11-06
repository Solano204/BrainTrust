"use client"

import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { Button } from "@components/common/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/common/ui/dialog"
import { Input } from "@components/common/ui/input"
import { Label } from "@components/common/ui/label"
import { useState } from "react"
import { Plus, Trash2, Edit, Eye, Search, UserCircle } from "lucide-react"

interface Alumno {
  id: number
  nombre: string
  apellido: string
  email: string
  matricula: string
}

export default function GestionAlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([
    { id: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", matricula: "A001" },
    { id: 2, nombre: "María", apellido: "García", email: "maria@example.com", matricula: "A002" },
    { id: 3, nombre: "Carlos", apellido: "López", email: "carlos@example.com", matricula: "A003" },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create")
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    matricula: "",
  })

  const handleOpenDialog = (mode: "create" | "edit" | "view" | "delete", alumno?: Alumno) => {
    setDialogMode(mode)
    if (alumno) {
      setSelectedAlumno(alumno)
      setFormData({
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        email: alumno.email,
        matricula: alumno.matricula,
      })
    } else {
      setSelectedAlumno(null)
      setFormData({ nombre: "", apellido: "", email: "", matricula: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (dialogMode === "create") {
      const newAlumno: Alumno = {
        id: Math.max(...alumnos.map((a) => a.id), 0) + 1,
        ...formData,
      }
      setAlumnos([...alumnos, newAlumno])
    } else if (dialogMode === "edit" && selectedAlumno) {
      setAlumnos(alumnos.map((a) => (a.id === selectedAlumno.id ? { ...a, ...formData } : a)))
    } else if (dialogMode === "delete" && selectedAlumno) {
      setAlumnos(alumnos.filter((a) => a.id !== selectedAlumno.id))
    }
    setIsDialogOpen(false)
  }

  const getDialogTitle = () => {
    switch (dialogMode) {
      case "create":
        return "Agregar Nuevo Alumno"
      case "edit":
        return "Modificar Alumno"
      case "view":
        return "Consultar Alumno"
      case "delete":
        return "Eliminar Alumno"
    }
  }

  const filteredAlumnos = alumnos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <AdminHeader />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header con animación */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <UserCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestión de Alumnos
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Administra el registro completo de estudiantes
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Alumnos</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{alumnos.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Activos</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{alumnos.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Encontrados</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{filteredAlumnos.length}</p>
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Buscar por nombre, apellido, email o matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
                <Button
                  onClick={() => handleOpenDialog("create")}
                  className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Alta
                </Button>

                <Button
                  onClick={() => {
                    if (alumnos.length > 0) {
                      handleOpenDialog("delete", alumnos[0])
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Baja
                </Button>

                <Button
                  onClick={() => {
                    if (alumnos.length > 0) {
                      handleOpenDialog("edit", alumnos[0])
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Modificar
                </Button>

                <Button
                  onClick={() => {
                    if (alumnos.length > 0) {
                      handleOpenDialog("view", alumnos[0])
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Consultar
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Registro de Estudiantes
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filteredAlumnos.length} {filteredAlumnos.length === 1 ? 'alumno encontrado' : 'alumnos encontrados'}
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
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Matrícula</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumnos.map((alumno, index) => (
                    <TableRow 
                      key={alumno.id} 
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    >
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-bold text-sm">
                          {alumno.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">{alumno.nombre}</TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">{alumno.apellido}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{alumno.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                          {alumno.matricula}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog("view", alumno)}
                            className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog("edit", alumno)}
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog("delete", alumno)}
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

            {filteredAlumnos.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No se encontraron alumnos
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
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                        Estás a punto de eliminar al alumno{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedAlumno?.nombre} {selectedAlumno?.apellido}
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
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="matricula" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Matrícula
                  </Label>
                  <Input
                    id="matricula"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    disabled={dialogMode === "view"}
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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