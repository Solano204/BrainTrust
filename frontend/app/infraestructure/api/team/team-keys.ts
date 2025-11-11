// File: src/app/features/courses/api/team-keys.ts

import { CourseId } from "@/app/domain/valueObjects";

/**
 * Query key factory for team-related queries
 */
export const teamKeys = {
  all: ["teams"] as const,
  
  // Teams by course
  lists: () => [...teamKeys.all, "list"] as const,
  list: (courseId: CourseId) => [...teamKeys.lists(), courseId] as const,
  
  // Individual team
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (courseId: CourseId, teamName: string) => [...teamKeys.details(), courseId, teamName] as const,
  
  // Team mutations
  mutations: () => [...teamKeys.all, "mutation"] as const,
  create: () => [...teamKeys.mutations(), "create"] as const,
  update: () => [...teamKeys.mutations(), "update"] as const,
  delete: () => [...teamKeys.mutations(), "delete"] as const,
  
  // Member operations
  members: () => [...teamKeys.all, "members"] as const,
  addMembers: () => [...teamKeys.members(), "add"] as const,
  removeMember: () => [...teamKeys.members(), "remove"] as const,
  
  // Available users
  availableUsers: () => [...teamKeys.all, "availableUsers"] as const,
  availableUsersByCourse: (courseId: CourseId) => [...teamKeys.availableUsers(), courseId] as const,
  
  // Auto-generation
  autoGenerate: () => [...teamKeys.all, "autoGenerate"] as const,
} as const;