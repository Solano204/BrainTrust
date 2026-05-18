'use client';

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
    Activity,
    Search
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
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
    {stats.map((stat, index) => {
      const Icon      = stat.icon
      const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
      const trendColor = stat.trend === 'up'
        ? 'text-primary bg-primary/10'
        : 'text-destructive bg-destructive/10'

      return (
        <div
          key={index}
          className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              {stat.change}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      )
    })}
  </div>
);
}


function SimpleBarChart({ data, label }: { data: number[], label: string }) {
    const max = Math.max(...data)
return (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
      {label}
    </p>
    <div className="flex items-end gap-1.5 h-40">
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-muted/50 rounded-t-lg relative" style={{ height: '100%' }}>
            <div
              className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
              style={{ height: `${(value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  </div>
);
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
  <div className="space-y-5">

    {/* ── Búsqueda ── */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        placeholder="Buscar curso..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      />
    </div>

    {/* ── Tabla de escritorio ── */}
    <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/40">
          <tr>
            {['Curso', 'Estudiantes', 'Promedio', 'Finalización', 'Tareas', 'Activos', 'Acciones'].map((h, i) => (
              <th
                key={h}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground ${i === 0 ? 'text-left' : 'text-center'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {filteredReports.map((report) => (
            <tr key={report.id} className="hover:bg-muted/30 transition-colors group">

              {/* Curso */}
              <td className="px-6 py-4">
                <p className="font-semibold text-sm text-foreground">{report.courseName}</p>
                <p className="text-xs text-muted-foreground">{report.courseCode}</p>
              </td>

              {/* Estudiantes */}
              <td className="px-6 py-4 text-center">
                <p className="font-semibold text-sm text-foreground">{report.enrolledStudents}</p>
              </td>

              {/* Calificación promedio */}
              <td className="px-6 py-4 text-center">
                <p className={`font-bold text-lg ${getGradeColor(report.averageGrade)}`}>
                  {report.averageGrade}%
                </p>
              </td>

              {/* Finalización */}
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <p className="font-semibold text-sm text-foreground">{report.completionRate}%</p>
                  <div className="w-20 bg-muted/50 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${report.completionRate}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Tareas */}
              <td className="px-6 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{report.submittedAssignments}</span>
                  {' / '}
                  {report.totalAssignments}
                </p>
              </td>

              {/* Estudiantes activos */}
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  {report.activeStudents} / {report.enrolledStudents}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 text-center">
                <button className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ── Tarjetas móviles ── */}
    <div className="lg:hidden space-y-3">
      {filteredReports.map((report) => (
        <div key={report.id} className="bg-card rounded-2xl border border-border p-4 space-y-4">

          {/* Nombre del curso + calificación */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground truncate">{report.courseName}</h3>
              <p className="text-xs text-muted-foreground">{report.courseCode}</p>
            </div>
            <p className={`text-2xl font-bold flex-shrink-0 ${getGradeColor(report.averageGrade)}`}>
              {report.averageGrade}%
            </p>
          </div>

          {/* Cuadrícula de estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Estudiantes', value: report.enrolledStudents },
              { label: 'Activos',     value: report.activeStudents },
              { label: 'Tareas',      value: `${report.submittedAssignments}/${report.totalAssignments}` },
              { label: 'Finalización',value: `${report.completionRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-base font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Barra de finalización */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Finalización</span>
              <span className="font-semibold text-foreground">{report.completionRate}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${report.completionRate}%` }}
              />
            </div>
          </div>

          {/* Descargar */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <Download className="w-4 h-4" />
            Descargar Reporte
          </button>

        </div>
      ))}
    </div>

  </div>
);
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
  <div className="space-y-5">

    {/* ── Búsqueda ── */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        placeholder="Buscar estudiante..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      />
    </div>

    {/* ── Tabla de escritorio ── */}
    <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/40">
          <tr>
            {[
              { label: 'Estudiante',       align: 'left'   },
              { label: 'Cursos',           align: 'center' },
              { label: 'Promedio',         align: 'center' },
              { label: 'Tareas',           align: 'center' },
              { label: 'Completadas',      align: 'center' },
              { label: 'Última Actividad', align: 'left'   },
            ].map(({ label, align }) => (
              <th
                key={label}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-${align}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {filteredStudents.map((student) => (
            <tr key={student.id} className="hover:bg-muted/30 transition-colors group">

              {/* Estudiante */}
              <td className="px-6 py-4">
                <p className="font-semibold text-sm text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </td>

              {/* Cursos */}
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  {student.coursesEnrolled}
                </span>
              </td>

              {/* Calificación promedio */}
              <td className="px-6 py-4 text-center">
                <p className={`font-bold text-lg ${getGradeColor(student.averageGrade)}`}>
                  {student.averageGrade}%
                </p>
              </td>

              {/* Total de tareas */}
              <td className="px-6 py-4 text-center">
                <p className="text-sm text-muted-foreground">{student.totalAssignments}</p>
              </td>

              {/* Finalización */}
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <p className="font-semibold text-sm text-foreground">
                    {Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%
                  </p>
                  <div className="w-20 bg-muted/50 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(student.assignmentsCompleted / student.totalAssignments) * 100}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Última actividad */}
              <td className="px-6 py-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(student.lastActivity).toLocaleString('es-MX', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ── Tarjetas móviles ── */}
    <div className="lg:hidden space-y-3">
      {filteredStudents.map((student) => (
        <div key={student.id} className="bg-card rounded-2xl border border-border p-4 space-y-4">

          {/* Nombre + calificación */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">{student.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{student.email}</p>
            </div>
            <p className={`text-2xl font-bold flex-shrink-0 ${getGradeColor(student.averageGrade)}`}>
              {student.averageGrade}%
            </p>
          </div>

          {/* Cuadrícula de estadísticas */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Cursos',  value: student.coursesEnrolled },
              { label: 'Tareas',  value: `${student.assignmentsCompleted}/${student.totalAssignments}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-base font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Barra de completadas */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Completadas</span>
              <span className="font-semibold text-foreground">
                {Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${(student.assignmentsCompleted / student.totalAssignments) * 100}%` }}
              />
            </div>
          </div>

        </div>
      ))}
    </div>

  </div>
);
}

export default function AdminReportsModule() {
   return (
  <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">

    {/* ── Encabezado de página ── */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Reportes y Analíticas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vista general del rendimiento del sistema
        </p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
          <Calendar className="w-4 h-4" />
          Período
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Exportar Todo
        </button>
      </div>
    </div>

    {/* ── Estadísticas generales ── */}
    <OverviewStats />

    {/* ── Gráficos de barras ── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <SimpleBarChart
          data={[85, 92, 88, 78, 95, 82, 90]}
          label="Promedio de Calificaciones por Semana"
        />
      </div>
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <SimpleBarChart
          data={[245, 278, 291, 265, 312, 289, 325]}
          label="Tareas Entregadas por Semana"
        />
      </div>
    </div>

    {/* ── Pestañas ── */}
    <Tabs defaultValue="courses" className="space-y-5">
      <TabsList className="w-full grid grid-cols-2 rounded-2xl bg-muted/50 p-1 h-auto">
        <TabsTrigger
          value="courses"
          className="flex items-center gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          Reporte de Cursos
        </TabsTrigger>
        <TabsTrigger
          value="students"
          className="flex items-center gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
        >
          <Users className="w-4 h-4" />
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
);
}