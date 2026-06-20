"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Loader2, BarChart3, FileText, HelpCircle, Calendar, Clock, CheckCircle, XCircle, AlertCircle, BookOpen, ArrowLeft } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { useStudentTaskOverview } from "@/components/student/hooks/student-task-hooks"
import { StudentTaskSubmissionView } from "./StudentTaskSubmissionView"
import { StudentQuizView } from "./StudentQuizViewSubmission"
import { useCourseAllUnits } from "@/components/teacher/hooks/courses-hooks"

interface StudentCourseTaskOverviewProps {
    courseId: string
}

export function StudentCourseTaskOverview({ courseId }: StudentCourseTaskOverviewProps) {
    const { user } = useAuth()
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("assignments")
    const [selectedTask, setSelectedTask] = useState<string | null>(null)
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const { 
        units: courseUnits, 
        isLoading: isLoadingUnits, 
        error: unitsError 
    } = useCourseAllUnits(courseId)

    const {
        assignments,
        quizzes,
        stats,
        isLoading: isLoadingTasks,
        error: tasksError,
        refetchAssignments,
        refetchQuizzes,
    } = useStudentTaskOverview(courseId, user?.id || null, selectedUnitId)

    const handleSelectUnit = (unitId: string) => {
        setSelectedUnitId(unitId)
        setActiveTab("assignments")
        setSelectedTask(null)
        setSelectedQuiz(null)
        setSearchTerm("")
    }

    const handleBackToUnits = () => {
        setSelectedUnitId(null)
        setSelectedTask(null)
        setSelectedQuiz(null)
        setSearchTerm("")
    }

    const handleViewTask = (taskId: string) => {
        setSelectedTask(taskId)
    }

    const handleViewQuiz = (quizId: string) => {
        setSelectedQuiz(quizId)
    }

    const handleBackFromTask = () => {
        setSelectedTask(null)
        refetchAssignments()
    }

    const handleBackFromQuiz = () => {
        setSelectedQuiz(null)
        refetchQuizzes()
    }


    console.log("assignments", assignments)
    if (selectedTask) {
        const assignment = assignments.find(a => a.id === selectedTask)
        return assignment ? (
            <StudentTaskSubmissionView
                assignment={assignment}
                onExit={handleBackFromTask}
            />
        ) : null
    }

    if (selectedQuiz) {
        const quiz = quizzes.find(q => q.id === selectedQuiz)
        return quiz ? (
            <StudentQuizView
                quiz={quiz}
                onExit={handleBackFromQuiz}
            />
        ) : null
    }

    console.log("submissions", assignments)
    if (!selectedUnitId) {
       return (
  <div className="page-container">

    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        Unidades del Curso
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Selecciona una unidad para ver tus tareas y cuestionarios
      </p>
    </div>

    {isLoadingUnits ? (
      <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-sm">Cargando unidades...</p>
      </div>

    ) : unitsError ? (
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-center gap-3 text-destructive">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm">Error al cargar las unidades</h3>
          <p className="text-xs mt-0.5 text-destructive/80">{unitsError.message}</p>
        </div>
      </div>

    ) : courseUnits.length === 0 ? (
      <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center text-center text-muted-foreground">
        <span className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="w-7 h-7 text-primary" />
        </span>
        <h3 className="text-base font-bold text-foreground mb-1">No hay Unidades Disponibles</h3>
        <p className="text-sm">Todavía no hay unidades en este curso.</p>
      </div>

    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courseUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleSelectUnit(unit.id)}
            className="bg-card rounded-2xl border border-border p-5 cursor-pointer hover:border-primary/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                Unidad {unit.numUnity}
              </span>
              <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-4 h-4 text-primary" />
              </span>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1">
                {unit.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {unit.description}
              </p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
              <Eye className="w-4 h-4" />
              Ver Tareas y Cuestionarios
            </button>
          </div>
        ))}
      </div>
    )}

  </div>
);
    }

    const selectedUnit = courseUnits.find(unit => unit.id === selectedUnitId)

    const filteredAssignments = assignments.filter(assignment => 
        assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.unit.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredQuizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) 
    )

    const getStatusBadge = (status: string, isOverdue: boolean) => {
        if (isOverdue && !status) {
            return <Badge variant="destructive" className="gap-1 text-xs">Retrasada</Badge>
        }
        
        switch (status) {
            case 'SUBMITTED':
                return <Badge variant="secondary" className="gap-1 text-xs bg-blue-100 text-blue-800">Entregada</Badge>
            case 'GRADED':
                return <Badge variant="default" className="gap-1 text-xs bg-green-100 text-green-800">Calificada</Badge>
            case 'LATE_SUBMITTED':
                return <Badge variant="destructive" className="gap-1 text-xs">Tarde</Badge>
            default:
                return <Badge variant="outline" className="gap-1 text-xs">No Iniciada</Badge>
        }
    }

    const getStatusIcon = (status: string, isOverdue: boolean) => {
        if (isOverdue && !status) return <XCircle className="h-4 w-4 text-destructive" />
        
        switch (status) {
            case 'SUBMITTED':
            case 'LATE_SUBMITTED':
                return <Clock className="h-4 w-4 text-blue-500" />
            case 'GRADED':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            default:
                return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    const getGradeDisplay = (grade: any, maxPoints: number) => {
        if (!grade) return null
        
        const percentage = (Number(grade.value) / maxPoints) * 100
        return (
            <div className="flex items-center gap-2">
                <span className="font-semibold">{grade.value}/{maxPoints}</span>
                <Badge variant={percentage >= 70 ? "default" : "destructive"} className="text-xs">
                    {percentage.toFixed(1)}%
                </Badge>
            </div>
        )
    }

   return (
  <div className="page-container">

    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="flex items-start gap-3">
        <button
          onClick={handleBackToUnits}
          className="flex items-center gap-1.5 mt-1 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Regresar
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {selectedUnit?.name || "Tareas y Cuestionarios de la Unidad"}
          </h1>
          {stats && (
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { icon: BarChart3,    label: `${stats.totalTasks} tareas`,        always: true  },
                { icon: CheckCircle,  label: `${stats.completedTasks} completadas`, always: true  },
                { icon: Calendar,     label: `${stats.pendingTasks} pendientes`,     always: true  },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
              {stats.overdueTasks > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-semibold">
                  <AlertCircle className="w-3 h-3" />
                  {stats.overdueTasks} retrasadas
                </span>
              )}
              {stats.averageGrade > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-semibold">
                  <BarChart3 className="w-3 h-3" />
                  Prom: {stats.averageGrade}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        placeholder="Buscar tareas o cuestionarios..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      />
    </div>

    {tasksError && (
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-center gap-3 text-destructive">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm">Error al cargar las tareas</h3>
          <p className="text-xs mt-0.5 text-destructive/80">{tasksError}</p>
        </div>
      </div>
    )}

    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
      <TabsList className="w-full grid grid-cols-2 rounded-2xl bg-muted/50 p-1 h-auto">
        <TabsTrigger
          value="assignments"
          className="flex items-center gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
        >
          <FileText className="w-4 h-4" />
          Tareas
          <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
            {assignments.length}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="quizzes"
          className="flex items-center gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          Cuestionarios
          <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
            {quizzes.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assignments" className="space-y-4">
        {isLoadingTasks ? (
          <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Cargando tus tareas...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center text-center text-muted-foreground">
            <span className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-primary" />
            </span>
            <h3 className="text-base font-bold text-foreground mb-1">No hay Tareas</h3>
            <p className="text-sm">
              {searchTerm ? "No hay tareas que coincidan con tu búsqueda." : "Todavía no tienes tareas en esta unidad."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    {['Tarea', 'Estado', 'Fecha Límite', 'Calificación', 'Acciones'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground ${i === 4 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-sm text-foreground">{assignment.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.submission?.status || '', assignment.isOverdue)}
                          {getStatusBadge(assignment.submission?.status || '', assignment.isOverdue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={assignment.isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}>
                          {assignment.deadline}
                          {assignment.isOverdue && <span className="ml-1 text-xs">(RETRASADA)</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {assignment.submission?.grade
                          ? getGradeDisplay(assignment.submission.grade, assignment.maxPoints)
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleViewTask(assignment.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                            title={assignment.submission ? "Ver Entrega" : "Comenzar Tarea"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-card rounded-2xl border border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">{assignment.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{assignment.unit}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {getStatusIcon(assignment.submission?.status || '', assignment.isOverdue)}
                      {getStatusBadge(assignment.submission?.status || '', assignment.isOverdue)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Fecha Límite</p>
                      <p className={`text-sm font-semibold ${assignment.isOverdue ? "text-destructive" : "text-foreground"}`}>
                        {assignment.deadline}
                        {assignment.isOverdue && <span className="block text-xs">(RETRASADA)</span>}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Calificación</p>
                      <p className="text-sm font-semibold text-foreground">
                        {assignment.submission?.grade
                          ? getGradeDisplay(assignment.submission.grade, assignment.maxPoints)
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewTask(assignment.id)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      assignment.submission
                        ? "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {assignment.submission ? "Ver Entrega" : "Comenzar Tarea"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="quizzes" className="space-y-4">
        {isLoadingTasks ? (
          <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Cargando tus cuestionarios...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center text-center text-muted-foreground">
            <span className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <HelpCircle className="w-7 h-7 text-primary" />
            </span>
            <h3 className="text-base font-bold text-foreground mb-1">No hay Cuestionarios</h3>
            <p className="text-sm">
              {searchTerm ? "No hay cuestionarios que coincidan con tu búsqueda." : "Todavía no tienes cuestionarios en esta unidad."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    {['Título del Cuestionario', 'Estado', 'Calificación', 'Acciones'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground ${i === 3 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-sm text-foreground">{quiz.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(quiz.submission?.status || '', quiz.isOverdue)}
                          {getStatusBadge(quiz.submission?.status || '', quiz.isOverdue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {quiz.submission?.grade ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {quiz.submission.grade.value}/{quiz.submission.grade.maxScore}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                              quiz.submission.grade.value >= (quiz.submission.grade.maxScore * 0.7)
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {((quiz.submission.grade.value / quiz.submission.grade.maxScore) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleViewQuiz(quiz.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                            title={quiz.submission ? "Ver Resultados" : "Realizar Cuestionario"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-card rounded-2xl border border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-sm text-foreground flex-1 min-w-0 truncate">{quiz.title}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {getStatusIcon(quiz.submission?.status || '', quiz.isOverdue)}
                      {getStatusBadge(quiz.submission?.status || '', quiz.isOverdue)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Calif. Máxima</p>
                      <p className="text-sm font-semibold text-foreground">{quiz.maxGrade}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Calificación</p>
                      <p className="text-sm font-semibold text-foreground">
                        {quiz.submission?.grade
                          ? `${quiz.submission.grade.value}/${quiz.submission.grade.maxScore}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewQuiz(quiz.id)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      quiz.submission
                        ? "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {quiz.submission ? "Ver Resultados" : "Realizar Cuestionario"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>

  </div>
);
}