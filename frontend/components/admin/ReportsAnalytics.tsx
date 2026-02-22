import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3,
    Download,
    FileText,
    TrendingUp,
    TrendingDown,
    Users,
    BookOpen,
    Calendar,
    Award,
    Clock,
    Target,
    Activity
} from "lucide-react"

interface CourseReport {
    id: string
    courseName: string
    courseCode: string
    enrolledStudents: number
    completionRate: number
    averageGrade: number
    submittedAssignments: number
    totalAssignments: number
    activeStudents: number
}

interface StudentPerformance {
    id: string
    name: string
    email: string
    coursesEnrolled: number
    averageGrade: number
    assignmentsCompleted: number
    totalAssignments: number
    lastActivity: string
}


const mockCourseReports: CourseReport[] = [
    {
        id: '1',
        courseName: 'Matemáticas Avanzadas',
        courseCode: 'MAT-401',
        enrolledStudents: 28,
        completionRate: 85,
        averageGrade: 82,
        submittedAssignments: 238,
        totalAssignments: 280,
        activeStudents: 26
    },
    {
        id: '2',
        courseName: 'Programación Web',
        courseCode: 'CS-301',
        enrolledStudents: 25,
        completionRate: 92,
        averageGrade: 88,
        submittedAssignments: 225,
        totalAssignments: 250,
        activeStudents: 24
    },
    {
        id: '3',
        courseName: 'Física Cuántica',
        courseCode: 'FIS-501',
        enrolledStudents: 20,
        completionRate: 78,
        averageGrade: 75,
        submittedAssignments: 152,
        totalAssignments: 200,
        activeStudents: 18
    }
]

const mockStudentPerformance: StudentPerformance[] = [
    {
        id: '1',
        name: 'Ana García',
        email: 'ana.garcia@universidad.edu',
        coursesEnrolled: 5,
        averageGrade: 92,
        assignmentsCompleted: 48,
        totalAssignments: 50,
        lastActivity: '2025-01-19T14:30:00'
    },
    {
        id: '2',
        name: 'Carlos Méndez',
        email: 'carlos.mendez@universidad.edu',
        coursesEnrolled: 4,
        averageGrade: 85,
        assignmentsCompleted: 38,
        totalAssignments: 40,
        lastActivity: '2025-01-18T10:15:00'
    },
    {
        id: '3',
        name: 'María Torres',
        email: 'maria.torres@universidad.edu',
        coursesEnrolled: 6,
        averageGrade: 78,
        assignmentsCompleted: 55,
        totalAssignments: 60,
        lastActivity: '2025-01-19T16:45:00'
    }
]


function OverviewStats() {
    const stats = [
        {
            label: 'Total Estudiantes',
            value: '1,248',
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'bg-blue-600'
        },
        {
            label: 'Cursos Activos',
            value: '42',
            change: '+3',
            trend: 'up',
            icon: BookOpen,
            color: 'bg-green-600'
        },
        {
            label: 'Promedio General',
            value: '83.5%',
            change: '+2.3%',
            trend: 'up',
            icon: Award,
            color: 'bg-purple-600'
        },
        {
            label: 'Tasa de Finalización',
            value: '87%',
            change: '-1.2%',
            trend: 'down',
            icon: Target,
            color: 'bg-orange-600'
        },
        {
            label: 'Tareas Entregadas',
            value: '3,421',
            change: '+156',
            trend: 'up',
            icon: FileText,
            color: 'bg-indigo-600'
        },
        {
            label: 'Usuarios Activos',
            value: '1,089',
            change: '+89',
            trend: 'up',
            icon: Activity,
            color: 'bg-pink-600'
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
                const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600'

                return (
                    <Card key={index} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                                <TrendIcon className="h-3 w-3" />
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </Card>
                )
            })}
        </div>
    )
}


function SimpleBarChart({ data, label }: { data: number[], label: string }) {
    const max = Math.max(...data)

    return (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <div className="flex items-end gap-2 h-40">
                {data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '100%' }}>
                            <div
                                className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all"
                                style={{ height: `${(value / max) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}


function CourseReportsTab() {
    const [reports] = useState(mockCourseReports)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredReports = useMemo(() => {
        return reports.filter(report =>
            report.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [reports, searchTerm])

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600'
        if (grade >= 80) return 'text-blue-600'
        if (grade >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <Card className="p-4">
                <Input
                    placeholder="Buscar curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Card>

            <Card className="hidden lg:block overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold">Curso</th>
                            <th className="px-6 py-4 text-center font-semibold">Estudiantes</th>
                            <th className="px-6 py-4 text-center font-semibold">Promedio</th>
                            <th className="px-6 py-4 text-center font-semibold">Finalización</th>
                            <th className="px-6 py-4 text-center font-semibold">Tareas</th>
                            <th className="px-6 py-4 text-center font-semibold">Activos</th>
                            <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="border-b hover:bg-muted/30">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium">{report.courseName}</p>
                                        <p className="text-sm text-muted-foreground">{report.courseCode}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <p className="font-medium">{report.enrolledStudents}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <p className={`font-bold text-lg ${getGradeColor(report.averageGrade)}`}>
                                        {report.averageGrade}%
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <p className="font-medium">{report.completionRate}%</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: `${report.completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <p className="text-sm">{report.submittedAssignments} / {report.totalAssignments}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Badge variant="secondary">
                                        {report.activeStudents} / {report.enrolledStudents}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <div className="lg:hidden space-y-4">
                {filteredReports.map((report) => (
                    <Card key={report.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{report.courseName}</h3>
                                <p className="text-sm text-muted-foreground">{report.courseCode}</p>
                            </div>
                            <p className={`text-2xl font-bold ${getGradeColor(report.averageGrade)}`}>
                                {report.averageGrade}%
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Estudiantes</p>
                                <p className="text-lg font-semibold">{report.enrolledStudents}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Activos</p>
                                <p className="text-lg font-semibold">{report.activeStudents}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Tareas</p>
                                <p className="text-lg font-semibold">{report.submittedAssignments}/{report.totalAssignments}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Finalización</p>
                                <p className="text-lg font-semibold">{report.completionRate}%</p>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Reporte
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}


function StudentPerformanceTab() {
    const [students] = useState(mockStudentPerformance)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [students, searchTerm])

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600'
        if (grade >= 80) return 'text-blue-600'
        if (grade >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <Input
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Card>

            <Card className="hidden lg:block overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold">Estudiante</th>
                            <th className="px-6 py-4 text-center font-semibold">Cursos</th>
                            <th className="px-6 py-4 text-center font-semibold">Promedio</th>
                            <th className="px-6 py-4 text-center font-semibold">Tareas</th>
                            <th className="px-6 py-4 text-center font-semibold">Completadas</th>
                            <th className="px-6 py-4 text-left font-semibold">Última Actividad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id} className="border-b hover:bg-muted/30">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Badge variant="secondary">{student.coursesEnrolled}</Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <p className={`font-bold text-lg ${getGradeColor(student.averageGrade)}`}>
                                        {student.averageGrade}%
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <p className="text-sm">{student.totalAssignments}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <p className="font-medium">
                                            {Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: `${(student.assignmentsCompleted / student.totalAssignments) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm">
                                        {new Date(student.lastActivity).toLocaleString('es-MX', {
                                            dateStyle: 'short',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <div className="lg:hidden space-y-4">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold">{student.name}</h3>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                            <p className={`text-2xl font-bold ${getGradeColor(student.averageGrade)}`}>
                                {student.averageGrade}%
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Cursos</p>
                                <p className="font-medium">{student.coursesEnrolled}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Tareas</p>
                                <p className="font-medium">{student.assignmentsCompleted}/{student.totalAssignments}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function AdminReportsModule() {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Reportes y Analíticas</h1>
                    <p className="text-muted-foreground mt-1">
                        Vista general del rendimiento del sistema
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Período
                    </Button>
                    <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar Todo
                    </Button>
                </div>
            </div>

            <OverviewStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <SimpleBarChart
                        data={[85, 92, 88, 78, 95, 82, 90]}
                        label="Promedio de Calificaciones por Semana"
                    />
                </Card>
                <Card className="p-6">
                    <SimpleBarChart
                        data={[245, 278, 291, 265, 312, 289, 325]}
                        label="Tareas Entregadas por Semana"
                    />
                </Card>
            </div>

            <Tabs defaultValue="courses" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="courses" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Reporte de Cursos
                    </TabsTrigger>
                    <TabsTrigger value="students" className="gap-2">
                        <Users className="h-4 w-4" />
                        Rendimiento de Estudiantes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="courses">
                    <CourseReportsTab />
                </TabsContent>

                <TabsContent value="students">
                    <StudentPerformanceTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}