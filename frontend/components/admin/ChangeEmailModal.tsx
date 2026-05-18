'use client';

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { useUserMutations } from "./hooks/useUsers";
import { User } from "../student/api/enrollment";

interface ChangeEmailModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "El correo es requerido")
    .email("Por favor ingresa una dirección de correo válida")
    .max(255, "El correo debe tener menos de 255 caracteres")
    .toLowerCase()
    .trim(),
  confirmEmail: z
    .string()
    .min(1, "Por favor confirma tu correo")
}).refine((data) => data.newEmail === data.confirmEmail, {
  message: "Las direcciones de correo no coinciden",
  path: ["confirmEmail"]
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export function ChangeEmailModal({ user, open, onClose }: ChangeEmailModalProps) {
  const { changeEmail } = useUserMutations();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onChange"
  });
  
  const onSubmit = async (data: ChangeEmailFormData) => {
    if (!user) return;
    
    await changeEmail.mutateAsync({
      userId: user.id,
      newEmail: data.newEmail
    });
    
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };
  
  if (!open || !user) return null;
  
 return (
  <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="rounded-3xl border-border bg-card p-0 overflow-hidden max-w-md">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
          <Mail className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Cambiar Dirección de Correo
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cambiar correo para{" "}
            <span className="font-medium text-foreground">
              {user.person.firstName} {user.person.lastName}
            </span>
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

        {/* Current email (read-only) */}
        <div className="space-y-1.5">
          <Label htmlFor="currentEmail" className="text-xs font-semibold text-foreground">
            Correo Actual
          </Label>
          <Input
            id="currentEmail"
            value={user.email}
            disabled
            className="rounded-xl border-border bg-muted text-muted-foreground"
          />
        </div>

        {/* New email */}
        <div className="space-y-1.5">
          <Label htmlFor="newEmail" className="text-xs font-semibold text-foreground">
            Nuevo Correo
          </Label>
          <Input
            id="newEmail"
            type="email"
            {...register("newEmail")}
            placeholder="Ingrese nuevo correo"
            className={`rounded-xl border-border bg-background focus:ring-ring/50 ${
              errors.newEmail ? "border-destructive focus:ring-destructive/40" : ""
            }`}
          />
          {errors.newEmail && (
            <p className="text-xs text-destructive mt-1">
              {errors.newEmail.message}
            </p>
          )}
        </div>

        {/* Confirm email */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmEmail" className="text-xs font-semibold text-foreground">
            Confirmar Nuevo Correo
          </Label>
          <Input
            id="confirmEmail"
            type="email"
            {...register("confirmEmail")}
            placeholder="Confirme nuevo correo"
            className={`rounded-xl border-border bg-background focus:ring-ring/50 ${
              errors.confirmEmail ? "border-destructive focus:ring-destructive/40" : ""
            }`}
          />
          {errors.confirmEmail && (
            <p className="text-xs text-destructive mt-1">
              {errors.confirmEmail.message}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border mt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={changeEmail.isPending}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={changeEmail.isPending || !isValid}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {changeEmail.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              "Cambiar Correo"
            )}
          </button>
        </div>

      </form>
    </DialogContent>
  </Dialog>
);
}