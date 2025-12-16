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

// ==========================================
// 🎯 TIPOS
// ==========================================

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

// ==========================================
// 🗄️ DATOS MOCK
// ==========================================

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

// ==========================================
// 📊 Stats Cards
// ==========================================

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
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Activos</p>
                        <p className="text-xl font-bold">{stats.active}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-600 flex items-center justify-center">
                        <Archive className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Archivados</p>
                        <p className="text-xl font-bold">{stats.archived}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Borradores</p>
                        <p className="text-xl font-bold">{stats.draft}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Estudiantes</p>
                        <p className="text-xl font-bold">{stats.totalStudents}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Ocupación</p>
                        <p className="text-xl font-bold">{stats.avgEnrollment}%</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

// ==========================================
// 📝 Course Form Modal
// ==========================================

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div>
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <BookOpen className="h-6 w-6" />
                            {isEditMode ? 'Editar Curso' : 'Crear Curso'}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">Nombre del Curso *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    placeholder="Ej: Matemáticas Avanzadas"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code" className="font-semibold">Código *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    placeholder="Ej: MAT-401"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-semibold">Descripción</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                disabled={isSaving}
                                placeholder="Describe brevemente el contenido del curso..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="grade" className="font-semibold">Nivel / Grado</Label>
                                <Input
                                    id="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    placeholder="Ej: Avanzado"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="group" className="font-semibold">Sección / Grupo</Label>
                                <Input
                                    id="group"
                                    value={formData.group}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    placeholder="Ej: Grupo A"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxStudents" className="font-semibold">Max. Estudiantes</Label>
                                <Input
                                    id="maxStudents"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.maxStudents}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="font-semibold">Fecha de Inicio</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="font-semibold">Fecha de Fin</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="urlImage" className="font-semibold">URL de Imagen (Opcional)</Label>
                            <Input
                                id="urlImage"
                                value={formData.urlImage}
                                onChange={handleChange}
                                disabled={isSaving}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            {formData.urlImage && (
                                <div className="mt-2">
                                    <img
                                        src={formData.urlImage}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                </div>
                            )}
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
                                <option value="DRAFT">Borrador</option>
                                <option value="ACTIVE">Activo</option>
                                <option value="ARCHIVED">Archivado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 dark:bg-gray-800">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Curso'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

// ==========================================
// 🎯 COMPONENTE PRINCIPAL
// ==========================================

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Cursos</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra todos los cursos del sistema
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                    <Button onClick={() => {
                        setSelectedCourse(null)
                        setShowFormModal(true)
                    }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Curso
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <CourseStatsCards courses={courses} />

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, código o profesor..."
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
                        Todos ({courses.length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Activos ({courses.filter(c => c.status === 'ACTIVE').length})
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                        Borradores ({courses.filter(c => c.status === 'DRAFT').length})
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                        Archivados ({courses.filter(c => c.status === 'ARCHIVED').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                    {isLoading ? (
                        <Card className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p>Cargando cursos...</p>
                        </Card>
                    ) : filteredCourses.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            No se encontraron cursos
                        </Card>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <Card className="hidden lg:block overflow-hidden shadow-lg">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Curso</th>
                                            <th className="px-6 py-4 text-left font-semibold">Profesor</th>
                                            <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                            <th className="px-6 py-4 text-left font-semibold">Inscritos</th>
                                            <th className="px-6 py-4 text-left font-semibold">Fechas</th>
                                            <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCourses.map((course) => (
                                            <tr key={course.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={course.urlImage}
                                                            alt={course.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{course.name}</p>
                                                            <p className="text-sm text-muted-foreground">{course.code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm">{course.teacherName}</p>
                                                    <p className="text-xs text-muted-foreground">{course.unitsCount} unidades</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={getStatusBadge(course.status)}>
                                                        {course.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className={`font-medium ${getEnrollmentColor(course.enrolledStudents, course.maxStudents)}`}>
                                                        {course.enrolledStudents} / {course.maxStudents}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {Math.round((course.enrolledStudents / course.maxStudents) * 100)}% ocupado
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <p>{new Date(course.startDate).toLocaleDateString('es-MX')}</p>
                                                    <p className="text-muted-foreground">{new Date(course.endDate).toLocaleDateString('es-MX')}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(course)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4">
                                {filteredCourses.map((course) => (
                                    <Card key={course.id} className="p-4">
                                        <div className="flex gap-3 mb-4">
                                            <img
                                                src={course.urlImage}
                                                alt={course.name}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg truncate">{course.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{course.code}</p>
                                                    </div>
                                                    <Badge className={getStatusBadge(course.status)}>
                                                        {course.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{course.teacherName}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Inscritos</p>
                                                <p className={`font-medium ${getEnrollmentColor(course.enrolledStudents, course.maxStudents)}`}>
                                                    {course.enrolledStudents} / {course.maxStudents}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Unidades</p>
                                                <p className="font-medium">{course.unitsCount}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEdit(course)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600">
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

            {/* Form Modal */}
            <CourseFormModal
                open={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedCourse(null)
                }}
                initialData={selectedCourse || undefined}
                onSave={handleSave}
                isSaving={isSaving}
            />
        </div>
    )
}