
import { CourseId } from "@/app/domain/valueObjects";

export const studentKeys = {
  all: ["students"] as const,
  
  enrollments: () => [...studentKeys.all, "enrollments"] as const,
  enrollmentsByCourse: (courseId: CourseId) => [...studentKeys.enrollments(), courseId] as const,
  
  enrollment: () => [...studentKeys.all, "enrollment"] as const,
  enrollmentById: (id: string) => [...studentKeys.enrollment(), id] as const,
  
  mutations: () => [...studentKeys.all, "mutation"] as const,
  create: () => [...studentKeys.mutations(), "create"] as const,
  update: () => [...studentKeys.mutations(), "update"] as const,
  delete: () => [...studentKeys.mutations(), "delete"] as const,
  bulkEnroll: () => [...studentKeys.mutations(), "bulk"] as const,
  
  availableUsers: () => [...studentKeys.all, "availableUsers"] as const,
  availableUsersByCourse: (courseId: CourseId) => [...studentKeys.availableUsers(), courseId] as const,
  
  stats: () => [...studentKeys.all, "stats"] as const,
  statsByCourse: (courseId: CourseId) => [...studentKeys.stats(), courseId] as const,

  
} as const;



export const studentKeysEnrollment = {
  all: ['students'] as const,
  
  enrollments: () => [...studentKeys.all, 'enrollments'] as const,
  enrollmentsByCourse: (courseId: string) => 
    [...studentKeys.enrollments(), courseId] as const,
  
  stats: () => [...studentKeys.all, 'stats'] as const,
  statsByCourse: (courseId: string) => 
    [...studentKeys.stats(), courseId] as const,
  
  availableUsers: () => [...studentKeys.all, 'available'] as const,
  availableUsersByCourse: (courseId: string) => 
    [...studentKeys.availableUsers(), courseId] as const,
};