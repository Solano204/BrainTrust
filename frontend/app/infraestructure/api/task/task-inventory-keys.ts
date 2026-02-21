
import { CourseId, SubmissionId } from "@/app/domain/valueObjects";

export const taskInventoryKeys = {
  all: ["taskInventory"] as const,
  
  inventory: () => [...taskInventoryKeys.all, "inventory"] as const,
  inventoryByCourse: (courseId: CourseId, unitId: string) => [...taskInventoryKeys.inventory(), courseId, unitId] as const,
  
  submissions: () => [...taskInventoryKeys.all, "submission"] as const,
  submissionDetail: (id: SubmissionId) => [...taskInventoryKeys.submissions(), id] as const,
  
  mutations: () => [...taskInventoryKeys.all, "mutation"] as const,
  updateGrade: () => [...taskInventoryKeys.mutations(), "updateGrade"] as const,
  requestAnalysis: () => [...taskInventoryKeys.mutations(), "requestAnalysis"] as const,
  
  stats: () => [...taskInventoryKeys.all, "stats"] as const,
  statsByCourse: (courseId: CourseId) => [...taskInventoryKeys.stats(), courseId] as const,
  
  bulk: () => [...taskInventoryKeys.all, "bulk"] as const,
  bulkDeadlines: () => [...taskInventoryKeys.bulk(), "deadlines"] as const,
} as const;