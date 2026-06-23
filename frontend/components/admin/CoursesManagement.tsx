'use client';

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    BookOpen,
    Users,
    Calendar,
    Archive,
    X,
    Save,
    Eye,
    Download,
    TrendingUp,
    Clock
} from "lucide-react"

type CourseStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT'

interface Course {
    id: string
    name: string
    code: string
    description: string
    grade: string
    group: string
    urlImage: string
    teacherId: string
    teacherName: string
    status: CourseStatus
    enrolledStudents: number
    maxStudents: number
    unitsCount: number
    startDate: string
    endDate: string
    createdAt: string
}

const mockCourses: Course[] = [
    {
        id: '1',
        name: 'Matemáticas Avanzadas',
        code: 'MAT-401',
        description: 'Curso avanzado de cálculo diferencial e integral',
        grade: 'Avanzado',
        group: 'Grupo A',
        urlImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        teacherId: 't1',
        teacherName: 'Dr. Juan Pérez',
        status: 'ACTIVE',
        enrolledStudents: 28,
        maxStudents: 30,
        unitsCount: 8,
        startDate: '2025-01-15',
        endDate: '2025-06-15',
        createdAt: '2024-12-01T10:00:00'
    },
    {
        id: '2',
        name: 'Programación Web',
        code: 'CS-301',
        description: 'Desarrollo de aplicaciones web modernas con React y Node.js',
        grade: 'Intermedio',
        group: 'Grupo B',
        urlImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        teacherId: 't2',
        teacherName: 'Mtra. María López',
        status: 'ACTIVE',
        enrolledStudents: 25,
        maxStudents: 30,
        unitsCount: 10,
        startDate: '2025-01-20',
        endDate: '2025-06-20',
        createdAt: '2024-12-05T14:30:00'
    },
    {
        id: '3',
        name: 'Historia Mundial',
        code: 'HIST-201',
        description: 'Análisis de los acontecimientos históricos más importantes',
        grade: 'Básico',
        group: 'Grupo C',
        urlImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
        teacherId: 't1',
        teacherName: 'Dr. Juan Pérez',
        status: 'ARCHIVED',
        enrolledStudents: 30,
        maxStudents: 30,
        unitsCount: 6,
        startDate: '2024-08-15',
        endDate: '2024-12-15',
        createdAt: '2024-07-01T09:00:00'
    },
    {
        id: '4',
        name: 'Física Cuántica',
        code: 'FIS-501',
        description: 'Introducción a la mecánica cuántica y sus aplicaciones',
        grade: 'Avanzado',
        group: 'Grupo A',
        urlImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
        teacherId: 't3',
        teacherName: 'Dr. Carlos Ramírez',
        status: 'DRAFT',
        enrolledStudents: 0,
        maxStudents: 25,
        unitsCount: 0,
        startDate: '2025-02-01',
        endDate: '2025-07-01',
        createdAt: '2025-01-10T11:00:00'
    }
]

function CourseStatsCards({ courses }: { courses: Course[] }) {
    const stats = useMemo(() => ({
        total: courses.length,
        active: courses.filter(c => c.status === 'ACTIVE').length,
        archived: courses.filter(c => c.status === 'ARCHIVED').length,
        draft: courses.filter(c => c.status === 'DRAFT').length,
        totalStudents: courses.reduce((sum, c) => sum + c.enrolledStudents, 0),
        avgEnrollment: Math.round(
            courses.filter(c => c.status === 'ACTIVE').reduce((sum, c) =>
                sum + (c.enrolledStudents / c.maxStudents * 100), 0
            ) / courses.filter(c => c.status === 'ACTIVE').length
        ) || 0
    }), [courses])
return (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-foreground">{stats.total}</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/80 flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Activos</p>
          <p className="text-xl font-bold text-foreground">{stats.active}</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <Archive className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Archivados</p>
          <p className="text-xl font-bold text-foreground">{stats.archived}</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <Clock className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Borradores</p>
          <p className="text-xl font-bold text-foreground">{stats.draft}</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/60 flex items-center justify-center flex-shrink-0">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Estudiantes</p>
          <p className="text-xl font-bold text-foreground">{stats.totalStudents}</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/80 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ocupación</p>
          <p className="text-xl font-bold text-foreground">{stats.avgEnrollment}%</p>
        </div>
      </div>
    </div>

  </div>
);
}

interface CourseFormModalProps {
    open: boolean
    onClose: () => void
    initialData?: Course
    onSave: (courseData: Partial<Course>) => void
    isSaving?: boolean
}

function CourseFormModal({ open, onClose, initialData, onSave, isSaving }: CourseFormModalProps) {
    const isEditMode = !!initialData
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || '',
        grade: initialData?.grade || '',
        group: initialData?.group || '',
        urlImage: initialData?.urlImage || '',
        maxStudents: initialData?.maxStudents || 30,
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        status: initialData?.status || 'DRAFT' as CourseStatus
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: id === 'maxStudents' ? parseInt(value) || 0 : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    if (!open) return null
return (
  <div className="modal-overlay">
    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl flex flex-col">

      <div className="flex justify-between items-center px-5 py-4 sm:px-7 sm:py-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <span className="icon-badge">
            <BookOpen className="h-4 w-4 text-primary" />
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            {isEditMode ? 'Editar Curso' : 'Crear Curso'}
          </h2>
        </div>
        <button
          onClick={onClose}
          disabled={isSaving}
          className="icon-btn transition-all disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-6 sm:px-7 space-y-6 flex-1 overflow-y-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-foreground">
              Nombre del Curso *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSaving}
              placeholder="Ej: Matemáticas Avanzadas"
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-semibold text-foreground">
              Código *
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={handleChange}
              required
              disabled={isSaving}
              placeholder="Ej: MAT-401"
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold text-foreground">
            Descripción
          </Label>
          <Textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            disabled={isSaving}
            placeholder="Describe brevemente el contenido del curso..."
            className="rounded-xl border-border bg-background focus:ring-ring/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="grade" className="text-xs font-semibold text-foreground">
              Nivel / Grado
            </Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Ej: Avanzado"
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group" className="text-xs font-semibold text-foreground">
              Sección / Grupo
            </Label>
            <Input
              id="group"
              value={formData.group}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Ej: Grupo A"
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxStudents" className="text-xs font-semibold text-foreground">
              Máx. Estudiantes
            </Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="100"
              value={formData.maxStudents}
              onChange={handleChange}
              disabled={isSaving}
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-xs font-semibold text-foreground">
              Fecha de Inicio
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={isSaving}
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-xs font-semibold text-foreground">
              Fecha de Fin
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={isSaving}
              className="rounded-xl border-border bg-background focus:ring-ring/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="urlImage" className="text-xs font-semibold text-foreground">
            URL de Imagen (Opcional)
          </Label>
          <Input
            id="urlImage"
            value={formData.urlImage}
            onChange={handleChange}
            disabled={isSaving}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="rounded-xl border-border bg-background focus:ring-ring/50"
          />
          {formData.urlImage && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border">
              <img
                src={formData.urlImage}
                alt="Vista previa"
                className="w-full h-32 object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs font-semibold text-foreground">
            Estado *
          </Label>
          <select
            id="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all disabled:opacity-50"
          >
            <option value="DRAFT">Borrador</option>
            <option value="ACTIVE">Activo</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </div>

      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4 sm:px-7 border-t border-border bg-muted/30 sticky bottom-0 rounded-b-3xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Curso'}
        </button>
      </div>

    </div>
  </div>
);
}
export default function AdminCoursesModule() {
    const [courses] = useState<Course[]>(mockCourses)
    const [isLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [showFormModal, setShowFormModal] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.teacherName.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesTab =
                activeTab === 'all' ||
                course.status.toLowerCase() === activeTab.toLowerCase()

            return matchesSearch && matchesTab
        })
    }, [courses, searchTerm, activeTab])

    const handleEdit = (course: Course) => {
        setSelectedCourse(course)
        setShowFormModal(true)
    }

    const handleSave = (courseData: Partial<Course>) => {
        setIsSaving(true)
        setTimeout(() => {
            console.log('Guardando curso:', courseData)
            setIsSaving(false)
            setShowFormModal(false)
            setSelectedCourse(null)
        }, 1500)
    }

    const getStatusBadge = (status: CourseStatus) => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-800',
            ARCHIVED: 'bg-gray-100 text-gray-800',
            DRAFT: 'bg-orange-100 text-orange-800'
        }
        return colors[status]
    }

    const getEnrollmentColor = (enrolled: number, max: number) => {
        const percentage = (enrolled / max) * 100
        if (percentage >= 90) return 'text-red-600'
        if (percentage >= 70) return 'text-yellow-600'
        return 'text-green-600'
    }
return (
  <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background min-h-screen">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Gestión de Cursos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administra todos los cursos del sistema
        </p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
          <Download className="h-4 w-4" />
          Exportar
        </button>
        <button
          onClick={() => { setSelectedCourse(null); setShowFormModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nuevo Curso
        </button>
      </div>
    </div>

    <CourseStatsCards courses={courses} />

    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Buscar por nombre, código o profesor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />
      </div>
    </div>

    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50 p-1 h-auto">
        {[
          { value: "all",      label: "Todos",      count: courses.length },
          { value: "active",   label: "Activos",    count: courses.filter(c => c.status === 'ACTIVE').length },
          { value: "draft",    label: "Borradores", count: courses.filter(c => c.status === 'DRAFT').length },
          { value: "archived", label: "Archivados", count: courses.filter(c => c.status === 'ARCHIVED').length },
        ].map(({ value, label, count }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-xl text-xs font-semibold py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.slice(0, 3)}</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold leading-none">
              {count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="space-y-4 mt-6">
        {isLoading ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando cursos...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground text-sm shadow-sm">
            No se encontraron cursos
          </div>
        ) : (
          <>
            <div className="hidden lg:block rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profesor</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscritos</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fechas</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-muted/30 transition-colors group">

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.urlImage}
                            alt={course.name}
                            className="w-11 h-11 rounded-xl object-cover border border-border flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-sm text-foreground">{course.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{course.code}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{course.teacherName}</p>
                        <p className="text-xs text-muted-foreground">{course.unitsCount} unidades</p>
                      </td>

                      <td className="px-6 py-4">
                        <Badge className={getStatusBadge(course.status)}>
                          {course.status === 'ACTIVE' ? 'ACTIVO' : course.status === 'DRAFT' ? 'BORRADOR' : 'ARCHIVADO'}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <p className={`text-sm font-semibold ${getEnrollmentColor(course.enrolledStudents, course.maxStudents)}`}>
                          {course.enrolledStudents} / {course.maxStudents}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((course.enrolledStudents / course.maxStudents) * 100)}% ocupado
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{new Date(course.startDate).toLocaleDateString('es-MX')}</p>
                        <p className="text-xs text-muted-foreground">{new Date(course.endDate).toLocaleDateString('es-MX')}</p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-1.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                       </td>

                     </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                  <div className="flex gap-3 mb-4">
                    <img
                      src={course.urlImage}
                      alt={course.name}
                      className="w-20 h-20 rounded-xl object-cover border border-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-foreground truncate">{course.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{course.code}</p>
                        </div>
                        <Badge className={getStatusBadge(course.status)}>
                          {course.status === 'ACTIVE' ? 'ACTIVO' : course.status === 'DRAFT' ? 'BORRADOR' : 'ARCHIVADO'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{course.teacherName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Inscritos</p>
                      <p className={`text-sm font-semibold ${getEnrollmentColor(course.enrolledStudents, course.maxStudents)}`}>
                        {course.enrolledStudents} / {course.maxStudents}
                      </p>
                    </div>
                    <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Unidades</p>
                      <p className="text-sm font-semibold text-foreground">{course.unitsCount}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>

    <CourseFormModal
      open={showFormModal}
      onClose={() => { setShowFormModal(false); setSelectedCourse(null); }}
      initialData={selectedCourse || undefined}
      onSave={handleSave}
      isSaving={isSaving}
    />

  </div>
);
}