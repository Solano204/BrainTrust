'use client';

// DARK NEW
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { useAdminResetPassword } from "./hooks/useUsers";
import { User } from "@/app/shared/models/user.model";

interface AdminResetPasswordModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña debe tener menos de 100 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function AdminResetPasswordModal({ user, open, onClose }: AdminResetPasswordModalProps) {
  const adminResetPassword = useAdminResetPassword();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange"
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!user) return;
    
    await adminResetPassword.mutateAsync({
      userId: user.id,
      newPassword: data.newPassword
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
          <Shield className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Admin: Restablecer Contraseña
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Restablecer contraseña para{" "}
            <span className="font-medium text-foreground">
              {user.person.firstName} {user.person.lastName}
            </span>
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

        {/* New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground">
            Nueva Contraseña
          </Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
            placeholder="Ingrese nueva contraseña"
            className={`rounded-xl border-border bg-background focus:ring-ring/50 ${
              errors.newPassword ? "border-destructive focus:ring-destructive/40" : ""
            }`}
          />
          {errors.newPassword ? (
            <p className="text-xs text-destructive mt-1">
              {errors.newPassword.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Debe contener: 8+ caracteres, mayúscula, minúscula y número
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
            Confirmar Contraseña
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirme la nueva contraseña"
            className={`rounded-xl border-border bg-background focus:ring-ring/50 ${
              errors.confirmPassword ? "border-destructive focus:ring-destructive/40" : ""
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border mt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={adminResetPassword.isPending}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={adminResetPassword.isPending || !isValid}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {adminResetPassword.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Restableciendo...
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>
        </div>

      </form>
    </DialogContent>
  </Dialog>
);
};