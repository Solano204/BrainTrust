"use client"

import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { Button } from "@components/common/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/common/ui/dialog"
import { Input } from "@components/common/ui/input"
import { Label } from "@components/common/ui/label"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Eye, Search, Filter, BookOpen, GraduationCap, Clock, Layers, Download, BookMarked } from "lucide-react"


interface Materia {
  id: number
  nombre: string
  codigo: string
  creditos: number
  semestre: string
}

export default function GestionMateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([
    { id: 1, nombre: "Cálculo I", codigo: "MAT101", creditos: 4, semestre: "1er Semestre" },
    { id: 2, nombre: "Programación", codigo: "INF102", creditos: 5, semestre: "1er Semestre" },
    { id: 3, nombre: "Física I", codigo: "FIS103", creditos: 4, semestre: "2do Semestre" },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create")
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    creditos: 0,
    semestre: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpenDialog = (mode: "create" | "edit" | "view" | "delete", materia?: Materia) => {
    setDialogMode(mode)
    if (materia) {
      setSelectedMateria(materia)
      setFormData({
        nombre: materia.nombre,
        codigo: materia.codigo,
        creditos: materia.creditos,
        semestre: materia.semestre,
      })
    } else {
      setSelectedMateria(null)
      setFormData({ nombre: "", codigo: "", creditos: 0, semestre: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (dialogMode === "create") {
      const newMateria: Materia = {
        id: Math.max(...materias.map((m) => m.id), 0) + 1,
        ...formData,
      }
      setMaterias([...materias, newMateria])
    } else if (dialogMode === "edit" && selectedMateria) {
      setMaterias(materias.map((m) => (m.id === selectedMateria.id ? { ...m, ...formData } : m)))
    } else if (dialogMode === "delete" && selectedMateria) {
      setMaterias(materias.filter((m) => m.id !== selectedMateria.id))
    }
    setIsDialogOpen(false)
  }

  const getDialogTitle = () => {
    switch (dialogMode) {
      case "create":
        return "Agregar Nueva Materia"
      case "edit":
        return "Modificar Materia"
      case "view":
        return "Consultar Materia"
      case "delete":
        return "Eliminar Materia"
    }
  }

  const filteredMaterias = materias.filter(materia =>
    materia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.semestre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCreditos = materias.reduce((sum, materia) => sum + materia.creditos, 0)
  const materiasPrimerSemestre = materias.filter(m => m.semestre === "1er Semestre").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header con animación */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Gestión de Materias
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Administra el catálogo completo de materias y planes de estudio
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-green-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transform transition-all duration-700 delay-300 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Materias</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {materias.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Créditos Totales</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {totalCreditos}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">1er Semestre</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {materiasPrimerSemestre}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y acciones principales */}
        <div className={`max-w-6xl mx-auto mb-8 transform transition-all duration-700 delay-500 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar materia, código o semestre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleOpenDialog("create")}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Materia
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

        {/* Tabla de materias */}
        <div className={`max-w-6xl mx-auto transform transition-all duration-700 delay-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Layers className="w-6 h-6 text-green-600" />
                Catálogo de Materias
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {filteredMaterias.length} materias registradas en el sistema
              </p>
            </div>
            
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">ID</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Nombre</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Código</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Créditos</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Semestre</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterias.map((materia, index) => (
                  <TableRow 
                    key={materia.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {materia.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-blue-500" />
                        {materia.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                        {materia.codigo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
                          {materia.creditos}
                        </span>
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        materia.semestre === "1er Semestre" 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                      }`}>
                        {materia.semestre}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleOpenDialog("view", materia)}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleOpenDialog("edit", materia)}
                          className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleOpenDialog("delete", materia)}
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
            
            {filteredMaterias.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg">No se encontraron materias</p>
                <Button 
                  onClick={() => handleOpenDialog("create")}
                  className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primera materia
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción específicos (manteniendo la funcionalidad original) */}
        <div className={`max-w-6xl mx-auto mt-8 flex flex-wrap justify-center gap-4 transform transition-all duration-700 delay-900 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <Button
            onClick={() => handleOpenDialog("create")}
            variant="outline"
            className="w-48 h-12 font-bold border-2 border-green-600 hover:bg-green-600 hover:text-white bg-transparent transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Alta
          </Button>
          <Button
            onClick={() => {
              if (materias.length > 0) {
                handleOpenDialog("delete", materias[0])
              }
            }}
            variant="outline"
            className="w-48 h-12 font-bold border-2 border-red-600 hover:bg-red-600 hover:text-white bg-transparent transition-all duration-300"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Baja
          </Button>
          <Button
            onClick={() => {
              if (materias.length > 0) {
                handleOpenDialog("edit", materias[0])
              }
            }}
            variant="outline"
            className="w-48 h-12 font-bold border-2 border-blue-600 hover:bg-blue-600 hover:text-white bg-transparent transition-all duration-300"
          >
            <Edit className="w-5 h-5 mr-2" />
            Modificar
          </Button>
          <Button
            onClick={() => {
              if (materias.length > 0) {
                handleOpenDialog("view", materias[0])
              }
            }}
            variant="outline"
            className="w-48 h-12 font-bold border-2 border-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300"
          >
            <Eye className="w-5 h-5 mr-2" />
            Consultar
          </Button>
        </div>

        {/* Dialog (sin cambios en la funcionalidad) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {getDialogTitle()}
              </DialogTitle>
            </DialogHeader>

            {dialogMode === "delete" ? (
              <div className="py-4">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg text-center text-slate-700 dark:text-slate-300">
                  ¿Está seguro que desea eliminar la materia{" "}
                  <span className="font-bold text-red-600 dark:text-red-400">"{selectedMateria?.nombre}"</span>?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                  Código: <span className="font-mono">{selectedMateria?.codigo}</span> • Créditos: {selectedMateria?.creditos}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre" className="font-semibold text-slate-700 dark:text-slate-300">
                    Nombre de la Materia
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    disabled={dialogMode === "view"}
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="codigo" className="font-semibold text-slate-700 dark:text-slate-300">
                    Código
                  </Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    disabled={dialogMode === "view"}
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditos" className="font-semibold text-slate-700 dark:text-slate-300">
                    Créditos
                  </Label>
                  <Input
                    id="creditos"
                    type="number"
                    value={formData.creditos}
                    onChange={(e) => setFormData({ ...formData, creditos: Number.parseInt(e.target.value) || 0 })}
                    disabled={dialogMode === "view"}
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semestre" className="font-semibold text-slate-700 dark:text-slate-300">
                    Semestre
                  </Label>
                  <Input
                    id="semestre"
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
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
                      : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
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