"use client";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Paperclip, 
  Upload, 
  Clock, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  X,
  Brain,
  AlertTriangle,
  Info,
  BarChart3,
  Link as LinkIcon,
  Users,
  User,
  CalendarClock,
  Award,
  MessageSquare,
  ExternalLink,
  BookOpen,
  CalendarCheck,
  Eye,
  File,
  List,
  Loader2
} from "lucide-react";
import { Assignment, Submission} from '@/app/domain/entities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Document } from '@/app/domain/valueObjects';

interface TaskSubmissionViewProps {
  assignment: Assignment;
  existingSubmission?: Submission;
  onSubmit: (submission: {
    content: string;
    attachments: File[];
  }) => Promise<void>;
  onDownloadAttachment: (attachment: Document) => void;
  isSubmitting?: boolean;
  onExit?: () => void;
}

export const TaskSubmissionView: React.FC<TaskSubmissionViewProps> = ({
  assignment,
  existingSubmission,
  onSubmit,
  onDownloadAttachment,
  isSubmitting = false,
  onExit
}) => {
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLate = existingSubmission?.status === 'LATE_SUBMITTED';
  const isSubmitted = existingSubmission?.status === 'SUBMITTED' || existingSubmission?.status === 'LATE_SUBMITTED' || existingSubmission?.status === 'GRADED';
  const isGraded = existingSubmission?.status === 'GRADED';
  const hasAIResult = existingSubmission?.iaResult !== undefined;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(0);
      }
    }, 100);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      const shouldContinue = window.confirm(
        'Por favor, proporciona contenido escrito o adjunta archivos. ¿Deseas continuar sin enviar?'
      );
      if (!shouldContinue) return;
    }

    try {
      await onSubmit({ content, attachments: files });
      setShowSubmitConfirm(false);
      if (!existingSubmission) {
        setContent('');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  const handleSubmitConfirm = () => {
    setShowSubmitConfirm(true);
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    onExit?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (date > now) {
      return `en ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    }
  };

  const getTimeRemaining = () => {
    if (!assignment.dueDate) return null;
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) return { overdue: true, text: 'Retrasado' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { overdue: false, text: `${days}d ${hours}h restantes` };
    if (hours > 0) return { overdue: false, text: `${hours}h ${minutes}m restantes` };
    return { overdue: false, text: `${minutes}m restantes` };
  };

  const renderAIDetectionResult = () => {
    if (!hasAIResult || !existingSubmission?.iaResult) return null;

    const aiResult = existingSubmission.iaResult;
    const probability = parseFloat(aiResult.probability);
    const percentage = parseFloat(aiResult.percentage);
    const isLikelyAI = aiResult.isLikelyAI;

   return (
  <div className={`bg-card rounded-2xl border-l-4 border-t border-r border-b border-border shadow-sm overflow-hidden ${
    isLikelyAI ? 'border-l-destructive' : 'border-l-primary'
  }`}>

    {/* ── Encabezado ── */}
    <div className="px-5 py-4 sm:px-6 border-b border-border">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 flex-shrink-0">
          <Brain className="w-4 h-4 text-primary" />
        </span>
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Análisis de Detección de IA
        </h3>
        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
          isLikelyAI
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
        }`}>
          {isLikelyAI ? 'Contenido de IA Detectado' : 'Contenido Humano'}
        </span>
      </div>
    </div>

    {/* ── Cuerpo ── */}
    <div className="px-5 py-5 sm:px-6 space-y-5">

      {/* Barra de probabilidad */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Puntaje de Probabilidad de IA
          </span>
          <span className="text-sm font-bold text-foreground tabular-nums">{percentage}%</span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage < 30 ? 'bg-primary' :
              percentage < 70 ? 'bg-accent'  :
              'bg-destructive'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0% (Humano)</span>
          <span>50%</span>
          <span>100% (IA)</span>
        </div>
      </div>

      {/* Cuadrícula de detalles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Confianza */}
        <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border">
          <span className="text-xs font-semibold text-muted-foreground">Nivel de Confianza</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
            aiResult.confidenceLevel === 'HIGH'   ? 'bg-destructive/10 text-destructive' :
            aiResult.confidenceLevel === 'MEDIUM' ? 'bg-accent/20 text-accent-foreground' :
            'bg-primary/10 text-primary'
          }`}>
            {aiResult.confidenceLevel === 'HIGH' ? 'ALTO' : aiResult.confidenceLevel === 'MEDIUM' ? 'MEDIO' : 'BAJO'}
          </span>
        </div>

        {/* Probabilidad */}
        <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border">
          <span className="text-xs font-semibold text-muted-foreground">Probabilidad</span>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {probability.toFixed(4)}
          </span>
        </div>

        {/* Modelo */}
        <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border">
          <span className="text-xs font-semibold text-muted-foreground">Modelo de Detección</span>
          <span className="text-sm font-semibold text-foreground">{aiResult.modelUsed}</span>
        </div>

        {/* Fecha */}
        <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border">
          <span className="text-xs font-semibold text-muted-foreground">Fecha de Análisis</span>
          <span className="text-xs text-foreground">{formatDate(aiResult.analyzedAt)}</span>
        </div>

      </div>

      {/* ID de Análisis */}
      <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-4 py-3 border border-border">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground">ID de Análisis:</span>
        <code className="text-xs bg-muted px-2 py-0.5 rounded-md text-foreground font-mono">
          {aiResult.analysisId}
        </code>
      </div>

      {/* Guía de interpretación */}
      <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Cómo interpretar los resultados de detección de IA
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><span className="font-semibold text-foreground">0–30%:</span> Contenido probablemente escrito por humanos</li>
              <li><span className="font-semibold text-foreground">30–70%:</span> Origen mixto o incierto</li>
              <li><span className="font-semibold text-foreground">70–100%:</span> Alta probabilidad de contenido generado por IA</li>
            </ul>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Nota: Las herramientas de detección de IA no son 100% precisas y deben usarse solo como referencia.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
);
  }



  const timeRemaining = getTimeRemaining();
  const totalSubmissions = assignment.submissions?.length || 0;

  const displayedLinks = showAllLinks ? assignment.links : assignment.links.slice(0, 3);
  const displayedAttachments = showAllAttachments ? assignment.attachments : assignment.attachments.slice(0, 3);
return (
  <>
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Encabezado de página ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight truncate">
              {assignment.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Contenido principal ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Resumen de la tarea */}
            <div className="bg-card rounded-2xl border-l-4 border-l-primary border-t border-r border-b border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 sm:px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </span>
                  <h2 className="text-base font-bold text-foreground">Resumen de la Tarea</h2>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6 space-y-5">

                {/* Descripción */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />Descripción
                  </p>
                  <p className="text-sm text-foreground">{assignment.description}</p>
                </div>

                {/* Instrucciones */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />Instrucciones
                  </p>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                </div>

                {/* Cuadrícula de metadatos */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />Creada
                    </p>
                    <p className="text-sm font-medium text-foreground">{formatDate(assignment.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">({formatDateRelative(assignment.createdAt)})</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" />Fecha Límite
                    </p>
                    {assignment.dueDate ? (
                      <>
                        <p className="text-sm font-medium text-foreground">{formatDate(assignment.dueDate)}</p>
                        {timeRemaining && (
                          <p className={`text-xs ${timeRemaining.overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {timeRemaining.text}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin fecha límite</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />Puntaje Máx.
                    </p>
                    <p className="text-lg font-bold text-primary">{assignment.maxScore.value} pts</p>
                    {assignment.maxScore.maxPoints && (
                      <p className="text-xs text-muted-foreground">de {assignment.maxScore.maxPoints}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      {assignment.deliveryMode === 'TEAM'
                        ? <Users className="w-3.5 h-3.5" />
                        : <User className="w-3.5 h-3.5" />}
                      Modo de Entrega
                    </p>
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      {assignment.deliveryMode === 'TEAM' ? 'Equipo' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recursos */}
            {(assignment.urls.length > 0 || assignment.attachments.length > 0 || assignment.links.length > 0) && (
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 sm:px-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </span>
                    <h2 className="text-base font-bold text-foreground">Recursos de Aprendizaje</h2>
                  </div>
                </div>
                <div className="px-5 py-5 sm:px-6 space-y-5">

                  {/* Enlaces */}
                  {assignment.links.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5" />
                          Enlaces de Referencia ({assignment.links.length})
                        </p>
                        {assignment.links.length > 3 && (
                          <button
                            onClick={() => setShowAllLinks(!showAllLinks)}
                            className="ml-auto text-xs font-semibold text-primary hover:opacity-80 transition-all"
                          >
                            {showAllLinks ? 'Mostrar Menos' : `Mostrar ${assignment.links.length - 3} Más`}
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {displayedLinks.map((link, index) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-xl border border-border">
                            <p className="text-xs font-medium text-foreground truncate">{link}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adjuntos */}
                  {assignment.attachments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          Adjuntos ({assignment.attachments.length})
                        </p>
                        {assignment.attachments.length > 3 && (
                          <button
                            onClick={() => setShowAllAttachments(!showAllAttachments)}
                            className="ml-auto text-xs font-semibold text-primary hover:opacity-80 transition-all"
                          >
                            {showAllAttachments ? 'Mostrar Menos' : `Mostrar ${assignment.attachments.length - 3} Más`}
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {displayedAttachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-card rounded-xl border border-border hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <File className="w-4 h-4 text-primary flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Subido: {formatDateRelative(attachment.createdAt)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => onDownloadAttachment(attachment)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Descargar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasAIResult && renderAIDetectionResult()}

            {/* Formulario de envío */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 sm:px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4 text-primary" />
                  </span>
                  <h2 className="text-base font-bold text-foreground">Tu Envío</h2>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6 space-y-5">

                {/* Respuesta escrita */}
                <div className="space-y-2">
                  <label htmlFor="content" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Respuesta Escrita
                    {!assignment.attachments.length && <span className="text-destructive">*</span>}
                  </label>
                  <textarea
                    id="content"
                    placeholder="Escribe tu respuesta aquí... Puedes incluir explicaciones, código, ensayos o cualquier contenido escrito requerido para esta tarea."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    disabled={isSubmitted}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none disabled:opacity-30 transition-all"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {content.length} caracteres · {content.split(/\s+/).filter(Boolean).length} palabras
                    </p>
                    {content.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                        ~{Math.ceil(content.split(/\s+/).length / 200)} min de lectura
                      </span>
                    )}
                  </div>
                </div>

                {/* Carga de archivos */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Adjuntos
                    {!content.trim() && <span className="text-destructive">*</span>}
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    disabled={isSubmitted}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitted}
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
                  >
                    <Upload className="w-7 h-7" />
                    <div className="text-center">
                      <p className="text-sm font-semibold">Haz clic para subir archivos</p>
                      <p className="text-xs">PDF, DOC, imágenes, archivos de código (Máx: 10MB cada uno)</p>
                    </div>
                  </button>

                  {/* Progreso de carga */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-1.5">
                      <div className="w-full bg-muted/50 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground tabular-nums">
                        Subiendo... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Lista de archivos */}
                  {files.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Archivos Seleccionados
                      </p>
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            disabled={isSubmitted}
                            className="text-xs font-semibold text-destructive hover:opacity-80 disabled:opacity-30 transition-all flex-shrink-0 px-2 py-1"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Archivos enviados anteriormente */}
                {existingSubmission?.attachments && existingSubmission.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      Archivos Enviados Anteriormente
                    </p>
                    <div className="space-y-1.5">
                      {existingSubmission.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Enviado: {formatDateRelative(existingSubmission.submittedAt)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onDownloadAttachment(attachment)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Descargar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Banner de estado del envío */}
                {isSubmitted && (
                  <div className={`p-4 rounded-2xl border ${
                    isGraded
                      ? 'bg-primary/5 border-primary/20'
                      : isLate
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-muted/30 border-border'
                  }`}>
                    <div className="flex items-start gap-3">
                      {isGraded
                        ? <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        : isLate
                        ? <AlertTriangle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                        : <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="font-semibold text-sm text-foreground">
                          {isGraded ? 'Envío Calificado' :
                           isLate  ? 'Envío Tardío Recibido' :
                           'Envío Recibido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enviado el {formatDate(existingSubmission!.submittedAt)}
                          {isLate && ' (Envío tardío)'}
                        </p>
                        {isGraded && existingSubmission?.grade && (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-primary">
                              {existingSubmission.grade.value}/{assignment.maxScore.value}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                              {((Number(existingSubmission.grade.value) / Number(assignment.maxScore.value)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {existingSubmission?.teacherFeedback && (
                          <div className="p-3 bg-card rounded-xl border border-border">
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Retroalimentación del Profesor
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                              {existingSubmission.teacherFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de envío */}
                {!isSubmitted && (
                  <button
                    onClick={handleSubmitConfirm}
                    disabled={isSubmitting || (!content.trim() && files.length === 0)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />Enviando...</>
                    ) : (
                      <><Send className="w-5 h-5" />Enviar Tarea</>
                    )}
                  </button>
                )}

              </div>
            </div>
          </div>

          {/* ── Barra lateral ── */}
          <div className="space-y-4">

            {/* Estadísticas */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">Estadísticas de la Tarea</h3>
                </div>
              </div>
              <div className="px-4 py-4 space-y-3">
                {[
                  {
                    label: 'Estado',
                    value: (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        isGraded    ? 'bg-primary/10 text-primary' :
                        isLate      ? 'bg-destructive/10 text-destructive' :
                        isSubmitted ? 'bg-muted text-muted-foreground' :
                        'border border-border text-muted-foreground'
                      }`}>
                        {isGraded ? 'Calificado' : isLate ? 'Enviado Tarde' : isSubmitted ? 'Enviado' : 'No Enviado'}
                      </span>
                    )
                  },
                  {
                    label: 'Modo de Entrega',
                    value: <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">{assignment.deliveryMode === 'TEAM' ? 'Equipo' : 'Individual'}</span>
                  },
                  {
                    label: 'Puntos Máx.',
                    value: <span className="text-sm font-bold text-foreground">{assignment.maxScore.value}</span>
                  },
                  {
                    label: 'Envíos Tardíos',
                    value: <span className={`text-xs font-semibold ${assignment.allowLateSubmissions ? 'text-primary' : 'text-destructive'}`}>
                      {assignment.allowLateSubmissions ? 'Permitidos' : 'No Permitidos'}
                    </span>
                  },
                  {
                    label: 'Creada',
                    value: <span className="text-xs text-muted-foreground">{formatDateRelative(assignment.createdAt)}</span>
                  },
                  ...(assignment.dueDate ? [{
                    label: 'Fecha Límite',
                    value: <span className="text-xs text-muted-foreground">{formatDateRelative(assignment.dueDate)}</span>
                  }] : []),
                  ...(hasAIResult ? [{
                    label: 'Análisis de IA',
                    value: (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        existingSubmission?.iaResult?.isLikelyAI
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {existingSubmission?.iaResult?.isLikelyAI ? 'Detectado' : 'Limpio'}
                      </span>
                    )
                  }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Pautas */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">Pautas</h3>
                </div>
              </div>
              <ul className="px-4 py-4 space-y-2.5">
                {[
                  'Asegura la originalidad y citas adecuadas',
                  'Verifica los formatos de archivo antes de subir',
                  'Revisa el envío antes de enviarlo',
                  'Los envíos tardíos pueden ser penalizados',
                  'El contenido generado por IA puede ser detectado',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tiempo restante */}
            {assignment.dueDate && (
              <div className={`bg-card rounded-2xl border-l-4 border-t border-r border-b border-border shadow-sm overflow-hidden ${
                timeRemaining?.overdue                              ? 'border-l-destructive' :
                timeRemaining?.text.includes('d')                  ? 'border-l-accent'      :
                'border-l-primary'
              }`}>
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">Tiempo Restante</h3>
                  </div>
                </div>
                <div className="px-4 py-4 text-center space-y-1">
                  <p className={`text-2xl font-bold ${timeRemaining?.overdue ? 'text-destructive' : 'text-foreground'}`}>
                    {timeRemaining?.text || 'Sin fecha límite'}
                  </p>
                  <p className="text-xs text-muted-foreground">Fecha límite: {formatDate(assignment.dueDate)}</p>
                  {timeRemaining?.overdue && (
                    <p className="text-xs font-semibold text-destructive">¡Esta tarea está retrasada!</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

    {/* ── Diálogo de salida ── */}
    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent className="bg-card rounded-3xl border border-border shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </span>
            ¿Salir de la Tarea?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {isSubmitted
              ? '¿Estás seguro de que deseas salir de esta vista de envío?'
              : 'Cualquier cambio no guardado se perderá. ¿Estás seguro de que deseas salir?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted/50">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExitConfirm}
            className="rounded-xl bg-destructive text-destructive-foreground hover:opacity-90"
          >
            Salir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* ── Diálogo de confirmación de envío ── */}
    <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
      <AlertDialogContent className="bg-card rounded-3xl border border-border shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4 text-primary" />
            </span>
            ¿Enviar Tarea?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            ¿Estás seguro de que deseas enviar esta tarea? No podrás hacer cambios después del envío.
          </AlertDialogDescription>
          {files.length > 0 && (
            <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Archivos a subir:</p>
              <ul className="space-y-0.5">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-3 h-3 flex-shrink-0" />
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted/50">
            Revisar Envío
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Enviando...</>
              : 'Enviar Tarea'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
};