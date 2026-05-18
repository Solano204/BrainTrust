//DARK
"use client";
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

export function VistaTareaEstudiante({
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
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-accent/30 bg-accent/5">
          <BookOpen className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              📓 Envío en Cuaderno Requerido
            </p>
            <p className="text-xs text-muted-foreground">
              Esta tarea requiere que entregues tu trabajo en un cuaderno físico.
              Por favor, asegúrate de haber completado tu trabajo en tu cuaderno
              antes de marcar esta tarea como enviada. Tu profesor revisará tu
              cuaderno en clase.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5">
          <Monitor className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              💻 Envío Digital
            </p>
            <p className="text-xs text-muted-foreground">
              Entrega tu trabajo digitalmente subiendo archivos o ingresando tu
              respuesta a continuación.
            </p>
          </div>
        </div>
      )}

      <TaskSubmissionView
        assignment={assignment}
        existingSubmission={existingSubmission || undefined}
        onSubmit={handleSubmitAttempt}
        onDownloadAttachment={(attachment) => {
          if (attachment.storagePath) window.open(attachment.storagePath, "_blank");
        }}
        isSubmitting={isSubmitting}
        onExit={onExit}
      />
    </div>

    {/* ── Diálogo de confirmación de envío en cuaderno ── */}
    <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
      <DialogContent className="bg-card rounded-3xl border border-border shadow-2xl sm:max-w-md p-0 overflow-hidden">

        {/* Encabezado */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <span className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-accent-foreground" />
          </span>
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Confirmar Envío de Cuaderno
          </h2>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-4">
          <div className="p-4 bg-accent/5 rounded-2xl border border-accent/30">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Esta es una tarea basada en cuaderno
                </p>
                <p className="text-xs text-muted-foreground">Por favor, confirma que:</p>
                <ul className="space-y-1.5">
                  {[
                    'Has completado todo el trabajo en tu cuaderno físico',
                    'Tu cuaderno está listo para la revisión del profesor',
                    'Has verificado tu trabajo nuevamente',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Una vez enviado, tu profesor será notificado para revisar tu cuaderno durante la clase.
          </p>
        </div>

        {/* Pie de página */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 rounded-b-3xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCancelSubmission}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-all"
            >
              Verificar Nuevamente
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmission}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Enviando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" />Sí, Enviar</>
              )}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  </>
);
};