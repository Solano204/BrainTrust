
import { CourseId, UnitId } from "@/app/domain/valueObjects";

export const unitKeys = {
  all: ["units"] as const,
  
  lists: () => [...unitKeys.all, "list"] as const,
  list: (courseId: CourseId) => [...unitKeys.lists(), courseId] as const,
  
  details: () => [...unitKeys.all, "detail"] as const,
  detail: (id: UnitId) => [...unitKeys.details(), id] as const,
  
  mutations: () => [...unitKeys.all, "mutation"] as const,
  create: () => [...unitKeys.mutations(), "create"] as const,
  update: () => [...unitKeys.mutations(), "update"] as const,
  delete: () => [...unitKeys.mutations(), "delete"] as const,
  reorder: () => [...unitKeys.mutations(), "reorder"] as const,
  
  resources: () => [...unitKeys.all, "resources"] as const,
  resourceList: (unitId: UnitId) => [...unitKeys.resources(), unitId] as const,
} as const;