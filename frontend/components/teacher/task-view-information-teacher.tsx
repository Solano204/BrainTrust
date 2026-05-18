"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  FileText, 
  LinkIcon, 
  Paperclip, 
  Award,
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Loader2,
  Upload,
  Download,
  Edit,
  Save,
  XCircle,
  Link2,
  Monitor,
  BookOpen
} from "lucide-react";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { Document } from "@/app/domain/valueObjects/CourseValues";
import { useAssignmentAttachmentMutations, useAssignmentLinkMutations, useAssignmentMutations } from "../teacher-student/hooks/assignment-hooks";

interface PropsVistaInfoTarea {
  assignment: Assignment;
  onClose: () => void;
}

export function VistaInfoTarea({ assignment, onClose }: PropsVistaInfoTarea) {
  const mutacionesAdjuntos = useAssignmentAttachmentMutations();
  const mutacionesEnlaces = useAssignmentLinkMutations();
  const { updateAssignment } = useAssignmentMutations();
  const [modoEdicion, setModoEdicion] = React.useState(false);
  
 const [datosEdicion, setDatosEdicion] = React.useState({
    title: assignment.title,
    description: assignment.description,
    instructions: assignment.instructions || "",
    maxPoints: assignment.maxScore.maxPoints.toString(),
    dueDate: assignment.dueDate || "",
    allowLateSubmissions: assignment.allowLateSubmissions,
    deliveryMode: assignment.deliveryMode,
    submissionFormat: assignment.submissionFormat || "DIGITAL" // NUEVO
  });
  
  const [nuevaUrl, setNuevaUrl] = React.useState("");
  const [agregandoUrl, setAgregandoUrl] = React.useState(false);
  
  const [agregandoMultiplesUrls, setAgregandoMultiplesUrls] = React.useState(false);
  const [entradaUrl, setEntradaUrl] = React.useState("");
  const [urlsSeleccionadas, setUrlsSeleccionadas] = React.useState<string[]>([]);
  
  const [archivosSeleccionados, setArchivosSeleccionados] = React.useState<File[]>([]);
  const [agregandoArchivos, setAgregandoArchivos] = React.useState(false);
  const referenciaInputArchivo = React.useRef<HTMLInputElement>(null);

  console.log("tarea en vista info", assignment);
  React.useEffect(() => {
    setDatosEdicion({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      maxPoints: assignment.maxScore.maxPoints.toString(),
      dueDate: assignment.dueDate || "",
      allowLateSubmissions: assignment.allowLateSubmissions,
      deliveryMode: assignment.deliveryMode,
      submissionFormat: assignment.submissionFormat
    });
  }, [assignment]);

  const esUrlValida = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAgregarUrlALista = () => {
    const urlRecortada = entradaUrl.trim();
    if (!urlRecortada) return;
    
    if (!esUrlValida(urlRecortada)) {
      alert("Por favor ingrese una URL válida (ej., https://ejemplo.com)");
      return;
    }
    
    if (urlsSeleccionadas.includes(urlRecortada)) {
      alert("Esta URL ya está en la lista");
      return;
    }
    
    setUrlsSeleccionadas(prev => [...prev, urlRecortada]);
    setEntradaUrl("");
  };

  const eliminarUrlSeleccionada = (indice: number) => {
    setUrlsSeleccionadas(prev => prev.filter((_, i) => i !== indice));
  };

  const handleSubirMultiplesUrls = async () => {
    if (urlsSeleccionadas.length === 0) return;

    try {
      await mutacionesEnlaces.addMultipleLinks.mutateAsync({
        assignmentId: assignment.id,
        urls: urlsSeleccionadas
      });
      setUrlsSeleccionadas([]);
      setEntradaUrl("");
      setAgregandoMultiplesUrls(false);
    } catch (error) {
      console.error("Error al subir URLs:", error);
    }
  };

  const handleGuardarEdiciones = async () => {
    try {
      await updateAssignment.mutateAsync({
        assignmentId: assignment.id,
        assignmentData: {
          title: datosEdicion.title,
          description: datosEdicion.description,
          instructions: datosEdicion.instructions,
          maxScore: {
            value: 0,
            maxPoints: parseFloat(datosEdicion.maxPoints)
          },
          dueDate: datosEdicion.dueDate || null,
          allowLateSubmissions: datosEdicion.allowLateSubmissions,
          deliveryMode: datosEdicion.deliveryMode,
          submissionFormat: datosEdicion.submissionFormat
        }
      });
      setModoEdicion(false);
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  const handleCancelarEdicion = () => {
    setDatosEdicion({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      maxPoints: assignment.maxScore.maxPoints.toString(),
      dueDate: assignment.dueDate || "",
      allowLateSubmissions: assignment.allowLateSubmissions,
      deliveryMode: assignment.deliveryMode,
      submissionFormat: assignment.submissionFormat
    });
    setModoEdicion(false);
  };

  const handleSubirArchivoUnico = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    try {
      await mutacionesAdjuntos.addAttachment.mutateAsync({
        assignmentId: assignment.id,
        file: archivo
      });
    } catch (error) {
      console.error("Error al subir archivo:", error);
    }

    if (referenciaInputArchivo.current) {
      referenciaInputArchivo.current.value = "";
    }
  };

  const handleSubirMultiplesArchivos = async () => {
    if (archivosSeleccionados.length === 0) return;

    try {
      await mutacionesAdjuntos.addMultipleAttachments.mutateAsync({
        assignmentId: assignment.id,
        files: archivosSeleccionados
      });
      setArchivosSeleccionados([]);
      setAgregandoArchivos(false);
    } catch (error) {
      console.error("Error al subir archivos:", error);
    }
  };

  const handleSeleccionArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    setArchivosSeleccionados(prev => [...prev, ...archivos]);
  };

  const eliminarArchivoSeleccionado = (indice: number) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== indice));
  };

  const handleAgregarUrl = async () => {
    if (!nuevaUrl.trim()) return;

    if (!esUrlValida(nuevaUrl.trim())) {
      alert("Por favor ingrese una URL válida (ej., https://ejemplo.com)");
      return;
    }

    try {
      await mutacionesEnlaces.addLink.mutateAsync({
        assignmentId: assignment.id,
        url: nuevaUrl.trim()
      });
      setNuevaUrl("");
      setAgregandoUrl(false);
    } catch (error) {
      console.error("Error al agregar URL:", error);
    }
  };

  const handleEliminarUrl = async (url: string) => {
    try {
      await mutacionesEnlaces.removeLink.mutateAsync({
        assignmentId: assignment.id,
        url: url
      });
    } catch (error) {
      console.error("Error al eliminar URL:", error);
    }
  };

  const handleEliminarAdjunto = async (nombreDocumento: string, rutaAlmacenamiento: string) => {

    console.log("Eliminando adjunto:", nombreDocumento, rutaAlmacenamiento);
    try {
      await mutacionesAdjuntos.removeAttachment.mutateAsync({
        assignmentId: assignment.id,
        documentName: nombreDocumento,
        storagePath: rutaAlmacenamiento
      });
    } catch (error) {
      console.error("Error al eliminar adjunto:", error);
    }
  };

  

  const handleLimpiarTodasUrls = async () => {
    if (!confirm("¿Está seguro de que desea eliminar todas las URLs?")) return;

    try {
      await mutacionesEnlaces.clearLinks.mutateAsync(assignment.id);
    } catch (error) {
      console.error("Error al limpiar URLs:", error);
    }
  };

  const cargando = 
    mutacionesAdjuntos.addAttachment.isPending ||
    mutacionesAdjuntos.addMultipleAttachments.isPending ||
    mutacionesAdjuntos.removeAttachment.isPending ||
    mutacionesAdjuntos.clearAttachments.isPending ||
    mutacionesEnlaces.addLink.isPending ||
    mutacionesEnlaces.addMultipleLinks.isPending ||
    mutacionesEnlaces.removeLink.isPending ||
    mutacionesEnlaces.clearLinks.isPending ||
    updateAssignment.isPending;

  const formatearFecha = (fechaString: string | null) => {
    if (!fechaString) return "Sin fecha de entrega";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCreacion = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const obtenerTiempoRestante = (fechaEntrega: string | null) => {
    if (!fechaEntrega) return { text: "Sin fecha de entrega", color: "gray" };
    
    const ahora = new Date();
    const entrega = new Date(fechaEntrega);
    const diffMs = entrega.getTime() - ahora.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      return { text: "Vencido", color: "destructive" };
    } else if (diffDias === 0) {
      return { text: "Vence hoy", color: "warning" };
    } else if (diffDias === 1) {
      return { text: "Vence mañana", color: "warning" };
    } else if (diffDias <= 7) {
      return { text: `Vence en ${diffDias} días`, color: "warning" };
    } else {
      return { text: `Vence en ${diffDias} días`, color: "success" };
    }
  };

  const tiempoRestante = obtenerTiempoRestante(assignment.dueDate);


  console.log("adjuntos", assignment.attachments);
  return (
  <div className="min-h-screen bg-background p-4 md:p-6">
    <div className="max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Recursos
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            {modoEdicion ? (
              <Input
                value={datosEdicion.title}
                onChange={(e) => setDatosEdicion(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                {assignment.title}
              </h1>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={assignment.deliveryMode === "TEAM" ? "default" : "secondary"} className="text-xs">
                {assignment.deliveryMode === "TEAM" ? (
                  <Users className="h-3 w-3 mr-1" />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
                {assignment.deliveryMode === "TEAM" ? "Tarea Grupal" : "Tarea Individual"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {(assignment.submissionFormat || "DIGITAL") === "DIGITAL" ? (
                  <Monitor className="h-3 w-3 mr-1" />
                ) : (
                  <BookOpen className="h-3 w-3 mr-1" />
                )}
                {assignment.submissionFormat || "DIGITAL"}
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Award className="h-3 w-3" />
                {assignment.maxScore.maxPoints} puntos
              </Badge>
              
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                {tiempoRestante.text}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="text-right text-sm">
              <p className="text-muted-foreground mb-1">Creado el</p>
              <p className="font-medium text-foreground">{formatearFechaCreacion(assignment.createdAt)}</p>
            </div>
            {modoEdicion ? (
              <div className="flex gap-2 flex-wrap justify-end">
                <Button
                  onClick={handleGuardarEdiciones}
                  disabled={cargando}
                  size="sm"
                  className="gap-2 text-sm"
                >
                  {updateAssignment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar
                </Button>
                <Button
                  onClick={handleCancelarEdicion}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setModoEdicion(true)}
                variant="outline"
                size="sm"
                className="gap-2 text-sm"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de Contenido Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de Descripción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-5 w-5" />
                Descripción de la Tarea
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modoEdicion ? (
                <Textarea
                  value={datosEdicion.description}
                  onChange={(e) => setDatosEdicion(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full text-sm"
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {assignment.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-5 w-5" />
                Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modoEdicion ? (
                <Textarea
                  value={datosEdicion.instructions}
                  onChange={(e) => setDatosEdicion(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={6}
                  className="w-full text-sm"
                />
              ) : (
                <div className="text-foreground whitespace-pre-wrap leading-relaxed p-3 sm:p-4 bg-muted/30 rounded-lg text-sm sm:text-base">
                  {assignment.instructions}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Paperclip className="h-5 w-5" />
                  Adjuntos ({assignment.attachments.length})
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <input
                    ref={referenciaInputArchivo}
                    type="file"
                    onChange={handleSubirArchivoUnico}
                    className="hidden"
                    id="single-file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => referenciaInputArchivo.current?.click()}
                    disabled={cargando}
                    className="text-xs"
                  >
                    {mutacionesAdjuntos.addAttachment.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Agregar Archivo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAgregandoArchivos(!agregandoArchivos)}
                    disabled={cargando}
                    className="text-xs"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Múltiples
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Interfaz de Subida de Múltiples Archivos */}
              {agregandoArchivos && (
                <div className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/20">
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={handleSeleccionArchivos}
                      className="hidden"
                      id="multiple-files-upload"
                    />
                    <label
                      htmlFor="multiple-files-upload"
                      className="flex items-center justify-center gap-2 p-3 sm:p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-sm">Haga clic para seleccionar archivos</span>
                    </label>
                  </div>

                  {archivosSeleccionados.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        {archivosSeleccionados.length} archivo(s) seleccionado(s)
                      </p>
                      {archivosSeleccionados.map((archivo, indice) => (
                        <div
                          key={indice}
                          className="flex items-center justify-between p-2 bg-card rounded text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-xs sm:text-sm truncate block text-foreground">{archivo.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(archivo.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarArchivoSeleccionado(indice)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleSubirMultiplesArchivos}
                      disabled={archivosSeleccionados.length === 0 || cargando}
                      className="flex-1 text-sm"
                    >
                      {mutacionesAdjuntos.addMultipleAttachments.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="h-4 w-4 mr-2" /> Subir {archivosSeleccionados.length} archivo(s)</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAgregandoArchivos(false);
                        setArchivosSeleccionados([]);
                      }}
                      className="text-sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {assignment.attachments.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                  <Paperclip className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Aún no hay adjuntos</p>
                  <p className="text-xs text-muted-foreground mt-1">Haga clic en "Agregar Archivo" para subir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignment.attachments.map((archivo: Document, indice: number) => (
                    <div
                      key={indice}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Paperclip className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate text-sm">{archivo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Agregado {formatearFechaCreacion(archivo.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {archivo.storagePath && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(archivo.storagePath, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarAdjunto(archivo.name, archivo.storagePath)}
                          disabled={cargando}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {mutacionesAdjuntos.removeAttachment.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <LinkIcon className="h-5 w-5" />
                  Enlaces de Referencia ({assignment.urls.length})
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAgregandoUrl(!agregandoUrl)}
                    disabled={cargando}
                    className="text-xs"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Enlace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAgregandoMultiplesUrls(!agregandoMultiplesUrls)}
                    disabled={cargando}
                    className="text-xs"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Agregar Múltiples
                  </Button>
                  {assignment.urls.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLimpiarTodasUrls}
                      disabled={cargando}
                      className="text-xs"
                    >
                      {mutacionesEnlaces.clearLinks.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Limpiar Todo
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {agregandoUrl && (
                <div className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4 bg-muted/20 rounded-lg border">
                  <Input
                    value={nuevaUrl}
                    onChange={(e) => setNuevaUrl(e.target.value)}
                    placeholder="https://ejemplo.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAgregarUrl();
                      }
                    }}
                    className="text-sm flex-1"
                  />
                  <Button 
                    onClick={handleAgregarUrl} 
                    disabled={!nuevaUrl.trim() || cargando}
                    className="text-sm flex-shrink-0"
                  >
                    {mutacionesEnlaces.addLink.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LinkIcon className="h-4 w-4 mr-2" />
                    )}
                    Agregar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAgregandoUrl(false);
                      setNuevaUrl("");
                    }}
                    className="text-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {agregandoMultiplesUrls && (
                <div className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/20">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={entradaUrl}
                      onChange={(e) => setEntradaUrl(e.target.value)}
                      placeholder="https://ejemplo.com"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAgregarUrlALista();
                        }
                      }}
                      className="text-sm flex-1"
                    />
                    <Button 
                      onClick={handleAgregarUrlALista}
                      disabled={!entradaUrl.trim()}
                      variant="outline"
                      className="text-sm flex-shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar a Lista
                    </Button>
                  </div>

                  {urlsSeleccionadas.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        {urlsSeleccionadas.length} URL(s) listas para subir
                      </p>
                      {urlsSeleccionadas.map((url, indice) => (
                        <div
                          key={indice}
                          className="flex items-center justify-between p-2 bg-card rounded text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-xs sm:text-sm truncate block text-foreground">{url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarUrlSeleccionada(indice)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleSubirMultiplesUrls}
                      disabled={urlsSeleccionadas.length === 0 || cargando}
                      className="flex-1 text-sm"
                    >
                      {mutacionesEnlaces.addMultipleLinks.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Agregando...</>
                      ) : (
                        <><Link2 className="h-4 w-4 mr-2" /> Agregar {urlsSeleccionadas.length} URL(s)</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAgregandoMultiplesUrls(false);
                        setUrlsSeleccionadas([]);
                        setEntradaUrl("");
                      }}
                      className="text-sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {assignment.urls.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                  <LinkIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Aún no se han agregado enlaces</p>
                  <p className="text-xs text-muted-foreground mt-1">Haga clic en "Agregar Enlace" para incluir recursos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignment.urls.map((url: string, indice: number) => (
                    <div
                      key={indice}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <LinkIcon className="h-4 w-4 text-accent flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline truncate block text-sm"
                          >
                            {url.replace(/^https?:\/\//, '')}
                          </a>
                          <p className="text-xs text-muted-foreground">Recurso externo</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarUrl(url)}
                          disabled={cargando}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {mutacionesEnlaces.removeLink.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Detalles de la Tarea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Fecha de Entrega
                </h4>
                {modoEdicion ? (
                  <Input
                    type="datetime-local"
                    value={datosEdicion.dueDate}
                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <p className="font-medium text-foreground text-sm">
                    {formatearFecha(assignment.dueDate)}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Estado
                </h4>
                <div className="flex flex-col gap-3">
                  <Badge variant="secondary" className="w-fit text-xs">
                    {tiempoRestante.text}
                  </Badge>
                  {modoEdicion ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={datosEdicion.allowLateSubmissions}
                        onCheckedChange={(checked) => setDatosEdicion(prev => ({ ...prev, allowLateSubmissions: checked }))}
                      />
                      <Label className="text-xs sm:text-sm">Permitir entregas tardías</Label>
                    </div>
                  ) : (
                    <Badge variant={assignment.allowLateSubmissions ? "outline" : "secondary"} className="w-fit text-xs">
                      {assignment.allowLateSubmissions ? "Entregas tardías permitidas" : "No se permiten entregas tardías"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                  <Award className="inline h-3 w-3 mr-1" />
                  Puntos Máximos
                </h4>
                {modoEdicion ? (
                  <Input
                    type="number"
                    value={datosEdicion.maxPoints}
                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, maxPoints: e.target.value }))}
                    min="1"
                    className="mt-1 text-sm"
                  />
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {assignment.maxScore.maxPoints} puntos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignment.deliveryMode === "TEAM" 
                        ? "Puntos otorgados a todo el grupo"
                        : "Puntos otorgados a cada estudiante"}
                    </p>
                  </>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                  Modo de Entrega
                </h4>
                {modoEdicion ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      variant={datosEdicion.deliveryMode === "INDIVIDUAL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDatosEdicion(prev => ({ ...prev, deliveryMode: "INDIVIDUAL" }))}
                      className="text-xs"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Individual
                    </Button>
                    <Button
                      variant={datosEdicion.deliveryMode === "TEAM" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDatosEdicion(prev => ({ ...prev, deliveryMode: "TEAM" }))}
                      className="text-xs"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Grupal
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-2">
                    {assignment.deliveryMode === "TEAM" ? (
                      <>
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Tarea Grupal</p>
                          <p className="text-xs text-muted-foreground">
                            Los estudiantes trabajan en equipos
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Tarea Individual</p>
                          <p className="text-xs text-muted-foreground">
                            Cada estudiante entrega individualmente
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                  Formato de Entrega
                </h4>
                {modoEdicion ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      variant={datosEdicion.submissionFormat === "DIGITAL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDatosEdicion(prev => ({ ...prev, submissionFormat: "DIGITAL" }))}
                      className="text-xs"
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Digital
                    </Button>
                    <Button
                      variant={datosEdicion.submissionFormat === "NOTEBOOK" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDatosEdicion(prev => ({ ...prev, submissionFormat: "NOTEBOOK" }))}
                      className="text-xs"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Cuaderno
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {assignment.submissionFormat === "DIGITAL" ? (
                      <><Monitor className="h-3 w-3 mr-1" /> Digital</>
                    ) : (
                      <><BookOpen className="h-3 w-3 mr-1" /> Cuaderno</>
                    )}
                  </Badge>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                  Estadísticas de Entregas
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total de Entregas:</span>
                    <span className="font-medium text-foreground">{assignment.submissions?.length || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pie de página */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Última actualización: {formatearFechaCreacion(assignment.createdAt)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}