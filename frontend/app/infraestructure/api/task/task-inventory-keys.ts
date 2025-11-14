// File: src/app/features/courses/api/task-inventory-keys.ts

import { CourseId, SubmissionId } from "@/app/domain/valueObjects";

/**
 * Query key factory for task inventory-related queries
 */
export const taskInventoryKeys = {
  all: ["taskInventory"] as const,
  
  // Task inventory by course
  inventory: () => [...taskInventoryKeys.all, "inventory"] as const,
  inventoryByCourse: (courseId: CourseId) => [...taskInventoryKeys.inventory(), courseId] as const,
  
  // Submission details
  submissions: () => [...taskInventoryKeys.all, "submission"] as const,
  submissionDetail: (id: SubmissionId) => [...taskInventoryKeys.submissions(), id] as const,
  
  // Grade mutations
  mutations: () => [...taskInventoryKeys.all, "mutation"] as const,
  updateGrade: () => [...taskInventoryKeys.mutations(), "updateGrade"] as const,
  requestAnalysis: () => [...taskInventoryKeys.mutations(), "requestAnalysis"] as const,
  
  // Statistics
  stats: () => [...taskInventoryKeys.all, "stats"] as const,
  statsByCourse: (courseId: CourseId) => [...taskInventoryKeys.stats(), courseId] as const,
  
  // Bulk operations
  bulk: () => [...taskInventoryKeys.all, "bulk"] as const,
  bulkDeadlines: () => [...taskInventoryKeys.bulk(), "deadlines"] as const,
} as const;