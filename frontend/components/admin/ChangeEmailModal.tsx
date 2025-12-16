// components/admin/ChangeEmailModal.tsx
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
import { Loader2, Mail } from "lucide-react";
import { useUserMutations } from "./hooks/useUsers";
import { User } from "./api/usersApi";

interface ChangeEmailModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

// Zod validation schema
const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  confirmEmail: z
    .string()
    .min(1, "Please confirm your email")
}).refine((data) => data.newEmail === data.confirmEmail, {
  message: "Email addresses do not match",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </DialogTitle>
          <DialogDescription>
            Change email for {user.person.firstName} {user.person.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="newEmail">New Email</Label>
            <Input
              id="newEmail"
              type="email"
              {...register("newEmail")}
              placeholder="Enter new email"
              className={errors.newEmail ? "border-red-500" : ""}
            />
            {errors.newEmail && (
              <p className="text-sm text-red-500 mt-1">
                {errors.newEmail.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirmEmail">Confirm New Email</Label>
            <Input
              id="confirmEmail"
              type="email"
              {...register("confirmEmail")}
              placeholder="Confirm new email"
              className={errors.confirmEmail ? "border-red-500" : ""}
            />
            {errors.confirmEmail && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmEmail.message}
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={changeEmail.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={changeEmail.isPending || !isValid}
            >
              {changeEmail.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                "Change Email"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}