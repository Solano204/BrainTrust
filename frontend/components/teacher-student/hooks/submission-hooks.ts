// File: src/app/presentation/hooks/student/submission-hooks.ts
"use client";

import { studentSubmissionKeys } from "@/app/infraestructure/api/course/student/student-key";
import { getStudentQuizSubmission, getStudentTaskSubmission, submitQuiz, submitTask } from "@/components/student/api/student-submission";
// import { getStudentQuizSubmission, getStudentTaskSubmission, submitQuiz, submitTask } from "@/components/student/api/submission-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Hook to get student's existing task submission

// THIS CURRENTLY WORKS
export function useStudentTaskSubmission(assignmentId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: studentSubmissionKeys.taskSubmission(assignmentId || "", studentId || ""),
    queryFn: () => getStudentTaskSubmission(assignmentId!, studentId!),
    enabled: !!assignmentId && !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


// THIS CURRENTLY WORKS


// Hook to get student's existing quiz submission
export function useStudentQuizSubmission(quizId: string | null, studentId: string | null) {

  console.log("QUIZ ID:", quizId);
  return useQuery({
    queryKey: studentSubmissionKeys.quizSubmission(quizId || "", studentId || ""),
    queryFn: () => getStudentQuizSubmission(quizId!, studentId!),
    enabled: !!quizId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for task submission mutations

// CURRENTLY WORKS

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
// CURRENTLY WORKS

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