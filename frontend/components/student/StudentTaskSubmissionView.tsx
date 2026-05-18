"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    ArrowLeft, 
    Paperclip, 
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    Download,
    AlertCircle,
    Award,
    User,
    Info,
    TrendingUp,
    Bot
} from "lucide-react"
import { SubmissionTask } from '@/app/shared/models/assignment.model'

export interface AttachmentData {
    name: string;
    storagePath: string;
}

interface StudentAssignment {
  id: string
  name: string
  unit: string
  instructions: string
  maxPoints: number
  deadline: string
  deliveryMode: string
  studentName: string
  isOverdue: boolean
  submission?: {
    id: string
    content: string
    submittedAt: string
    status: string
    grade?: { value: string; maxScore: number }
    teacherFeedback?: string
    attachments: Array<{ name: string; storagePath: string; createdAt: string }>
    aiAnalysis?: {
      analysisId: string
      probability: string
      percentage: string
      isLikelyAI: boolean
      confidenceLevel: string
      modelUsed: string
      analyzedAt: string
    }
  }
}

interface StudentTaskSubmissionViewProps {
  assignment: SubmissionTask
  onExit: () => void
}

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`text-sm font-medium leading-none ${className || ''}`}>
        {children}
    </label>
)

const handleDownload = (file: AttachmentData) => {
    const link = document.createElement('a')
    link.href = file.storagePath
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export function StudentTaskSubmissionView({ assignment, onExit }: StudentTaskSubmissionViewProps) {

    console.log(assignment)
    const isSubmitted = assignment.submission?.status === 'SUBMITTED' || assignment.submission?.status === 'GRADED'
    const isGraded = assignment.submission?.status === 'GRADED'

    
    if (!assignment.submission) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-border">
                        <div>
                            <Button onClick={onExit} variant="outline" className="gap-2 mb-4">
                                <ArrowLeft className="h-4 w-4" /> Volver a Tareas
                            </Button>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {assignment.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">{assignment.unit}</p>
                        </div>
                        <Badge variant="outline">No Enviado</Badge>
                    </div>

                    <Card className="text-center p-8">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">No se encontró envío</h2>
                        <p className="text-muted-foreground mb-4">
                            Aún no has enviado esta tarea.
                        </p>
                        <Button onClick={onExit}>
                            Volver a Tareas
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    const submission = assignment.submission
    const percentage = submission.grade 
        ? (parseInt(submission.grade.value) / assignment.maxPoints) * 100 
        : 0

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 90) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' }
        if (pct >= 80) return { label: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-50' }
        if (pct >= 70) return { label: 'Satisfactorio', color: 'text-yellow-600', bg: 'bg-yellow-50' }
        return { label: 'Necesita Mejorar', color: 'text-red-600', bg: 'bg-red-50' }
    }

    const performance = getPerformanceLevel(percentage)

    const getAIAnalysisColor = (isLikelyAI: boolean, confidenceLevel: string) => {
        if (!isLikelyAI) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' }
        if (confidenceLevel === 'HIGH') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
        if (confidenceLevel === 'MEDIUM') return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' }
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' }
    }

   return (
  <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Encabezado ── */}
      <div className="space-y-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Tareas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
              {assignment.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />{assignment.studentName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(submission.submittedAt).toLocaleTimeString()}
              </span>
              <span className="px-2 py-0.5 rounded-md border border-border text-xs font-medium">
                {assignment.deliveryMode === 'TEAM' ? 'Equipo' : 'Individual'}
              </span>
            </div>
          </div>
          <span className={`self-start px-3 py-1 rounded-xl text-xs font-bold flex-shrink-0 ${
            isGraded
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {isGraded ? '✓ Calificado' : '⏳ Enviado'}
          </span>
        </div>
      </div>

      {/* ── Tarjetas de estadísticas de calificación ── */}
      {isGraded && submission.grade && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-2xl border-2 border-primary p-4 text-center space-y-1">
            <Award className="w-7 h-7 mx-auto text-primary" />
            <p className="text-2xl font-bold text-primary">
              {submission.grade.value}/{assignment.maxPoints}
            </p>
            <p className="text-xs text-muted-foreground">Tu Puntaje</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 text-center space-y-1">
            <TrendingUp className="w-7 h-7 mx-auto text-primary" />
            <p className="text-2xl font-bold text-primary">{percentage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Porcentaje</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 text-center space-y-1">
            <CheckCircle className={`w-7 h-7 mx-auto ${performance.color}`} />
            <p className={`text-base font-bold ${performance.color}`}>{performance.label}</p>
            <p className="text-xs text-muted-foreground">Rendimiento</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 text-center space-y-1">
            <Calendar className="w-7 h-7 mx-auto text-primary" />
            <p className={`text-base font-bold ${assignment.isOverdue ? 'text-destructive' : 'text-primary'}`}>
              {assignment.isOverdue ? 'Tarde' : 'A Tiempo'}
            </p>
            <p className="text-xs text-muted-foreground">Envío</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Contenido principal ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Respuesta enviada */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </span>
                <h2 className="text-base font-bold text-foreground">Tu Envío</h2>
              </div>
            </div>
            <div className="px-5 py-5 sm:px-6 space-y-3">
              <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm text-foreground whitespace-pre-wrap">
                {submission.content}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Enviado el: {new Date(submission.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Adjuntos */}
          {submission.attachments && submission.attachments.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 sm:px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Paperclip className="w-4 h-4 text-primary" />
                  </span>
                  <h2 className="text-base font-bold text-foreground">
                    Archivos Adjuntos ({submission.attachments.length})
                  </h2>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6 space-y-2">
                {submission.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                      
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análisis de IA */}
          {submission.aiAnalysis && (
            <div className={`bg-card rounded-2xl border-l-4 border-t border-r border-b border-border shadow-sm overflow-hidden ${
              submission.aiAnalysis.isLikelyAI ? 'border-l-destructive' : 'border-l-primary'
            }`}>
              <div className="px-5 py-4 sm:px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </span>
                  <h2 className="text-base font-bold text-foreground">Análisis de Detección de IA</h2>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  submission.aiAnalysis.isLikelyAI
                    ? 'bg-destructive/5 border-destructive/20'
                    : 'bg-primary/5 border-primary/20'
                }`}>
                  {[
                    { label: 'Probabilidad de IA', value: (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        submission.aiAnalysis.isLikelyAI
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {submission.aiAnalysis.percentage}
                      </span>
                    )},
                    { label: 'Nivel de Confianza', value: (
                      <span className="px-2 py-0.5 rounded-md border border-border text-xs font-medium text-muted-foreground">
                        {submission.aiAnalysis.confidenceLevel === 'HIGH' ? 'ALTO' : 
                         submission.aiAnalysis.confidenceLevel === 'MEDIUM' ? 'MEDIO' : 'BAJO'}
                      </span>
                    )},
                    { label: 'Modelo Utilizado', value: (
                      <span className="text-xs text-muted-foreground">{submission.aiAnalysis.modelUsed}</span>
                    )},
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{label}:</span>
                      {value}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Analizado: {new Date(submission.aiAnalysis.analyzedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retroalimentación del profesor */}
          {submission.teacherFeedback && (
            <div className="bg-card rounded-2xl border-l-4 border-l-primary border-t border-r border-b border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 sm:px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </span>
                  <h2 className="text-base font-bold text-foreground">Retroalimentación del Profesor</h2>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6 space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {submission.teacherFeedback}
                  </p>
                </div>
                {submission.grade && (
                  <div className={`p-4 rounded-2xl border border-border ${performance.bg}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground">Calificación:</span>
                      <span className="text-lg font-bold text-foreground">
                        {submission.grade.value}/{assignment.maxPoints}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(1)}%)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${performance.color} bg-primary/10`}>
                        {performance.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Barra lateral ── */}
        <div className="space-y-4">

          {/* Detalles del envío */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Detalles del Envío</h3>
            </div>
            <div className="px-4 py-4 space-y-4">
              {[
                {
                  label: 'Estado',
                  value: (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      isGraded ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isGraded ? 'Calificado' : 'Enviado'}
                    </span>
                  ),
                },
                { label: 'Estudiante',         value: <p className="text-sm font-semibold text-foreground">{assignment.studentName}</p> },
                { label: 'Fecha de Envío', value: <p className="text-xs font-medium text-foreground">{new Date(submission.submittedAt).toLocaleString()}</p> },
                {
                  label: 'Fecha Límite',
                  value: (
                    <div>
                      <p className={`text-xs font-medium ${assignment.isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                        {assignment.deadline}
                      </p>
                      {assignment.isOverdue && (
                        <p className="text-xs text-destructive">(Envío Tardío)</p>
                      )}
                    </div>
                  ),
                },
                { label: 'Modo de Entrega', value: <p className="text-xs font-medium text-foreground">{assignment.deliveryMode === 'TEAM' ? 'Equipo' : 'Individual'}</p> },
                { label: 'Puntos Máximos',    value: <p className="text-xs font-medium text-foreground">{assignment.maxPoints} puntos</p> },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {value}
                </div>
              ))}

              {isGraded && submission.grade && (
                <>
                  <div className="pt-3 border-t border-border space-y-0.5">
                    <p className="text-xs text-muted-foreground">Tu Calificación</p>
                    <p className="text-2xl font-bold text-primary">
                      {submission.grade.value}/{assignment.maxPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% — {performance.label}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">ID del Envío</p>
                    <code className="block text-xs font-mono bg-muted px-3 py-2 rounded-xl text-foreground">
                      {submission.id}
                    </code>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información de la tarea */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Info className="w-3.5 h-3.5 text-primary" />
                </span>
                <h3 className="text-sm font-bold text-foreground">Información de la Tarea</h3>
              </div>
            </div>
            <div className="px-4 py-4 space-y-3">
              {[
                { label: 'Título', value: assignment.name },
                { label: 'Unidad',  value: assignment.unit  },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xs font-semibold text-foreground">{value}</p>
                </div>
              ))}
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Instrucciones</p>
                <p className="text-xs text-foreground line-clamp-4">{assignment.instructions}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
)
}