"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchStudentSubmissions,
} from "@/components/student/api/student-submission";

import {
  fetchStudentQuizSubmissions,
  fetchQuizSubmissionDetail,
} from "@/components/teacher-student/api/quiz-teacher";

import type { SubmissionTask } from "@/app/shared/models/assignment.model";
import type { StudentSubmissionQuiz, QuizSubmissionDetail } from "@/app/shared/models/quiz.model";

export function useStudentTaskOverview(
    courseId: string | null,
    studentId: string | null,
    unitId: string | null = null
) {

  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    error: assignmentsError,
    refetch: refetchAssignments
  } = useQuery<SubmissionTask[], Error>({
    queryKey: ['student-assignments', courseId, studentId, unitId],
    queryFn: () => fetchStudentSubmissions(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
    staleTime: 30000,
    retry: 2,
  });

  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes,
    error: quizzesError,
    refetch: refetchQuizzes
  } = useQuery<StudentSubmissionQuiz[], Error>({
    queryKey: ['student-quizzes', courseId, studentId, unitId],
    queryFn: () => fetchStudentQuizSubmissions(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
    staleTime: 30000,
    retry: 2,
  });

  const isLoading = isLoadingAssignments || isLoadingQuizzes;
  const error = assignmentsError || quizzesError;

  const stats = {
    totalTasks: assignments.length + quizzes.length,
    completedTasks: [
      ...assignments.filter((a: SubmissionTask) => a.submission?.status === 'GRADED'),
      ...quizzes.filter((q: StudentSubmissionQuiz) =>
          q.submission?.status === 'GRADED'
      )
    ].length,
    pendingTasks: [
      ...assignments.filter((a: SubmissionTask) =>
          !a.submission || a.submission.status === 'SUBMITTED'
      ),
      ...quizzes.filter((q: StudentSubmissionQuiz) =>
          q.submission && q.submission.status === 'SUBMITTED'
      )
    ].length,
    overdueTasks: [
      ...assignments.filter((a: SubmissionTask) =>
          a.isOverdue && !a.submission
      ),
      ...quizzes.filter((q: StudentSubmissionQuiz) =>
          q.isOverdue && !q.submission
      )
    ].length,
    averageGrade: calculateAverageGrade(assignments, quizzes),
  };

  return {
    assignments,
    quizzes,
    stats,
    isLoading,
    error: error ? error.message : null,
    refetchAssignments,
    refetchQuizzes,
  };
}

export function useStudentQuizSubmissionDetail(
    submissionId: string | null
) {
  const {
    data: quizSubmissionDetail,
    isLoading,
    error,
    refetch
  } = useQuery<QuizSubmissionDetail, Error>({
    queryKey: ['student-quiz-submission-detail', submissionId],
    queryFn: () => fetchQuizSubmissionDetail(submissionId!),
    enabled: !!submissionId,
    staleTime: 30000,
    retry: 2,
  });

  return {
    quizSubmissionDetail,
    isLoading,
    error: error ? error.message : null,
    refetch,
  };
}

export function useStudentAssignment(
    courseId: string | null,
    studentId: string | null,
    unitId: string | null,
    assignmentId: string | null
) {
  const { data: assignments = [] } = useQuery<SubmissionTask[], Error>({
    queryKey: ['student-assignments', courseId, studentId, unitId],
    queryFn: () => fetchStudentSubmissions(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
  });

  const assignment = assignments.find((a: SubmissionTask) => a.id === assignmentId);

  return {
    assignment,
    isLoading: !assignment && !!assignmentId,
  };
}

export function useStudentQuiz(
    courseId: string | null,
    studentId: string | null,
    unitId: string | null,
    quizId: string | null
) {
  const { data: quizzes = [] } = useQuery<StudentSubmissionQuiz[], Error>({
    queryKey: ['student-quizzes', courseId, studentId, unitId],
    queryFn: () => fetchStudentQuizSubmissions(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
  });

  const quiz = quizzes.find((q: StudentSubmissionQuiz) => q.id === quizId);

  return {
    quiz,
    isLoading: !quiz && !!quizId,
  };
}

function calculateAverageGrade(
    assignments: SubmissionTask[],
    quizzes: StudentSubmissionQuiz[]
): number {
  const gradedAssignments = assignments.filter(
      (a: SubmissionTask) => a.submission?.grade
  );

  const gradedQuizzes = quizzes.filter(
      (q: StudentSubmissionQuiz) => q.submission?.grade
  );

  const totalGraded = gradedAssignments.length + gradedQuizzes.length;

  if (totalGraded === 0) return 0;

  const assignmentTotal = gradedAssignments.reduce((sum, a) => {
    const gradeValue = Number(a.submission!.grade!.value);
    const maxPoints = a.maxPoints;
    const percentage = (gradeValue / maxPoints) * 100;
    return sum + percentage;
  }, 0);

  const quizTotal = gradedQuizzes.reduce((sum, q) => {
    const gradeValue = q.submission!.grade!.value;
    const maxScore = q.submission!.grade!.maxScore;
    const percentage = (gradeValue / maxScore) * 100;
    return sum + percentage;
  }, 0);

  return Math.round((assignmentTotal + quizTotal) / totalGraded);
}