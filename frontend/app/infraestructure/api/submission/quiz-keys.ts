// File: src/app/infraestructure/api/submission/quiz-keys.ts

export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (courseId: string) => [...quizKeys.lists(), courseId] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  submissions: () => [...quizKeys.all, 'submissions'] as const,
  quizSubmissions: (quizId: string) => [...quizKeys.submissions(), quizId] as const,
  // NEW KEYS FOR SUBMISSIONQUIZ
  submissionQuizzes: (quizId: string) => [...quizKeys.all, 'submission-quizzes', quizId] as const,
  submissionQuizDetail: (submissionId: string) => [...quizKeys.all, 'submission-quiz', submissionId] as const,
  statsByQuiz: (quizId: string) => [...quizKeys.all, 'stats', quizId] as const,
} as const;