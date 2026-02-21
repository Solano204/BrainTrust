export const courseKeys = {
  all: ["courses"] as const,
  
  lists: () => [...courseKeys.all, "list"] as const,
  list: (teacherId: string) => [...courseKeys.lists(), teacherId] as const,
  
  studentList: (studentId: string) => [...courseKeys.all, "student", studentId] as const,
  
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  
  mutations: () => [...courseKeys.all, "mutation"] as const,
  create: () => [...courseKeys.mutations(), "create"] as const,
  update: () => [...courseKeys.mutations(), "update"] as const,
  delete: () => [...courseKeys.mutations(), "delete"] as const,
} as const;