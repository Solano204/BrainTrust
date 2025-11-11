// File: src/app/features/courses/hooks/quiz-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizKeys } from "@/app/infraestructure/api/course/units/resources/quiz-keys";
import {
  fetchQuizzesByUnit,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from "@/app/infraestructure/api/course/units/resources/quiz-api";
import { Quiz } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";

export function useQuizzesByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchQuizzesByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
      // Remove any refetchOnMount, refetchOnWindowFocus if present
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const createQuizMutation = useMutation({
    mutationFn: ({ 
      courseId, 
      unitId, 
      quizData 
    }: { 
      courseId: CourseId; 
      unitId: UnitId; 
      quizData: Omit<Quiz, "id" | "courseId" | "unitId" | "createdAt">;
    }) => createQuiz(courseId, unitId, quizData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.list(variables.courseId, variables.unitId) 
      });
    }
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      quizData 
    }: { 
      quizId: string; 
      quizData: Partial<Omit<Quiz, "id" | "courseId" | "unitId" | "createdAt">>;
    }) => updateQuiz(quizId, quizData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.lists() 
      });
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.lists() 
      });
    }
  });

  return {
    createQuiz: createQuizMutation,
    updateQuiz: updateQuizMutation,
    deleteQuiz: deleteQuizMutation
  };
}