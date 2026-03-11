//DARK
import React, { useState } from "react";
import { TaskSubmissionView } from "@/components/student/quiz-view-tasks-student";
import { useStudentTaskSubmission } from "@/components/teacher-student/hooks/submission-hooks";
import { Assignment } from "@/app/domain/entities";
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
  onSubmit: (submission: {
    content: string;
    attachments: File[];
  }) => Promise<void>;
  onExit: () => void;
  isSubmitting: boolean;
}

export function StudentTaskView({
  assignment,
  studentId,
  onSubmit,
  onExit,
  isSubmitting,
}: StudentTaskViewProps) {
  const { data: existingSubmission, isLoading } = useStudentTaskSubmission(
    assignment.id,
    studentId,
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    content: string;
    attachments: File[];
  } | null>(null);

  const isNotebookSubmission = assignment.submissionFormat === "NOTEBOOK";

  const handleSubmitAttempt = async (submission: {
    content: string;
    attachments: File[];
  }) => {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* ✅ was: border-blue-600 → border-primary */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {isNotebookSubmission ? (
          // ✅ was: border-amber-500 bg-amber-50 dark:bg-amber-950/20 → accent (gold)
          <Alert className="border-accent/50 bg-accent/5">
            {/* ✅ was: text-amber-600 dark:text-amber-400 → text-accent-foreground */}
            <BookOpen className="h-5 w-5 text-accent-foreground" />
            <AlertDescription className="ml-2">
              {/* ✅ was: text-amber-900 dark:text-amber-100 → text-foreground */}
              <div className="font-semibold text-foreground mb-1">
                📓 Notebook Submission Required
              </div>
              {/* ✅ was: text-amber-800 dark:text-amber-200 → text-foreground/80 */}
              <p className="text-sm text-foreground/80">
                This assignment requires you to submit your work in a physical
                notebook. Please ensure you have completed your work in your
                notebook before marking this assignment as submitted. Your
                teacher will review your notebook in class.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          // ✅ was: border-blue-500 bg-blue-50 dark:bg-blue-950/20 → primary (navy)
          <Alert className="border-primary/40 bg-primary/5">
            {/* ✅ was: text-blue-600 dark:text-blue-400 → text-primary */}
            <Monitor className="h-5 w-5 text-primary" />
            <AlertDescription className="ml-2">
              {/* ✅ was: text-blue-900 dark:text-blue-100 → text-foreground */}
              <div className="font-semibold text-foreground mb-1">
                💻 Digital Submission
              </div>
              {/* ✅ was: text-blue-800 dark:text-blue-200 → text-foreground/80 */}
              <p className="text-sm text-foreground/80">
                Submit your work digitally by uploading files or entering your
                response below.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <TaskSubmissionView
          assignment={assignment}
          existingSubmission={existingSubmission || undefined}
          onSubmit={handleSubmitAttempt}
          onDownloadAttachment={(attachment) => {
            if (attachment.storagePath) {
              window.open(attachment.storagePath, "_blank");
            }
          }}
          isSubmitting={isSubmitting}
          onExit={onExit}
        />
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {/* ✅ was: text-amber-500 → text-accent-foreground */}
              <AlertTriangle className="h-5 w-5 text-accent-foreground" />
              Confirm Notebook Submission
            </DialogTitle>
            <div className="pt-4 space-y-3 text-sm text-muted-foreground">
              {/* ✅ was: bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 → accent */}
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/30">
                <div className="flex items-start gap-3">
                  {/* ✅ was: text-amber-600 dark:text-amber-400 → text-accent-foreground */}
                  <BookOpen className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    {/* ✅ was: text-amber-900 dark:text-amber-100 → text-foreground */}
                    <p className="font-medium text-foreground">
                      This is a notebook-based assignment
                    </p>
                    {/* ✅ was: text-amber-800 dark:text-amber-200 → text-foreground/80 */}
                    <p className="text-sm text-foreground/80">
                      Please confirm that you have:
                    </p>
                    <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>Completed all work in your physical notebook</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>Your notebook is ready for teacher review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>You have double-checked your work</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Once submitted, your teacher will be notified to review your notebook during class time.
              </p>
            </div>
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
                  {/* ✅ was: border-white → border-primary-foreground */}
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
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