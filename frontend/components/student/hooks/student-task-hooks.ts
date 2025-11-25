// File: src/app/presentation/hooks/course/student/student-task-hooks.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/context/AuthContext";
import { 
  fetchStudentAssignments, 
  fetchStudentAssignmentsItem, 
  fetchStudentQuizzes,
  fetchStudentQuizzesItem,
} from "@/components/student/api/student-task-api";
import { CourseId } from "@/app/domain/valueObjects";
import { fetchStudentSubmissionsItem, fetchStudentSubmissionsQuizzesItem } from "@/components/student/api/student-submission";

export interface StudentAssignment {
  id: string;
  name: string;
  unit: string;
  instructions: string;
  maxPoints: number;
  deadline: string;
  isOverdue: boolean;
  submission?: {
    id: string;
    content: string;
    submittedAt: string;
    status: string;
    grade?: { value: string; maxScore: number };
    teacherFeedback?: string;
    attachments: Array<{ name: string; storagePath: string; createdAt: string }>;
  };
}

export interface StudentQuiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  maxGrade: number;
  dueDate?: string;
  isOverdue: boolean;
  questions?: any[];
  submission?: {
    id: string;
    status: string;
    submittedAt: string;
    grade?: { value: number; maxScore: number };
    teacherFeedback?: string;
    quizData?: any;
  };
}

export interface StudentTaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  averageGrade: number;
  overdueTasks: number;
}

export function useStudentTaskOverview(courseId: CourseId | null, studentId: string | null) {
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['student-assignments', courseId, studentId],
    queryFn: () => fetchStudentSubmissionsItem(courseId!, studentId!),
    enabled: !!courseId && !!studentId,
  });

  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['student-quizzes', courseId, studentId],
    queryFn: () => fetchStudentSubmissionsQuizzesItem(courseId!, studentId!),
    enabled: !!courseId && !!studentId,
  });

  const isLoading = isLoadingAssignments || isLoadingQuizzes 

  return {
    assignments,
    quizzes,
    isLoading,
    error: null, // You can add error handling as needed
  };
}