
"use client";

import { useEffect, useState } from "react";
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
  Save, XCircle, Plus, Trash2, GripVertical
} from "lucide-react";
import type { Quiz, Question } from "@/app/domain/entities/CourseEntities";
import { useAuth } from "@/app/context/AuthContext";
import { useQuizDetail, useQuizMutations } from "../teacher-student/hooks/quiz-hooks";

interface QuizViewProps {
  quiz: Quiz;
  onClose: () => void;
}

export function QuizView({ quiz: initialQuiz, onClose }: QuizViewProps) {
  const { user } = useAuth();
  const userType = user?.role === 'teacher' ? 'teacher' : 'student';
  
  const { 
    data: quiz, 
    isLoading: isQuizLoading,
    error: quizError,
    refetch 
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
    deleteQuestionsBulk 
  } = useQuizMutations();

  const quizData = quiz || initialQuiz;
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(userType === 'teacher');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: quizData.title,
    description: quizData.description,
    timeLimit: quizData.timeLimit.toString(),
    maxGrade: quizData.maxGrade,
    dueDate: quizData.dueDate || "",
    acceptLateSubmissions: quizData.acceptLateSubmissions,
  });

  const [editQuestions, setEditQuestions] = useState<Question[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);

  useEffect(() => {
    if (quizData) {
      setEditData({
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit.toString(),
        maxGrade: quizData.maxGrade,
        dueDate: quizData.dueDate || "",
        acceptLateSubmissions: quizData.acceptLateSubmissions,
      });
      setEditQuestions(quizData.questions || []);
    }
  }, [quizData]);

  const totalPoints = editQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
  const multipleChoiceCount = editQuestions.filter(q => q.type === 'multiple-choice').length;
  const openEndedCount = editQuestions.filter(q => q.type === 'open-ended').length;

  const handleSaveSettings = async () => {
    try {
      await updateQuiz.mutateAsync({
        quizId: quizData.id,
        quizData: {
          title: editData.title,
          description: editData.description,
          timeLimit: parseInt(editData.timeLimit),
          maxGrade: editData.maxGrade,
          dueDate: editData.dueDate || null,
          acceptLateSubmissions: editData.acceptLateSubmissions,
        }
      });
      setIsEditMode(false);
      refetch();
    } catch (error) {
      console.error("Failed to update quiz:", error);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      if (deletedQuestionIds.length > 0) {
        await deleteQuestionsBulk.mutateAsync({
          quizId: quizData.id,
          questionIds: deletedQuestionIds
        });
      }

      const newQuestions = editQuestions.filter(q => q.id.startsWith("temp_"));
      const existingQuestions = editQuestions.filter(q => !q.id.startsWith("temp_"));

      if (newQuestions.length > 0) {
        const questionsToAdd = newQuestions.map(q => ({
          question: q.question,
          type: q.type,
          points: q.points,
          options: q.type === 'multiple-choice' ? q.options : undefined,
          correctAnswer: q.type === 'multiple-choice' ? q.correctAnswer : undefined,
          expectedAnswer: q.type === 'open-ended' ? q.expectedAnswer : undefined
        })) as Omit<Question, "id" | "text" | "maxPoints">[];

        await addQuestionsBulk.mutateAsync({
          quizId: quizData.id,
          questions: questionsToAdd
        });
      }

      if (existingQuestions.length > 0) {
      const updates = existingQuestions.map(q => ({
        questionId: q.id,
        questionText: q.question,
        type: q.type,
        points: q.points,
        options: q.type === 'multiple-choice' ? q.options : undefined,
        correctAnswer: q.type === 'multiple-choice' ? q.correctAnswer : undefined,
        expectedAnswer: q.type === 'open-ended' ? q.expectedAnswer : undefined,
        action: "UPDATE_ALL" as const // ✅ Explicitly set action
      }));

      await updateQuestionsBulk.mutateAsync({
        quizId: quizData.id,
        updates
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

  const handleBulkUpdatePoints = async (newPoints: number) => {
    try {
      const pointUpdates: Record<string, number> = {};
      editQuestions.forEach(q => {
        if (!q.id.startsWith("temp_")) {
          pointUpdates[q.id] = newPoints;
        }
      });

      await updateQuestionsPointsBulk.mutateAsync({
        quizId: quizData.id,
        questionPoints: pointUpdates
      });

      await refetch();
    } catch (error) {
      console.error("Failed to update points:", error);
    }
  };

  const handleUpdateQuestionText = async (questionId: string, newText: string) => {
    try {
      await updateQuestionsTextBulk.mutateAsync({
        quizId: quizData.id,
        questionTexts: { [questionId]: newText }
      });
      await refetch();
    } catch (error) {
      console.error("Failed to update question text:", error);
    }
  };

  const handleUpdateQuestionAnswer = async (questionId: string, newAnswer: string) => {
    try {
      await updateQuestionsAnswersBulk.mutateAsync({
        quizId: quizData.id,
        questionAnswers: { [questionId]: newAnswer }
      });
      await refetch();
    } catch (error) {
      console.error("Failed to update answer:", error);
    }
  };

  const handleUpdateQuestionOptions = async (
    questionId: string, 
    options: string[], 
    correctAnswer: number
  ) => {
    try {
      await updateQuestionsOptionsBulk.mutateAsync({
        quizId: quizData.id,
        questionOptions: {
          [questionId]: { options, correctAnswer }
        }
      });
      await refetch();
    } catch (error) {
      console.error("Failed to update options:", error);
    }
  };

  const handleChangeQuestionType = async (
    questionId: string, 
    newType: 'multiple-choice' | 'open-ended'
  ) => {
    try {
      await updateQuestionsTypesBulk.mutateAsync({
        quizId: quizData.id,
        questionTypes: { [questionId]: newType }
      });
      await refetch();
    } catch (error) {
      console.error("Failed to change question type:", error);
    }
  };

  const addNewQuestion = (type: "multiple-choice" | "open-ended") => {
    const newQuestion: Question = {
      id: "temp_" + new Date().getTime(),
      type,
      question: "",
      points: 10,
      text: "",
      maxPoints: 10,
      ...(type === "multiple-choice" && {
        options: ["", "", "", ""],
        correctAnswer: 0,
      }),
      ...(type === "open-ended" && {
        expectedAnswer: ""
      })
    };
    setEditQuestions([...editQuestions, newQuestion]);
  };

  const updateEditQuestion = (id: string, updates: Partial<Question>) => {
    setEditQuestions(editQuestions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteEditQuestion = (id: string) => {
    setEditQuestions(editQuestions.filter(q => q.id !== id));
    if (!id.startsWith("temp_")) {
      setDeletedQuestionIds([...deletedQuestionIds, id]);
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
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
  };

  const addOption = (questionId: string) => {
    setEditQuestions(
      editQuestions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, ""] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setEditQuestions(
      editQuestions.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex);
          const newCorrectAnswer = q.correctAnswer === optionIndex 
            ? 0 
            : q.correctAnswer! > optionIndex 
            ? q.correctAnswer! - 1 
            : q.correctAnswer;
          return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
        }
        return q;
      })
    );
  };

  const handleCancelSettings = () => {
    setEditData({
      title: quizData.title,
      description: quizData.description,
      timeLimit: quizData.timeLimit.toString(),
      maxGrade: quizData.maxGrade,
      dueDate: quizData.dueDate || "",
      acceptLateSubmissions: quizData.acceptLateSubmissions,
    });
    setIsEditMode(false);
  };

  const handleCancelQuestions = () => {
    setEditQuestions(quizData.questions || []);
    setDeletedQuestionIds([]);
    setIsEditingQuestions(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dueDate: string | null | undefined) => {
    if (!dueDate) return { text: "No due date", color: "gray" };
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      return { text: "Overdue", color: "destructive" };
    } else if (diffDays === 0) {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) return { text: "Due within the hour", color: "destructive" };
      return { text: `Due in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`, color: "warning" };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", color: "warning" };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: "warning" };
    } else {
      return { text: `Due in ${diffDays} days`, color: "success" };
    }
  };

  const timeRemaining = getTimeRemaining(quizData.dueDate);

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

  if (isQuizLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading quiz details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                  Failed to Load Quiz Details
                </h3>
                <p className="text-red-700 dark:text-red-400">
                  {quizError instanceof Error ? quizError.message : "Unable to load quiz information."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  QUIZ
                </Badge>
                {quizData.active === false && (
                  <Badge variant="secondary" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
                {quizData.availableNow && (
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Available
                  </Badge>
                )}
              </div>
              
              {isEditMode ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-3xl md:text-4xl font-bold mb-3"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {quizData.title}
                </h1>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {quizData.timeLimit > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {quizData.timeLimit} minutes</span>
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
            
            <div className="flex gap-2 self-start md:self-end">
              {userType === 'teacher' && (
                <>
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                        size="sm"
                        className="gap-2"
                      >
                        {updateQuiz.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Settings
                      </Button>
                      <Button
                        onClick={handleCancelSettings}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditMode(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Settings
                    </Button>
                  )}
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Quiz Description</h2>
              </div>
              {isEditMode ? (
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed text-lg">
                    {quizData.description}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Questions</h2>
                  <Badge variant="outline" className="text-lg">
                    {editQuestions.length} Total
                  </Badge>
                </div>
                
                {userType === 'teacher' && (
                  <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                    {isEditingQuestions ? (
                      <>
                        <Button
                          onClick={handleSaveQuestions}
                          disabled={isLoading}
                          size="sm"
                          className="gap-2"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Questions
                        </Button>
                        <Button
                          onClick={handleCancelQuestions}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditingQuestions(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Questions
                      </Button>
                    )}
                    
                    {isEditingQuestions && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addNewQuestion("multiple-choice")}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Multiple Choice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addNewQuestion("open-ended")}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Open Answer
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editQuestions && editQuestions.length > 0 ? (
                <div className="space-y-8">
                  {editQuestions.map((question, index) => (
                    <div key={question.id || index} className="border-l-4 border-primary pl-4">
                      {isEditingQuestions && userType === 'teacher' ? (
                        // EDIT MODE
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
                                      <Badge variant="secondary" className="text-xs">
                                        New
                                      </Badge>
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
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(question.id)}
                                    className="gap-1 h-7 text-xs"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add Option
                                  </Button>
                                </div>
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name={`correct-${question.id}`}
                                      checked={question.correctAnswer === optIndex}
                                      onChange={() => updateEditQuestion(question.id, { correctAnswer: optIndex })}
                                      className="h-4 w-4 text-blue-600 flex-shrink-0"
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
                                        variant="ghost"
                                        size="sm"
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
                                <Textarea
                                  value={question.expectedAnswer || ''}
                                  onChange={(e) => updateEditQuestion(question.id, { expectedAnswer: e.target.value })}
                                  placeholder="Enter the expected answer..."
                                  rows={3}
                                  className="bg-gray-50 dark:bg-gray-900/50"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      ) : (

                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <Badge variant="outline" className="mr-2">
                                  {question.points || 0} points
                                </Badge>
                                <Badge variant="secondary">
                                  {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Open Answer'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-xl font-semibold mb-4 whitespace-pre-wrap">
                            {question.question}
                          </h3>

                          {question.type === 'multiple-choice' && question.options && (
                            <div className="space-y-2 ml-4">
                              {question.options.map((option, optIndex) => {
                                const isCorrectAnswer = question.correctAnswer === optIndex;
                                const shouldHighlight = userType === 'teacher' && showCorrectAnswers && isCorrectAnswer;
                                
                                return (
                                  <div 
                                    key={optIndex} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                      shouldHighlight 
                                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                                        : 'border-border hover:bg-muted/50'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                                      shouldHighlight 
                                        ? 'border-green-500 bg-green-500 text-white' 
                                        : 'border-border'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <span className={`text-lg flex-1 ${
                                      shouldHighlight 
                                        ? 'font-semibold text-green-700 dark:text-green-300' 
                                        : ''
                                    }`}>
                                      {option}
                                    </span>
                                    {shouldHighlight && (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {question.type === 'open-ended' && (
                            <div className="ml-4 space-y-4">
                              <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                                <Badge variant="outline">Student Response Area</Badge>
                                <p className="text-muted-foreground italic mt-2">
                                  Students will write their response here
                                </p>
                              </div>
                              
                              {userType === 'teacher' && question.expectedAnswer && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
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
                  <p className="text-lg">No questions added to this quiz yet.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Quiz Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Due Date
                  </h4>
                  {isEditMode ? (
                    <Input
                      type="datetime-local"
                      value={editData.dueDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <>
                      <p className="font-medium">
                        {formatDate(quizData.dueDate)}
                      </p>
                      {quizData.dueDate && (
                        <Badge 
                          variant={timeRemaining.color as "default"} 
                          className="mt-1 gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {timeRemaining.text}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Time Limit
                  </h4>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editData.timeLimit}
                      onChange={(e) => setEditData(prev => ({ ...prev, timeLimit: e.target.value }))}
                      min="0"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">
                      {quizData.timeLimit > 0 ? `${quizData.timeLimit} minutes` : 'No time limit'}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Award className="inline h-3 w-3 mr-1" />
                    Points & Grading
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Points:</span>
                      <span className="font-bold">{totalPoints}</span>
                    </div>
                    {isEditMode ? (
                      <div className="flex justify-between items-center">
                        <span>Max Grade:</span>
                        <Input
                          type="number"
                          value={editData.maxGrade}
                          onChange={(e) => setEditData(prev => ({ ...prev, maxGrade: parseInt(e.target.value) || 0 }))}
                          min="1"
                          className="w-20"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Max Grade:</span>
                        <span>{quizData.maxGrade || 100}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Multiple Choice:</span>
                      <span>{multipleChoiceCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Ended:</span>
                      <span>{openEndedCount}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Late Submissions
                  </h4>
                  {isEditMode ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={editData.acceptLateSubmissions}
                        onCheckedChange={(checked) => setEditData(prev => ({ ...prev, acceptLateSubmissions: checked }))}
                      />
                      <Label className="text-sm">Allow late submissions</Label>
                    </div>
                  ) : (
                    <Badge variant={quizData.acceptLateSubmissions ? "default" : "secondary"} className="mt-1">
                      {quizData.acceptLateSubmissions ? 'Allowed' : 'Not allowed'}
                    </Badge>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Created Information
                  </h4>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Created: </span>
                      {formatCreatedDate(quizData.createdAt || new Date().toISOString())}
                    </div>
                    {quizData.courseName && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Course: </span>
                        {quizData.courseName}
                      </div>
                    )}
                    {quizData.unitName && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Unit: </span>
                        {quizData.unitName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {userType === 'teacher' && !isEditingQuestions && editQuestions.some(q => q.type === 'multiple-choice') && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Answer Visibility</h3>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Correct Answers</Label>
                  <Switch
                    checked={showCorrectAnswers}
                    onCheckedChange={setShowCorrectAnswers}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Toggle to show/hide correct answers in the questions section
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Last updated: {formatCreatedDate(quizData.createdAt || new Date().toISOString())}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}