"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Calculator, 
  Download, 
  Paperclip, 
  Link as LinkIcon, 
  Award,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react";
import type { Quiz, Question } from "@/app/domain/entities/CourseEntities";
import { useAuth } from "@/app/context/AuthContext";

interface PropsVistaQuiz {
  quiz: Quiz;
  onClose: () => void;
}

export function VistaQuiz({ quiz, onClose }: PropsVistaQuiz) {
  const { user } = useAuth();
  const esProfesor = user?.role === 'teacher';
  
  const puntosTotales = quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  
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

  const formatearFechaCreacion = (fechaString: string | undefined) => {
    if (!fechaString) return "N/A";
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

  const tiempoRestante = obtenerTiempoRestante(quiz.dueDate);
return (
  <div className="min-h-screen bg-background p-4 md:p-6">
    <div className="max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="mb-6 md:mb-8">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Recursos
        </Button>
        
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/30">
                QUIZ / EXAMEN
              </Badge>
              {quiz.active === false && (
                <Badge variant="secondary">Inactivo</Badge>
              )}
              {quiz.availableNow && (
                <Badge variant="default">Disponible</Badge>
              )}
              {quiz.acceptLateSubmissions && (
                <Badge variant="outline">Entregas tardías permitidas</Badge>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              {quiz.title}
            </h1>
            
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'Sin límite de tiempo'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {puntosTotales} puntos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {quiz.questions?.length || 0} preguntas
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-2 text-sm">
            <div className="text-muted-foreground">Creado el</div>
            <div className="font-medium text-foreground">{formatearFechaCreacion(quiz.createdAt)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          {/* Descripción del Quiz */}
          {quiz.description && (
            <Card>
              <CabeceraCard className="bg-primary/5 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                  <FileText className="h-5 w-5" />
                  Descripción del Quiz
                </CardTitle>
              </CabeceraCard>
              <ContenidoCard className="p-4 sm:p-6">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {quiz.description}
                </p>
              </ContenidoCard>
            </Card>
          )}

          <Card>
            <CabeceraCard className="border-b border-border">
              <CardTitle className="flex items-center justify-between gap-4 flex-wrap text-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Preguntas ({quiz.questions?.length || 0})
                </div>
                <Badge variant="outline" className="text-xs">
                  Puntos: {puntosTotales}
                </Badge>
              </CardTitle>
            </CabeceraCard>
            <ContenidoCard className="p-4 sm:p-6">
              {quiz.questions && quiz.questions.length > 0 ? (
                <div className="space-y-6 sm:space-y-8">
                  {quiz.questions.map((pregunta, indice) => (
                    <div key={pregunta.id || indice} className="pb-6 sm:pb-8 border-b last:border-b-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div>
                          <span className="font-bold text-base sm:text-lg text-foreground">
                            Pregunta {indice + 1}
                          </span>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Award className="h-3 w-3" />
                              {pregunta.points || 0} puntos
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {pregunta.type === 'multiple-choice' ? 'Opción Múltiple' : 'Respuesta Abierta'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 p-3 sm:p-4 bg-card/50 rounded-lg border border-border">
                        <p className="text-foreground text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                          {pregunta.question}
                        </p>
                      </div>

                      {pregunta.type === 'multiple-choice' && pregunta.options && (
                        <div className="space-y-3 ml-0 sm:ml-4">
                          <h4 className="font-semibold mb-3 text-muted-foreground text-sm">Opciones de Respuesta:</h4>
                          {pregunta.options.map((opcion, indiceOpcion) => (
                            <div 
                              key={indiceOpcion} 
                              className={`flex items-start sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
                                pregunta.correctAnswer === indiceOpcion 
                                  ? 'border-primary/50 bg-primary/5' 
                                  : 'border-border hover:bg-muted/30'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm ${
                                pregunta.correctAnswer === indiceOpcion 
                                  ? 'border-primary bg-primary text-primary-foreground' 
                                  : 'border-border text-foreground'
                              }`}>
                                {String.fromCharCode(65 + indiceOpcion)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm sm:text-base break-words ${pregunta.correctAnswer === indiceOpcion ? 'font-semibold text-primary' : 'text-foreground'}`}>
                                  {opcion}
                                </span>
                              </div>
                              {pregunta.correctAnswer === indiceOpcion && (
                                <Badge className="gap-1 bg-primary/10 text-primary border-primary/30 text-xs flex-shrink-0">
                                  <CheckCircle className="h-3 w-3" />
                                  Correcta
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {pregunta.type === 'open-ended' && (
                        <div className="space-y-4 ml-0 sm:ml-4">
                          {esProfesor && pregunta.expectedAnswer && (
                            <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/30">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <Badge className="bg-primary/10 text-primary border-primary/30 text-xs gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Respuesta Esperada
                                </Badge>
                                <span className="text-xs text-muted-foreground">(Para calificación)</span>
                              </div>
                              <div className="p-3 bg-card rounded border border-border">
                                <p className="text-foreground text-sm whitespace-pre-wrap">
                                  {pregunta.expectedAnswer}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {esProfesor ? "Área de Respuesta del Estudiante" : "Tu Respuesta"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground italic text-xs sm:text-sm">
                              {esProfesor 
                                ? "Los estudiantes escribirán su respuesta en esta área" 
                                : "Escribe tu respuesta aquí al realizar el quiz"}
                            </p>
                          </div>

                          {esProfesor && !pregunta.expectedAnswer && (
                            <div className="p-3 sm:p-4 bg-accent/10 rounded border border-accent/30">
                              <div className="flex items-start gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium text-accent-foreground">
                                  No se proporcionó respuesta esperada
                                </span>
                              </div>
                              <p className="text-xs text-accent-foreground ml-6">
                                Considera agregar una respuesta esperada como referencia para la calificación.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No se Agregaron Preguntas</h3>
                  <p className="text-muted-foreground text-sm">
                    Este quiz aún no tiene preguntas.
                  </p>
                </div>
              )}
            </ContenidoCard>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CabeceraCard className="border-b border-border">
              <CardTitle className="text-lg">Detalles del Quiz</CardTitle>
            </CabeceraCard>
            <ContenidoCard className="p-4 sm:p-6 space-y-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Límite de Tiempo
                </h4>
                <p className="font-medium text-sm text-foreground">
                  {quiz.timeLimit > 0 ? `${quiz.timeLimit} minutos` : 'Sin límite de tiempo'}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Fecha y Hora de Entrega
                </h4>
                <p className="font-medium text-sm text-foreground">{formatearFecha(quiz.dueDate)}</p>
                <div className="mt-2">
                  <Badge variant={tiempoRestante.color as "default"} className="text-xs">
                    {tiempoRestante.text}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  <Award className="inline h-3 w-3 mr-1" />
                  Puntos y Calificación
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Puntos Totales:</span>
                    <span className="font-bold text-primary">{puntosTotales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calificación Máx.:</span>
                    <span className="text-foreground">{quiz.maxGrade || 100}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">
                  Configuración de Intentos
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Máx. Intentos:</span>
                    <Badge variant="outline">
                      {quiz.maxAttempts === 0 || !quiz.maxAttempts ? 'Ilimitados' : quiz.maxAttempts}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mezclar Preguntas:</span>
                    <Badge variant={quiz.shuffleQuestions ? "default" : "secondary"}>
                      {quiz.shuffleQuestions ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mostrar Respuestas:</span>
                    <Badge variant={quiz.showCorrectAnswers ? "default" : "secondary"}>
                      {quiz.showCorrectAnswers ? 'Después' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </ContenidoCard>
          </Card>

          <Card>
            <CabeceraCard className="border-b border-border">
              <CardTitle className="text-lg">Disponibilidad</CardTitle>
            </CabeceraCard>
            <ContenidoCard className="p-4 sm:p-6 space-y-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Estado</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={quiz.availableNow ? "default" : "secondary"} className="text-xs">
                    {quiz.availableNow ? (
                      <>
                        <Unlock className="h-3 w-3 mr-1" />
                        Disponible
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        No Disponible
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {quiz.availableFrom && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Disponible Desde
                  </h4>
                  <p className="font-medium text-sm text-foreground">
                    {new Date(quiz.availableFrom).toLocaleString('es-ES')}
                  </p>
                </div>
              )}

              {quiz.availableUntil && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Disponible Hasta
                  </h4>
                  <p className="font-medium text-sm text-foreground">
                    {new Date(quiz.availableUntil).toLocaleString('es-ES')}
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Entregas Tardías
                </h4>
                <Badge variant={quiz.acceptLateSubmissions ? "default" : "secondary"} className="text-xs">
                  {quiz.acceptLateSubmissions ? 'Permitidas' : 'No permitidas'}
                </Badge>
              </div>
            </ContenidoCard>
          </Card>

          <Card>
            <CabeceraCard className="border-b border-border">
              <CardTitle className="text-lg">Información del Curso</CardTitle>
            </CabeceraCard>
            <ContenidoCard className="p-4 sm:p-6 space-y-4 text-sm">
              {quiz.courseName && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">
                    Curso
                  </h4>
                  <p className="font-medium text-foreground">{quiz.courseName}</p>
                </div>
              )}
              
              {quiz.unitName && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">
                    Unidad
                  </h4>
                  <p className="font-medium text-foreground">{quiz.unitName}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  ID del Quiz
                </h4>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded block truncate text-foreground">
                  {quiz.id}
                </code>
              </div>
            </ContenidoCard>
          </Card>

          <Card>
            <CabeceraCard className="border-b border-border">
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CabeceraCard>
            <ContenidoCard className="p-4 sm:p-6 space-y-2">
              {esProfesor && (
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Quiz
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start text-sm">
                <FileText className="h-4 w-4 mr-2" />
                Vista Previa de Impresión
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Copiar Enlace del Quiz
              </Button>
              
              {esProfesor && (
                <Button variant="outline" className="w-full justify-start text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Analíticas
                </Button>
              )}
            </ContenidoCard>
          </Card>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Última actualización: {formatearFechaCreacion(quiz.createdAt)}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cerrar
            </Button>
            {esProfesor && (
              <Button variant="default" className="text-sm">
                Editar Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

const CabeceraCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 border-b ${className}`}>
    {children}
  </div>
);

const ContenidoCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>
    {children}
  </div>
);