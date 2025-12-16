// File: src/app/features/courses/hooks/quiz-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizKeys } from "@/app/infraestructure/api/course/units/resources/quiz-keys";

import { Question, Quiz } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";
import { fetchQuizzesByUnit, updateQuestionsAnswersBulk, updateQuestionsTextBulk, updateQuestionsTypesBulk } from "../api/quiz";
import { 
  addQuizQuestion, 
  addQuizQuestionsBulk, 
  createQuiz, 
  deleteQuiz, 
  deleteQuizQuestionsBulk, 
  fetchQuizDetail, 
  fetchQuizSubmissionDetail, 
  updateQuestionsOptionsBulk, 
  updateQuestionsPointsBulk, 
  updateQuiz, 
  updateQuizQuestionsBulk 
} from "../api/quiz-teacher";


// CURRENTLY WORKS

export function useQuizzesByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchQuizzesByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}



// CURRENTLY WORKS
export function useQuizDetail(quizId: string | null) {
  return useQuery<Quiz>({
    queryKey: quizKeys.detail(quizId || ""),
    queryFn: () => fetchQuizDetail(quizId!),
    enabled: !!quizId,
    staleTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}



// export function useQuizSubmissionDetail(submissionId: string | null) {
//   return useQuery({
//     queryKey: quizKeys.submissionDetail(submissionId || ''),
//     queryFn: () => fetchQuizSubmissionDetail(submissionId!),
//     enabled: !!submissionId,
//     staleTime: 300000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// }




// CURRENTLY WORKS

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
      quizData: Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow">;
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
      quizData: Partial<Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt">>;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.lists() 
      });
    }
  });

  const addQuestionMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      question 
    }: { 
      quizId: string; 
      question: Omit<Question, "id" | "text" | "maxPoints">;
    }) => addQuizQuestion(quizId, question),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  // BULK OPERATION MUTATIONS
  const addQuestionsBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questions 
    }: { 
      quizId: string; 
      questions: Omit<Question, "id" | "text" | "maxPoints">[];
    }) => addQuizQuestionsBulk(quizId, questions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.lists() 
      });
    }
  });

  const deleteQuestionsBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questionIds 
    }: { 
      quizId: string; 
      questionIds: string[];
    }) => deleteQuizQuestionsBulk(quizId, questionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.lists() 
      });
    }
  });

  // COMPLETE UPDATE (all fields)
  const updateQuestionsBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      updates 
    }: { 
      quizId: string; 
      updates: Array<{
        questionId: string;
        questionText?: string;
        type?: 'multiple-choice' | 'open-ended';
        points?: number;
        options?: string[];
        correctAnswer?: number | string;
        expectedAnswer?: string;
        action?: "UPDATE_TEXT" | "UPDATE_POINTS" | "UPDATE_ANSWER" | "UPDATE_OPTIONS" | "UPDATE_ALL" | "CHANGE_TYPE";
      }>;
    }) => updateQuizQuestionsBulk(quizId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  // POINTS ONLY UPDATE
  const updateQuestionsPointsBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questionPoints 
    }: { 
      quizId: string; 
      questionPoints: Record<string, number>;
    }) => updateQuestionsPointsBulk(quizId, questionPoints),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  // TEXT ONLY UPDATE
  const updateQuestionsTextBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questionTexts 
    }: { 
      quizId: string; 
      questionTexts: Record<string, string>;
    }) => updateQuestionsTextBulk(quizId, questionTexts),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  // ANSWERS ONLY UPDATE
  const updateQuestionsAnswersBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questionAnswers 
    }: { 
      quizId: string; 
      questionAnswers: Record<string, string>;
    }) => updateQuestionsAnswersBulk(quizId, questionAnswers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  // OPTIONS ONLY UPDATE
  const updateQuestionsOptionsBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questionOptions 
    }: { 
      quizId: string; 
      questionOptions: Record<string, {
        options: string[];
        correctAnswer: number;
      }>;
    }) => updateQuestionsOptionsBulk(quizId, questionOptions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  // TYPES ONLY UPDATE
  const updateQuestionsTypesBulkMutation = useMutation({
    mutationFn: ({ 
      quizId, 
      questionTypes 
    }: { 
      quizId: string; 
      questionTypes: Record<string, 'multiple-choice' | 'open-ended'>;
    }) => updateQuestionsTypesBulk(quizId, questionTypes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.detail(variables.quizId) 
      });
    }
  });

  return {
    // Basic operations
    createQuiz: createQuizMutation,
    updateQuiz: updateQuizMutation,
    deleteQuiz: deleteQuizMutation,
    addQuestion: addQuestionMutation,
    
    // Bulk operations
    addQuestionsBulk: addQuestionsBulkMutation,
    deleteQuestionsBulk: deleteQuestionsBulkMutation,
    
    // Update operations - ALL TYPES
    updateQuestionsBulk: updateQuestionsBulkMutation,           // Complete update
    updateQuestionsPointsBulk: updateQuestionsPointsBulkMutation, // Points only
    updateQuestionsTextBulk: updateQuestionsTextBulkMutation,     // Text only
    updateQuestionsAnswersBulk: updateQuestionsAnswersBulkMutation, // Answers only
    updateQuestionsOptionsBulk: updateQuestionsOptionsBulkMutation, // Options only
    updateQuestionsTypesBulk: updateQuestionsTypesBulkMutation     // Types only
  };
}

// ============================================
// SPECIALIZED HOOKS FOR COMMON BULK OPERATIONS
// ============================================

/**
 * Hook for handling multiple question operations at once
 */
export function useQuizQuestionsManager(quizId: string) {
  const { 
    addQuestionsBulk, 
    deleteQuestionsBulk, 
    updateQuestionsBulk,
    updateQuestionsPointsBulk,
    updateQuestionsOptionsBulk
  } = useQuizMutations();
  const { data: quiz, refetch } = useQuizDetail(quizId);

  // Add multiple questions at once
  const handleAddMultipleQuestions = async (
    questions: Omit<Question, "id" | "text" | "maxPoints">[]
  ) => {
    return addQuestionsBulk.mutateAsync({ quizId, questions });
  };

  // Delete multiple questions at once
  const handleDeleteMultipleQuestions = async (questionIds: string[]) => {
    return deleteQuestionsBulk.mutateAsync({ quizId, questionIds });
  };

  // Update all questions at once (complete replacement)
  const handleUpdateAllQuestions = async (questions: Question[]) => {
    const updates = questions.map(q => ({
      questionId: q.id,
      questionText: q.question,
      type: q.type,
      points: q.points,
      options: q.type === 'multiple-choice' ? q.options || [] : undefined,
      correctAnswer: q.type === 'multiple-choice' ? q.correctAnswer || 0 : undefined,
      expectedAnswer: q.type === 'open-ended' ? q.expectedAnswer || '' : undefined
    }));

    return updateQuestionsBulk.mutateAsync({ quizId, updates });
  };

  // Bulk update question points
  const handleBulkUpdatePoints = async (pointUpdates: Record<string, number>) => {
    return updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
  };

  // Bulk update question options (for multiple-choice questions)
  const handleBulkUpdateOptions = async (
    optionUpdates: Record<string, { options: string[]; correctAnswer: number }>
  ) => {
    return updateQuestionsOptionsBulk.mutateAsync({ quizId, questionOptions: optionUpdates });
  };

  // Import questions from another quiz or template
  const handleImportQuestions = async (
    questions: Question[],
    replaceExisting: boolean = false
  ) => {
    const questionsToImport = questions.map(q => ({
      question: q.question,
      type: q.type,
      points: q.points,
      options: q.options,
      correctAnswer: q.correctAnswer,
      expectedAnswer: q.expectedAnswer
    })) as Omit<Question, "id" | "text" | "maxPoints">[];

    if (replaceExisting && quiz?.questions.length) {
      // Delete all existing questions first
      const existingQuestionIds = quiz.questions.map(q => q.id);
      await deleteQuestionsBulk.mutateAsync({ quizId, questionIds: existingQuestionIds });
    }

    return addQuestionsBulk.mutateAsync({ quizId, questions: questionsToImport });
  };

  // Clone selected questions
  const handleCloneQuestions = async (questionIds: string[]) => {
    if (!quiz) throw new Error("Quiz not loaded");

    const questionsToClone = quiz.questions
      .filter(q => questionIds.includes(q.id))
      .map(q => ({
        question: q.question,
        type: q.type,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer,
        expectedAnswer: q.expectedAnswer
      })) as Omit<Question, "id" | "text" | "maxPoints">[];

    return addQuestionsBulk.mutateAsync({ quizId, questions: questionsToClone });
  };

  return {
    // Actions
    addMultipleQuestions: handleAddMultipleQuestions,
    deleteMultipleQuestions: handleDeleteMultipleQuestions,
    updateAllQuestions: handleUpdateAllQuestions,
    bulkUpdatePoints: handleBulkUpdatePoints,
    bulkUpdateOptions: handleBulkUpdateOptions,
    importQuestions: handleImportQuestions,
    cloneQuestions: handleCloneQuestions,
    
    // State
    isLoading: addQuestionsBulk.isPending || 
               deleteQuestionsBulk.isPending || 
               updateQuestionsBulk.isPending,
    isAdding: addQuestionsBulk.isPending,
    isDeleting: deleteQuestionsBulk.isPending,
    isUpdating: updateQuestionsBulk.isPending,
    
    // Data
    quiz,
    refetch
  };
}

/**
 * Hook for batch editing question points
 */
export function useBulkPointsEditor(quizId: string) {
  const { updateQuestionsPointsBulk } = useQuizMutations();
  const { data: quiz } = useQuizDetail(quizId);

  const applyPointsToAll = async (points: number) => {
    if (!quiz) throw new Error("Quiz not loaded");

    const pointUpdates: Record<string, number> = {};
    quiz.questions.forEach(q => {
      pointUpdates[q.id] = points;
    });

    return updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
  };

  const applyPointsByType = async (
    type: 'multiple-choice' | 'open-ended',
    points: number
  ) => {
    if (!quiz) throw new Error("Quiz not loaded");

    const pointUpdates: Record<string, number> = {};
    quiz.questions
      .filter(q => q.type === type)
      .forEach(q => {
        pointUpdates[q.id] = points;
      });

    return updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
  };

  const applyPointsToSelected = async (
    questionIds: string[],
    points: number
  ) => {
    const pointUpdates: Record<string, number> = {};
    questionIds.forEach(id => {
      pointUpdates[id] = points;
    });

    return updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
  };

  return {
    applyPointsToAll,
    applyPointsByType,
    applyPointsToSelected,
    isUpdating: updateQuestionsPointsBulk.isPending
  };
}