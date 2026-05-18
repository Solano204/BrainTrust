import { CourseId, UnitId } from "@/app/domain/valueObjects";

export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (courseId: CourseId, unitId: UnitId) => [...quizKeys.lists(), courseId, unitId] as const,
  details: () => [...quizKeys.all, "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  mutations: () => [...quizKeys.all, "mutation"] as const,
  create: () => [...quizKeys.mutations(), "create"] as const,
  update: () => [...quizKeys.mutations(), "update"] as const,
  delete: () => [...quizKeys.mutations(), "delete"] as const,
} as const;