// File: src/app/presentation/hooks/submission/quiz-submissions-hooks.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { SubmissionQuiz } from "@/app/domain/entities/CourseEntities";
import { quizKeys } from "./quiz-keys";
import { fetchSubmissionQuizByStudentAndQuiz, fetchSubmissionQuizzesByCourse } from "./quiz-api";
import { QuizId } from "@/app/domain/valueObjects/CourseValues";
import { fetchQuizSubmissionDetail } from "@/components/student/api/student-submission";

/**
 * Custom hook for fetching all SubmissionQuiz entries for a course
 */
export function useSubmissionQuizzesByCourse(courseId: CourseId | null) {
  return useQuery<SubmissionQuiz[]>({
    queryKey: quizKeys.submissionQuizzesByCourse(courseId || ""),
    queryFn: () => fetchSubmissionQuizzesByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}



export function useSubmissionQuizByStudentAndQuiz(
  quizId: QuizId | null, 
  studentId: UserId | null
) {
  return useQuery<SubmissionQuiz | null>({
    queryKey: quizKeys.submissionQuizByStudentAndQuiz(quizId || "", studentId || ""),
    queryFn: () => fetchQuizSubmissionDetail(quizId!, studentId!),
    enabled: !!quizId && !!studentId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}