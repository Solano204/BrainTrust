// File: src/app/infraestructure/api/student/submission-keys.ts
export const studentSubmissionKeys = {
  all: ["studentSubmissions"] as const,
  
  // Task submissions
  taskSubmissions: () => [...studentSubmissionKeys.all, "task"] as const,
  taskSubmission: (assignmentId: string, studentId: string) => 
    [...studentSubmissionKeys.taskSubmissions(), assignmentId, studentId] as const,
  
  // Quiz submissions  
  quizSubmissions: () => [...studentSubmissionKeys.all, "quiz"] as const,
  quizSubmission: (quizId: string, studentId: string) => 
    [...studentSubmissionKeys.quizSubmissions(), quizId, studentId] as const,
  
  // Mutations
  mutations: () => [...studentSubmissionKeys.all, "mutation"] as const,
  submitTask: () => [...studentSubmissionKeys.mutations(), "submitTask"] as const,
  submitQuiz: () => [...studentSubmissionKeys.mutations(), "submitQuiz"] as const,
} as const;