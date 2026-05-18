import { CourseId, UnitId } from "@/app/domain/valueObjects";

export const pageKeys = {
  all: ["pages"] as const,
  lists: () => [...pageKeys.all, "list"] as const,
  list: (courseId: CourseId, unitId: UnitId) => [...pageKeys.lists(), courseId, unitId] as const,
  details: () => [...pageKeys.all, "detail"] as const,
  detail: (id: string) => [...pageKeys.details(), id] as const,
  mutations: () => [...pageKeys.all, "mutation"] as const,
  create: () => [...pageKeys.mutations(), "create"] as const,
  update: () => [...pageKeys.mutations(), "update"] as const,
  delete: () => [...pageKeys.mutations(), "delete"] as const,
} as const;