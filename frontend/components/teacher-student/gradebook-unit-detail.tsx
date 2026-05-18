"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, FileText, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useUnitGrades } from './hooks/gradebooks-hooks';
import { useAuth } from '@/app/context/AuthContext';

interface PropsDetalleUnidadLibroCalificaciones {
  courseId: string;
  unitId: string;
  onBack: () => void;
  isTeacher: boolean;
  onAssignUnitFinalGrade?: (unitId: string, studentId: string, gradeValue: string, courseId: string, feedback?: string) => Promise<void>;
}

interface ItemCalificacion {
  id: string;
  name: string;
  type: 'ASSIGNMENT' | 'QUIZ';
  score: number;
  maxPoints: number;
  graded: boolean;
  percentage: string;
}

interface VisualizacionCalificacionEstudiante {
  id: string;
  name: string;
  assignments: ItemCalificacion[];
  unitGrade: string;
  feedback?: string;
  lastCalculated?: string;
}

export function GradebookUnitDetail({
  unitId,
  onBack,
  isTeacher,
  onAssignUnitFinalGrade
}: PropsDetalleUnidadLibroCalificaciones) {
  const { user } = useAuth();
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);
  const [valorCalificacion, setValorCalificacion] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [asignandoCalificacion, setAsignandoCalificacion] = useState(false);

  const { 
    unitGrades: calificacionesUnidad, 
    loading: cargando, 
    error: error, 
    refresh: actualizar 
  } = useUnitGrades(unitId);

  const transformarCalificacionesUnidadAEstudiantes = (): VisualizacionCalificacionEstudiante[] => {
    const calificacionesFiltradas = isTeacher
      ? calificacionesUnidad 
      : calificacionesUnidad.filter(calificacion => calificacion.studentId === user?.id);

    return calificacionesFiltradas.map(calificacionUnidad => {
      const calificacionesTarea: ItemCalificacion[] = [];
      const calificacionesQuiz: ItemCalificacion[] = [];

      if (calificacionUnidad.assignmentGrades && typeof calificacionUnidad.assignmentGrades === 'object') {
        calificacionesTarea.push(
          ...Object.entries(calificacionUnidad.assignmentGrades).map(([id, calificacion]) => ({
            id,
            name: `Tarea ${id.split('_').pop() || id.split('-').pop() || id}`,
            type: 'ASSIGNMENT' as const,
            score: calificacion?.value ? parseFloat(calificacion.value.toString()) : 0,
            maxPoints: calificacion?.maxScore ? parseFloat(calificacion.maxScore.toString()) : 100,
            graded: true,
            percentage: calificacion?.percentage || '0%'
          }))
        );
      }

      if (calificacionUnidad.quizGrades && typeof calificacionUnidad.quizGrades === 'object') {
        calificacionesQuiz.push(
          ...Object.entries(calificacionUnidad.quizGrades).map(([id, calificacion]) => ({
            id,
            name: `Quiz ${id.split('_').pop() || id.split('-').pop() || id}`,
            type: 'QUIZ' as const,
            score: calificacion?.value ? parseFloat(calificacion.value.toString()) : 0,
            maxPoints: calificacion?.maxScore ? parseFloat(calificacion.maxScore.toString()) : 100,
            graded: true,
            percentage: calificacion?.percentage || '0%'
          }))
        );
      }

      return {
        id: calificacionUnidad.studentId,
        name: calificacionUnidad.studentName || `Estudiante ${calificacionUnidad.studentId}`,
        assignments: [...calificacionesTarea, ...calificacionesQuiz],
        unitGrade: calificacionUnidad.finalGrade || calificacionUnidad.calculatedTotal || 'N/A',
        feedback: calificacionUnidad.feedback,
        lastCalculated: calificacionUnidad.lastCalculated
      };
    });
  };

  const estudiantes = transformarCalificacionesUnidadAEstudiantes();

  const handleAsignarCalificacion = async (estudiante: any) => {
    if (!onAssignUnitFinalGrade || !valorCalificacion.trim()) return;
    
    try {
      setAsignandoCalificacion(true);
      await onAssignUnitFinalGrade(unitId, estudiante.id, valorCalificacion, retroalimentacion);
      setEstudianteSeleccionado(null);
      setValorCalificacion('');
      setRetroalimentacion('');
      actualizar();
    } catch (error) {
      console.error('Error al asignar la calificación de la unidad:', error);
    } finally {
      setAsignandoCalificacion(false);
    }
  };

  const obtenerColorCalificacion = (calificacion: string): string => {
    if (calificacion === 'N/A') return 'text-gray-600';
    
    const porcentaje = parseFloat(calificacion);
    if (isNaN(porcentaje)) return 'text-gray-600';
    
    if (porcentaje >= 90) return 'text-green-600';
    if (porcentaje >= 80) return 'text-blue-600';
    if (porcentaje >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };


if (cargando) {
  return (
    <div className="flex justify-center items-center min-h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Cargando detalles de la unidad...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-border hover:bg-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Unidades
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Detalles de la Unidad</h2>
          <p className="text-muted-foreground">Calificaciones de los estudiantes para esta unidad</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center text-destructive space-y-4">
            <p>Error al cargar las calificaciones de la unidad: {error}</p>
            <Button onClick={actualizar} variant="outline" className="border-border hover:bg-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

return (
  <div className="space-y-6">
    {/* Encabezado */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-border hover:bg-secondary shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Unidades
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {calificacionesUnidad.length > 0 ? calificacionesUnidad[0].unitName : 'Detalles de la Unidad'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isTeacher
              ? 'Calificaciones y tareas de los estudiantes para esta unidad'
              : 'Tus calificaciones y tareas para esta unidad'}
          </p>
        </div>
      </div>

      <Button onClick={actualizar} variant="outline" size="sm" className="border-border hover:bg-secondary self-start sm:self-auto">
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualizar
      </Button>
    </div>

    {/* Tarjeta principal de calificaciones */}
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground">{isTeacher ? 'Calificaciones de Estudiantes' : 'Tus Calificaciones'}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {isTeacher
            ? 'Ver y gestionar las calificaciones de los estudiantes para esta unidad'
            : 'Ver tus tareas y calificaciones para esta unidad'}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {estudiantes.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 space-y-1">
            <p className="font-medium text-foreground">No hay calificaciones disponibles para esta unidad.</p>
            <p className="text-sm">Las calificaciones aparecerán aquí una vez que las tareas sean entregadas y calificadas.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {isTeacher && <TableHead className="text-muted-foreground font-medium">Nombre del Estudiante</TableHead>}
                <TableHead className="text-muted-foreground font-medium">Tareas y Quizzes</TableHead>
                <TableHead className="text-muted-foreground font-medium">Calificación de la Unidad</TableHead>
                <TableHead className="text-muted-foreground font-medium">Última Actualización</TableHead>
                {isTeacher && <TableHead className="text-muted-foreground font-medium">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.map((estudiante) => (
                <TableRow key={estudiante.id} className="border-border hover:bg-secondary/50 transition-colors">
                  {isTeacher && (
                    <TableCell className="font-medium text-foreground">{estudiante.name}</TableCell>
                  )}
                  <TableCell>
                    <div className="space-y-2 max-w-md">
                      {estudiante.assignments.map((tarea) => (
                        <div key={tarea.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {tarea.type === 'ASSIGNMENT' ? (
                              <FileText className="h-3 w-3 text-primary" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-accent" />
                            )}
                            <span className="truncate text-foreground">{tarea.name}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-secondary text-foreground border border-border text-xs ml-2"
                          >
                            {tarea.score}/{tarea.maxPoints}
                          </Badge>
                        </div>
                      ))}
                      {estudiante.assignments.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          No se han entregado tareas
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-base font-semibold bg-accent/10 text-accent-foreground border border-accent/20 ${obtenerColorCalificacion(estudiante.unitGrade)}`}
                    >
                      {estudiante.unitGrade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {estudiante.lastCalculated
                      ? new Date(estudiante.lastCalculated).toLocaleDateString()
                      : 'Nunca'}
                  </TableCell>
                  {isTeacher && (
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-secondary"
                            onClick={() => setEstudianteSeleccionado(estudiante)}
                          >
                            Establecer Calificación Final
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Establecer Calificación Final de la Unidad</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Establecer la calificación final de la unidad para {estudiante.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="unit-grade" className="text-foreground">Calificación Final de la Unidad</Label>
                              <Input
                                id="unit-grade"
                                value={valorCalificacion}
                                onChange={(e) => setValorCalificacion(e.target.value)}
                                placeholder="ej., 95% o A"
                                required
                                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                              />
                            </div>
                            <div>
                              <Label htmlFor="unit-feedback" className="text-foreground">Retroalimentación de la Unidad</Label>
                              <Textarea
                                id="unit-feedback"
                                value={retroalimentacion}
                                onChange={(e) => setRetroalimentacion(e.target.value)}
                                placeholder="Retroalimentación para esta unidad (opcional)"
                                rows={3}
                                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                              />
                            </div>

                            <div className="rounded-lg border border-border bg-secondary p-3">
                              <Label className="text-sm font-medium text-foreground">Tareas Actuales</Label>
                              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                                {estudiante.assignments.map((tarea) => (
                                  <div key={tarea.id} className="flex justify-between text-xs text-muted-foreground">
                                    <span>{tarea.name}</span>
                                    <span className="text-foreground font-medium">
                                      {tarea.score}/{tarea.maxPoints} ({tarea.percentage})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              className="border-border hover:bg-secondary"
                              onClick={() => {
                                setEstudianteSeleccionado(null);
                                setValorCalificacion('');
                                setRetroalimentacion('');
                              }}
                              disabled={asignandoCalificacion}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => handleAsignarCalificacion(estudiante)}
                              disabled={!valorCalificacion.trim() || asignandoCalificacion}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {asignandoCalificacion ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Asignando...
                                </>
                              ) : (
                                'Establecer Calificación de Unidad'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>

    {/* Estadísticas de la unidad */}
    {isTeacher && estudiantes.length > 0 && (
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground">Estadísticas de la Unidad</CardTitle>
          <CardDescription className="text-muted-foreground">
            Resumen del rendimiento de los estudiantes en esta unidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-secondary border border-border">
              <div className="text-2xl font-bold text-primary">{estudiantes.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Estudiantes</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary border border-border">
              <div className="text-2xl font-bold text-accent">
                {(() => {
                  const calificaciones = estudiantes
                    .filter(s => s.unitGrade !== 'N/A')
                    .map(s => parseFloat(s.unitGrade));
                  return calificaciones.length > 0
                    ? `${(calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)}%`
                    : 'N/A';
                })()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Calificación Promedio</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary border border-border">
              <div className="text-2xl font-bold text-primary">
                {(() => {
                  const calificaciones = estudiantes
                    .filter(s => s.unitGrade !== 'N/A')
                    .map(s => parseFloat(s.unitGrade));
                  return calificaciones.length > 0
                    ? `${Math.max(...calificaciones).toFixed(1)}%`
                    : 'N/A';
                })()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Calificación Más Alta</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary border border-border">
              <div className="text-2xl font-bold text-muted-foreground">
                {(() => {
                  const calificaciones = estudiantes
                    .filter(s => s.unitGrade !== 'N/A')
                    .map(s => parseFloat(s.unitGrade));
                  return calificaciones.length > 0
                    ? `${Math.min(...calificaciones).toFixed(1)}%`
                    : 'N/A';
                })()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Calificación Más Baja</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
}