// File: src/app/features/quizzes/hooks/quiz-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQuizzesByMonth, fetchQuizDetail, fetchThisWeekQuizzes } from "@/app/infraestructure/api/calendar/quiz-api";
import { Quiz } from "@/app/domain/entities/CourseEntities";
import { quizKeys } from "@/app/infraestructure/api/calendar/task-keys";

export function useQuizzesByMonth(
  userId: string | null, 
  monthStart: string, 
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.list(userId || "", monthStart, userType),
    queryFn: () => fetchQuizzesByMonth(userId!, monthStart, userType),
    enabled: !!userId && !!monthStart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useThisWeekQuizzes(
  userId: string | null, 
  weekStart: string, 
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.week(userId || "", weekStart, userType),
    queryFn: () => fetchThisWeekQuizzes(userId!, weekStart, userType),
    enabled: !!userId && !!weekStart,
    staleTime: 2 * 60 * 1000, // 2 minutes for week data
  });
}

export function useQuizDetail(
  quizId: string | null, 
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Quiz>({
    queryKey: quizKeys.detailById(quizId || ""),
    queryFn: () => fetchQuizDetail(quizId!, userType),
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const refreshQuizzes = useMutation({
    mutationFn: async (params: { 
      userId: string; 
      monthStart: string; 
      userType: 'teacher' | 'student' 
    }) => {
      return Promise.resolve();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.list(variables.userId, variables.monthStart, variables.userType) 
      });
    },
  });

  return {
    refreshQuizzes,
  };
}