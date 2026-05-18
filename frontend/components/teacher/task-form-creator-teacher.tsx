"use client";

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, LinkIcon, X, Users, User, Monitor, BookOpen } from "lucide-react"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"


export function generarCadenaAceptar(formatos: Record<string, string[]>): string {
  const extensiones = Object.values(formatos).flat();
  return extensiones.join(',');
}

const TAMANO_MAXIMO_ARCHIVO_TAREA = 10 * 1024 * 1024; // 10MB
const TIPOS_ARCHIVO_PERMITIDOS_TAREA = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain'
];

export const FORMATOS_ACEPTADOS_TAREA = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],

  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],

  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const esquemaFormularioTarea = z.object({
  title: z.string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no debe exceder los 200 caracteres")
    .trim(),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no debe exceder los 2000 caracteres")
    .trim(),
  instructions: z.string()
    .min(10, "Las instrucciones deben tener al menos 10 caracteres")
    .max(5000, "Las instrucciones no deben exceder los 5000 caracteres")
    .trim(),
  deliveryMode: z.enum(["INDIVIDUAL", "TEAM"], {
    required_error: "Por favor seleccione un modo de entrega"
  }),
  submissionFormat: z.enum(["DIGITAL", "NOTEBOOK"], {
    required_error: "Por favor seleccione un formato de entrega"
  }),
  maxPoints: z.number()
    .min(1, "Los puntos máximos deben ser al menos 1")
    .max(1000, "Los puntos máximos no pueden exceder 1000")
    .int("Los puntos máximos deben ser un número entero"),
  dueDate: z.string()
    .min(1, "La fecha de entrega es requerida"),
  allowLateSubmissions: z.boolean().default(true),
  attachments: z.array(z.object({
    name: z.string(),
    storagePath: z.string(),
    createdAt: z.string()
  })).default([]),
  urls: z.array(z.string().url("Formato de URL inválido")).default([])
}).refine((data) => {
  const fechaHoraEntrega = new Date(data.dueDate)
  return fechaHoraEntrega > new Date()
}, {
  message: "La fecha de entrega debe ser en el futuro",
  path: ["dueDate"]
})

type DatosFormularioTarea = z.infer<typeof esquemaFormularioTarea>

const esquemaUrl = z.string()
  .min(1, "La URL no puede estar vacía")
  .url("Por favor ingrese una URL válida (ej., https://ejemplo.com)")
  .refine((url) => {
    try {
      const parseada = new URL(url)
      return ['http:', 'https:'].includes(parseada.protocol)
    } catch {
      return false
    }
  }, "La URL debe comenzar con http:// o https://")

interface PropsCreadorTarea {
  open: boolean
  onClose: () => void
  onSave: (task: any, files?: File[]) => void
  idCourse: string
  idUnit: string
}

export function CreadorTarea({ open, onClose, onSave, idCourse, idUnit }: PropsCreadorTarea) {
  const [archivosSubidos, setArchivosSubidos] = useState<File[]>([])
  const [nuevaUrl, setNuevaUrl] = useState("")
  const [errorUrl, setErrorUrl] = useState("")
  const [errorArchivo, setErrorArchivo] = useState("")
  const inputArchivoRef = useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<DatosFormularioTarea>({
    resolver: zodResolver(esquemaFormularioTarea),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      deliveryMode: "INDIVIDUAL",
      submissionFormat: "DIGITAL",
      maxPoints: 100,
      dueDate: "",
      allowLateSubmissions: true,
      attachments: [],
      urls: []
    }
  })


  
  const valoresObservados = watch()

function validarArchivo(archivo: File, tiposPermitidos: string[], tamanoMaximo: number): string | null {
  if (archivo.size > tamanoMaximo) {
    return `El archivo "${archivo.name}" excede el límite de ${tamanoMaximo / (1024 * 1024)}MB`;
  }
  
  if (!tiposPermitidos.includes(archivo.type)) {
    return `El archivo "${archivo.name}" tiene un formato no soportado. Permitidos: ${obtenerExtensionesPermitidas(tiposPermitidos)}`;
  }
  
  const extension = archivo.name.split('.').pop()?.toLowerCase();
  const extensionesPermitidas = obtenerArrayExtensionesPermitidas(tiposPermitidos);
  
  if (extension && !extensionesPermitidas.includes(extension)) {
    return `La extensión de archivo ".${extension}" no está permitida`;
  }
  
  return null;
}

function obtenerExtensionesPermitidas(tiposMime: string[]): string {
  const mapaExtensiones: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'image/jpeg': 'JPG/JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP',
    'text/plain': 'TXT',
    'application/zip': 'ZIP',
    'application/x-zip-compressed': 'ZIP'
  };
  
  return tiposMime.map(tipo => mapaExtensiones[tipo] || tipo).join(', ');
}

function obtenerArrayExtensionesPermitidas(tiposMime: string[]): string[] {
  const mapaExtensiones: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'text/plain': ['txt'],
    'application/zip': ['zip'],
    'application/x-zip-compressed': ['zip']
  };
  
  return tiposMime.flatMap(tipo => mapaExtensiones[tipo] || []);
}
const alEnviar = (data: DatosFormularioTarea) => {
  const valoresActualesFormulario = watch()
  
  const tarea = {
    title: data.title,
    description: data.description,
    deliveryMode: data.deliveryMode,
    submissionFormat: data.submissionFormat,
    maxScore: { 
      value: 0, 
      maxPoints: data.maxPoints
    },
    dueDate: data.dueDate,
    allowLateSubmissions: data.allowLateSubmissions,
    instructions: data.instructions,
    attachments: data.attachments,
    urls: valoresActualesFormulario.urls || [], // Usar valoresActualesFormulario en lugar de data
  }
  
  console.log("tarea", tarea)
  console.log("URLs del formulario:", data.urls)
  console.log("URLs de valores observados:", valoresActualesFormulario.urls)
  onSave(tarea, archivosSubidos)
  handleCerrar()
}

  const handleCerrar = () => {
    reset({
      title: "",
      description: "",
      instructions: "",
      deliveryMode: "INDIVIDUAL",
      submissionFormat: "DIGITAL",
      maxPoints: 100,
      dueDate: "",
      allowLateSubmissions: true,
      attachments: [],
      urls: []
    })
    setArchivosSubidos([])
    setNuevaUrl("")
    setErrorUrl("")
    setErrorArchivo("")
    onClose()
  }

  
  const handleSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
   const archivos = Array.from(e.target.files || []);
  
  if (archivos.length === 0) return;
  
  for (const archivo of archivos) {
    const error = validarArchivo(archivo, TIPOS_ARCHIVO_PERMITIDOS_TAREA, TAMANO_MAXIMO_ARCHIVO_TAREA);
    if (error) {
      setErrorArchivo(error);
      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }
      return;
    }
  }
  
  setErrorArchivo("");
  setArchivosSubidos(prev => [...prev, ...archivos]);
  
  const nuevosAdjuntos = archivos.map(archivo => ({
    name: archivo.name,
    storagePath: `/asignaciones/${Date.now()}_${archivo.name}`,
    createdAt: new Date().toISOString()
  }));
  
  const adjuntosActuales = valoresObservados.attachments || [];
  setValue("attachments", [...adjuntosActuales, ...nuevosAdjuntos], { 
    shouldValidate: true 
  });
  
  if (inputArchivoRef.current) {
    inputArchivoRef.current.value = "";
  }
};

const handleAgregarUrl = () => {
  const urlRecortada = nuevaUrl.trim()
  
  const validacion = esquemaUrl.safeParse(urlRecortada)
  
  if (!validacion.success) {
    setErrorUrl(validacion.error.errors[0].message)
    return
  }
  
  const urlsActuales = valoresObservados.urls || []
  if (urlsActuales.includes(urlRecortada)) {
    setErrorUrl("Esta URL ya ha sido agregada")
    return
  }
  
  setErrorUrl("")
  
  setValue("urls", [...urlsActuales, urlRecortada], {
    shouldValidate: true,
    shouldDirty: true,
    shouldTouch: true 
  })
  setNuevaUrl("")
}

  const eliminarArchivo = (indice: number) => {
    const nombreArchivo = valoresObservados.attachments[indice].name
    setArchivosSubidos(prev => prev.filter(archivo => archivo.name !== nombreArchivo))
    const adjuntosActuales = valoresObservados.attachments || []
    setValue("attachments", adjuntosActuales.filter((_, i) => i !== indice), { shouldValidate: true })
    setErrorArchivo("")
  }

const eliminarUrl = (indice: number) => {
  const urlsActuales = valoresObservados.urls || []
  setValue("urls", urlsActuales.filter((_, i) => i !== indice), { 
    shouldValidate: true,
    shouldDirty: true,
    shouldTouch: true 
  })
  setErrorUrl("")
}

  const handleKeyDownUrl = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAgregarUrl()
    }
  } 
return (
  <Dialog open={open} onOpenChange={handleCerrar}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
          Crear Nueva Tarea
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(alEnviar)} className="space-y-4 sm:space-y-6 py-4">
        <div>
          <Label className="font-bold mb-2 block text-sm sm:text-base">Título de la Tarea *</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ej. Tarea 1: Trabajo de Investigación"
                className={`text-sm ${errors.title ? "border-destructive" : ""}`}
              />
            )}
          />
          {errors.title && (
            <p className="text-xs sm:text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label className="font-bold mb-2 block text-sm sm:text-base">Descripción *</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Proporcione una descripción detallada de la tarea..."
                rows={3}
                className={`text-sm ${errors.description ? "border-destructive" : ""}`}
              />
            )}
          />
          {errors.description && (
            <p className="text-xs sm:text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label className="font-bold mb-2 block text-sm sm:text-base">Instrucciones *</Label>
          <Controller
            name="instructions"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Proporcione instrucciones detalladas para los estudiantes..."
                rows={4}
                className={`text-sm ${errors.instructions ? "border-destructive" : ""}`}
              />
            )}
          />
          {errors.instructions && (
            <p className="text-xs sm:text-sm text-destructive mt-1">{errors.instructions.message}</p>
          )}
        </div>

        <div className="border border-border rounded-lg p-3 sm:p-4 space-y-4">
          <Label className="font-bold text-sm sm:text-base">Modo de Entrega *</Label>
          <Controller
            name="deliveryMode"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange("INDIVIDUAL")}
                  className={`p-3 sm:p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                    field.value === "INDIVIDUAL" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <User className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="font-medium text-sm">Individual</span>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Cada estudiante entrega su propio trabajo
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => field.onChange("TEAM")}
                  className={`p-3 sm:p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                    field.value === "TEAM" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="font-medium text-sm">Grupal</span>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Los equipos entregan una tarea en conjunto
                  </p>
                </button>
              </div>
            )}
          />
          {errors.deliveryMode && (
            <p className="text-xs sm:text-sm text-destructive">{errors.deliveryMode.message}</p>
          )}
        </div>

        <div className="border border-border rounded-lg p-3 sm:p-4 space-y-4">
          <Label className="font-bold text-sm sm:text-base">Formato de Entrega *</Label>
          <Controller
            name="submissionFormat"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange("DIGITAL")}
                  className={`p-3 sm:p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                    field.value === "DIGITAL" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Monitor className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="font-medium text-sm">Digital</span>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Entregar archivos y texto en línea
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => field.onChange("NOTEBOOK")}
                  className={`p-3 sm:p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                    field.value === "NOTEBOOK" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="font-medium text-sm">Cuaderno</span>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Entrega de cuaderno físico
                  </p>
                </button>
              </div>
            )}
          />
          {errors.submissionFormat && (
            <p className="text-xs sm:text-sm text-destructive">{errors.submissionFormat.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label className="font-bold mb-2 block text-sm">Puntos Máximos *</Label>
            <Controller
              name="maxPoints"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  min="1"
                  className={`text-sm ${errors.maxPoints ? "border-destructive" : ""}`}
                />
              )}
            />
            {errors.maxPoints && (
              <p className="text-xs sm:text-sm text-destructive mt-1">{errors.maxPoints.message}</p>
            )}
          </div>
          
          <div>
            <Label className="font-bold mb-2 block text-sm">Fecha de Entrega *</Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Input 
                  type="datetime-local"
                  {...field}
                  className={`text-sm ${errors.dueDate ? "border-destructive" : ""}`}
                />
              )}
            />
            {errors.dueDate && (
              <p className="text-xs sm:text-sm text-destructive mt-1">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
          <div>
            <Label className="font-bold text-sm sm:text-base">Permitir Entregas Tardías</Label>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Los estudiantes pueden entregar después de la fecha límite (con posibles penalizaciones)
            </p>
          </div>
          <Controller
            name="allowLateSubmissions"
            control={control}
            render={({ field }) => (
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="border border-border rounded-lg p-3 sm:p-4 space-y-4">
          <Label className="font-bold text-sm sm:text-base">Materiales de Apoyo</Label>

          <div>
            <Label className="text-xs sm:text-sm mb-2 block">Subir Archivos</Label>
            
            {errorArchivo && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-3">
                <p className="text-xs sm:text-sm text-destructive">{errorArchivo}</p>
              </div>
            )}
            
            <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input 
                ref={inputArchivoRef}
                type="file" 
                multiple 
                onChange={handleSubirArchivo}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt"
                className="hidden" 
                id="file-upload-tarea" 
              />
              <label htmlFor="file-upload-tarea" className="cursor-pointer block">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Haga clic para subir archivos o arrastre y suelte
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, PPT, PPTX, imágenes, TXT (Máx 10MB cada uno)
                </p>
                {archivosSubidos.length > 0 && (
                  <p className="text-xs text-primary mt-2">
                    {archivosSubidos.length} archivo(s) seleccionado(s)
                  </p>
                )}
              </label>
            </div>
            
            {(valoresObservados.attachments?.length || 0) > 0 && (
              <div className="mt-3 space-y-2">
                {valoresObservados.attachments?.map((archivo, indice) => (
                  <div key={indice} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs sm:text-sm truncate text-foreground">{archivo.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {archivosSubidos[indice] && 
                          `(${Math.round(archivosSubidos[indice].size / 1024)} KB)`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarArchivo(indice)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* URLs */}
          <div>
            <Label className="text-xs sm:text-sm mb-2 block">Agregar URLs</Label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex-1">
                <Input
                  value={nuevaUrl}
                  onChange={(e) => {
                    setNuevaUrl(e.target.value)
                    setErrorUrl("")
                  }}
                  placeholder="https://ejemplo.com"
                  onKeyDown={handleKeyDownUrl}
                  className={`text-sm ${errorUrl ? "border-destructive" : ""}`}
                />
                {errorUrl && (
                  <p className="text-xs sm:text-sm text-destructive mt-1">{errorUrl}</p>
                )}
              </div>
              <Button 
                type="button" 
                onClick={handleAgregarUrl} 
                variant="outline"
                disabled={!nuevaUrl.trim()}
                className="text-sm flex-shrink-0"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            
            {(valoresObservados.urls?.length || 0) > 0 && (
              <div className="space-y-2">
                {valoresObservados.urls?.map((url, indice) => (
                  <div key={indice} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-primary hover:underline truncate"
                    >
                      {url}
                    </a>
                    <button
                      type="button"
                      onClick={() => eliminarUrl(indice)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
          <Button type="button" variant="outline" onClick={handleCerrar} className="text-sm">
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={!isValid}
            className="text-sm"
          >
            Crear Tarea
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)
}