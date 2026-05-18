"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Plus, Users, Loader2 } from "lucide-react";
import { Team } from "@/app/domain/entities/CourseEntities";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const esquemaFormularioEquipo = z.object({
  name: z.string()
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(100, "El nombre del equipo no debe exceder los 100 caracteres")
    .trim()
    .refine((nombre) => {
      return /^[a-zA-Z0-9\s\-_]+$/.test(nombre)
    }, "El nombre del equipo solo puede contener letras, números, espacios, guiones y guiones bajos"),
  description: z.string()
    .max(500, "La descripción no debe exceder los 500 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  maxMembers: z.number()
    .min(1, "El equipo debe tener al menos 1 miembro")
    .max(20, "El equipo no puede exceder los 20 miembros")
    .int("El número máximo de miembros debe ser un número entero"),
  active: z.boolean().default(true)
});

type DatosFormularioEquipo = z.infer<typeof esquemaFormularioEquipo>;

interface PropsModalFormularioEquipo {
  open: boolean;
  onClose: () => void;
  onSave: (
    datosEquipo: Omit<Team, "courseId" | "leaderId" | "members" | "createdAt">
  ) => void;
  isSaving?: boolean;
}

export function ModalFormularioEquipo({
  open,
  onClose,
  onSave,
  isSaving = false,
}: PropsModalFormularioEquipo) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<DatosFormularioEquipo>({
    resolver: zodResolver(esquemaFormularioEquipo),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      maxMembers: 4,
      active: true,
    }
  });

  React.useEffect(() => {
    if (!open) {
      // Reiniciar formulario cuando se cierra el modal
      reset({
        name: "",
        description: "",
        maxMembers: 4,
        active: true,
      });
    }
  }, [open, reset]);

  const alEnviar = (data: DatosFormularioEquipo) => {
    onSave(data);
  };

  if (!open) return null;
return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit(alEnviar)}>
          {/* Encabezado */}
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <Users className="h-6 w-6 text-primary" /> Crear Nuevo Equipo
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cuerpo del Formulario */}
          <div className="p-6 space-y-6 bg-card">
            {/* Nombre del Equipo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-foreground">
                Nombre del Equipo *
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    disabled={isSaving}
                    placeholder="Ingrese el nombre del equipo"
                    className={errors.name ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use letras, números, espacios, guiones o guiones bajos
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-foreground">
                Descripción
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    rows={3}
                    placeholder="Describa el propósito o enfoque del equipo..."
                    disabled={isSaving}
                    className={errors.description ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Miembros Máximos */}
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="font-semibold text-foreground">
                Miembros Máximos *
              </Label>
              <Controller
                name="maxMembers"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="maxMembers"
                    type="number"
                    min="1"
                    max="20"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    disabled={isSaving}
                    className={errors.maxMembers ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.maxMembers && (
                <p className="text-sm text-destructive">{errors.maxMembers.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Número máximo de estudiantes permitidos en este equipo (1-20)
              </p>
            </div>

            {/* Estado Activo */}
            <div className="space-y-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Label htmlFor="active" className="font-semibold text-foreground flex items-center gap-2">
                    <input
                      id="active"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSaving}
                      className="rounded accent-primary"
                    />
                    Equipo Activo
                  </Label>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Los equipos inactivos no estarán disponibles para nuevas tareas
              </p>
            </div>

            {/* Cuadro de Información */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">
                Información de Creación de Equipo
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• El equipo se creará sin miembros inicialmente</li>
                <li>• Puede agregar miembros después de la creación</li>
                <li>• El líder del equipo se puede asignar más tarde</li>
                <li>• El nombre del equipo debe ser único dentro del curso</li>
              </ul>
            </div>

            {/* Errores de Validación */}
            {Object.keys(errors).length > 0 && !isValid && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Por favor, corrija los siguientes errores:
                </h4>
                <ul className="text-sm text-destructive space-y-1">
                  {errors.name && <li>• {errors.name.message}</li>}
                  {errors.description && <li>• {errors.description.message}</li>}
                  {errors.maxMembers && <li>• {errors.maxMembers.message}</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Pie de página */}
          <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !isValid}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSaving ? "Creando..." : "Crear Equipo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}