// File: src/app/features/courses/components/student/StudentTaskView.tsx
"use client";

import React from 'react';
import { TaskSubmissionView } from "@/components/student/quiz-view-tasks-student";
import { useStudentTaskSubmission } from '@/components/teacher-student/hooks/submission-hooks';
import { Assignment } from '@/app/domain/entities';

interface StudentTaskViewProps {
  assignment: Assignment;
  studentId: string;
  onSubmit: (submission: { content: string; attachments: File[] }) => Promise<void>;
  onExit: () => void;
  isSubmitting: boolean;
}

export function StudentTaskView({ 
  assignment, 
  studentId, 
  onSubmit, 
  onExit, 
  isSubmitting 
}: StudentTaskViewProps) {
  const { data: existingSubmission, isLoading } = useStudentTaskSubmission(assignment.id, studentId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <TaskSubmissionView
      assignment={assignment}
      existingSubmission={existingSubmission || undefined}
      onSubmit={onSubmit}
      onDownloadAttachment={(attachment) => {
        // Implement download logic
        console.log('Downloading attachment:', attachment);
      }}
      isSubmitting={isSubmitting}
      onExit={onExit}
    />
  );
}