
export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (userId: string, monthStart: string, userType: string) => 
    [...quizKeys.lists(), userId, monthStart, userType] as const,
  week: (userId: string, weekStart: string, userType: string) => 
    [...quizKeys.all, "week", userId, weekStart, userType] as const,
  detail: () => [...quizKeys.all, "detail"] as const,
  detailById: (quizId: string) => [...quizKeys.detail(), quizId] as const,
  mutations: () => [...quizKeys.all, "mutation"] as const,
  submit: () => [...quizKeys.mutations(), "submit"] as const,
} as const;