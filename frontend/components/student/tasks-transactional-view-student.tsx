import React, { useState } from 'react';
import { TaskSubmissionView } from "@/components/student/quiz-view-tasks-student";
import { useStudentTaskSubmission } from '@/components/teacher-student/hooks/submission-hooks';
import { Assignment } from '@/app/domain/entities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Monitor, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{ content: string; attachments: File[] } | null>(null);

  const isNotebookSubmission = assignment.submissionFormat === "NOTEBOOK";

  const handleSubmitAttempt = async (submission: { content: string; attachments: File[] }) => {
    if (isNotebookSubmission) {
      setPendingSubmission(submission);
      setShowConfirmModal(true);
    } else {
      await onSubmit(submission);
    }
  };

  const handleConfirmSubmission = async () => {
    if (pendingSubmission) {
      setShowConfirmModal(false);
      await onSubmit(pendingSubmission);
      setPendingSubmission(null);
    }
  };

  const handleCancelSubmission = () => {
    setShowConfirmModal(false);
    setPendingSubmission(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {isNotebookSubmission ? (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="ml-2">
              <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                📓 Notebook Submission Required
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This assignment requires you to submit your work in a physical notebook. 
                Please ensure you have completed your work in your notebook before marking this assignment as submitted.
                Your teacher will review your notebook in class.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="ml-2">
              <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                💻 Digital Submission
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Submit your work digitally by uploading files or entering your response below.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <TaskSubmissionView
          assignment={assignment}
          existingSubmission={existingSubmission || undefined}
          onSubmit={handleSubmitAttempt}
          onDownloadAttachment={(attachment) => {
            console.log('Downloading attachment:', attachment);
          }}
          isSubmitting={isSubmitting}
          onExit={onExit}
        />
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Notebook Submission
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      This is a notebook-based assignment
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Please confirm that you have:
                    </p>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Completed all work in your physical notebook</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Your notebook is ready for teacher review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>You have double-checked your work</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Once submitted, your teacher will be notified to review your notebook during class time.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelSubmission}
              disabled={isSubmitting}
            >
              Check Again
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubmission}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Yes, Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}