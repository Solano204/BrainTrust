
import { CourseId } from "@/app/domain/valueObjects";

export const teamKeys = {
  all: ["teams"] as const,
  
  lists: () => [...teamKeys.all, "list"] as const,
  list: (courseId: CourseId) => [...teamKeys.lists(), courseId] as const,
  
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
  
  mutations: () => [...teamKeys.all, "mutation"] as const,
  create: () => [...teamKeys.mutations(), "create"] as const,
  update: () => [...teamKeys.mutations(), "update"] as const,
  delete: () => [...teamKeys.mutations(), "delete"] as const,
  
  members: () => [...teamKeys.all, "members"] as const,
  addMembers: () => [...teamKeys.members(), "add"] as const,
  removeMember: () => [...teamKeys.members(), "remove"] as const,
    userTeam: (userId: string) => [...teamKeys.all, "userTeam", userId] as const,

  availableUsers: () => [...teamKeys.all, "availableUsers"] as const,
  availableUsersByCourse: (courseId: CourseId) => [...teamKeys.availableUsers(), courseId] as const,
  
  autoGenerate: () => [...teamKeys.all, "autoGenerate"] as const,
} as const;