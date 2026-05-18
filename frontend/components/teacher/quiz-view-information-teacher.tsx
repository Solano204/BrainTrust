//DARK
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Calendar, Clock, FileText, Calculator, Loader2, AlertCircle,
  ArrowLeft, CheckCircle, Award, Eye, EyeOff, Check, X, Edit,
  Save, XCircle, Plus, Trash2, GripVertical, Info,
} from "lucide-react";
import type { Question } from "@/app/domain/entities/CourseEntities";
import { useAuth } from "@/app/context/AuthContext";
import { useQuizDetail, useQuizMutations } from "../teacher-student/hooks/quiz-hooks";
import { Quiz } from "@/app/shared/models/quiz.model";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface EditData {
  title: string;
  description: string;
  timeLimit: string;
  maxGrade: number;
  dueDate: string;
  acceptLateSubmissions: boolean;
  allowSeeResults: boolean;
  totalScore: number;
}

interface QuizViewProps {
  quiz: Quiz;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Redistribution preview helper
// ─────────────────────────────────────────────────────────────────────────────

function computeRedistributedPoints(
  questions: Question[],
  newTotalScore: number
): { id: string; question: string; oldPoints: number; weight: number; newPoints: number }[] {
  const currentTotal = questions.reduce((s, q) => s + (q.points ?? 0), 0);

  return questions.map((q) => {
    const weight = currentTotal > 0 ? (q.points ?? 0) / currentTotal : 1 / questions.length;
    const newPoints = +(newTotalScore * weight).toFixed(2);
    return {
      id: q.id,
      question: q.question || "(empty question)",
      oldPoints: q.points ?? 0,
      weight: +(weight * 100).toFixed(1),
      newPoints,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function QuizView({ quiz: initialQuiz, onClose }: QuizViewProps) {
  const { user } = useAuth();
  const userType = user?.role === "teacher" ? "teacher" : "student";

  const {
    data: quiz,
    isLoading: isQuizLoading,
    error: quizError,
    refetch,
  } = useQuizDetail(initialQuiz.id);

  const {
    updateQuiz,
    addQuestionsBulk,
    updateQuestionsBulk,
    updateQuestionsPointsBulk,
    updateQuestionsTextBulk,
    updateQuestionsAnswersBulk,
    updateQuestionsOptionsBulk,
    updateQuestionsTypesBulk,
    deleteQuestionsBulk,
  } = useQuizMutations();

  console.log("quiz", quiz);
  const quizData: Quiz = quiz ?? initialQuiz;

  const [showCorrectAnswers, setShowCorrectAnswers] = useState(userType === "teacher");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    title: quizData.title,
    description: quizData.description,
    timeLimit: quizData.timeLimit.toString(),
    maxGrade: quizData.maxGrade,
    dueDate: quizData.dueDate ?? "",
    acceptLateSubmissions: quizData.acceptLateSubmissions,
    allowSeeResults: quizData.allowSeeResults,
    totalScore: quizData.totalScore ?? quizData.maxGrade ?? 100,
  });

  const [editQuestions, setEditQuestions] = useState<Question[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [showRedistributionPreview, setShowRedistributionPreview] = useState(false);

  useEffect(() => {
    if (quizData) {
      setEditData({
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit.toString(),
        maxGrade: quizData.maxGrade,
        dueDate: quizData.dueDate ?? "",
        acceptLateSubmissions: quizData.acceptLateSubmissions,
        allowSeeResults: quizData.allowSeeResults,
        totalScore: quizData.totalScore ?? quizData.maxGrade ?? 100,
      });
      setEditQuestions(quizData.questions ?? []);
    }
  }, [quizData]);

  // ── Computed values ──────────────────────────────────────────────────────
  const totalPoints = editQuestions.reduce((sum, q) => sum + (q.points ?? 0), 0);
  const multipleChoiceCount = editQuestions.filter((q) => q.type === "multiple-choice").length;
  const openEndedCount = editQuestions.filter((q) => q.type === "open-ended").length;

  const redistributionPreview = useMemo(() => {
    const existing = editQuestions.filter((q) => !q.id.startsWith("temp_"));
    if (existing.length === 0) return [];
    return computeRedistributedPoints(existing, editData.totalScore);
  }, [editQuestions, editData.totalScore]);

  const totalScoreChanged =
    editData.totalScore !== (quizData.totalScore ?? quizData.maxGrade ?? 100);

  // ── Loading flag ─────────────────────────────────────────────────────────
  const isLoading =
    isQuizLoading ||
    updateQuiz.isPending ||
    addQuestionsBulk.isPending ||
    updateQuestionsBulk.isPending ||
    updateQuestionsPointsBulk.isPending ||
    updateQuestionsTextBulk.isPending ||
    updateQuestionsAnswersBulk.isPending ||
    updateQuestionsOptionsBulk.isPending ||
    updateQuestionsTypesBulk.isPending ||
    deleteQuestionsBulk.isPending;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    try {
      await updateQuiz.mutateAsync({
        quizId: quizData.id,
        quizData: {
          title: editData.title,
          description: editData.description,
          timeLimit: parseInt(editData.timeLimit),
          maxGrade: editData.maxGrade,
          dueDate: editData.dueDate || undefined,
          acceptLateSubmissions: editData.acceptLateSubmissions,
          allowSeeResults: editData.allowSeeResults,
          totalScore: editData.totalScore,
        },
      });
      setIsEditMode(false);
      setShowRedistributionPreview(false);
      refetch();
    } catch (error) {
      console.error("Failed to update quiz:", error);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      await updateQuiz.mutateAsync({
        quizId: quizData.id,
        quizData: {
          title: quizData.title,
          description: quizData.description,
          timeLimit: quizData.timeLimit,
          maxGrade: totalPoints,
          dueDate: quizData.dueDate || undefined,
          acceptLateSubmissions: quizData.acceptLateSubmissions,
          allowSeeResults: quizData.allowSeeResults,
          totalScore: totalPoints,
        },
      });

      if (deletedQuestionIds.length > 0) {
        await deleteQuestionsBulk.mutateAsync({ quizId: quizData.id, questionIds: deletedQuestionIds });
      }

      const newQuestions = editQuestions.filter((q) => q.id.startsWith("temp_"));
      const existingQuestions = editQuestions.filter((q) => !q.id.startsWith("temp_"));

      if (newQuestions.length > 0) {
        await addQuestionsBulk.mutateAsync({
          quizId: quizData.id,
          questions: newQuestions.map((q) => ({
            question: q.question,
            type: q.type,
            points: q.points,
            options: q.type === "multiple-choice" ? q.options : undefined,
            correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : undefined,
            expectedAnswer: q.type === "open-ended" ? q.expectedAnswer : undefined,
          })) as Omit<Question, "id" | "text" | "maxPoints">[],
        });
      }

      if (existingQuestions.length > 0) {
        await updateQuestionsBulk.mutateAsync({
          quizId: quizData.id,
          updates: existingQuestions.map((q) => ({
            questionId: q.id,
            questionText: q.question,
            type: q.type,
            points: q.points,
            options: q.type === "multiple-choice" ? q.options : undefined,
            correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : undefined,
            expectedAnswer: q.type === "open-ended" ? q.expectedAnswer : undefined,
            action: "UPDATE_ALL" as const,
          })),
        });
      }

      setIsEditingQuestions(false);
      setDeletedQuestionIds([]);
      await refetch();
    } catch (error) {
      console.error("Failed to update questions:", error);
      alert("Error saving questions. Please try again.");
    }
  };

  const handleCancelSettings = () => {
    setEditData({
      title: quizData.title,
      description: quizData.description,
      timeLimit: quizData.timeLimit.toString(),
      maxGrade: quizData.maxGrade,
      dueDate: quizData.dueDate ?? "",
      acceptLateSubmissions: quizData.acceptLateSubmissions,
      allowSeeResults: quizData.allowSeeResults,
      totalScore: quizData.totalScore ?? quizData.maxGrade ?? 100,
    });
    setIsEditMode(false);
    setShowRedistributionPreview(false);
  };

  const handleCancelQuestions = () => {
    setEditQuestions(quizData.questions ?? []);
    setDeletedQuestionIds([]);
    setIsEditingQuestions(false);
  };

  const addNewQuestion = (type: "multiple-choice" | "open-ended") => {
    const questionCount = editQuestions.length;
    const defaultPoints = questionCount > 0
      ? Math.round(totalPoints / questionCount)
      : 10;

    const newQ: Question = {
      id: "temp_" + Date.now(),
      type,
      question: "",
      points: defaultPoints,
      text: "",
      maxPoints: defaultPoints,
      ...(type === "multiple-choice" && { options: ["", "", "", ""], correctAnswer: 0 }),
      ...(type === "open-ended" && { expectedAnswer: "" }),
    };
    setEditQuestions([...editQuestions, newQ]);
  };

  const updateEditQuestion = (id: string, updates: Partial<Question>) =>
    setEditQuestions(editQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q)));

  const deleteEditQuestion = (id: string) => {
    setEditQuestions(editQuestions.filter((q) => q.id !== id));
    if (!id.startsWith("temp_")) setDeletedQuestionIds([...deletedQuestionIds, id]);
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) =>
    setEditQuestions(
      editQuestions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );

  const addOption = (questionId: string) =>
    setEditQuestions(
      editQuestions.map((q) =>
        q.id === questionId && q.options ? { ...q, options: [...q.options, ""] } : q
      )
    );

  const removeOption = (questionId: string, optionIndex: number) =>
    setEditQuestions(
      editQuestions.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex);
          const newCorrect =
            q.correctAnswer === optionIndex
              ? 0
              : (q.correctAnswer ?? 0) > optionIndex
              ? (q.correctAnswer ?? 0) - 1
              : q.correctAnswer;
          return { ...q, options: newOptions, correctAnswer: newCorrect };
        }
        return q;
      })
    );

  // ── Date helpers ─────────────────────────────────────────────────────────
  const formatDate = (d: string | null | undefined) => {
    if (!d) return "No date set";
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };
  const formatCreatedDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const getTimeRemaining = (dueDate: string | null | undefined) => {
    if (!dueDate) return { text: "No due date", color: "secondary" as const };
    const diffMs = new Date(dueDate).getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / 86_400_000);
    if (diffMs < 0) return { text: "Overdue", color: "destructive" as const };
    if (diffDays === 0) {
      const hrs = Math.ceil(diffMs / 3_600_000);
      return hrs <= 0
        ? { text: "Due within the hour", color: "destructive" as const }
        : { text: `Due in ${hrs}h`, color: "default" as const };
    }
    if (diffDays === 1) return { text: "Due tomorrow", color: "default" as const };
    return { text: `Due in ${diffDays} days`, color: diffDays <= 7 ? ("default" as const) : ("secondary" as const) };
  };

  const timeRemaining = getTimeRemaining(quizData.dueDate);

  // ─────────────────────────────────────────────────────────────────────────
  // Loading / error states
  // ─────────────────────────────────────────────────────────────────────────
  if (isQuizLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading quiz details…</span>
        </div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* ✅ was: border-red-200 bg-red-50 dark:bg-red-950/20 → destructive tokens */}
          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              {/* ✅ was: text-red-600 → text-destructive */}
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                {/* ✅ was: text-red-800 dark:text-red-300 → text-destructive */}
                <h3 className="text-lg font-semibold text-destructive">
                  Failed to Load Quiz Details
                </h3>
                {/* ✅ was: text-red-700 dark:text-red-400 → text-destructive/80 */}
                <p className="text-destructive/80">
                  {quizError instanceof Error ? quizError.message : "Unable to load quiz information."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    // ✅ was: bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 → bg-background
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onClose} className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* ✅ was: bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 → primary tokens */}
                <Badge className="bg-primary/10 text-primary border-primary/20">QUIZ</Badge>
                {quizData.active === false && (
                  <Badge variant="secondary" className="gap-1">
                    <EyeOff className="h-3 w-3" /> Inactive
                  </Badge>
                )}
                {quizData.availableNow && (
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" /> Available
                  </Badge>
                )}
              </div>

              {isEditMode ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                  className="text-3xl md:text-4xl font-bold mb-3 h-auto py-2"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{quizData.title}</h1>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {quizData.timeLimit > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{quizData.timeLimit} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calculator className="h-4 w-4" />
                  <span>Total Points: {totalPoints}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{editQuestions.length} Questions</span>
                </div>
              </div>
            </div>

            {userType === "teacher" && (
              <div className="flex gap-2 self-start">
                {isEditMode ? (
                  <>
                    <Button onClick={handleSaveSettings} disabled={isLoading} size="sm" className="gap-2">
                      {updateQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Settings
                    </Button>
                    <Button onClick={handleCancelSettings} variant="outline" size="sm" className="gap-2">
                      <XCircle className="h-4 w-4" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" /> Edit Settings
                    </Button>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Quiz Description</h2>
              </div>
              {isEditMode ? (
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full"
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed text-lg">
                  {quizData.description}
                </p>
              )}
            </Card>

            {/* Questions */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Questions</h2>
                  <Badge variant="outline" className="text-lg">{editQuestions.length} Total</Badge>
                </div>

                {userType === "teacher" && (
                  <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                    {isEditingQuestions ? (
                      <>
                        <Button onClick={handleSaveQuestions} disabled={isLoading} size="sm" className="gap-2">
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Questions
                        </Button>
                        <Button onClick={handleCancelQuestions} variant="outline" size="sm" className="gap-2">
                          <XCircle className="h-4 w-4" /> Cancel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addNewQuestion("multiple-choice")} className="gap-2">
                          <Plus className="h-4 w-4" /> Add Multiple Choice
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addNewQuestion("open-ended")} className="gap-2">
                          <Plus className="h-4 w-4" /> Add Open Answer
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditingQuestions(true)} variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" /> Edit Questions
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {editQuestions.length > 0 ? (
                <div className="space-y-8">

                  {isEditingQuestions && (
                    // ✅ was: bg-green-100/text-green-700 (match) or bg-orange-100/text-orange-700 (mismatch)
                    // → primary (match) or accent/gold (mismatch)
                    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
                      totalPoints === editData.totalScore
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent-foreground"
                    }`}>
                      <Calculator className="h-4 w-4" />
                      {totalPoints} pts total
                    </div>
                  )}

                  {editQuestions.map((question, index) => (
                    <div key={question.id} className="border-l-4 border-primary pl-4">
                      {isEditingQuestions && userType === "teacher" ? (
                        /* ── EDIT MODE ── */
                        <Card className="p-4 mb-4">
                          <div className="space-y-4">
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
                                    {question.id.startsWith("temp_") && (
                                      <Badge variant="secondary" className="text-xs">New</Badge>
                                    )}
                                  </div>
                                  <Input
                                    value={question.question}
                                    onChange={(e) => updateEditQuestion(question.id, { question: e.target.value })}
                                    placeholder="Enter your question"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => updateEditQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                                  className="w-20"
                                  min="1"
                                />
                                <span className="text-sm text-muted-foreground">pts</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteEditQuestion(question.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {question.type === "multiple-choice" && question.options && (
                              <div className="space-y-3 ml-8">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm text-muted-foreground">Answer Options</Label>
                                  <Button
                                    variant="outline" size="sm"
                                    onClick={() => addOption(question.id)}
                                    className="gap-1 h-7 text-xs"
                                  >
                                    <Plus className="h-3 w-3" /> Add Option
                                  </Button>
                                </div>
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-3">
                                    {/* ✅ was: text-blue-600 → accent-foreground via CSS accent-color */}
                                    <input
                                      type="radio"
                                      name={`correct-${question.id}`}
                                      checked={question.correctAnswer === optIndex}
                                      onChange={() => updateEditQuestion(question.id, { correctAnswer: optIndex })}
                                      className="h-4 w-4 flex-shrink-0 accent-primary"
                                    />
                                    <span className="font-semibold text-sm w-6 flex-shrink-0">
                                      {String.fromCharCode(65 + optIndex)})
                                    </span>
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="flex-1"
                                    />
                                    {question.options && question.options.length > 2 && (
                                      <Button
                                        variant="ghost" size="sm"
                                        onClick={() => removeOption(question.id, optIndex)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.type === "open-ended" && (
                              <div className="ml-8">
                                <Label className="text-sm font-semibold text-primary/80 mb-2 block">
                                  Model Answer / Expected Response
                                </Label>
                                {/* ✅ was: bg-gray-50 dark:bg-gray-900/50 → bg-muted/40 */}
                                <Textarea
                                  value={question.expectedAnswer ?? ""}
                                  onChange={(e) => updateEditQuestion(question.id, { expectedAnswer: e.target.value })}
                                  placeholder="Enter the expected answer…"
                                  rows={3}
                                  className="bg-muted/40"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      ) : (
                        /* ── VIEW MODE ── */
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <Badge variant="outline" className="mr-2">{question.points ?? 0} points</Badge>
                                <Badge variant="secondary">
                                  {question.type === "multiple-choice" ? "Multiple Choice" : "Open Answer"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-xl font-semibold mb-4 whitespace-pre-wrap">{question.question}</h3>

                          {question.type === "multiple-choice" && question.options && (
                            <div className="space-y-2 ml-4">
                              {question.options.map((option, optIndex) => {
                                const isCorrect = question.correctAnswer === optIndex;
                                const highlight = userType === "teacher" && showCorrectAnswers && isCorrect;
                                return (
                                  <div
                                    key={optIndex}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                      highlight
                                        // ✅ was: border-green-500 bg-green-50 dark:bg-green-950/30 → primary tokens
                                        ? "border-primary/50 bg-primary/8"
                                        : "border-border hover:bg-muted/50"
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                                      highlight
                                        // ✅ was: border-green-500 bg-green-500 text-white → primary tokens
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border"
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <span className={`text-lg flex-1 ${
                                      // ✅ was: text-green-700 dark:text-green-300 → text-primary
                                      highlight ? "font-semibold text-primary" : ""
                                    }`}>
                                      {option}
                                    </span>
                                    {/* ✅ was: text-green-500 → text-primary */}
                                    {highlight && <CheckCircle className="h-5 w-5 text-primary" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {question.type === "open-ended" && (
                            <div className="ml-4 space-y-4">
                              <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                                <Badge variant="outline">Student Response Area</Badge>
                                <p className="text-muted-foreground italic mt-2">Students will write their response here</p>
                              </div>
                              {userType === "teacher" && question.expectedAnswer && (
                                // ✅ was: bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 → primary tokens
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                  <Badge variant="outline" className="mb-2">Expected Answer</Badge>
                                  <p className="text-foreground whitespace-pre-wrap">{question.expectedAnswer}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <Separator className="my-6" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No questions added yet.</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Quiz Details */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Quiz Details</h3>
              <div className="space-y-4">

                {/* Due Date */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Due Date
                  </h4>
                  {isEditMode ? (
                    <Input
                      type="datetime-local"
                      value={editData.dueDate}
                      onChange={(e) => setEditData((p) => ({ ...p, dueDate: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <>
                      <p className="font-medium">{formatDate(quizData.dueDate)}</p>
                      {quizData.dueDate && (
                        <Badge variant={timeRemaining.color} className="mt-1 gap-1">
                          <Clock className="h-3 w-3" /> {timeRemaining.text}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                <Separator />

                {/* Time Limit */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Time Limit
                  </h4>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editData.timeLimit}
                      onChange={(e) => setEditData((p) => ({ ...p, timeLimit: e.target.value }))}
                      min="0"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">
                      {quizData.timeLimit > 0 ? `${quizData.timeLimit} minutes` : "No time limit"}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Points & Grading */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3" /> Points & Grading
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Points (sum):</span>
                      <span className="font-bold">{totalPoints}</span>
                    </div>
                    {isEditMode ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Max Grade:</span>
                        <Input
                          type="number"
                          value={editData.maxGrade}
                          onChange={(e) => setEditData((p) => ({ ...p, maxGrade: parseInt(e.target.value) || 0 }))}
                          min="1"
                          className="w-20"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-sm">Max Grade:</span>
                        <span>{quizData.maxGrade ?? 100}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm">Multiple Choice:</span>
                      <span>{multipleChoiceCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Open Ended:</span>
                      <span>{openEndedCount}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total Score */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3" /> Total Score
                  </h4>
                  {isEditMode ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={editData.totalScore}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, totalScore: parseInt(e.target.value) || 0 }))
                        }
                        min="1"
                        className="mt-1"
                      />
                      {editQuestions.filter((q) => !q.id.startsWith("temp_")).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs h-7 text-muted-foreground"
                          onClick={() => setShowRedistributionPreview((v) => !v)}
                        >
                          <Info className="h-3 w-3" />
                          {showRedistributionPreview ? "Hide" : "Preview"} point redistribution
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="font-medium">{quizData.totalScore ?? quizData.maxGrade ?? 100}</p>
                  )}
                </div>

                {/* ── Redistribution preview table ── */}
                {isEditMode && showRedistributionPreview && redistributionPreview.length > 0 && (
                  <div className="mt-2 rounded-lg border overflow-hidden">
                    <div className="bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Point Redistribution Preview
                    </div>
                    <div className="divide-y">
                      {redistributionPreview.map((row, i) => (
                        <div key={row.id} className="px-3 py-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-5 shrink-0">Q{i + 1}</span>
                          <span className="flex-1 truncate text-xs text-muted-foreground" title={row.question}>
                            {row.question.length > 28 ? row.question.slice(0, 28) + "…" : row.question}
                          </span>
                          <span className="text-muted-foreground text-xs">{row.weight}%</span>
                          <span className="text-muted-foreground text-xs">=</span>
                          <span className="font-semibold tabular-nums">{row.newPoints} pts</span>
                        </div>
                      ))}
                      <div className="px-3 py-2 flex justify-between text-sm font-bold bg-muted/30">
                        <span>TOTAL</span>
                        <span>{redistributionPreview.reduce((s, r) => +(s + r.newPoints).toFixed(2), 0)} pts</span>
                      </div>
                    </div>
                    {/* ✅ was: bg-blue-50 dark:bg-blue-950/20 → bg-primary/5 */}
                    <p className="px-3 py-2 text-xs text-muted-foreground bg-primary/5">
                      Points will be proportionally redistributed when you save.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Late Submissions */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Late Submissions</h4>
                  {isEditMode ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={editData.acceptLateSubmissions}
                        onCheckedChange={(checked) =>
                          setEditData((p) => ({ ...p, acceptLateSubmissions: checked }))
                        }
                      />
                      <Label className="text-sm">Allow late submissions</Label>
                    </div>
                  ) : (
                    <Badge variant={quizData.acceptLateSubmissions ? "default" : "secondary"} className="mt-1">
                      {quizData.acceptLateSubmissions ? "Allowed" : "Not allowed"}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Student Results Visibility */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Student Results Visibility
                  </h4>
                  {isEditMode ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={editData.allowSeeResults}
                        onCheckedChange={(checked) =>
                          setEditData((p) => ({ ...p, allowSeeResults: checked }))
                        }
                      />
                      <Label className="text-sm">Allow students to see results</Label>
                    </div>
                  ) : (
                    <Badge variant={quizData.allowSeeResults ? "default" : "secondary"} className="mt-1">
                      {quizData.allowSeeResults ? "Results visible" : "Results hidden"}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Created info */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created Information</h4>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Created: </span>
                      {formatCreatedDate(quizData.createdAt ?? new Date().toISOString())}
                    </div>
                    {quizData.courseName && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Course: </span>
                        {quizData.courseName}
                      </div>
                    )}
                    {(quizData as any).unitName && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Unit: </span>
                        {(quizData as any).unitName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Answer visibility toggle (teacher, view mode) */}
            {userType === "teacher" && !isEditingQuestions && editQuestions.some((q) => q.type === "multiple-choice") && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Answer Visibility</h3>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Correct Answers</Label>
                  <Switch checked={showCorrectAnswers} onCheckedChange={setShowCorrectAnswers} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Toggle to show/hide correct answers in the questions section
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {formatCreatedDate(quizData.createdAt ?? new Date().toISOString())}
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}