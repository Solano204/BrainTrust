
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (userId: string, monthStart: string, userType: string) => 
    [...taskKeys.lists(), userId, monthStart, userType] as const,
  week: (userId: string, weekStart: string, userType: string) => 
    [...taskKeys.all, "week", userId, weekStart, userType] as const,
  detail: () => [...taskKeys.all, "detail"] as const,
  detailById: (taskId: string) => [...taskKeys.detail(), taskId] as const,
} as const;


export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (userId: string, monthStart: string, userType: string) => 
    [...quizKeys.lists(), userId, monthStart, userType] as const,
  week: (userId: string, weekStart: string, userType: string) => 
    [...quizKeys.all, "week", userId, weekStart, userType] as const,
  detail: () => [...quizKeys.all, "detail"] as const,
  detailById: (quizId: string) => [...quizKeys.detail(), quizId] as const,
} as const;


export const timelineKeys = {
  all: ["timeline"] as const,
  pending: (userId: string, userType: string) => 
    [...timelineKeys.all, "pending", userId, userType] as const,
} as const;