import { z } from 'zod';

export const quizValidationSchema = z.object({
  answers: z.record(z.object({
    questionId: z.string(),
    studentAnswer: z.union([z.string(), z.number()]),
    questionText: z.string(),
    questionType: z.string(),
    points: z.number(),
    maxPoints: z.number(),
    isCorrect: z.boolean().optional()
  }))
});

export type QuizValidationData = z.infer<typeof quizValidationSchema>;