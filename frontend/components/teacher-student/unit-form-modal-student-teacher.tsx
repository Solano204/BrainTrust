"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { CourseUnit } from "@/app/domain/entities/CourseEntities";
import { ImageUploadWithValidation } from './image-upload-with-validation';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const esquemaFormularioUnidad = z.object({
  name: z.string()
    .min(3, "El nombre de la unidad debe tener al menos 3 caracteres")
    .max(150, "El nombre de la unidad no debe exceder los 150 caracteres")
    .trim(),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no debe exceder los 1000 caracteres")
    .trim(),
  numUnity: z.number()
    .min(1, "El número de unidad debe ser al menos 1")
    .max(100, "El número de unidad no puede exceder 100")
    .int("El número de unidad debe ser un número entero"),
  urlImage: z.string().optional(),
});

type DatosFormularioUnidad = z.infer<typeof esquemaFormularioUnidad>;

interface PropsModalFormularioUnidad {
  open: boolean;
  onClose: () => void;
  initialData?: CourseUnit;
  onSave: (datosUnidad: Omit<CourseUnit, "id" | "courseId" | "resources">, unitId?: string, imageFile?: File | null) => void;
  isSaving: boolean;
}

export function ModalFormularioUnidad({ open, onClose, initialData, onSave, isSaving }: PropsModalFormularioUnidad) {
  const [archivoImagen, setArchivoImagen] = React.useState<File | null>(null);
  const [vistaPreviaImagen, setVistaPreviaImagen] = React.useState<string>(initialData?.urlImage || "");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<DatosFormularioUnidad>({
    resolver: zodResolver(esquemaFormularioUnidad),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      numUnity: initialData?.numUnity || 1,
      urlImage: initialData?.urlImage || "",
    }
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
          numUnity: initialData.numUnity,
          urlImage: initialData.urlImage || "",
        });
        setVistaPreviaImagen(initialData.urlImage || "");
        setArchivoImagen(null);
      } else {
        reset({
          name: "",
          description: "",
          numUnity: 1,
          urlImage: "",
        });
        setVistaPreviaImagen("");
        setArchivoImagen(null);
      }
    }
  }, [initialData, open, reset]);

  const handleCambioImagen = (datosImagen: { file: File; previewUrl: string; validationType: string } | null) => {
    if (datosImagen) {
      setArchivoImagen(datosImagen.file);
      setVistaPreviaImagen(datosImagen.previewUrl);
      setValue("urlImage", datosImagen.previewUrl, { shouldValidate: true });
    } else {
      setArchivoImagen(null);
      setVistaPreviaImagen("");
      setValue("urlImage", "", { shouldValidate: true });
    }
  };

  const alEnviar = (data: DatosFormularioUnidad) => {
    const datosUnidad = {
      name: data.name,
      description: data.description,
      numUnity: data.numUnity,
      urlImage: data.urlImage || "",
    };

    onSave(datosUnidad, initialData?.id, archivoImagen);
  };
return (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-foreground">
          {initialData ? "Editar Unidad" : "Crear Nueva Unidad"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {initialData
            ? "Actualice la información de la unidad a continuación."
            : "Complete los detalles para crear una nueva unidad para este curso."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(alEnviar)} className="space-y-6 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Nombre de la Unidad *</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="name"
                placeholder="ej., Módulo 1: Introducción a JavaScript"
                disabled={isSaving}
                className={`border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent ${
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            )}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">Descripción *</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="description"
                placeholder="Describa lo que los estudiantes aprenderán en esta unidad..."
                rows={4}
                disabled={isSaving}
                className={`border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent ${
                  errors.description ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {initialData && (
          <div className="space-y-2">
            <Label htmlFor="numUnity" className="text-foreground">Número de Unidad</Label>
            <Controller
              name="numUnity"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="numUnity"
                  type="number"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  min={1}
                  disabled={isSaving}
                  className={`border-border bg-background text-foreground focus-visible:ring-accent ${
                    errors.numUnity ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              )}
            />
            {errors.numUnity && (
              <p className="text-sm text-destructive">{errors.numUnity.message}</p>
            )}
          </div>
        )}

        <ImageUploadWithValidation
          currentImageUrl={vistaPreviaImagen}
          onImageChange={handleCambioImagen}
          label="Imagen de Portada de la Unidad"
          disabled={isSaving}
        />

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSaving || !isValid}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              initialData ? "Actualizar Unidad" : "Crear Unidad"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-border hover:bg-secondary"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
}