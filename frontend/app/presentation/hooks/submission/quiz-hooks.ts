// File: src/app/features/courses/hooks/quiz-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizKeys } from "@/app/infraestructure/api/submission/quiz-keys";
import {
  fetchQuizzesByCourse,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchQuizSubmissions,
  fetchStudentQuizSubmission,
  gradeQuizSubmission,
  autoGradeQuiz,
  getQuizStats,
  SubmissionQuiz,
  fetchSubmissionQuizzes,
  fetchSubmissionQuizById,
  submitQuizAnswers,
  gradeSubmissionQuiz,
  autoGradeSubmissionQuiz
} from "@/app/infraestructure/api/submission/quiz-api";
import { Quiz, Question,  Submission } from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuestionId, QuizId } from "@/app/domain/valueObjects/CourseValues";
import React from "react";





/**
 * Custom hook for fetching SubmissionQuiz entries
 */
export function useSubmissionQuizzes(quizId: QuizId | null) {
  return useQuery<SubmissionQuiz[]>({
    queryKey: quizKeys.submissionQuizzes(quizId || ""),
    queryFn: () => fetchSubmissionQuizzes(quizId!),
    enabled: !!quizId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single SubmissionQuiz by ID
 */
export function useSubmissionQuiz(submissionId: string | null) {
  return useQuery<SubmissionQuiz>({
    queryKey: quizKeys.submissionQuizDetail(submissionId || ""),
    queryFn: () => fetchSubmissionQuizById(submissionId!),
    enabled: !!submissionId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for SubmissionQuiz mutations
 */
export function useSubmissionQuizMutations() {
  const queryClient = useQueryClient();

  const submitQuizMutation = useMutation({
    mutationFn: ({
      quizId,
      studentId,
      answers,
      timeSpent
    }: {
      quizId: QuizId;
      studentId: UserId;
      answers: Array<{ questionId: QuestionId; answer: string | number }>;
      timeSpent?: number;
    }) => submitQuizAnswers(quizId, studentId, answers, timeSpent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissionQuizzes(data.quizId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting quiz:", error.message);
    }
  });

  const gradeSubmissionQuizMutation = useMutation({
    mutationFn: ({
      submissionId,
      grades
    }: {
      submissionId: string;
      grades: { questionId: QuestionId; score: number; feedback?: string }[];
    }) => gradeSubmissionQuiz(submissionId, grades),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissionQuizzes(data.quizId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissionQuizDetail(data.id) 
      });
    },
    onError: (error: Error) => {
      console.error("Error grading submission quiz:", error.message);
    }
  });

  const autoGradeSubmissionQuizMutation = useMutation({
    mutationFn: autoGradeSubmissionQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissionQuizzes(data.quizId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissionQuizDetail(data.id) 
      });
    },
    onError: (error: Error) => {
      console.error("Error auto-grading submission quiz:", error.message);
    }
  });

  return {
    submitQuiz: submitQuizMutation,
    gradeSubmissionQuiz: gradeSubmissionQuizMutation,
    autoGradeSubmissionQuiz: autoGradeSubmissionQuizMutation
  };
}


/**
 * Custom hook for fetching quizzes by course
 */
export function useQuizzesByCourse(courseId: CourseId | null) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.list(courseId || ""),
    queryFn: () => fetchQuizzesByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single quiz by ID
 */
export function useQuiz(quizId: QuizId | null) {
  return useQuery<Quiz>({
    queryKey: quizKeys.detail(quizId || ""),
    queryFn: () => fetchQuizById(quizId!),
    enabled: !!quizId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching quiz submissions
 */
export function useQuizSubmissions(quizId: QuizId | null) {
  return useQuery<Submission[]>({
    queryKey: quizKeys.quizSubmissions(quizId || ""),
    queryFn: async () => {
      const apiSubmissions = await fetchQuizSubmissions(quizId!);
      // Map API submissions to domain submissions
      return apiSubmissions.map((submission: any) => ({
        ...submission,
        attachments: (submission.attachments || []).map((att: any) => {
          // If already a Document, return as is; otherwise, map string to Document
          if (typeof att === "string") {
            // Map string to a minimal Document object, adjust as needed
            return { id: att, name: att, url: att };
          }
          return att;
        }),
      }));
    },
    enabled: !!quizId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching quiz statistics
 */
export function useQuizStats(quizId: QuizId | null) {
  return useQuery({
    queryKey: quizKeys.statsByQuiz(quizId || ""),
    queryFn: () => getQuizStats(quizId!),
    enabled: !!quizId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for quiz mutations
 */
export function useQuizMutations() {
  const queryClient = useQueryClient();

  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.list(data.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating quiz:", error.message);
    }
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, quizData }: { quizId: QuizId, quizData: Partial<Omit<Quiz, "id">> }) =>
      updateQuiz(quizId, quizData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.list(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating quiz:", error.message);
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.lists() 
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting quiz:", error.message);
    }
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: ({ submissionId, grades }: { 
      submissionId: string; 
      grades: { questionId: QuestionId; score: number }[];
    }) => gradeQuizSubmission(submissionId, grades),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissions() 
      });
    },
    onError: (error: Error) => {
      console.error("Error grading submission:", error.message);
    }
  });

  const autoGradeMutation = useMutation({
    mutationFn: autoGradeQuiz,
    onSuccess: (data, submissionId) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.submissions() 
      });
    },
    onError: (error: Error) => {
      console.error("Error auto-grading quiz:", error.message);
    }
  });

  return {
    createQuiz: createQuizMutation,
    updateQuiz: updateQuizMutation,
    deleteQuiz: deleteQuizMutation,
    gradeSubmission: gradeSubmissionMutation,
    autoGrade: autoGradeMutation
  };
}

/**
 * Custom hook for managing quiz form state
 */
export function useQuizForm(initialData?: Quiz) {
  const [formData, setFormData] = React.useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    maxGrade: initialData?.maxGrade || 100,
    timeLimit: initialData?.timeLimit || 60,
    passingScore: initialData?.passingScore || 70,
    dueDate: initialData?.dueDate || "",
    questions: initialData?.questions || [],
    acceptLateSubmissions: initialData?.acceptLateSubmissions || false,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        maxGrade: initialData.maxGrade,
        timeLimit: initialData.timeLimit,
        passingScore: initialData.passingScore,
        dueDate: initialData.dueDate || "",
        questions: initialData.questions,
        acceptLateSubmissions: initialData.acceptLateSubmissions,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        maxGrade: 100,
        timeLimit: 60,
        passingScore: 70,
        dueDate: "",
        questions: [],
        acceptLateSubmissions: false,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [id]: type === 'number' ? parseInt(value) || 0 : value 
    }));
  };

  const addQuestion = (question: Question) => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));
  };

  const updateQuestion = (index: number, question: Question) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? question : q)
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      maxGrade: 100,
      timeLimit: 60,
      passingScore: 70,
      dueDate: "",
      questions: [],
      acceptLateSubmissions: false,
    });
  };

  return {
    formData,
    handleChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    resetForm,
    setFormData
  };
}