"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Brain,
  AlertTriangle,
  BarChart3,
  Clock,
  Users,
  File,
  Hash,
  Award,
  Eye,
  X,
  Activity,
  Shield,
  Cpu,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SubmissionTask } from "@/app/shared/models/assignment.model";

interface PropsVistaDetalleEntrega {
  data: SubmissionTask;
  onBack: () => void;
  onUpdateGrade: (data: {
    submissionId: string;
    gradeValue: string;
    maxScore: string;
    feedback: string;
  }) => void;
  onDownloadAttachment: (attachment: {
    name: string;
    storagePath: string;
  }) => void;
  isUpdatingGrade: boolean;
  isDownloadingAttachment?: boolean;
}


export function SubmissionDetailView({
  data,
  onBack,
  onUpdateGrade,
  onDownloadAttachment,
  isUpdatingGrade,
  isDownloadingAttachment = false,
}: PropsVistaDetalleEntrega) {
  const [valorCalificacion, setValorCalificacion] = React.useState(
    data.submission?.grade?.value || ""
  );
  const [retroalimentacion, setRetroalimentacion] = React.useState(
    data.submission?.teacherFeedback || ""
  );
  const [mostrarModalAnalisisIA, setMostrarModalAnalisisIA] = React.useState(false);

  const porcentaje = React.useMemo(() => {
    if (!data.submission?.grade) return 0;
    const calificacionNum = Number(valorCalificacion || data.submission.grade.value);
    return (calificacionNum / data.maxPoints) * 100;
  }, [valorCalificacion, data.submission?.grade, data.maxPoints]);

  const handleEnviarCalificacion = () => {
    if (!data.submission) return;
    onUpdateGrade({
      submissionId: data.submission.id,
      gradeValue: valorCalificacion,
      maxScore: data.maxPoints.toString(),
      feedback: retroalimentacion,
    });
  };

  const formatearFecha = (fechaString: string) =>
    new Date(fechaString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatearFechaCorta = (fechaString: string) =>
    new Date(fechaString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const obtenerVarianteEstado = (estado: string) => {
    switch (estado) {
      case "GRADED": return "default";
      case "SUBMITTED": return "secondary";
      case "LATE_SUBMITTED": return "destructive";
      case "NOT_SUBMITTED": return "outline";
      default: return "secondary";
    }
  };

  const formatearTextoEstado = (estado: string) =>
    estado.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

  /* ─── Modal de Análisis IA ─── */
  const ModalAnalisisIA = () => {
    const analisis = data.submission?.aiAnalysis;
    if (!analisis) return null;

    const esIA = analisis.isLikelyAI;
    const segmentosIA = analisis.segments?.filter((s) => s.isLikelyAI) ?? [];
    const segmentosHumanos = analisis.segments?.filter((s) => !s.isLikelyAI) ?? [];
    const totalSegmentos = analisis.segments?.length ?? 0;

    const probabilidadPromedio =
      totalSegmentos > 0
        ? (
            (analisis.segments!.reduce(
              (sum, seg) => sum + parseFloat(seg.probability || "0"),
              0
            ) /
              totalSegmentos) *
            100
          ).toFixed(1)
        : "N/A";


return (
  <Dialog open={mostrarModalAnalisisIA} onOpenChange={setMostrarModalAnalisisIA}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
      <div
        className={`px-6 sm:px-8 py-6 rounded-t-2xl ${
          esIA
            ? "bg-gradient-to-r from-destructive/90 to-destructive"
            : "bg-gradient-to-r from-primary to-primary/80"
        }`}
      >
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
                {esIA ? (
                  <Cpu className="h-6 w-6 text-white" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-white text-lg sm:text-xl font-bold leading-tight">
                  {esIA ? "Contenido Generado por IA Detectado" : "Contenido Escrito por Humano Confirmado"}
                </DialogTitle>
                <DialogDescription className="text-white/75 text-sm mt-0.5">
                  Analizado el {formatearFecha(analisis.analyzedAt)}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMostrarModalAnalisisIA(false)}
              className="text-white hover:bg-white/20 rounded-lg h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-6 bg-card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: <Activity className="h-4 w-4 text-primary" />,
              label: "Probabilidad IA",
              value: analisis.probability,
              bg: "bg-primary/10",
            },
            {
              icon: <BarChart3 className="h-4 w-4 text-accent" />,
              label: "Confianza",
              value: `${analisis.percentage}%`,
              bg: "bg-accent/10",
            },
            {
              icon: <Shield className="h-4 w-4 text-accent" />,
              label: "Nivel",
              value: analisis.confidenceLevel,
              bg: "bg-accent/10",
              capitalizar: true,
            },
            {
              icon: <Cpu className="h-4 w-4 text-muted-foreground" />,
              label: "Modelo",
              value: analisis.modelUsed,
              bg: "bg-muted",
            },
          ].map((metrica, i) => (
            <div
              key={i}
              className={`${metrica.bg} rounded-xl p-4 flex flex-col gap-2 border border-border/50`}
            >
              <div className="flex items-center gap-1.5">
                {metrica.icon}
                <span className="text-xs font-medium text-muted-foreground">
                  {metrica.label}
                </span>
              </div>
              <span
                className={`text-lg font-bold leading-none text-foreground ${
                  metrica.capitalizar ? "capitalize" : ""
                }`}
              >
                {metrica.value}
              </span>
            </div>
          ))}
        </div>

        {totalSegmentos > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border rounded-xl p-4 text-center bg-secondary/50">
              <p className="text-2xl font-bold text-foreground">{totalSegmentos}</p>
              <p className="text-xs text-muted-foreground mt-1">Segmentos Totales</p>
            </div>
            <div className="border border-destructive/30 bg-destructive/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{segmentosIA.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Generados por IA</p>
            </div>
            <div className="border border-primary/30 bg-primary/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{segmentosHumanos.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Escritos por Humano</p>
            </div>
          </div>
        )}

        {totalSegmentos > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Desglose de Segmentos
              </h4>
              <Badge variant="outline" className="text-xs">
                {totalSegmentos} segmentos
              </Badge>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {analisis.segments!.map((segmento, indice) => (
                <div
                  key={indice}
                  className={`rounded-xl border p-4 ${
                    segmento.isLikelyAI
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-primary/10 border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {segmento.isLikelyAI ? (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-foreground">
                        Segmento {indice + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        IA:{" "}
                        <strong>
                          {(
                            parseFloat(segmento.aiProbability || "0") * 100
                          ).toFixed(1)}
                          %
                        </strong>
                      </span>
                      <span>
                        Pos: {segmento.startIndex}–{segmento.endIndex}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-card/60 rounded-lg px-3 py-2 italic">
                    "{segmento.text}"
                  </p>
                  {segmento.reasoning && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                      💡 {segmento.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" /> ID de Referencia de Análisis
          </p>
          <code className="text-xs font-mono text-foreground/70 break-all">
            {analisis.analysisId}
          </code>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm text-accent-foreground">
              <p className="font-semibold">Consideraciones Importantes</p>
              <ul className="space-y-1 text-xs text-accent-foreground/80 list-disc list-inside">
                <li>Las herramientas de detección de IA pueden producir falsos positivos o negativos.</li>
                <li>El contenido humano que sigue patrones predecibles puede ser marcado.</li>
                <li>Use esto como una señal — no como la única base para decisiones.</li>
                <li>Compare con el estilo de escritura previo del estudiante y otras entregas.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setMostrarModalAnalisisIA(false)}
            className="rounded-lg"
          >
            Cerrar Informe
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
};

  /* ─── Vista Principal ─── */
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Entregas
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {data.name} — Revisión de Entrega
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Estudiante: {data.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span>ID de Tarea: {data.id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Máx: {data.maxPoints} pts</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent-foreground">
              Fecha Límite: {formatearFechaCorta(data.deadline)}
            </span>
          </div>
          <Badge
            variant={obtenerVarianteEstado(data.submission?.status || "NOT_SUBMITTED")}
            className="px-3 py-2"
          >
            {formatearTextoEstado(data.submission?.status || "Not Submitted")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Resumen de la Tarea</h2>
              <Badge variant="outline" className="capitalize">
                {data.deliveryMode}
              </Badge>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Información de la Unidad</h3>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <p className="font-medium text-foreground">{data.unit}</p>
                  <p className="text-sm text-muted-foreground mt-1">Unidad Asociada</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Instrucciones</h3>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {data.instructions}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Puntos Máximos", value: data.maxPoints },
                  { label: "Modo de Entrega", value: data.deliveryMode, capitalizar: true },
                  {
                    label: "Fecha Límite",
                    value: new Date(data.deadline).toLocaleDateString(),
                  },
                  {
                    label: "Estado",
                    value: (
                      <Badge variant={data.isOverdue ? "destructive" : "default"}>
                        {data.isOverdue ? "Vencido" : "Activo"}
                      </Badge>
                    ),
                  },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {typeof item.value === "string" || typeof item.value === "number" ? (
                      <p className={`text-lg font-bold text-foreground ${item.capitalizar ? "capitalize" : ""}`}>
                        {item.value}
                      </p>
                    ) : (
                      <div className="mt-1">{item.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {data.submission && (
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-foreground">Entrega del Estudiante</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Entregado: {formatearFechaCorta(data.submission.submittedAt)}</span>
                  </div>
                  <Badge variant={obtenerVarianteEstado(data.submission.status)}>
                    {formatearTextoEstado(data.submission.status)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-6">
                {data.submission.isTeamSubmission && (
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        Entrega en Equipo: {data.submission.teamName}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Contenido de la Entrega</h3>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="whitespace-pre-wrap text-foreground">
                      {data.submission.content || "No se proporcionó contenido"}
                    </p>
                  </div>
                </div>
                {data.submission.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Adjuntos</h3>
                      <span className="text-sm text-muted-foreground">
                        {data.submission.attachments.length} archivo(s)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {data.submission.attachments.map((adjunto, indice) => (
                        <div
                          key={indice}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{adjunto.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {adjunto.storagePath}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownloadAttachment(adjunto)}
                            disabled={isDownloadingAttachment}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {isDownloadingAttachment ? "Descargando..." : "Descargar"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.submission.grade && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Calificación Actual</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {data.submission.grade.value} / {data.maxPoints}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {porcentaje.toFixed(1)}% alcanzado
                        </p>
                      </div>
                      <Badge variant={porcentaje >= 70 ? "default" : "secondary"}>
                        {porcentaje >= 70 ? "Aprobado" : "Necesita Mejorar"}
                      </Badge>
                    </div>
                    {data.submission.teacherFeedback && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <p className="text-sm font-medium text-foreground mb-1">Retroalimentación:</p>
                        <p className="text-sm text-muted-foreground">{data.submission.teacherFeedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">Calificar Entrega</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Ingresar Calificación</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={valorCalificacion}
                    onChange={(e) => setValorCalificacion(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    min="0"
                    max={data.maxPoints}
                  />
                  <span className="text-muted-foreground">/ {data.maxPoints}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Porcentaje Calculado</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={porcentaje.toFixed(1)}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <span className="text-foreground">%</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Retroalimentación para el Estudiante</label>
                <Textarea
                  value={retroalimentacion}
                  onChange={(e) => setRetroalimentacion(e.target.value)}
                  placeholder="Proporcione retroalimentación constructiva para ayudar al estudiante a mejorar..."
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleEnviarCalificacion}
                disabled={isUpdatingGrade || !valorCalificacion}
                className="w-full gap-2"
              >
                {isUpdatingGrade ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Actualizando Calificación...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    {data.submission?.grade ? "Actualizar Calificación" : "Enviar Calificación"}
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Análisis de Contenido IA</h2>
            </div>
            {data.submission?.aiAnalysis ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    data.submission.aiAnalysis.isLikelyAI
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-primary/10 border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {data.submission.aiAnalysis.isLikelyAI ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                      <p className="text-sm font-semibold text-foreground">
                        {data.submission.aiAnalysis.isLikelyAI
                          ? "Contenido IA Detectado"
                          : "Contenido Humano Confirmado"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.submission.aiAnalysis.isLikelyAI ? "destructive" : "default"
                      }
                      className="text-xs"
                    >
                      {data.submission.aiAnalysis.percentage}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analizado: {formatearFechaCorta(data.submission.aiAnalysis.analyzedAt)}
                  </p>
                </div>
                <Button
                  onClick={() => setMostrarModalAnalisisIA(true)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Análisis Completo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No se ha realizado ningún análisis de IA en esta entrega.
                </p>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                  <p className="text-sm text-accent-foreground">
                    El análisis de IA puede ayudar a detectar contenido generado por IA. Esta función requiere
                    activación manual.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">Detalles de la Entrega</h2>
            <div className="space-y-3">
              {[
                { icon: <User />, label: "Estudiante", value: data.studentName },
                { icon: <Hash />, label: "ID de Tarea", value: data.id, pequeno: true },
                {
                  icon: <Calendar />,
                  label: "Fecha Límite",
                  value: new Date(data.deadline).toLocaleDateString(),
                },
                {
                  icon: <File />,
                  label: "Modo de Entrega",
                  value: (
                    <Badge variant="outline" className="capitalize">
                      {data.deliveryMode}
                    </Badge>
                  ),
                },
                { icon: <BarChart3 />, label: "Puntos Máximos", value: data.maxPoints },
                {
                  icon: <Clock />,
                  label: "Estado de Entrega",
                  value: (
                    <Badge
                      variant={obtenerVarianteEstado(
                        data.submission?.status || "NOT_SUBMITTED"
                      )}
                    >
                      {formatearTextoEstado(data.submission?.status || "Not Submitted")}
                    </Badge>
                  ),
                },
                {
                  icon: <Users />,
                  label: "Estado de Tarea",
                  value: (
                    <Badge variant={data.isOverdue ? "destructive" : "default"}>
                      {data.isOverdue ? "Vencido" : "Activo"}
                    </Badge>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {React.cloneElement(item.icon as React.ReactElement<any>, {
                        className: "h-4 w-4",
                      })}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {typeof item.value === "string" || typeof item.value === "number" ? (
                    <span className={`font-medium text-foreground ${item.pequeno ? "text-xs" : ""}`}>
                      {item.value}
                    </span>
                  ) : (
                    item.value
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ModalAnalisisIA />
    </div>
  );
}