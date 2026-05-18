//DARK
"use client";

import React, { useEffect, useState } from 'react';
import { QuizView } from "@/components/student/quiz-view-submission-student";
import { useStudentQuizSubmission } from '@/components/teacher-student/hooks/submission-hooks';
import { useAuth } from '@/app/context/AuthContext';
import { useQuizDetail } from '@/app/presentation/hooks/calendar/quiz-hooks';
import { UnitResource, CourseUnit, Assignment, Quiz, Page } from "@/app/domain/entities/CourseEntities";

interface StudentQuizViewProps {
  quizData: Quiz;
  studentId: string;
  onSubmit: (answers: any) => Promise<void>;
  onExit: () => void;
  isSubmitting: boolean;
}

export function StudentQuizView({
  quizData,
  studentId,
  onSubmit,
  onExit,
  isSubmitting
}: StudentQuizViewProps) {
  const { user } = useAuth();
  const userType = user?.role === 'student' ? 'student' : 'teacher';

  const {
    data: quiz,
    isLoading: isQuizLoading,
    error: quizError
  } = useQuizDetail(quizData.id, userType);

  const {
    data: existingSubmission,
    isLoading: isSubmissionLoading,
    error: submissionError
  } = useStudentQuizSubmission(quizData.id, studentId);

  const isLoading = isQuizLoading || isSubmissionLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          {/* ✅ was: border-blue-600 → border-primary */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* ✅ was: bg-red-50 dark:bg-red-900/20 → bg-destructive/5 */}
        <div className="text-center p-6 bg-destructive/5 rounded-lg border border-destructive/20 max-w-md">
          {/* ✅ was: text-red-600 dark:text-red-400 → text-destructive */}
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Quiz</h3>
          {/* ✅ was: text-red-500 dark:text-red-300 → text-destructive/80 */}
          <p className="text-sm text-destructive/80 mb-4">
            {quizError.message || "Failed to load quiz details"}
          </p>
          {/* ✅ was: bg-red-600 hover:bg-red-700 text-white → bg-destructive text-destructive-foreground */}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          {/* ✅ was: text-gray-600 dark:text-gray-300 → text-foreground */}
          <h3 className="text-lg font-semibold text-foreground mb-2">Quiz Not Found</h3>
          <p className="text-sm text-muted-foreground">The requested quiz could not be found.</p>
        </div>
      </div>
    );
  }

  console.log("Quiz data:", quiz);

  return (
    <QuizView
      quiz={quiz}
      existingSubmission={existingSubmission || undefined}
      onSubmit={onSubmit}
      onExit={onExit}
    />
  );
}