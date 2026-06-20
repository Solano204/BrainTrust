"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  FileText, 
  LinkIcon, 
  Paperclip, 
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Loader2,
  Download,
  Upload,
  BookOpen,
  Edit,
  Save,
  XCircle,
  Link2
} from "lucide-react";
import { Page } from "@/app/domain/entities/CourseEntities";
import { Document } from "@/app/domain/valueObjects/CourseValues";
import { 
  usePageLinkMutations, 
  usePageMutations, 
  usePageAttachmentMutations,
  usePage
} from "./hooks/page-hooks";
import { useAuth } from "@/app/context/AuthContext";

interface PropsVistaPagina {
  page: Page;
  onClose: () => void;
}

export function VistaPagina({ page: paginaInicial, onClose }: PropsVistaPagina) {
  const { user } = useAuth();
  const esProfesor = user?.role === "teacher";
  
  const { data: datosPaginaViva, isLoading: cargandoPagina } = usePage(paginaInicial.id);
  
  const pagina = datosPaginaViva || paginaInicial;
  
  const mutacionesEnlaces = usePageLinkMutations();
  const mutacionesAdjuntos = usePageAttachmentMutations();
  const { updatePage: actualizarPagina } = usePageMutations();
  
  const [modoEdicion, setModoEdicion] = React.useState(false);
  
  const [datosEdicion, setDatosEdicion] = React.useState({
    title: pagina.title,
    sectionContent: pagina.sectionContent
  });
  
  const [nuevaUrl, setNuevaUrl] = React.useState("");
  const [agregandoUrl, setAgregandoUrl] = React.useState(false);
  
  const [agregandoMultiplesUrls, setAgregandoMultiplesUrls] = React.useState(false);
  const [entradaUrl, setEntradaUrl] = React.useState("");
  const [urlsSeleccionadas, setUrlsSeleccionadas] = React.useState<string[]>([]);
  
  const [archivosSeleccionados, setArchivosSeleccionados] = React.useState<File[]>([]);
  const [agregandoArchivos, setAgregandoArchivos] = React.useState(false);
  const referenciaInputArchivo = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDatosEdicion({
      title: pagina.title,
      sectionContent: pagina.sectionContent
    });
  }, [pagina.title, pagina.sectionContent]);

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
    if (!esProfesor || urlsSeleccionadas.length === 0) return;

    try {
      await mutacionesEnlaces.addMultipleLinks.mutateAsync({
        pageId: pagina.id,
        links: urlsSeleccionadas
      });
      setUrlsSeleccionadas([]);
      setEntradaUrl("");
      setAgregandoMultiplesUrls(false);
    } catch (error) {
      console.error("Error al subir URLs:", error);
    }
  };

  const handleGuardarEdiciones = async () => {
    if (!esProfesor) return;

    try {
      await actualizarPagina.mutateAsync({
        pageId: pagina.id,
        pageData: {
          title: datosEdicion.title,
          sectionContent: datosEdicion.sectionContent
        }
      });
      setModoEdicion(false);
    } catch (error) {
      console.error("Error al actualizar la página:", error);
    }
  };

  const handleCancelarEdicion = () => {
    setDatosEdicion({
      title: pagina.title,
      sectionContent: pagina.sectionContent
    });
    setModoEdicion(false);
  };

  const handleSubirArchivoUnico = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!esProfesor) return;
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    try {
      await mutacionesAdjuntos.addAttachment.mutateAsync({
        pageId: pagina.id,
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
    if (!esProfesor || archivosSeleccionados.length === 0) return;

    try {
      await mutacionesAdjuntos.addMultipleAttachments.mutateAsync({
        pageId: pagina.id,
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

  const handleEliminarAdjunto = async (nombreDocumento: string) => {
    if (!esProfesor) return;

    try {
      await mutacionesAdjuntos.removeAttachment.mutateAsync({
        pageId: pagina.id,
        documentName: nombreDocumento
      });
    } catch (error) {
      console.error("Error al eliminar adjunto:", error);
    }
  };

  const handleAgregarUrl = async () => {
    if (!nuevaUrl.trim() || !esProfesor) return;

    if (!esUrlValida(nuevaUrl.trim())) {
      alert("Por favor ingrese una URL válida (ej., https://ejemplo.com)");
      return;
    }

    try {
      await mutacionesEnlaces.addLink.mutateAsync({
        pageId: pagina.id,
        linkUrl: nuevaUrl.trim()
      });
      setNuevaUrl("");
      setAgregandoUrl(false);
    } catch (error) {
      console.error("Error al agregar URL:", error);
    }
  };

  const handleEliminarUrl = async (url: string) => {
    if (!esProfesor) return;

    try {
      await mutacionesEnlaces.removeLink.mutateAsync({
        pageId: pagina.id,
        linkUrl: url
      });
    } catch (error) {
      console.error("Error al eliminar URL:", error);
    }
  };

  const handleLimpiarTodasUrls = async () => {
    if (!esProfesor) return;
    if (!confirm("¿Está seguro de que desea eliminar todas las URLs?")) return;

    try {
      await mutacionesEnlaces.clearLinks.mutateAsync(pagina.id);
    } catch (error) {
      console.error("Error al limpiar URLs:", error);
    }
  };

  const cargando = 
    cargandoPagina ||
    mutacionesEnlaces.addLink.isPending ||
    mutacionesEnlaces.addMultipleLinks.isPending ||
    mutacionesEnlaces.removeLink.isPending ||
    mutacionesEnlaces.clearLinks.isPending ||
    mutacionesAdjuntos.addAttachment.isPending ||
    mutacionesAdjuntos.addMultipleAttachments.isPending ||
    mutacionesAdjuntos.removeAttachment.isPending ||
    actualizarPagina.isPending;

  const formatearFechaCreacion = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearContenido = (contenido: string) => {
    return contenido.split('\n').map((linea, indice) => (
      <p key={indice} className="mb-3 last:mb-0">
        {linea}
      </p>
    ));
  };
if (cargandoPagina && !datosPaginaViva) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

return (
  <div className="min-h-screen bg-background p-4 md:p-6">
    <div className="max-w-6xl mx-auto">

      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Recursos
        </Button>

        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            {modoEdicion ? (
              <Input
                value={datosEdicion.title}
                onChange={(e) => setDatosEdicion(prev => ({ ...prev, title: e.target.value }))}
                className="text-3xl md:text-4xl font-bold mb-2 border-border bg-background text-foreground focus-visible:ring-accent"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {pagina.title}
              </h1>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="bg-secondary text-foreground border border-border">
                <BookOpen className="h-3 w-3 mr-1" />
                Página de Información
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                {pagina.attachments?.length || 0} archivos • {pagina.urlsSupport?.length || 0} enlaces
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Creado el</p>
              <p className="font-medium text-foreground">{formatearFechaCreacion(pagina.createdAt)}</p>
            </div>
            {esProfesor && (
              modoEdicion ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleGuardarEdiciones}
                    disabled={cargando}
                    size="sm"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {actualizarPagina.isPending ? (
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
                    className="gap-2 border-border hover:bg-secondary"
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
                  className="gap-2 border-border hover:bg-secondary"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modoEdicion ? (
                <Textarea
                  value={datosEdicion.sectionContent}
                  onChange={(e) => setDatosEdicion(prev => ({ ...prev, sectionContent: e.target.value }))}
                  rows={12}
                  className="w-full font-mono text-sm border-border bg-background text-foreground focus-visible:ring-accent"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {formatearContenido(pagina.sectionContent)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Paperclip className="h-5 w-5 text-primary" />
                  Adjuntos ({pagina.attachments?.length || 0})
                </CardTitle>
                {esProfesor && (
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
                      className="border-border hover:bg-secondary"
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
                      className="border-border hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Múltiples
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {esProfesor && agregandoArchivos && (
                <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-4 bg-secondary/30">
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
                      className="flex items-center justify-center gap-2 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Haga clic para seleccionar archivos</span>
                    </label>
                  </div>

                  {archivosSeleccionados.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {archivosSeleccionados.length} archivo(s) seleccionado(s)
                      </p>
                      {archivosSeleccionados.map((archivo, indice) => (
                        <div
                          key={indice}
                          className="flex items-center justify-between p-2 bg-background border border-border rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block text-foreground">{archivo.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(archivo.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => eliminarArchivoSeleccionado(indice)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubirMultiplesArchivos}
                      disabled={archivosSeleccionados.length === 0 || cargando}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {mutacionesAdjuntos.addMultipleAttachments.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="h-4 w-4 mr-2" /> Subir {archivosSeleccionados.length} archivo(s)</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border hover:bg-secondary"
                      onClick={() => { setAgregandoArchivos(false); setArchivosSeleccionados([]); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {!pagina.attachments || pagina.attachments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-secondary/20">
                  <Paperclip className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Aún no hay adjuntos</p>
                  {esProfesor && (
                    <p className="text-xs text-muted-foreground mt-1">Haga clic en "Agregar Archivo" para subir</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {pagina.attachments.map((archivo: Document, indice: number) => (
                    <div
                      key={indice}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Paperclip className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-foreground">{archivo.name}</p>
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
                            className="hover:bg-secondary"
                            onClick={() => window.open(archivo.storagePath, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {esProfesor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarAdjunto(archivo.name)}
                            disabled={cargando}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                          >
                            {mutacionesAdjuntos.removeAttachment.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  Enlaces de Referencia ({pagina.urlsSupport?.length || 0})
                </CardTitle>
                {esProfesor && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAgregandoUrl(!agregandoUrl)}
                      disabled={cargando}
                      className="border-border hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Enlace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAgregandoMultiplesUrls(!agregandoMultiplesUrls)}
                      disabled={cargando}
                      className="border-border hover:bg-secondary"
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Agregar Múltiples
                    </Button>
                    {pagina.urlsSupport && pagina.urlsSupport.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLimpiarTodasUrls}
                        disabled={cargando}
                        className="bg-destructive text-white hover:bg-destructive/90"
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
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {esProfesor && agregandoUrl && (
                <div className="flex gap-2 p-4 bg-secondary/30 rounded-lg border border-border">
                  <Input
                    value={nuevaUrl}
                    onChange={(e) => setNuevaUrl(e.target.value)}
                    placeholder="https://ejemplo.com"
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAgregarUrl(); }
                    }}
                  />
                  <Button
                    onClick={handleAgregarUrl}
                    disabled={!nuevaUrl.trim() || cargando}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
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
                    className="border-border hover:bg-secondary"
                    onClick={() => { setAgregandoUrl(false); setNuevaUrl(""); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {esProfesor && agregandoMultiplesUrls && (
                <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-4 bg-secondary/30">
                  <div className="flex gap-2">
                    <Input
                      value={entradaUrl}
                      onChange={(e) => setEntradaUrl(e.target.value)}
                      placeholder="https://ejemplo.com"
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleAgregarUrlALista(); }
                      }}
                    />
                    <Button
                      onClick={handleAgregarUrlALista}
                      disabled={!entradaUrl.trim()}
                      variant="outline"
                      className="border-border hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar a Lista
                    </Button>
                  </div>

                  {urlsSeleccionadas.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {urlsSeleccionadas.length} URL(s) listas para subir
                      </p>
                      {urlsSeleccionadas.map((url, indice) => (
                        <div
                          key={indice}
                          className="flex items-center justify-between p-2 bg-background border border-border rounded-lg"
                        >
                          <span className="text-sm truncate block flex-1 text-foreground">{url}</span>
                          <Button variant="ghost" size="sm" onClick={() => eliminarUrlSeleccionada(indice)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubirMultiplesUrls}
                      disabled={urlsSeleccionadas.length === 0 || cargando}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {mutacionesEnlaces.addMultipleLinks.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Agregando...</>
                      ) : (
                        <><Link2 className="h-4 w-4 mr-2" /> Agregar {urlsSeleccionadas.length} URL(s)</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border hover:bg-secondary"
                      onClick={() => { setAgregandoMultiplesUrls(false); setUrlsSeleccionadas([]); setEntradaUrl(""); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {!pagina.urlsSupport || pagina.urlsSupport.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-secondary/20">
                  <LinkIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No hay enlaces de referencia disponibles</p>
                  {esProfesor && (
                    <p className="text-xs text-muted-foreground mt-1">Haga clic en "Agregar Enlace" para incluir recursos</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {pagina.urlsSupport.map((url: string, indice: number) => (
                    <div
                      key={indice}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <LinkIcon className="h-4 w-4 text-accent shrink-0" />
                        <div className="min-w-0 flex-1">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:text-primary/80 hover:underline truncate block"
                          >
                            {url.replace(/^https?:\/\//, '')}
                          </a>
                          <p className="text-xs text-muted-foreground">Recurso externo</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="hover:bg-secondary">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        {esProfesor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarUrl(url)}
                            disabled={cargando}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                          >
                            {mutacionesEnlaces.removeLink.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Detalles de la Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Fecha de Creación
                </h4>
                <p className="font-medium text-foreground">
                  {new Date(pagina.createdAt).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <Separator className="bg-border" />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  <BookOpen className="inline h-3 w-3 mr-1" />
                  Tipo de Página
                </h4>
                <p className="font-medium text-foreground">Página de Información</p>
                <p className="text-xs text-muted-foreground mt-1">Material de referencia para estudiantes</p>
              </div>

              <Separator className="bg-border" />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Estadísticas de Contenido</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Adjuntos:</span>
                    <span className="font-medium text-foreground">{pagina.attachments?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Enlaces de Referencia:</span>
                    <span className="font-medium text-foreground">{pagina.urlsSupport?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conteo de Palabras:</span>
                    <span className="font-medium text-foreground">
                      {pagina.sectionContent.split(/\s+/).filter(w => w.length > 0).length}
                    </span>
                  </div>
                </div>
              </div>

              {esProfesor && (
                <>
                  <Separator className="bg-border" />
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <p className="text-xs text-foreground">
                      <strong>Vista de Profesor:</strong> Puede editar contenido, gestionar adjuntos y enlaces. Los estudiantes solo pueden ver.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Acerca de Esta Página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Esta página contiene información importante y recursos</p>
                <p>• Todos los materiales están disponibles para descargar</p>
                <p>• Los enlaces de referencia proporcionan recursos adicionales de aprendizaje</p>
                {esProfesor && (
                  <p>• Los profesores pueden agregar/eliminar adjuntos y enlaces</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Última actualización: {formatearFechaCreacion(pagina.createdAt)}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-border hover:bg-secondary">
              Cerrar
            </Button>
          </div>
        </div>
      </div>

    </div>
  </div>
);
}