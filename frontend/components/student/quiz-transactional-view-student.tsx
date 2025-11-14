// File: src/app/features/courses/components/student/StudentQuizView.tsx
"use client";

import React from 'react';
import { QuizView } from "@/components/student/quiz-view-submission-student";
import { useStudentQuizSubmission } from '@/app/presentation/hooks/course/student/submission-hooks';
import { Quiz } from '@/app/domain/entities/CourseEntities';

interface StudentQuizViewProps {
  quiz: Quiz;
  studentId: string;
  onSubmit: (answers: any) => Promise<void>;
  onExit: () => void;
  isSubmitting: boolean;
}

export function StudentQuizView({ 
  quiz, 
  studentId, 
  onSubmit, 
  onExit, 
  isSubmitting 
}: StudentQuizViewProps) {
  const { data: existingSubmission, isLoading } = useStudentQuizSubmission(quiz.id, studentId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QuizView
      quiz={quiz}
      existingSubmission={existingSubmission || undefined}
      onSubmit={onSubmit}
      onExit={onExit}
    />
  );
}