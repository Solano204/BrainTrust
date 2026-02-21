"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizKeys } from "@/app/infraestructure/api/submission/quiz-keys";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuestionId, QuizId } from "@/app/domain/valueObjects/CourseValues";
import React from "react";


import {
  fetchTeacherQuizSubmissions,
  fetchQuizSubmissionDetail,
  gradeQuizSubmission,
  submitQuiz,
} from "@/components/teacher-student/api/quiz-teacher";

import {
  createQuiz,
  deleteQuiz,
  updateQuiz,
  fetchQuizzesByCourse,
} from "@/components/teacher-student/api/quiz-teacher";


import type { StudentSubmissionQuiz, QuizSubmissionDetail } from "@/app/shared/models/quiz.model";
import type { Quiz, Question } from "@/app/shared/models/quiz.model";


export function useQuizSubmissionsByCourse(courseId: CourseId | null, unitId: string | null) {
  return useQuery<StudentSubmissionQuiz[]>({
    queryKey: ['quiz-submissions', courseId, unitId],
    queryFn: () => fetchTeacherQuizSubmissions(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useQuizSubmissionDetail(submissionId: string | null) {
  return useQuery<QuizSubmissionDetail>({
    queryKey: quizKeys.submissionDetail(submissionId || ''),
    queryFn: () => fetchQuizSubmissionDetail(submissionId!),
    enabled: !!submissionId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}


export function useQuizzesByCourseWithoutDetails(courseId: CourseId | null, unitId: string | null) {
  return useQuery<StudentSubmissionQuiz[]>({
    queryKey: quizKeys.listUnit(courseId || "", unitId || ""),
    queryFn: () => fetchTeacherQuizSubmissions(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useQuizzesByCourse(courseId: CourseId | null) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.list((courseId || "") + "completed"),
    queryFn: () => fetchQuizzesByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
}

export function useSubmissionQuizMutations() {
  const queryClient = useQueryClient();

  const submitQuizMutation = useMutation({
    mutationFn: ({
                   quizId,
                   studentId,
                   answers,
                   timeSpent,
                 }: {
      quizId: QuizId;
      studentId: UserId;
      answers: Record<string, any>;
      timeSpent?: number;
    }) => submitQuiz({
      quizId,
      studentId,
      answers,
      timeSpent,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['quiz-submissions'],
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting quiz:", error.message);
    },
  });

  const gradeSubmissionQuizMutation = useMutation({
    mutationFn: ({
                   submissionId,
                   grades,
                   overallGrade,
                 }: {
      submissionId: string;
      grades: {
        questionId: QuestionId;
        earnedPoints: number;
        maxPoints: number;
        feedback?: string;
      }[];
      overallGrade?: {
        earnedPoints: number;
        totalPoints: number;
      };
    }) => gradeQuizSubmission(submissionId, grades, overallGrade),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.submissionDetail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ['quiz-submissions'],
      });
    },
    onError: (error: Error) => {
      console.error("Error grading submission quiz:", error.message);
    },
  });

  return {
    submitQuiz: submitQuizMutation,
    gradeSubmissionQuiz: gradeSubmissionQuizMutation,
  };
}

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const createQuizMutation = useMutation({
    mutationFn: ({
                   courseId,
                   unitId,
                   quizData,
                 }: {
      courseId: string;
      unitId: string;
      quizData: Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow">;
    }) => createQuiz(courseId, unitId, quizData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(data.courseId),
      });
    },
    onError: (error: Error) => {
      console.error("Error creating quiz:", error.message);
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({
                   quizId,
                   quizData,
                 }: {
      quizId: QuizId;
      quizData: Partial<Quiz>;
    }) => updateQuiz(quizId, quizData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(data.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: quizKeys.detail(variables.quizId),
      });
    },
    onError: (error: Error) => {
      console.error("Error updating quiz:", error.message);
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting quiz:", error.message);
    },
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: ({
                   submissionId,
                   grades,
                   overallGrade,
                 }: {
      submissionId: string;
      grades: {
        questionId: string;
        earnedPoints: number;
        maxPoints: number;
        feedback?: string;
      }[];
      overallGrade?: {
        earnedPoints: number;
        totalPoints: number;
      };
    }) => gradeQuizSubmission(submissionId, grades, overallGrade),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.submissionDetail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: quizKeys.submissions(),
      });
    },
    onError: (error: Error) => {
      console.error("Error grading submission:", error.message);
    },
  });

  return {
    createQuiz: createQuizMutation,
    updateQuiz: updateQuizMutation,
    deleteQuiz: deleteQuizMutation,
    gradeSubmission: gradeSubmissionMutation,
  };
}


export function useQuizForm(initialData?: Quiz) {
  const [formData, setFormData] = React.useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    maxGrade: initialData?.maxGrade || 100,
    timeLimit: initialData?.timeLimit || 60,
    dueDate: initialData?.dueDate || "",
    questions: initialData?.questions || [],
    acceptLateSubmissions: initialData?.acceptLateSubmissions || false,
    maxAttempts: initialData?.maxAttempts || 1,
    shuffleQuestions: initialData?.shuffleQuestions || false,
    showCorrectAnswers: initialData?.showCorrectAnswers || false,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        maxGrade: initialData.maxGrade,
        timeLimit: initialData.timeLimit,
        dueDate: initialData.dueDate || "",
        questions: initialData.questions,
        acceptLateSubmissions: initialData.acceptLateSubmissions,
        maxAttempts: initialData.maxAttempts || 1,
        shuffleQuestions: initialData.shuffleQuestions || false,
        showCorrectAnswers: initialData.showCorrectAnswers || false,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        maxGrade: 100,
        timeLimit: 60,
        dueDate: "",
        questions: [],
        acceptLateSubmissions: false,
        maxAttempts: 1,
        shuffleQuestions: false,
        showCorrectAnswers: false,
      });
    }
  }, [initialData]);

  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const addQuestion = (question: Question) => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  };

  const updateQuestion = (index: number, question: Question) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      maxGrade: 100,
      timeLimit: 60,
      dueDate: "",
      questions: [],
      acceptLateSubmissions: false,
      maxAttempts: 1,
      shuffleQuestions: false,
      showCorrectAnswers: false,
    });
  };

  return {
    formData,
    handleChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    resetForm,
    setFormData,
  };
}