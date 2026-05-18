"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizKeys } from "@/app/infraestructure/api/course/units/resources/quiz-keys";

import { Question } from "@/app/domain/entities/CourseEntities";
import { Quiz as QuizEntity } from "@/app/domain/entities/CourseEntities";

import { Quiz } from "@/app/shared/models/quiz.model";
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

export function useQuizzesByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<QuizEntity []>({
    queryKey: quizKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchQuizzesByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
function redistributePoints(questions: Question[], newTotalScore: number): Record<string, number> {
  const currentTotal = questions.reduce((s, q) => s + (q.points ?? 0), 0);
  const pointUpdates: Record<string, number> = {};

  if (currentTotal === 0) {
    // Distribute evenly when there are no existing points
    const even = +(newTotalScore / questions.length).toFixed(2);
    questions.forEach((q) => { pointUpdates[q.id] = even; });
    return pointUpdates;
  }

  questions.forEach((q) => {
    const weight = (q.points ?? 0) / currentTotal;
    pointUpdates[q.id] = +( newTotalScore * weight).toFixed(2);
  });

  return pointUpdates;
}

export function useQuizDetail(quizId: string | null) {
  return useQuery<Quiz>({
    queryKey: quizKeys.detail(quizId || ""),
    queryFn: () => fetchQuizDetail(quizId!),
    enabled: !!quizId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}


export function useQuizMutations() {
  const queryClient = useQueryClient();

  const createQuizMutation = useMutation({
    mutationFn: async ({
      courseId,
      unitId,
      quizData
    }: {
      courseId: CourseId;
      unitId: UnitId;
      quizData: Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow">;
    }) => {
      console.log("🚀 [Hook] Starting quiz creation...");
      const result = await createQuiz(courseId, unitId, quizData);
      console.log("✅ [Hook] Quiz created:", result);
      return result;
    },
    onSuccess: async (createdQuiz, variables) => {
      console.log("🎉 [Hook] onSuccess triggered with quiz:", createdQuiz);

      try {
        // 1. Invalidar el cache de la lista
        console.log("🔄 [Hook] Invalidating list queries...");
        await queryClient.invalidateQueries({
          queryKey: quizKeys.list(variables.courseId, variables.unitId),
          refetchType: 'active'
        });

        // 2. Invalidar todas las listas
        await queryClient.invalidateQueries({
          queryKey: quizKeys.lists(),
          refetchType: 'active'
        });

        // 3. Si tenemos el quiz con ID, añadirlo al cache y refrescar
        if (createdQuiz?.id) {
          console.log("📝 [Hook] Setting quiz in cache:", createdQuiz.id);

          // Setear el quiz en el cache directamente
          queryClient.setQueryData(
            quizKeys.detail(createdQuiz.id),
            createdQuiz
          );

          // Invalidar el detail también
          await queryClient.invalidateQueries({
            queryKey: quizKeys.detail(createdQuiz.id),
            refetchType: 'active'
          });
        }

        // 4. Forzar refetch INMEDIATO de la lista
        console.log("🔄 [Hook] Force refetching list...");
        await queryClient.refetchQueries({
          queryKey: quizKeys.list(variables.courseId, variables.unitId),
          type: 'active'
        });

        // 5. Pequeña espera y otro refetch para asegurar
        await new Promise(resolve => setTimeout(resolve, 500));

        await queryClient.refetchQueries({
          queryKey: quizKeys.list(variables.courseId, variables.unitId),
          type: 'active'
        });

        console.log("✅ [Hook] All cache operations completed");
      } catch (error) {
        console.error("❌ [Hook] Error in onSuccess:", error);
      }
    },
    onError: (error) => {
      console.error("❌ [Hook] Error creating quiz:", error);
    },
    onSettled: async (data, error, variables) => {
      console.log("🏁 [Hook] Mutation settled");

      // Un último refetch por si acaso
      await queryClient.refetchQueries({
        queryKey: quizKeys.list(variables.courseId, variables.unitId),
        type: 'active'
      });
    }
  });
 // ── UPDATE ────────────────────────────────────────────────────────────────
  /**
   * After updating quiz settings, if `totalScore` changed we automatically
   * redistribute question points proportionally.
   */
  const updateQuizMutation = useMutation({
    mutationFn: async ({
      quizId,
      quizData,
    }: {
      quizId: string;
      quizData: Partial<Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt">>;
    }) => {
      console.log("🔄 [Hook] Updating quiz:", quizId);
      const result = await updateQuiz(quizId, quizData);
      console.log("✅ [Hook] Quiz updated:", result);
      return result;
    },
    onSuccess: async (updatedQuiz, variables) => {
      console.log("🎉 [Hook] Update success");

      // Cache the freshly updated quiz
      if (updatedQuiz?.id) {
        queryClient.setQueryData(quizKeys.detail(updatedQuiz.id), updatedQuiz);
      }

      // ── Redistribute points when totalScore changed ───────────────────────
      const newTotalScore = variables.quizData.totalScore;
      if (newTotalScore !== undefined && updatedQuiz?.questions?.length > 0) {
        // Only redistribute existing (non-temp) questions
        const existingQuestions = updatedQuiz.questions.filter((q) => !q.id.startsWith("temp_"));

        if (existingQuestions.length > 0) {
          const pointUpdates = redistributePoints(existingQuestions, newTotalScore);
          console.log("📊 [Hook] Redistributing points:", pointUpdates);

          try {
            await updateQuestionsPointsBulk(variables.quizId, pointUpdates);
            console.log("✅ [Hook] Points redistributed successfully");
          } catch (err) {
            console.error("❌ [Hook] Failed to redistribute points:", err);
          }
        }
      }

      // Invalidate & refetch
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: quizKeys.lists(), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
    onError: (error) => { console.error("❌ [Hook] Error updating quiz:", error); },
  });

  // ── DELETE ────────────────────────────────────────────────────────────────
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      await deleteQuiz(quizId);
      return quizId;
    },
    onSuccess: async (quizId) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.lists(), refetchType: "active" });
      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });
      await queryClient.refetchQueries({ queryKey: quizKeys.lists(), type: "active" });
    },
    onError: (error) => { console.error("❌ [Hook] Error deleting quiz:", error); },
  });

  // ── QUESTIONS ─────────────────────────────────────────────────────────────
  const addQuestionMutation = useMutation({
    mutationFn: ({ quizId, question }: { quizId: string; question: Omit<Question, "id" | "text" | "maxPoints"> }) =>
      addQuizQuestion(quizId, question),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const addQuestionsBulkMutation = useMutation({
    mutationFn: ({ quizId, questions }: { quizId: string; questions: Omit<Question, "id" | "text" | "maxPoints">[] }) =>
      addQuizQuestionsBulk(quizId, questions),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: quizKeys.lists(), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const deleteQuestionsBulkMutation = useMutation({
    mutationFn: ({ quizId, questionIds }: { quizId: string; questionIds: string[] }) =>
      deleteQuizQuestionsBulk(quizId, questionIds),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: quizKeys.lists(), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const updateQuestionsBulkMutation = useMutation({
    mutationFn: ({
      quizId,
      updates,
    }: {
      quizId: string;
      updates: Array<{
        questionId: string;
        questionText?: string;
        type?: "multiple-choice" | "open-ended";
        points?: number;
        options?: string[];
        correctAnswer?: number | string;
        expectedAnswer?: string;
        action?: "UPDATE_TEXT" | "UPDATE_POINTS" | "UPDATE_ANSWER" | "UPDATE_OPTIONS" | "UPDATE_ALL" | "CHANGE_TYPE";
      }>;
    }) => updateQuizQuestionsBulk(quizId, updates),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const updateQuestionsPointsBulkMutation = useMutation({
    mutationFn: ({ quizId, questionPoints }: { quizId: string; questionPoints: Record<string, number> }) =>
      updateQuestionsPointsBulk(quizId, questionPoints),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const updateQuestionsTextBulkMutation = useMutation({
    mutationFn: ({ quizId, questionTexts }: { quizId: string; questionTexts: Record<string, string> }) =>
      updateQuestionsTextBulk(quizId, questionTexts),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const updateQuestionsAnswersBulkMutation = useMutation({
    mutationFn: ({ quizId, questionAnswers }: { quizId: string; questionAnswers: Record<string, string> }) =>
      updateQuestionsAnswersBulk(quizId, questionAnswers),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const updateQuestionsOptionsBulkMutation = useMutation({
    mutationFn: ({
      quizId,
      questionOptions,
    }: {
      quizId: string;
      questionOptions: Record<string, { options: string[]; correctAnswer: number }>;
    }) => updateQuestionsOptionsBulk(quizId, questionOptions),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  const updateQuestionsTypesBulkMutation = useMutation({
    mutationFn: ({
      quizId,
      questionTypes,
    }: {
      quizId: string;
      questionTypes: Record<string, "multiple-choice" | "open-ended">;
    }) => updateQuestionsTypesBulk(quizId, questionTypes),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId), refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: quizKeys.detail(variables.quizId), type: "active" });
    },
  });

  return {
    createQuiz: createQuizMutation,
    updateQuiz: updateQuizMutation,
    deleteQuiz: deleteQuizMutation,
    addQuestion: addQuestionMutation,

    addQuestionsBulk: addQuestionsBulkMutation,
    deleteQuestionsBulk: deleteQuestionsBulkMutation,

    updateQuestionsBulk: updateQuestionsBulkMutation,
    updateQuestionsPointsBulk: updateQuestionsPointsBulkMutation,
    updateQuestionsTextBulk: updateQuestionsTextBulkMutation,
    updateQuestionsAnswersBulk: updateQuestionsAnswersBulkMutation,
    updateQuestionsOptionsBulk: updateQuestionsOptionsBulkMutation,
    updateQuestionsTypesBulk: updateQuestionsTypesBulkMutation,
  };
}


export function useQuizQuestionsManager(quizId: string) {
  const {
    addQuestionsBulk,
    deleteQuestionsBulk,
    updateQuestionsBulk,
    updateQuestionsPointsBulk,
    updateQuestionsOptionsBulk,
  } = useQuizMutations();
  const { data: quiz, refetch } = useQuizDetail(quizId);

  const handleAddMultipleQuestions = async (questions: Omit<Question, "id" | "text" | "maxPoints">[]) => {
    const result = await addQuestionsBulk.mutateAsync({ quizId, questions });
    await refetch();
    return result;
  };

  const handleDeleteMultipleQuestions = async (questionIds: string[]) => {
    const result = await deleteQuestionsBulk.mutateAsync({ quizId, questionIds });
    await refetch();
    return result;
  };

  const handleUpdateAllQuestions = async (questions: Question[]) => {
    const updates = questions.map((q) => ({
      questionId: q.id,
      questionText: q.question,
      type: q.type,
      points: q.points,
      options: q.type === "multiple-choice" ? q.options || [] : undefined,
      correctAnswer: q.type === "multiple-choice" ? q.correctAnswer || 0 : undefined,
      expectedAnswer: q.type === "open-ended" ? q.expectedAnswer || "" : undefined,
    }));
    const result = await updateQuestionsBulk.mutateAsync({ quizId, updates });
    await refetch();
    return result;
  };

  const handleBulkUpdatePoints = async (pointUpdates: Record<string, number>) => {
    const result = await updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
    await refetch();
    return result;
  };

  const handleBulkUpdateOptions = async (
    optionUpdates: Record<string, { options: string[]; correctAnswer: number }>
  ) => {
    const result = await updateQuestionsOptionsBulk.mutateAsync({ quizId, questionOptions: optionUpdates });
    await refetch();
    return result;
  };

  const handleImportQuestions = async (questions: Question[], replaceExisting = false) => {
    const questionsToImport = questions.map((q) => ({
      question: q.question,
      type: q.type,
      points: q.points,
      options: q.options,
      correctAnswer: q.correctAnswer,
      expectedAnswer: q.expectedAnswer,
    })) as Omit<Question, "id" | "text" | "maxPoints">[];

    if (replaceExisting && quiz?.questions.length) {
      await deleteQuestionsBulk.mutateAsync({ quizId, questionIds: quiz.questions.map((q) => q.id) });
    }

    const result = await addQuestionsBulk.mutateAsync({ quizId, questions: questionsToImport });
    await refetch();
    return result;
  };

  const handleCloneQuestions = async (questionIds: string[]) => {
    if (!quiz) throw new Error("Quiz not loaded");
    const questionsToClone = quiz.questions
      .filter((q) => questionIds.includes(q.id))
      .map((q) => ({
        question: q.question,
        type: q.type,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer,
        expectedAnswer: q.expectedAnswer,
      })) as Omit<Question, "id" | "text" | "maxPoints">[];
    const result = await addQuestionsBulk.mutateAsync({ quizId, questions: questionsToClone });
    await refetch();
    return result;
  };

  return {
    addMultipleQuestions: handleAddMultipleQuestions,
    deleteMultipleQuestions: handleDeleteMultipleQuestions,
    updateAllQuestions: handleUpdateAllQuestions,
    bulkUpdatePoints: handleBulkUpdatePoints,
    bulkUpdateOptions: handleBulkUpdateOptions,
    importQuestions: handleImportQuestions,
    cloneQuestions: handleCloneQuestions,
    isLoading: addQuestionsBulk.isPending || deleteQuestionsBulk.isPending || updateQuestionsBulk.isPending,
    isAdding: addQuestionsBulk.isPending,
    isDeleting: deleteQuestionsBulk.isPending,
    isUpdating: updateQuestionsBulk.isPending,
    quiz,
    refetch,
  };
}


export function useBulkPointsEditor(quizId: string) {
  const { updateQuestionsPointsBulk } = useQuizMutations();
  const { data: quiz, refetch } = useQuizDetail(quizId);

  const applyPointsToAll = async (points: number) => {
    if (!quiz) throw new Error("Quiz not loaded");
    const pointUpdates: Record<string, number> = {};
    quiz.questions.forEach((q) => { pointUpdates[q.id] = points; });
    const result = await updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
    await refetch();
    return result;
  };

  const applyPointsByType = async (type: "multiple-choice" | "open-ended", points: number) => {
    if (!quiz) throw new Error("Quiz not loaded");
    const pointUpdates: Record<string, number> = {};
    quiz.questions.filter((q) => q.type === type).forEach((q) => { pointUpdates[q.id] = points; });
    const result = await updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
    await refetch();
    return result;
  };

  const applyPointsToSelected = async (questionIds: string[], points: number) => {
    const pointUpdates: Record<string, number> = {};
    questionIds.forEach((id) => { pointUpdates[id] = points; });
    const result = await updateQuestionsPointsBulk.mutateAsync({ quizId, questionPoints: pointUpdates });
    await refetch();
    return result;
  };

  return {
    applyPointsToAll,
    applyPointsByType,
    applyPointsToSelected,
    isUpdating: updateQuestionsPointsBulk.isPending,
 };
}
