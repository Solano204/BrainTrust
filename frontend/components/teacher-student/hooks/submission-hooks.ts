
"use client";

import { studentSubmissionKeys } from "@/app/infraestructure/api/course/student/student-key";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


import {
  getStudentTaskSubmission,
  submitTask,
} from "@/components/student/api/student-submission";

import {
  getStudentQuizSubmission,
  submitQuiz,
} from "@/components/teacher-student/api/quiz-teacher";

export function useStudentTaskSubmission(
    assignmentId: string | null,
    studentId: string | null
) {
  return useQuery({
    queryKey: studentSubmissionKeys.taskSubmission(
        assignmentId || "",
        studentId || ""
    ),
    queryFn: () => getStudentTaskSubmission(assignmentId!, studentId!),
    enabled: !!assignmentId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaskSubmission() {
  const queryClient = useQueryClient();

  const submitTaskMutation = useMutation({
    mutationFn: submitTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentSubmissionKeys.taskSubmission(
            variables.assignmentId,
            variables.studentId
        ),
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting task:", error.message);
    },
  });

  return {
    submitTask: submitTaskMutation,
    isSubmitting: submitTaskMutation.isPending,
  };
}

export function useStudentQuizSubmission(
    quizId: string | null,
    studentId: string | null
) {
  return useQuery({
    queryKey: studentSubmissionKeys.quizSubmission(quizId || "", studentId || ""),
    queryFn: () => getStudentQuizSubmission(quizId!, studentId!),
    enabled: !!quizId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useQuizSubmission() {
  const queryClient = useQueryClient();

  const submitQuizMutation = useMutation({
    mutationFn: submitQuiz,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentSubmissionKeys.quizSubmission(
            variables.quizId,
            variables.studentId
        ),
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting quiz:", error.message);
    },
  });

  return {
    submitQuiz: submitQuizMutation,
    isSubmitting: submitQuizMutation.isPending,
  };
}