"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Printer, GripVertical, Paperclip, Upload, LinkIcon, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Question, Quiz } from "@/app/domain/entities/CourseEntities"

interface QuizCreatorProps {
  open: boolean
  onClose: () => void
  onSave: (quiz: any) => void
  unitId: string
  courseId: string
  editMode?: boolean
  initialData?: Quiz
}

export function QuizCreator({ open, onClose, onSave, unitId, courseId, editMode = false, initialData }: QuizCreatorProps) {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: "",
    maxGrade: 100,
    dueDate: "",
    acceptLateSubmissions: true,
  })

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string }[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState("")

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "" + new Date().getTime(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
      text: "",
      maxPoints: 0
    },
  ])

  // Load initial data when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setQuizData({
        title: initialData.title,
        description: initialData.description,
        timeLimit: initialData.timeLimit.toString(),
        maxGrade: initialData.maxGrade,
        dueDate: initialData.dueDate || "",
        acceptLateSubmissions: initialData.acceptLateSubmissions,
      })
      
      // Load questions if they exist
      if (initialData.questions && initialData.questions.length > 0) {
        setQuestions(initialData.questions.map(q => ({
          ...q,
          // Ensure consistent data structure
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          points: q.points || 10,
          // Initialize expectedAnswer if available (important for open-ended editing)
          expectedAnswer: q.expectedAnswer || "" 
        })))
      }
      
    }
  }, [editMode, initialData])

  const addQuestion = (type: "multiple-choice" | "open-ended") => {
    const newQuestion: Question = {
      id: "" + new Date().getTime(),
      type,
      question: "",
      points: 10,
      text: "",
      maxPoints: 10,
      ...(type === "multiple-choice" && {
        options: ["", "", "", ""],
        correctAnswer: 0,
      }),
      // Default empty string for open-ended expected answer
      ...(type === "open-ended" && {
        expectedAnswer: ""
      })
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleSave = () => {
    const quiz = {
      title: quizData.title,
      description: quizData.description,
      timeLimit: Number.parseInt(quizData.timeLimit) || 0,
      maxGrade: quizData.maxGrade,
      dueDate: quizData.dueDate || null,
      acceptLateSubmissions: quizData.acceptLateSubmissions,
      questions: questions.map(q => ({
          ...q,
          // Clean up unnecessary fields for specific types before saving if needed, 
          // but mainly ensuring the structure is consistent:
          options: q.type === 'multiple-choice' ? q.options : undefined,
          correctAnswer: q.type === 'multiple-choice' ? q.correctAnswer : undefined,
          expectedAnswer: q.type === 'open-ended' ? q.expectedAnswer : undefined
      })),
      supportMaterials: {
        files: uploadedFiles,
        urls: urls
      },
      ...(editMode && initialData && { id: initialData.id })
    }
    onSave(quiz) // Execute the save function passed from parent
    handleClose()
  }

  const handleClose = () => {
    if (!editMode) {
      setQuizData({
        title: "",
        description: "",
        timeLimit: "",
        maxGrade: 100,
        dueDate: "",
        acceptLateSubmissions: true,
      })
      setQuestions([{
        id: "" + new Date().getTime(),
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 10,
        text: "",
        maxPoints: 0
      }])
      setUploadedFiles([])
      setUrls([])
    }
    setNewUrl("")
    onClose()
  }

  // --- File/URL Handlers (Omitted for brevity, kept for completeness) ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        type: "file",
      }))
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const addUrl = () => {
    if (newUrl.trim()) {
      setUrls([...urls, newUrl.trim()])
      setNewUrl("")
    }
  }

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index))
  }
  // --- End File/URL Handlers ---

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${quizData.title || "Quiz"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
            .quiz-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .question { margin: 30px 0; page-break-inside: avoid; }
            .question-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .question-number { font-weight: bold; color: #1e40af; }
            .question-points { color: #6b7280; font-size: 14px; }
            .question-text { font-size: 16px; margin-bottom: 15px; line-height: 1.6; }
            .options { margin-left: 20px; }
            .option { margin: 10px 0; display: flex; align-items: center; }
            .option-letter { display: inline-block; width: 30px; font-weight: bold; }
            .answer-space { border-bottom: 1px solid #d1d5db; min-height: 80px; margin-top: 10px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>${quizData.title || "Quiz"}</h1>
          <div class="quiz-info">
            <p><strong>Description:</strong> ${quizData.description || "N/A"}</p>
            <p><strong>Time Limit:</strong> ${quizData.timeLimit || "No limit"}</p>
            <p><strong>Total Points:</strong> ${questions.reduce((sum, q) => sum + q.points, 0)}</p>
          </div>
          ${questions
            .map(
              (q, index) => `
            <div class="question">
              <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <span class="question-points">${q.points} points</span>
              </div>
              <div class="question-text">${q.question || "Question text"}</div>
              ${
                q.type === "multiple-choice" && q.options
                  ? `
                <div class="options">
                  ${q.options
                    .map(
                      (opt, i) => `
                    <div class="option">
                      <span class="option-letter">${String.fromCharCode(65 + i)})</span>
                      <span>${opt || `Option ${i + 1}`}</span>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : `<div class="answer-space"></div>`
              }
            </div>
          `,
            )
            .join("")}
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-[95vw] md:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{editMode ? "Edit Quiz" : "Create Quiz / Exam"}</span>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-transparent w-full sm:w-auto">
              <Printer className="h-4 w-4" />
              Print Exam
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quiz Settings */}
          <Card className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-950/20">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Quiz Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input
                  id="quiz-title"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: e.target.value }))}
                  placeholder="e.g., 60"
                  type="number"
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="quiz-description">Description</Label>
                <Textarea
                  id="quiz-description"
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quiz description"
                  rows={2}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="max-grade-quiz">Maximum Grade</Label>
                <Input
                  id="max-grade-quiz"
                  type="number"
                  value={quizData.maxGrade}
                  onChange={(e) => setQuizData(prev => ({ ...prev, maxGrade: Number.parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={quizData.dueDate}
                  onChange={(e) => setQuizData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold">
                Questions ({questions.length}) - Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("multiple-choice")}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Multiple Choice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("open-ended")}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Open Answer
                </Button>
              </div>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id} className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0 mt-1" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={question.type === "multiple-choice" ? "default" : "secondary"}>
                            Question {index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.type === "multiple-choice" ? "Multiple Choice" : "Open Answer"}
                          </Badge>
                        </div>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                          placeholder="Enter your question"
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, { points: Number.parseInt(e.target.value) || 0 })}
                        className="w-16 sm:w-20"
                        min="1"
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">pts</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {question.type === "multiple-choice" && question.options && (
                    <div className="space-y-3 ml-0 sm:ml-8">
                      <Label className="text-xs sm:text-sm text-muted-foreground">Answer Options</Label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => updateQuestion(question.id, { correctAnswer: optIndex })}
                            className="h-4 w-4 text-blue-600 flex-shrink-0"
                          />
                          <span className="font-semibold text-xs sm:text-sm w-5 sm:w-6 flex-shrink-0">
                            {String.fromCharCode(65 + optIndex)})
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 text-sm"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground ml-0 sm:ml-9">
                        Select the correct answer by clicking the radio button
                      </p>
                    </div>
                  )}

                  {/* 🔥 Open-Ended Answer Space (UPDATED) */}
                  {question.type === "open-ended" && (
                    <div className="ml-0 sm:ml-8">
                      <Label htmlFor={`expected-answer-${question.id}`} className="text-xs sm:text-sm font-semibold text-primary/80 mb-2 block">
                        Model Answer / Expected Response (For Grading Reference)
                      </Label>
                      <Textarea
                        id={`expected-answer-${question.id}`}
                        value={question.expectedAnswer || ''}
                        onChange={(e) => updateQuestion(question.id, { expectedAnswer: e.target.value })}
                        placeholder="Enter the expected answer or key points here for reference (students won't see this)."
                        rows={3}
                        className="bg-gray-50 dark:bg-gray-900/50 border-primary/30"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This model answer will be used for manual grading or AI comparison.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {questions.length === 0 && (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  No questions yet. Add your first question to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={() => addQuestion("multiple-choice")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Multiple Choice
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("open-ended")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Open Answer
                  </Button>
                </div>
              </Card>
            )}
          </div>

        
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {editMode ? "Save Changes" : "Create Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}