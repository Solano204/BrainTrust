export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (courseId: string) => [...quizKeys.lists(), courseId] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  submissions: () => [...quizKeys.all, 'submissions'] as const,
  quizSubmissions: (quizId: string) => [...quizKeys.submissions(), quizId] as const,
  
  submissionQuizzes: (quizId: string) => [...quizKeys.all, 'submission-quizzes', quizId] as const,
  submissionQuizzesByCourse: (courseId: string) => [...quizKeys.all, 'submission-quizzes-by-course', courseId] as const,
  submissionQuizByStudentAndQuiz: (quizId: string, studentId: string) => 
    [...quizKeys.all, 'submission-quiz-by-student', quizId, studentId] as const,
  submissionQuizDetail: (submissionId: string) => [...quizKeys.all, 'submission-quiz', submissionId] as const,
  statsByQuiz: (quizId: string) => [...quizKeys.all, 'stats', quizId] as const,
} as const;
