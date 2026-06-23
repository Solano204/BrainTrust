"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, X, Eye, EyeOff, AlertCircle, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Question } from "@/app/domain/entities/CourseEntities"
import { z } from "zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"


const esquemaPreguntaOpcionMultiple = z.object({
  id: z.string(),
  type: z.literal("multiple-choice"),
  question: z.string()
    .min(5, "La pregunta debe tener al menos 5 caracteres")
    .max(500, "La pregunta no debe exceder los 500 caracteres")
    .trim(),
  options: z.array(z.string().min(1, "La opción no puede estar vacía").trim())
    .min(2, "Debe tener al menos 2 opciones")
    .max(10, "No puede tener más de 10 opciones"),
  correctAnswer: z.number().min(0).int(),
  /** Peso como porcentaje (0-100). Todas las preguntas deben sumar 100. */
  percentage: z.number().min(0).max(100),
  points: z.number().optional(),
  text: z.string().optional(),
  maxPoints: z.number().optional()
})

const esquemaPreguntaAbierta = z.object({
  id: z.string(),
  type: z.literal("open-ended"),
  question: z.string()
    .min(5, "La pregunta debe tener al menos 5 caracteres")
    .max(500, "La pregunta no debe exceder los 500 caracteres")
    .trim(),
  expectedAnswer: z.string()
    .min(1, "Se requiere una respuesta esperada como referencia para calificar")
    .max(2000, "La respuesta esperada no debe exceder los 2000 caracteres")
    .trim()
    .optional(),
  /** Peso como porcentaje (0-100). Todas las preguntas deben sumar 100. */
  percentage: z.number().min(0).max(100),
  points: z.number().optional(),
  text: z.string().optional(),
  maxPoints: z.number().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.number().optional()
})

const esquemaPregunta = z.discriminatedUnion("type", [
  esquemaPreguntaOpcionMultiple,
  esquemaPreguntaAbierta
])

const esquemaFormularioQuiz = z.object({
  title: z.string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no debe exceder los 200 caracteres")
    .trim(),
  description: z.string()
    .max(1000, "La descripción no debe exceder los 1000 caracteres")
    .trim()
    .optional(),
  timeLimit: z.number()
    .min(0, "El límite de tiempo no puede ser negativo")
    .max(1440, "El límite de tiempo no puede exceder 24 horas (1440 minutos)")
    .int()
    .optional()
    .or(z.literal(0)),
  maxGrade: z.number()
    .min(1, "La calificación máxima debe ser al menos 1")
    .max(1000, "La calificación máxima no puede exceder 1000")
    .int(),
  dueDate: z.string().optional(),
  acceptLateSubmissions: z.boolean().default(true),
  /** NUEVO: Si los estudiantes pueden ver las respuestas correctas después de enviar */
  allowSeeResults: z.boolean().default(false),
  questions: z.array(esquemaPregunta)
    .min(1, "El quiz debe tener al menos una pregunta")
    .max(100, "El quiz no puede tener más de 100 preguntas")
}).refine((data) => {
  return data.questions.every(q => {
    if (q.type === "multiple-choice") {
      return q.options.every(opt => opt.trim().length > 0)
    }
    return true
  })
}, {
  message: "Todas las opciones de opción múltiple deben estar llenas",
  path: ["questions"]
}).refine((data) => {
  if (data.dueDate) {
    return new Date(data.dueDate) > new Date()
  }
  return true
}, {
  message: "La fecha de entrega debe ser en el futuro",
  path: ["dueDate"]
}).refine((data) => {
  const total = data.questions.reduce((sum, q) => sum + (q.percentage || 0), 0)
  return Math.round(total) === 100
}, {
  message: "Los porcentajes de las preguntas deben sumar exactamente 100%",
  path: ["questions"]
})

type DatosFormularioQuiz = z.infer<typeof esquemaFormularioQuiz>


interface PropsCreadorQuiz {
  open: boolean
  onClose: () => void
  onSave: (quiz: any) => void
  unitId: string
  courseId: string
}


function calcularPuntosReales(porcentaje: number, calificacionMaxima: number): number {
  return Math.round((porcentaje / 100) * calificacionMaxima * 100) / 100
}

function porcentajesPorDefecto(cantidad: number): number[] {
  if (cantidad === 0) return []
  const base = Math.floor(100 / cantidad)
  const resto = 100 - base * cantidad
  return Array.from({ length: cantidad }, (_, i) => (i === 0 ? base + resto : base))
}


export function CreadorQuiz({ open, onClose, onSave, unitId, courseId }: PropsCreadorQuiz) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<DatosFormularioQuiz>({
    resolver: zodResolver(esquemaFormularioQuiz),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 0,
      maxGrade: 100,
      dueDate: "",
      acceptLateSubmissions: true,
      allowSeeResults: false,
      questions: [{
        id: "" + new Date().getTime(),
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        percentage: 100,
        text: "",
        maxPoints: 0
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: "questions" })

  const preguntasObservadas = watch("questions")
  const calificacionMaxima = watch("maxGrade")
  const permitirVerResultados = watch("allowSeeResults")

  const porcentajeTotal = preguntasObservadas.reduce((sum, q) => sum + (q.percentage || 0), 0)
  const porcentajeOk = Math.round(porcentajeTotal) === 100
  const restante = 100 - porcentajeTotal

  const redistribuirUniformemente = () => {
    const porcentajesEq = porcentajesPorDefecto(preguntasObservadas.length)
    preguntasObservadas.forEach((_, i) => {
      setValue(`questions.${i}.percentage`, porcentajesEq[i])
    })
    trigger("questions")
  }

  const agregarPregunta = (tipo: "multiple-choice" | "open-ended") => {
    const nuevaPregunta: any = {
      id: "" + new Date().getTime(),
      type: tipo,
      question: "",
      percentage: 0,
      text: "",
      maxPoints: 0,
      ...(tipo === "multiple-choice" && { options: ["", "", "", ""], correctAnswer: 0 }),
      ...(tipo === "open-ended" && { expectedAnswer: "" })
    }
    append(nuevaPregunta)
    trigger("questions")
  }

  const eliminarPregunta = (indice: number) => {
    remove(indice)
    trigger("questions")
  }

  const agregarOpcion = (indicePregunta: number) => {
    const q = preguntasObservadas[indicePregunta]
    if (q.type === "multiple-choice" && q.options) {
      setValue(`questions.${indicePregunta}.options`, [...q.options, ""])
    }
  }

  const eliminarOpcion = (indicePregunta: number, indiceOpcion: number) => {
    const q = preguntasObservadas[indicePregunta]
    if (q.type === "multiple-choice" && q.options && q.options.length > 2) {
      const nuevasOpciones = q.options.filter((_, i) => i !== indiceOpcion)
      const nuevaCorrecta = q.correctAnswer === indiceOpcion
        ? 0
        : (q.correctAnswer || 0) > indiceOpcion
        ? (q.correctAnswer || 0) - 1
        : q.correctAnswer
      setValue(`questions.${indicePregunta}.options`, nuevasOpciones)
      setValue(`questions.${indicePregunta}.correctAnswer`, nuevaCorrecta)
    }
  }

  const alEnviar = (data: DatosFormularioQuiz) => {
    const quiz = {
      title: data.title,
      description: data.description,
      timeLimit: data.timeLimit || 0,
      maxGrade: data.maxGrade,
      totalScore: data.maxGrade,          // ← NUEVO campo para el backend
      allowSeeResults: data.allowSeeResults, // ← NUEVO campo para el backend
      dueDate: data.dueDate || null,
      acceptLateSubmissions: data.acceptLateSubmissions,
      questions: data.questions.map(q => ({
        ...q,
        points: calcularPuntosReales(q.percentage, data.maxGrade),
        options: q.type === "multiple-choice" ? q.options : undefined,
        correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : undefined,
        expectedAnswer: q.type === "open-ended" ? q.expectedAnswer : undefined
      }))
    }
    onSave(quiz)
    handleCerrar()
  }

  const handleCerrar = () => {
    reset({
      title: "",
      description: "",
      timeLimit: 0,
      maxGrade: 100,
      dueDate: "",
      acceptLateSubmissions: true,
      allowSeeResults: false,
      questions: [{
        id: "" + new Date().getTime(),
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        percentage: 100,
        text: "",
        maxPoints: 0
      }]
    })
    onClose()
  }

  const obtenerErrorPregunta = (indice: number, campo?: string) => {
    if (!errors.questions) return null
    const errQ = errors.questions[indice]
    if (!errQ) return null
    if (campo && typeof errQ === "object" && campo in errQ) return (errQ as any)[campo]?.message
    if (typeof errQ === "object" && "message" in errQ) return errQ.message
    return null
  }

  const colorBarra = porcentajeOk
    ? "bg-green-500"
    : porcentajeTotal > 100
    ? "bg-red-500"
    : "bg-orange-400"
return (
  <Dialog open={open} onOpenChange={handleCerrar}>
    <DialogContent className="bg-card rounded-3xl border border-border shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 sm:max-w-[95vw] md:max-w-6xl">

      <div className="flex items-center gap-3 px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <span className="icon-badge">
          <HelpCircle className="w-4 h-4 text-primary" />
        </span>
        <div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Crear Quiz / Examen
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Configurar ajustes y agregar preguntas
          </DialogDescription>
        </div>
      </div>

      <form onSubmit={handleSubmit(alEnviar)} className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-5 py-6 sm:px-7 space-y-6 flex-1">

          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
            <h3 className="section-label">
              Configuración del Quiz
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5">
                <label htmlFor="quiz-title" className="text-xs font-semibold text-foreground">
                  Título del Quiz *
                </label>
                <Controller name="title" control={control} render={({ field }) => (
                  <input
                    {...field}
                    id="quiz-title"
                    placeholder="Ingrese el título del quiz"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                      errors.title ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                    }`}
                  />
                )} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="time-limit" className="text-xs font-semibold text-foreground">
                  Límite de Tiempo (minutos)
                </label>
                <Controller name="timeLimit" control={control} render={({ field }) => (
                  <input
                    {...field}
                    id="time-limit"
                    type="number"
                    placeholder="ej., 60"
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                      errors.timeLimit ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                    }`}
                  />
                )} />
                {errors.timeLimit && <p className="text-xs text-destructive">{errors.timeLimit.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="quiz-description" className="text-xs font-semibold text-foreground">
                  Descripción
                </label>
                <Controller name="description" control={control} render={({ field }) => (
                  <textarea
                    {...field}
                    id="quiz-description"
                    placeholder="Ingrese la descripción del quiz"
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all ${
                      errors.description ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                    }`}
                  />
                )} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="max-grade-quiz" className="text-xs font-semibold text-foreground">
                  Calificación Máxima *
                </label>
                <Controller name="maxGrade" control={control} render={({ field }) => (
                  <input
                    {...field}
                    id="max-grade-quiz"
                    type="number"
                    value={field.value || ""}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                    min="1"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                      errors.maxGrade ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                    }`}
                  />
                )} />
                {errors.maxGrade && <p className="text-xs text-destructive">{errors.maxGrade.message}</p>}
                <p className="text-xs text-muted-foreground">
                  La puntuación real de cada pregunta = su porcentaje × {calificacionMaxima || 100}
                </p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="due-date" className="text-xs font-semibold text-foreground">
                  Fecha de Entrega
                </label>
                <Controller name="dueDate" control={control} render={({ field }) => (
                  <input
                    {...field}
                    id="due-date"
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                      errors.dueDate ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                    }`}
                  />
                )} />
                {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {permitirVerResultados
                        ? <Eye className="w-4 h-4 text-primary" />
                        : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      <p className="text-sm font-semibold text-foreground">
                        Permitir a los estudiantes ver los resultados después de enviar
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {permitirVerResultados
                        ? "Los estudiantes podrán revisar las respuestas correctas y su puntuación después de enviar."
                        : "Los estudiantes solo verán su puntuación total — las respuestas correctas permanecerán ocultas."}
                    </p>
                  </div>
                  <Controller name="allowSeeResults" control={control} render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="section-label">
                  Preguntas ({fields.length})
                </h3>
                {errors.questions && typeof errors.questions === "object" && "message" in errors.questions && (
                  <p className="text-xs text-destructive mt-1">{errors.questions.message as string}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => agregarPregunta("multiple-choice")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Opción Múltiple
                </button>
                <button
                  type="button"
                  onClick={() => agregarPregunta("open-ended")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Respuesta Abierta
                </button>
              </div>
            </div>

            {fields.length > 0 && (
              <div className="p-4 bg-card rounded-2xl border border-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">Porcentaje total asignado</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {!porcentajeOk && (
                      <span className="text-xs text-muted-foreground">
                        {restante > 0
                          ? `${restante.toFixed(1)}% restante`
                          : `${Math.abs(restante).toFixed(1)}% excede el límite`}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      porcentajeOk ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {porcentajeTotal.toFixed(1)}% / 100%
                    </span>
                    <button
                      type="button"
                      onClick={redistribuirUniformemente}
                      className="px-3 py-1 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      Distribuir Uniformemente
                    </button>
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-muted/50 overflow-hidden flex">
                  {preguntasObservadas.map((q, i) => {
                    const pct = Math.min(q.percentage || 0, 100)
                    const hue = (i * 47) % 360
                    return pct > 0 ? (
                      <div
                        key={i}
                        title={`P${i + 1}: ${pct}%`}
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: `hsl(${hue},60%,50%)` }}
                      />
                    ) : null
                  })}
                  {porcentajeTotal > 100 && (
                    <div className="h-full bg-destructive flex-1" />
                  )}
                </div>

                {!porcentajeOk && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent-foreground">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Los porcentajes deben sumar exactamente 100% antes de poder guardar.
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Con una calificación máxima de <strong className="text-foreground">{calificacionMaxima || 100}</strong>:{' '}
                  {preguntasObservadas.map((q, i) => (
                    <span key={i} className="ml-1">
                      P{i + 1} = <strong className="text-foreground">{calcularPuntosReales(q.percentage || 0, calificacionMaxima || 100)} pts</strong>
                      {i < preguntasObservadas.length - 1 && " ·"}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {fields.map((field, indice) => {
              const pregunta           = preguntasObservadas[indice]
              const errorPregunta      = obtenerErrorPregunta(indice, "question")
              const errorOpciones       = obtenerErrorPregunta(indice, "options")
              const errorRespuestaEsperada = obtenerErrorPregunta(indice, "expectedAnswer")
              const errorPorcentaje    = obtenerErrorPregunta(indice, "percentage")
              const tieneError           = !!(errorPregunta || errorOpciones || errorRespuestaEsperada || errorPorcentaje)
              const puntosReales       = calcularPuntosReales(pregunta?.percentage || 0, calificacionMaxima || 100)

              return (
                <div
                  key={field.id}
                  className={`p-5 bg-card rounded-2xl border transition-colors ${
                    tieneError ? 'border-destructive/50' : 'border-border'
                  }`}
                >
                  <div className="space-y-4">

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move flex-shrink-0 mt-2.5" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                              pregunta.type === "multiple-choice"
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              Pregunta {indice + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                              {pregunta.type === "multiple-choice" ? "Opción Múltiple" : "Respuesta Abierta"}
                            </span>
                          </div>
                          <Controller
                            name={`questions.${indice}.question`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                placeholder="Ingrese su pregunta"
                                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                                  errorPregunta ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                                }`}
                              />
                            )}
                          />
                          {errorPregunta && <p className="text-xs text-destructive">{errorPregunta}</p>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Controller
                            name={`questions.${indice}.percentage`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                value={field.value}
                                onChange={e => { field.onChange(parseFloat(e.target.value) || 0); trigger("questions") }}
                                min="0"
                                max="100"
                                step="0.1"
                                className={`w-20 px-3 py-2 rounded-xl border bg-background text-sm text-right text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                                  errorPorcentaje ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                                }`}
                              />
                            )}
                          />
                          <span className="text-xs font-semibold text-muted-foreground">%</span>
                          <button
                            type="button"
                            onClick={() => eliminarPregunta(indice)}
                            className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          = <strong className="text-foreground">{puntosReales}</strong> pts
                        </span>
                        {errorPorcentaje && <p className="text-xs text-destructive">{errorPorcentaje}</p>}
                      </div>
                    </div>

                    {pregunta.type === "multiple-choice" && pregunta.options && (
                      <div className="space-y-3 sm:ml-7">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground">Opciones de Respuesta *</label>
                          <button
                            type="button"
                            onClick={() => agregarOpcion(indice)}
                            disabled={pregunta.options.length >= 10}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Agregar Opción
                          </button>
                        </div>
                        {pregunta.options.map((_, indiceOpcion) => (
                          <div key={indiceOpcion} className="flex items-center gap-3">
                            <Controller
                              name={`questions.${indice}.correctAnswer`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="radio"
                                  checked={field.value === indiceOpcion}
                                  onChange={() => field.onChange(indiceOpcion)}
                                  className="w-4 h-4 accent-primary flex-shrink-0"
                                />
                              )}
                            />
                            <span className="text-xs font-bold text-muted-foreground w-5 flex-shrink-0">
                              {String.fromCharCode(65 + indiceOpcion)})
                            </span>
                            <Controller
                              name={`questions.${indice}.options.${indiceOpcion}`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  placeholder={`Opción ${indiceOpcion + 1}`}
                                  className={`flex-1 px-4 py-2 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                                    !field.value?.trim() && errorOpciones
                                      ? 'border-destructive focus:ring-destructive/40'
                                      : 'border-border'
                                  }`}
                                />
                              )}
                            />
                            {pregunta.options && pregunta.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => eliminarOpcion(indice, indiceOpcion)}
                                className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {errorOpciones && <p className="text-xs text-destructive">{errorOpciones}</p>}
                        <p className="text-xs text-muted-foreground ml-8">
                          Seleccione la respuesta correcta haciendo clic en el botón de radio
                        </p>
                      </div>
                    )}

                    {pregunta.type === "open-ended" && (
                      <div className="sm:ml-7 space-y-1.5">
                        <label
                          htmlFor={`expected-answer-${field.id}`}
                          className="text-xs font-semibold text-primary"
                        >
                          Respuesta Modelo / Respuesta Esperada (Para Referencia de Calificación)
                        </label>
                        <Controller
                          name={`questions.${indice}.expectedAnswer`}
                          control={control}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              id={`expected-answer-${""}`}
                              placeholder="Ingrese la respuesta esperada o puntos clave aquí como referencia (los estudiantes no verán esto)."
                              rows={3}
                              className={`w-full px-4 py-2.5 rounded-xl border bg-muted/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all ${
                                errorRespuestaEsperada
                                  ? 'border-destructive focus:ring-destructive/40'
                                  : 'border-primary/20'
                              }`}
                            />
                          )}
                        />
                        {errorRespuestaEsperada && <p className="text-xs text-destructive">{errorRespuestaEsperada}</p>}
                        <p className="text-xs text-muted-foreground">
                          Esta respuesta modelo se utilizará para calificación manual o comparación con IA.
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              )
            })}

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 p-12 bg-card rounded-2xl border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Aún no hay preguntas. Agregue su primera pregunta para comenzar.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => agregarPregunta("multiple-choice")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Opción Múltiple
                  </button>
                  <button
                    type="button"
                    onClick={() => agregarPregunta("open-ended")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Respuesta Abierta
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCerrar}
              className="flex-1 flex items-center justify-center px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || !porcentajeOk}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Crear Quiz
            </button>
          </div>
        </div>

      </form>
    </DialogContent>
  </Dialog>
)
}
