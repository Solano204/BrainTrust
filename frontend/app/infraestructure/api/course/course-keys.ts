// File: src/app/features/courses/api/course-keys.ts
export const courseKeys = {
  all: ["courses"] as const,
  
  // Courses by teacher
  lists: () => [...courseKeys.all, "list"] as const,
  list: (teacherId: string) => [...courseKeys.lists(), teacherId] as const,
  
  // Individual course
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  
  // Course mutations
  mutations: () => [...courseKeys.all, "mutation"] as const,
  create: () => [...courseKeys.mutations(), "create"] as const,
  update: () => [...courseKeys.mutations(), "update"] as const,
  delete: () => [...courseKeys.mutations(), "delete"] as const,
} as const;