"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, Paperclip, LinkIcon, FileText } from "lucide-react";
import { Page } from "@/app/domain/entities/CourseEntities";
import { Document } from "@/app/domain/valueObjects/CourseValues";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const PAGE_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PAGE_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
];

const pageFormSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no debe exceder los 200 caracteres")
    .trim(),
  sectionContent: z
    .string()
    .min(20, "El contenido debe tener al menos 20 caracteres")
    .max(10000, "El contenido no debe exceder los 10,000 caracteres")
    .trim(),
  urlsSupport: z.array(z.string().url("Formato de URL inválido")).default([]),
  attachments: z.array(z.any()).default([]),
});

type PageFormData = z.infer<typeof pageFormSchema>;

const urlSchema = z
  .string()
  .min(1, "La URL no puede estar vacía")
  .url("Por favor, ingresa una URL válida (ej., https://ejemplo.com)")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, "La URL debe comenzar con http:// o https://");

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];

export const PAGE_ACCEPTED_FORMATS = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],

  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],

  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
};

interface PageCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (page: any, files?: File[]) => void;
  unitId: string;
  courseId: string;
}

export function PageCreator({
  open,
  onClose,
  onSave,
  unitId,
  courseId,
}: PageCreatorProps) {
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      sectionContent:
        "Crea contenido atractivo para tus estudiantes aquí. Puedes incluir:\n\n• Objetivos de aprendizaje\n• Conceptos clave\n• Ejemplos y explicaciones\n• Consejos de estudio\n• Recursos adicionales",
      attachments: [],
      urlsSupport: [],
    },
  });

  const watchedValues = watch();
  const wordCount = watchedValues.sectionContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const handleSave = (data: PageFormData) => {
    const page: Page = {
      ...data,
      id: `page-${Date.now()}`,
      courseId: courseId,
      unitId: unitId,
      createdAt: new Date().toISOString(),
    };

    onSave(page, attachmentFiles);
    handleClose();
  };

  const handleClose = () => {
    reset({
      title: "",
      sectionContent:
        "Crea contenido atractivo para tus estudiantes aquí. Puedes incluir:\n\n• Objetivos de aprendizaje\n• Conceptos clave\n• Ejemplos y explicaciones\n• Consejos de estudio\n• Recursos adicionales",
      attachments: [],
      urlsSupport: [],
    });
    setAttachmentFiles([]);
    setNewUrl("");
    setUrlError("");
    setFileError("");
    onClose();
  };

  function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): string | null {
    if (file.size > maxSize) {
      return `El archivo "${file.name}" excede el límite de ${maxSize / (1024 * 1024)}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `El archivo "${
        file.name
      }" tiene un formato no soportado. Permitidos: ${getAllowedExtensions(
        allowedTypes
      )}`;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = getAllowedExtensionsArray(allowedTypes);

    if (extension && !allowedExtensions.includes(extension)) {
      return `La extensión de archivo ".${extension}" no está permitida`;
    }

    return null;
  }

  function getAllowedExtensions(mimeTypes: string[]): string {
    const extensionMap: Record<string, string> = {
      "application/pdf": "PDF",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
      "application/vnd.ms-powerpoint": "PPT",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "PPTX",
      "image/jpeg": "JPG/JPEG",
      "image/png": "PNG",
      "image/gif": "GIF",
      "image/webp": "WEBP",
      "text/plain": "TXT",
      "application/zip": "ZIP",
      "application/x-zip-compressed": "ZIP",
    };

    return mimeTypes.map((type) => extensionMap[type] || type).join(", ");
  }

  function getAllowedExtensionsArray(mimeTypes: string[]): string[] {
    const extensionMap: Record<string, string[]> = {
      "application/pdf": ["pdf"],
      "application/msword": ["doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ["docx"],
      "application/vnd.ms-powerpoint": ["ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ["pptx"],
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/gif": ["gif"],
      "image/webp": ["webp"],
      "text/plain": ["txt"],
      "application/zip": ["zip"],
      "application/x-zip-compressed": ["zip"],
    };

    return mimeTypes.flatMap((type) => extensionMap[type] || []);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const error = validateFile(file, PAGE_ALLOWED_FILE_TYPES, PAGE_MAX_FILE_SIZE);
      if (error) {
        setFileError(error);
        e.target.value = ""; // Reset input
        return;
      }
    }

    setFileError("");
    setAttachmentFiles((prev) => [...prev, ...fileArray]);

    const newDocuments: Document[] = fileArray.map((file) => ({
      name: file.name,
      storagePath: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    }));

    const currentAttachments = watchedValues.attachments || [];
    setValue("attachments", [...currentAttachments, ...newDocuments], {
      shouldValidate: true,
    });

    e.target.value = "";
  }
};


  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    const currentAttachments = watchedValues.attachments || [];
    setValue(
      "attachments",
      currentAttachments.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
    setFileError("");
  };

  const addUrl = () => {
    const trimmedUrl = newUrl.trim();

    const validation = urlSchema.safeParse(trimmedUrl);

    if (!validation.success) {
      setUrlError(validation.error.errors[0].message);
      return;
    }

    const currentUrls = watchedValues.urlsSupport || [];
    if (currentUrls.includes(trimmedUrl)) {
      setUrlError("Esta URL ya ha sido agregada");
      return;
    }

    setUrlError("");
    setValue("urlsSupport", [...currentUrls, trimmedUrl], {
      shouldValidate: true,
    });
    setNewUrl("");
  };

  const removeUrl = (index: number) => {
    const currentUrls = watchedValues.urlsSupport || [];
    setValue(
      "urlsSupport",
      currentUrls.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
    setUrlError("");
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUrl();
    }
  };

 return (
  <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="bg-card rounded-3xl border border-border shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 sm:max-w-[95vw] md:max-w-6xl">

      {/* ── Encabezado ── */}
      <div className="flex items-center gap-3 px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
          <FileText className="w-4 h-4 text-primary" />
        </span>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Crear Página de Información
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Construye una página de contenido estructurada para tus estudiantes
          </p>
        </div>
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={handleSubmit(handleSave)} className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-5 py-6 sm:px-7 space-y-6 flex-1">

          {/* Título de la página */}
          <div className="space-y-1.5">
            <label htmlFor="page-title" className="text-xs font-semibold text-foreground">
              Título de la Página *
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="page-title"
                  placeholder="Ingresa el título de la página (ej., Introducción a JavaScript)"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                    errors.title ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                  }`}
                />
              )}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Un título claro y descriptivo ayuda a los estudiantes a entender de qué trata esta página.
            </p>
          </div>

          {/* Tarjeta de vista previa */}
          <div className="p-5 rounded-2xl border-l-4 border-l-primary border-t border-r border-b border-border bg-primary/5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Vista Previa</span>
              </div>

              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                {watchedValues.title || "Vista Previa del Título de la Página"}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[80px]">
                {watchedValues.sectionContent || "El contenido aparecerá aquí..."}
              </p>

              {((watchedValues.attachments?.length || 0) > 0 ||
                (watchedValues.urlsSupport?.length || 0) > 0) && (
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Vista Previa de Materiales de Apoyo:
                  </p>

                  {(watchedValues.attachments?.length || 0) > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Archivos:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {watchedValues.attachments?.slice(0, 3).map((file: Document, index: number) => (
                          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg text-xs text-foreground">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{file.name}</span>
                          </span>
                        ))}
                        {(watchedValues.attachments?.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground">
                            +{(watchedValues.attachments?.length || 0) - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {(watchedValues.urlsSupport?.length || 0) > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Enlaces:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {watchedValues.urlsSupport?.slice(0, 3).map((url: string, index: number) => (
                          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg text-xs text-foreground">
                            <LinkIcon className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{url.replace(/^https?:\/\//, "")}</span>
                          </span>
                        ))}
                        {(watchedValues.urlsSupport?.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground">
                            +{(watchedValues.urlsSupport?.length || 0) - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sección de contenido */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <label htmlFor="section-content" className="text-xs font-semibold text-foreground">
                Contenido *
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {wordCount} {wordCount === 1 ? "palabra" : "palabras"}
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Escribe tu contenido aquí. Puedes usar formato tipo markdown:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-3">
                {[
                  'Usa líneas en blanco para separar párrafos',
                  'Comienza líneas con • para viñetas',
                  'Usa **negrita** o *cursiva* para énfasis',
                  'Agrega enlaces: [texto](https://ejemplo.com)',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <Controller
              name="sectionContent"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="section-content"
                  placeholder="Escribe tu contenido aquí... Puedes incluir objetivos de aprendizaje, explicaciones, ejemplos, consejos de estudio, etc."
                  rows={12}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 resize-y min-h-[200px] transition-all ${
                    errors.sectionContent ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                  }`}
                />
              )}
            />
            {errors.sectionContent && (
              <p className="text-xs text-destructive">{errors.sectionContent.message}</p>
            )}
          </div>

          {/* Materiales de apoyo */}
          <div className="space-y-6 border-t border-border pt-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Materiales de Apoyo
              </h3>
              <p className="text-xs text-muted-foreground">
                Agrega archivos y enlaces para apoyar tu contenido. Estarán disponibles para los estudiantes.
              </p>
            </div>

            {/* Archivos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Archivos ({watchedValues.attachments?.length || 0})
                </label>
                {(watchedValues.attachments?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => { setValue("attachments", [], { shouldValidate: true }); setAttachmentFiles([]); setFileError(""); }}
                    className="text-xs font-semibold text-destructive hover:opacity-80 transition-all"
                  >
                    Eliminar Todos
                  </button>
                )}
              </div>

              {fileError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive">{fileError}</p>
                </div>
              )}

              {(watchedValues.attachments?.length || 0) > 0 ? (
                <div className="space-y-1.5">
                  {watchedValues.attachments?.map((file: Document, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Agregado el {new Date(file.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-border text-muted-foreground">
                  <Paperclip className="w-7 h-7 mb-2 opacity-40" />
                  <p className="text-xs">Aún no se han subido archivos</p>
                </div>
              )}

              {/* Zona de subida de archivos */}
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground mb-1">Haz clic para subir archivos</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, imágenes, archivos de texto, ZIP (Máx: 10MB cada uno)
                  </p>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip"
                className="hidden"
              />
            </div>

            {/* URLs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Enlaces ({watchedValues.urlsSupport?.length || 0})
                </label>
                {(watchedValues.urlsSupport?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => { setValue("urlsSupport", [], { shouldValidate: true }); setUrlError(""); }}
                    className="text-xs font-semibold text-destructive hover:opacity-80 transition-all"
                  >
                    Eliminar Todos
                  </button>
                )}
              </div>

              {(watchedValues.urlsSupport?.length || 0) > 0 && (
  <div className="space-y-1.5">
    {watchedValues.urlsSupport?.map((url: string, index: number) => (
      <div 
        key={index} 
        className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
          
          {/* CORREGIDO: Etiqueta <a> añadida aquí */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline truncate block"
          >
            {url}
          </a>
        </div>

        <button
          type="button"
          onClick={() => removeUrl(index)}
          className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
)}

              {/* Input de URL */}
              <div className="space-y-1.5">
                <label htmlFor="new-url" className="text-xs font-semibold text-foreground">
                  Agregar un enlace
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      id="new-url"
                      value={newUrl}
                      onChange={(e) => { setNewUrl(e.target.value); setUrlError(""); }}
                      placeholder="https://ejemplo.com/recurso-de-aprendizaje"
                      onKeyDown={handleUrlKeyDown}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                        urlError ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                      }`}
                    />
                    {urlError && (
                      <p className="text-xs text-destructive mt-1">{urlError}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addUrl}
                    disabled={!newUrl.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Agregar Enlace
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Agrega enlaces a recursos externos, documentación o materiales relacionados.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Pie de página ── */}
        <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 flex items-center justify-center px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Crear Página
            </button>
          </div>
        </div>

      </form>
    </DialogContent>
  </Dialog>
 )
}