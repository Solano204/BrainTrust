"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2 } from "lucide-react";
import { Course } from "@/app/domain/entities/CourseEntities";
import { ImageUploadWithValidation } from '../teacher-student/image-upload-with-validation';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const courseFormSchema = z.object({
  name: z.string()
    .min(3, "El nombre del curso debe tener al menos 3 caracteres")
    .max(100, "El nombre del curso no debe exceder los 100 caracteres")
    .trim(),
  code: z.string()
    .min(2, "El código del curso debe tener al menos 2 caracteres")
    .max(20, "El código del curso no debe exceder los 20 caracteres")
    .regex(/^[A-Z0-9-]+$/i, "El código del curso solo puede contener letras, números y guiones")
    .trim()
    .transform(val => val.toUpperCase()),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no debe exceder los 1000 caracteres")
    .trim(),
  grade: z.string()
    .min(1, "El nivel de grado es requerido")
    .max(50, "El nivel de grado no debe exceder los 50 caracteres")
    .trim(),
  group: z.string()
    .min(1, "El grupo es requerido")
    .max(50, "El grupo no debe exceder los 50 caracteres")
    .trim(),
  urlImage: z.string().optional(),
  active: z.boolean().default(true),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Course;
  onSave: (courseData: Omit<Course, "id" | "teacherId">, courseId?: string, imageFile?: File | null) => void;
  isSaving: boolean;
}

export function CourseFormModal({ open, onClose, initialData, onSave, isSaving }: CourseFormModalProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>(initialData?.urlImage || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      grade: initialData?.grade || "Principiante",
      group: initialData?.group || "Grupo Predeterminado",
      urlImage: initialData?.urlImage || "",
      active: initialData?.active ?? true,
    }
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description,
          grade: initialData.grade,
          group: initialData.group,
          urlImage: initialData.urlImage || "",
          active: initialData.active,
        });
        setImagePreview(initialData.urlImage || "");
        setImageFile(null);
      } else {
        reset({
          name: "",
          code: "",
          description: "",
          grade: "Principiante",
          group: "Grupo Predeterminado",
          urlImage: "",
          active: true,
        });
        setImagePreview("");
        setImageFile(null);
      }
    }
  }, [initialData, open, reset]);

  const handleImageChange = (imageData: { file: File; previewUrl: string; validationType: string } | null) => {
    if (imageData) {
      setImageFile(imageData.file);
      setImagePreview(imageData.previewUrl);
      setValue("urlImage", imageData.previewUrl, { shouldValidate: true });
    } else {
      setImageFile(null);
      setImagePreview("");
      setValue("urlImage", "", { shouldValidate: true });
    }
  };

  const onSubmit = (data: CourseFormData) => {
    const courseData = {
      name: data.name,
      code: data.code,
      description: data.description,
      grade: data.grade,
      group: data.group,
      urlImage: data.urlImage || "",
      active: data.active,
      enrollments: initialData?.enrollments || [],
      units: initialData?.units || []
    };

    onSave(courseData, initialData?.id, imageFile);
  };
return (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="bg-card rounded-3xl border border-border shadow-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">

      {/* ── Encabezado ── */}
      <div className="flex items-center gap-3 px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
          <BookOpen className="w-4 h-4 text-primary" />
        </span>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            {initialData ? "Editar Curso" : "Crear Nuevo Curso"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {initialData
              ? "Actualiza la información del curso a continuación."
              : "Completa los detalles para crear un nuevo curso."}
          </p>
        </div>
      </div>

      {/* ── Formulario ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto flex flex-col"
      >
        <div className="px-5 py-6 sm:px-7 space-y-5 flex-1">

          {/* Nombre del Curso */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-foreground">
              Nombre del Curso *
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder="ej., Introducción a JavaScript"
              disabled={isSaving}
              className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-30 transition-all ${
                errors.name ? 'border-destructive focus:ring-destructive/40' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Código del Curso */}
          <div className="space-y-1.5">
            <label htmlFor="code" className="text-xs font-semibold text-foreground">
              Código del Curso *
            </label>
            <input
              id="code"
              {...register("code")}
              placeholder="ej., JS-101"
              disabled={isSaving}
              className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-30 transition-all ${
                errors.code ? 'border-destructive focus:ring-destructive/40' : 'border-border'
              }`}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-foreground">
              Descripción *
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Describe lo que los estudiantes aprenderán en este curso..."
              rows={4}
              disabled={isSaving}
              className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-30 resize-none transition-all ${
                errors.description ? 'border-destructive focus:ring-destructive/40' : 'border-border'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Nivel + Grupo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="grade" className="text-xs font-semibold text-foreground">
                Nivel de Grado *
              </label>
              <input
                id="grade"
                {...register("grade")}
                placeholder="ej., Principiante"
                disabled={isSaving}
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-30 transition-all ${
                  errors.grade ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                }`}
              />
              {errors.grade && (
                <p className="text-xs text-destructive">{errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="group" className="text-xs font-semibold text-foreground">
                Grupo *
              </label>
              <input
                id="group"
                {...register("group")}
                placeholder="ej., Sección A"
                disabled={isSaving}
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-30 transition-all ${
                  errors.group ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                }`}
              />
              {errors.group && (
                <p className="text-xs text-destructive">{errors.group.message}</p>
              )}
            </div>
          </div>

          {/* Subida de imagen */}
          <ImageUploadWithValidation
            currentImageUrl={imagePreview}
            onImageChange={handleImageChange}
            label="Imagen de Portada del Curso"
            disabled={isSaving}
          />

        </div>

        {/* ── Pie de página ── */}
        <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !isValid}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{initialData ? "Actualizando..." : "Creando..."}</>
              ) : (
                initialData ? "Actualizar Curso" : "Crear Curso"
              )}
            </button>
          </div>
        </div>

      </form>
    </DialogContent>
  </Dialog>
);
};