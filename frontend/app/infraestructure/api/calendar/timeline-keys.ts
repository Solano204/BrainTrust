// File: src/app/features/timeline/api/timeline-keys.ts
export const timelineKeys = {
  all: ["timeline"] as const,
  resources: (userId: string, weekStart: string, userType: string) => 
    [...timelineKeys.all, "resources", userId, weekStart, userType] as const,
  mutations: () => [...timelineKeys.all, "mutation"] as const,
  dismiss: () => [...timelineKeys.mutations(), "dismiss"] as const,
} as const;