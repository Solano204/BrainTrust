// File: src/app/presentation/hooks/course/student/student-task-hooks.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/context/AuthContext";
import { 
  fetchQuizSubmissionDetail,
  fetchStudentSubmissionsItem, 
  fetchStudentSubmissionsQuizzesItem 
} from "@/components/student/api/student-submission";
import { CourseId } from "@/app/domain/valueObjects";

/**
 * Hook to fetch student task overview for a specific course and unit
 * Now properly uses the API functions with unitId support
 */
export function useStudentTaskOverview(
  courseId: CourseId | null, 
  studentId: string | null,
  unitId: string | null = null
) {
  // Fetch assignments with submissions
// THIS CURRENTLY WORKS

  const { 
    data: assignments = [], 
    isLoading: isLoadingAssignments,
    error: assignmentsError,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: ['student-assignments', courseId, studentId, unitId],
    queryFn: () => fetchStudentSubmissionsItem(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });


// THIS CURRENTLY WORKS

  // Fetch quizzes with submissions
  const { 
    data: quizzes = [], 
    isLoading: isLoadingQuizzes,
    error: quizzesError,
    refetch: refetchQuizzes
  } = useQuery({
    queryKey: ['student-quizzes', courseId, studentId, unitId],
    queryFn: () => fetchStudentSubmissionsQuizzesItem(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  

  const isLoading = isLoadingAssignments || isLoadingQuizzes;
  const error = assignmentsError || quizzesError;

  // Calculate statistics based on fetched data
  const stats = {
    totalTasks: assignments.length + quizzes.length,
    completedTasks: [
      ...assignments.filter(a => a.submission?.status === 'GRADED'),
      ...quizzes.filter(q => q.submission?.status === 'GRADED')
    ].length,
    pendingTasks: [
      ...assignments.filter(a => !a.submission || a.submission.status === 'SUBMITTED'),
      ...quizzes.filter(q => !q.submission || q.submission.status === 'SUBMITTED')
    ].length,
    overdueTasks: [
      ...assignments.filter(a => a.isOverdue && !a.submission),
      ...quizzes.filter(q => q.isOverdue && !q.submission)
    ].length,
    averageGrade: calculateAverageGrade(assignments, quizzes),
  };

  return {
    assignments,
    quizzes,
    stats,
    isLoading,
    error: error ? (error as Error).message : null,
    refetchAssignments,
    refetchQuizzes,
  };
}


export function useStudentQuizSubmissionDetail(
  submissionId: string | null
) {
  const { data: quizSubmissionDetail, isLoading, error, refetch } = useQuery({
    queryKey: ['student-quiz-submission-detail', submissionId],
    queryFn: () => fetchQuizSubmissionDetail(submissionId!),
    enabled: !!submissionId,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  return {
    quizSubmissionDetail,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}


/**
 * Calculate average grade from assignments and quizzes
 */
function calculateAverageGrade(assignments: any[], quizzes: any[]): number {
  const gradedAssignments = assignments.filter(a => a.submission?.grade);
  const gradedQuizzes = quizzes.filter(q => q.submission?.grade);
  
  const totalGraded = gradedAssignments.length + gradedQuizzes.length;
  
  if (totalGraded === 0) return 0;
  
  const assignmentTotal = gradedAssignments.reduce((sum, a) => {
    const percentage = (Number(a.submission.grade.value) / a.maxPoints) * 100;
    return sum + percentage;
  }, 0);
  
  const quizTotal = gradedQuizzes.reduce((sum, q) => {
    const percentage = (q.submission.grade.value / q.maxGrade) * 100;
    return sum + percentage;
  }, 0);
  
  return Math.round((assignmentTotal + quizTotal) / totalGraded);
}

/**
 * Hook to fetch a single assignment with its submission
 */
export function useStudentAssignment(
  courseId: CourseId | null,
  studentId: string | null,
  unitId: string | null,
  assignmentId: string | null
) {
  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments', courseId, studentId, unitId],
    queryFn: () => fetchStudentSubmissionsItem(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
  });

  const assignment = assignments.find(a => a.id === assignmentId);

  return {
    assignment,
    isLoading: !assignment && !!assignmentId,
  };
}

/**
 * Hook to fetch a single quiz with its submission
 */
export function useStudentQuiz(
  courseId: CourseId | null,
  studentId: string | null,
  unitId: string | null,
  quizId: string | null
) {
  const { data: quizzes = [] } = useQuery({
    queryKey: ['student-quizzes', courseId, studentId, unitId],
    queryFn: () => fetchStudentSubmissionsQuizzesItem(courseId!, studentId!, unitId!),
    enabled: !!courseId && !!studentId && !!unitId,
  });

  const quiz = quizzes.find(q => q.id === quizId);

  return {
    quiz,
    isLoading: !quiz && !!quizId,
  };
}