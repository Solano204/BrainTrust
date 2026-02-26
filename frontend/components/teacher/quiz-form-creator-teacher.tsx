"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, X, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Question } from "@/app/domain/entities/CourseEntities"
import { z } from "zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// ─── Schemas ────────────────────────────────────────────────────────────────

const multipleChoiceQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("multiple-choice"),
  question: z.string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question must not exceed 500 characters")
    .trim(),
  options: z.array(z.string().min(1, "Option cannot be empty").trim())
    .min(2, "Must have at least 2 options")
    .max(10, "Cannot have more than 10 options"),
  correctAnswer: z.number().min(0).int(),
  /** Weight as a percentage (0-100). All questions must sum to 100. */
  percentage: z.number().min(0).max(100),
  points: z.number().optional(),
  text: z.string().optional(),
  maxPoints: z.number().optional()
})

const openEndedQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("open-ended"),
  question: z.string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question must not exceed 500 characters")
    .trim(),
  expectedAnswer: z.string()
    .min(1, "Expected answer is required for grading reference")
    .max(2000, "Expected answer must not exceed 2000 characters")
    .trim()
    .optional(),
  /** Weight as a percentage (0-100). All questions must sum to 100. */
  percentage: z.number().min(0).max(100),
  points: z.number().optional(),
  text: z.string().optional(),
  maxPoints: z.number().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.number().optional()
})

const questionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  openEndedQuestionSchema
])

const quizFormSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  description: z.string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional(),
  timeLimit: z.number()
    .min(0, "Time limit cannot be negative")
    .max(1440, "Time limit cannot exceed 24 hours (1440 minutes)")
    .int()
    .optional()
    .or(z.literal(0)),
  maxGrade: z.number()
    .min(1, "Maximum grade must be at least 1")
    .max(1000, "Maximum grade cannot exceed 1000")
    .int(),
  dueDate: z.string().optional(),
  acceptLateSubmissions: z.boolean().default(true),
  /** NEW: Whether students can see correct answers after submitting */
  allowSeeResults: z.boolean().default(false),
  questions: z.array(questionSchema)
    .min(1, "Quiz must have at least one question")
    .max(100, "Quiz cannot have more than 100 questions")
}).refine((data) => {
  return data.questions.every(q => {
    if (q.type === "multiple-choice") {
      return q.options.every(opt => opt.trim().length > 0)
    }
    return true
  })
}, {
  message: "All multiple-choice options must be filled",
  path: ["questions"]
}).refine((data) => {
  if (data.dueDate) {
    return new Date(data.dueDate) > new Date()
  }
  return true
}, {
  message: "Due date must be in the future",
  path: ["dueDate"]
}).refine((data) => {
  const total = data.questions.reduce((sum, q) => sum + (q.percentage || 0), 0)
  return Math.round(total) === 100
}, {
  message: "Question percentages must add up to exactly 100%",
  path: ["questions"]
})

type QuizFormData = z.infer<typeof quizFormSchema>

// ─── Props ───────────────────────────────────────────────────────────────────

interface QuizCreatorProps {
  open: boolean
  onClose: () => void
  onSave: (quiz: any) => void
  unitId: string
  courseId: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcActualPoints(percentage: number, maxGrade: number): number {
  return Math.round((percentage / 100) * maxGrade * 100) / 100
}

function defaultPercentages(count: number): number[] {
  if (count === 0) return []
  const base = Math.floor(100 / count)
  const remainder = 100 - base * count
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base))
}

// ─── Component ───────────────────────────────────────────────────────────────

export function QuizCreator({ open, onClose, onSave, unitId, courseId }: QuizCreatorProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
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

  const watchedQuestions = watch("questions")
  const maxGrade = watch("maxGrade")
  const allowSeeResults = watch("allowSeeResults")

  const totalPercentage = watchedQuestions.reduce((sum, q) => sum + (q.percentage || 0), 0)
  const percentageOk = Math.round(totalPercentage) === 100
  const remaining = 100 - totalPercentage

  // ── redistribute percentages evenly across all questions ──────────────────
  const redistributeEvenly = () => {
    const perqs = defaultPercentages(watchedQuestions.length)
    watchedQuestions.forEach((_, i) => {
      setValue(`questions.${i}.percentage`, perqs[i])
    })
    trigger("questions")
  }

  // ── add question ──────────────────────────────────────────────────────────
  const addQuestion = (type: "multiple-choice" | "open-ended") => {
    // When adding, set new question to 0% and let teacher decide
    const newQuestion: any = {
      id: "" + new Date().getTime(),
      type,
      question: "",
      percentage: 0,
      text: "",
      maxPoints: 0,
      ...(type === "multiple-choice" && { options: ["", "", "", ""], correctAnswer: 0 }),
      ...(type === "open-ended" && { expectedAnswer: "" })
    }
    append(newQuestion)
    trigger("questions")
  }

  const deleteQuestion = (index: number) => {
    remove(index)
    trigger("questions")
  }

  // ── option helpers ────────────────────────────────────────────────────────
  const addOption = (questionIndex: number) => {
    const q = watchedQuestions[questionIndex]
    if (q.type === "multiple-choice" && q.options) {
      setValue(`questions.${questionIndex}.options`, [...q.options, ""])
    }
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const q = watchedQuestions[questionIndex]
    if (q.type === "multiple-choice" && q.options && q.options.length > 2) {
      const newOptions = q.options.filter((_, i) => i !== optionIndex)
      const newCorrect = q.correctAnswer === optionIndex
        ? 0
        : (q.correctAnswer || 0) > optionIndex
        ? (q.correctAnswer || 0) - 1
        : q.correctAnswer
      setValue(`questions.${questionIndex}.options`, newOptions)
      setValue(`questions.${questionIndex}.correctAnswer`, newCorrect)
    }
  }

  // ── submit ────────────────────────────────────────────────────────────────
  const onSubmit = (data: QuizFormData) => {
    const quiz = {
      title: data.title,
      description: data.description,
      timeLimit: data.timeLimit || 0,
      maxGrade: data.maxGrade,
      totalScore: data.maxGrade,          // ← NEW field for backend
      allowSeeResults: data.allowSeeResults, // ← NEW field for backend
      dueDate: data.dueDate || null,
      acceptLateSubmissions: data.acceptLateSubmissions,
      questions: data.questions.map(q => ({
        ...q,
        // Compute actual points from percentage × maxGrade
        points: calcActualPoints(q.percentage, data.maxGrade),
        options: q.type === "multiple-choice" ? q.options : undefined,
        correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : undefined,
        expectedAnswer: q.type === "open-ended" ? q.expectedAnswer : undefined
      }))
    }
    onSave(quiz)
    handleClose()
  }

  const handleClose = () => {
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

  const getQuestionError = (index: number, field?: string) => {
    if (!errors.questions) return null
    const qErr = errors.questions[index]
    if (!qErr) return null
    if (field && typeof qErr === "object" && field in qErr) return (qErr as any)[field]?.message
    if (typeof qErr === "object" && "message" in qErr) return qErr.message
    return null
  }

  // ── percentage bar color ──────────────────────────────────────────────────
  const barColor = percentageOk
    ? "bg-green-500"
    : totalPercentage > 100
    ? "bg-red-500"
    : "bg-orange-400"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Quiz / Exam</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">

          {/* ── Quiz Settings ─────────────────────────────────────────────── */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
            <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title *</Label>
                <Controller name="title" control={control} render={({ field }) => (
                  <Input {...field} id="quiz-title" placeholder="Enter quiz title"
                    className={errors.title ? "border-red-500" : ""} />
                )} />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Controller name="timeLimit" control={control} render={({ field }) => (
                  <Input {...field} id="time-limit" type="number" placeholder="e.g., 60"
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                    className={errors.timeLimit ? "border-red-500" : ""} />
                )} />
                {errors.timeLimit && <p className="text-sm text-red-500">{errors.timeLimit.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="quiz-description">Description</Label>
                <Controller name="description" control={control} render={({ field }) => (
                  <Textarea {...field} id="quiz-description" placeholder="Enter quiz description"
                    rows={2} className={errors.description ? "border-red-500" : ""} />
                )} />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>

              {/* Max Grade */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="max-grade-quiz">Maximum Grade *</Label>
                <Controller name="maxGrade" control={control} render={({ field }) => (
                  <Input {...field} id="max-grade-quiz" type="number"
                    value={field.value || ""}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                    min="1" className={errors.maxGrade ? "border-red-500" : ""} />
                )} />
                {errors.maxGrade && <p className="text-sm text-red-500">{errors.maxGrade.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Each question's actual score = its percentage × {maxGrade || 100}
                </p>
              </div>

              {/* Due Date */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Controller name="dueDate" control={control} render={({ field }) => (
                  <Input {...field} id="due-date" type="datetime-local"
                    className={errors.dueDate ? "border-red-500" : ""} />
                )} />
                {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
              </div>

              {/* ── NEW: Allow See Results ──────────────────────────────── */}
              <div className="md:col-span-2">
                <Card className="p-4 border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {allowSeeResults
                          ? <Eye className="h-5 w-5 text-green-600" />
                          : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                        <Label className="text-base font-semibold cursor-pointer">
                          Allow students to see results after submission
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        {allowSeeResults
                          ? "Students will be able to review correct answers and their score after submitting."
                          : "Students will only see their total score — correct answers remain hidden."}
                      </p>
                    </div>
                    <Controller name="allowSeeResults" control={control} render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )} />
                  </div>
                </Card>
              </div>

            </div>
          </Card>

          {/* ── Questions ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Questions ({fields.length})
                </h3>
                {errors.questions && typeof errors.questions === "object" && "message" in errors.questions && (
                  <p className="text-sm text-red-500 mt-1">{errors.questions.message as string}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("multiple-choice")} className="gap-2">
                  <Plus className="h-4 w-4" /> Multiple Choice
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("open-ended")} className="gap-2">
                  <Plus className="h-4 w-4" /> Open Answer
                </Button>
              </div>
            </div>

            {/* ── Percentage progress bar ──────────────────────────────── */}
            {fields.length > 0 && (
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total percentage assigned</span>
                  <div className="flex items-center gap-3">
                    {!percentageOk && (
                      <span className="text-sm text-muted-foreground">
                        {remaining > 0
                          ? `${remaining.toFixed(1)}% remaining`
                          : `${Math.abs(remaining).toFixed(1)}% over limit`}
                      </span>
                    )}
                    <Badge
                      variant={percentageOk ? "default" : "destructive"}
                      className={percentageOk ? "bg-green-600" : ""}
                    >
                      {totalPercentage.toFixed(1)}% / 100%
                    </Badge>
                    <Button type="button" variant="outline" size="sm" onClick={redistributeEvenly}
                      className="text-xs h-7">
                      Distribute Evenly
                    </Button>
                  </div>
                </div>

                {/* Stacked percentage bar */}
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden flex">
                  {watchedQuestions.map((q, i) => {
                    const pct = Math.min(q.percentage || 0, 100)
                    const hue = (i * 47) % 360
                    return pct > 0 ? (
                      <div
                        key={i}
                        title={`Q${i + 1}: ${pct}%`}
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: `hsl(${hue},70%,55%)` }}
                      />
                    ) : null
                  })}
                  {/* overflow indicator */}
                  {totalPercentage > 100 && (
                    <div className="h-full bg-red-500 flex-1" />
                  )}
                </div>

                {!percentageOk && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Percentages must add up to exactly 100% before you can save.
                  </div>
                )}

                {/* Actual points preview */}
                <div className="text-xs text-muted-foreground">
                  With a max grade of <strong>{maxGrade || 100}</strong>:
                  {watchedQuestions.map((q, i) => (
                    <span key={i} className="ml-2">
                      Q{i + 1} = <strong>{calcActualPoints(q.percentage || 0, maxGrade || 100)} pts</strong>
                      {i < watchedQuestions.length - 1 && " ·"}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Question cards ─────────────────────────────────────────── */}
            {fields.map((field, index) => {
              const question = watchedQuestions[index]
              const questionError = getQuestionError(index, "question")
              const optionsError = getQuestionError(index, "options")
              const expectedAnswerError = getQuestionError(index, "expectedAnswer")
              const percentageError = getQuestionError(index, "percentage")
              const hasError = !!(questionError || optionsError || expectedAnswerError || percentageError)

              const actualPoints = calcActualPoints(question?.percentage || 0, maxGrade || 100)

              return (
                <Card key={field.id} className={`p-6 ${hasError ? "border-red-300" : ""}`}>
                  <div className="space-y-4">

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0 mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={question.type === "multiple-choice" ? "default" : "secondary"}>
                              Question {index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.type === "multiple-choice" ? "Multiple Choice" : "Open Answer"}
                            </Badge>
                          </div>
                          <Controller
                            name={`questions.${index}.question`}
                            control={control}
                            render={({ field }) => (
                              <Input {...field} placeholder="Enter your question"
                                className={questionError ? "border-red-500" : ""} />
                            )}
                          />
                          {questionError && <p className="text-sm text-red-500">{questionError}</p>}
                        </div>
                      </div>

                      {/* Percentage input + actual points badge */}
                      <div className="flex flex-col items-end gap-1 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Controller
                            name={`questions.${index}.percentage`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                value={field.value}
                                onChange={e => {
                                  field.onChange(parseFloat(e.target.value) || 0)
                                  trigger("questions")
                                }}
                                className={`w-20 text-right ${percentageError ? "border-red-500" : ""}`}
                                min="0"
                                max="100"
                                step="0.1"
                              />
                            )}
                          />
                          <span className="text-sm font-semibold text-muted-foreground">%</span>
                          <Button
                            type="button" variant="ghost" size="sm"
                            onClick={() => deleteQuestion(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground text-right">
                          = <strong>{actualPoints}</strong> pts
                        </span>
                        {percentageError && <p className="text-sm text-red-500">{percentageError}</p>}
                      </div>
                    </div>

                    {/* Multiple choice options */}
                    {question.type === "multiple-choice" && question.options && (
                      <div className="space-y-3 ml-8">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-muted-foreground">Answer Options *</Label>
                          <Button
                            type="button" variant="outline" size="sm"
                            onClick={() => addOption(index)}
                            className="gap-1 h-7 text-xs"
                            disabled={question.options.length >= 10}
                          >
                            <Plus className="h-3 w-3" /> Add Option
                          </Button>
                        </div>
                        {question.options.map((_, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <Controller
                              name={`questions.${index}.correctAnswer`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="radio"
                                  checked={field.value === optIndex}
                                  onChange={() => field.onChange(optIndex)}
                                  className="h-4 w-4 text-blue-600 flex-shrink-0"
                                />
                              )}
                            />
                            <span className="font-semibold text-sm w-6 flex-shrink-0">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            <Controller
                              name={`questions.${index}.options.${optIndex}`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className={`flex-1 ${!field.value?.trim() && optionsError ? "border-red-500" : ""}`}
                                />
                              )}
                            />
                            {question.options && question.options.length > 2 && (
                              <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => removeOption(index, optIndex)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {optionsError && <p className="text-sm text-red-500">{optionsError}</p>}
                        <p className="text-xs text-muted-foreground ml-9">
                          Select the correct answer by clicking the radio button
                        </p>
                      </div>
                    )}

                    {/* Open-ended expected answer */}
                    {question.type === "open-ended" && (
                      <div className="ml-8">
                        <Label htmlFor={`expected-answer-${field.id}`}
                          className="text-sm font-semibold text-primary/80 mb-2 block">
                          Model Answer / Expected Response (For Grading Reference)
                        </Label>
                        <Controller
                          name={`questions.${index}.expectedAnswer`}
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              id={`expected-answer-${field.id}`}
                              placeholder="Enter the expected answer or key points here for reference (students won't see this)."
                              rows={3}
                              className={`bg-gray-50 dark:bg-gray-900/50 border-primary/30 ${expectedAnswerError ? "border-red-500" : ""}`}
                            />
                          )}
                        />
                        {expectedAnswerError && <p className="text-sm text-red-500 mt-1">{expectedAnswerError}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          This model answer will be used for manual grading or AI comparison.
                        </p>
                      </div>
                    )}

                  </div>
                </Card>
              )
            })}

            {fields.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No questions yet. Add your first question to get started.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button type="button" variant="outline" onClick={() => addQuestion("multiple-choice")} className="gap-2">
                    <Plus className="h-4 w-4" /> Multiple Choice
                  </Button>
                  <Button type="button" variant="outline" onClick={() => addQuestion("open-ended")} className="gap-2">
                    <Plus className="h-4 w-4" /> Open Answer
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={!isValid || !percentageOk}>
              Create Quiz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}