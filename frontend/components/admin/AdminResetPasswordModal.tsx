// components/admin/AdminResetPasswordModal.tsx
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
import { User } from "./api/usersApi";

interface AdminResetPasswordModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

// Zod validation schema
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin: Reset Password
          </DialogTitle>
          <DialogDescription>
            Reset password for {user.person.firstName} {user.person.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder="Enter new password"
              className={errors.newPassword ? "border-red-500" : ""}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.newPassword.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Must contain: 8+ characters, uppercase, lowercase, and number
            </p>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={adminResetPassword.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={adminResetPassword.isPending || !isValid}
              variant="destructive"
            >
              {adminResetPassword.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}