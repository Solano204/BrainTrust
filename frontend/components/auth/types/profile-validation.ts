import { z } from "zod"

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .trim(),
  
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .trim(),
  
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    errorMap: () => ({ message: "Please select a valid gender" })
  }),
  
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Phone number can only contain numbers, spaces, and +()-")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
    .trim()
    .optional()
    .or(z.literal("")),
})

export const addressSchema = z.object({
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(100, "Street address must be less than 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  
  colony: z
    .string()
    .min(2, "Colony must be at least 2 characters")
    .max(50, "Colony must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  
  municipality: z
    .string()
    .min(2, "Municipality must be at least 2 characters")
    .max(50, "Municipality must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  
  postalCode: z
    .string()
    .regex(/^[0-9]{4,10}$/, "Postal code must be between 4-10 digits")
    .trim()
    .optional()
    .or(z.literal("")),
})

export const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
      "Only JPEG, PNG, GIF, and WebP images are allowed"
    ),
})

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type PasswordFormData = z.infer<typeof passwordSchema>
export type ImageUploadData = z.infer<typeof imageUploadSchema>