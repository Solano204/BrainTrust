// File: src/app/presentation/hooks/student/submission-hooks.ts
"use client";

import { studentSubmissionKeys } from "@/app/infraestructure/api/course/student/student-key";
import { getStudentQuizSubmission, getStudentTaskSubmission, submitQuiz, submitTask } from "@/app/infraestructure/api/course/student/submission-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Hook to get student's existing task submission
export function useStudentTaskSubmission(assignmentId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: studentSubmissionKeys.taskSubmission(assignmentId || "", studentId || ""),
    queryFn: () => getStudentTaskSubmission(assignmentId!, studentId!),
    enabled: !!assignmentId && !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get student's existing quiz submission
export function useStudentQuizSubmission(quizId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: studentSubmissionKeys.quizSubmission(quizId || "", studentId || ""),
    queryFn: () => getStudentQuizSubmission(quizId!, studentId!),
    enabled: !!quizId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for task submission mutations
export function useTaskSubmission() {
  const queryClient = useQueryClient();

  const submitTaskMutation = useMutation({
    mutationFn: submitTask,
    onSuccess: (data, variables) => {
      // Invalidate and refetch the specific task submission
      queryClient.invalidateQueries({ 
        queryKey: studentSubmissionKeys.taskSubmission(variables.assignmentId, variables.studentId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting task:", error.message);
    }
  });

  return {
    submitTask: submitTaskMutation,
    isSubmitting: submitTaskMutation.isPending
  };
}

// Hook for quiz submission mutations
export function useQuizSubmission() {
  const queryClient = useQueryClient();

  const submitQuizMutation = useMutation({
    mutationFn: submitQuiz,
    onSuccess: (data, variables) => {
      // Invalidate and refetch the specific quiz submission
      queryClient.invalidateQueries({ 
        queryKey: studentSubmissionKeys.quizSubmission(variables.quizId, variables.studentId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting quiz:", error.message);
    }
  });

  return {
    submitQuiz: submitQuizMutation,
    isSubmitting: submitQuizMutation.isPending
  };
}