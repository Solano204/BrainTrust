"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, FileText, CheckCircle } from 'lucide-react';
import { StudentGradebook } from '../student/api/student-gradebooks';
import { useCourseAllUnits } from '../teacher/hooks/courses-hooks';

interface PropsVistaUnidadesLibroCalificaciones {
  courseId: string;
  onSelectUnit: (unitId: string) => void;
  isTeacher: boolean;
  studentGradebook?: StudentGradebook | null;
  courseGradebooks?: any[];
  onAssignUnitFinalGrade?: (unitId: string, studentId: string, gradeValue: string, courseId: string, feedback?: string) => Promise<void>;
  onAssignCourseFinalGrade?: (studentId: string, gradeValue: string, feedback?: string) => Promise<void>;
}

export function GradebookUnitsView({
  courseId,
  onSelectUnit,
  isTeacher,
  studentGradebook,
  courseGradebooks,
  onAssignUnitFinalGrade,
  onAssignCourseFinalGrade,
}: PropsVistaUnidadesLibroCalificaciones) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [valorCalificacion, setValorCalificacion] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [asignandoCalificacion, setAsignandoCalificacion] = useState(false);

  // ✅ Seguimiento de qué diálogo está abierto por fila de estudiante usando studentId
  const [dialogoAbiertoStudentId, setDialogoAbiertoStudentId] = useState<string | null>(null);

  // ✅ Seguimiento del unitId seleccionado para la asignación de calificación actual
  const [unidadIdSeleccionada, setUnidadIdSeleccionada] = useState<string | null>(null);

  const [tareasPorUnidad, setTareasPorUnidad] = useState<Record<string, any[]>>({});
  // Estado separado para cada tipo de diálogo
  const [dialogoUnidadStudentId, setDialogoUnidadStudentId] = useState<string | null>(null);
  const [dialogoCursoStudentId, setDialogoCursoStudentId] = useState<string | null>(null);
  
  const resetearEstadoDialogo = () => {
    setValorCalificacion('');
    setRetroalimentacion('');
    setUnidadIdSeleccionada(null);
  };
  
  const {
    units: unidadesCurso,
    isLoading: cargandoUnidades,
    error: errorUnidades
  } = useCourseAllUnits(courseId);

  const unidadesFiltradas = unidadesCurso.filter(unidad =>
    unidad.name.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    unidad.description.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  useEffect(() => {
    if (studentGradebook?.tasks) {
      const tareasAgrupadas: Record<string, any[]> = {};
      studentGradebook.tasks.forEach(tarea => {
        if (!tareasAgrupadas[tarea.unitName]) {
          tareasAgrupadas[tarea.unitName] = [];
        }
        tareasAgrupadas[tarea.unitName].push(tarea);
      });
      setTareasPorUnidad(tareasAgrupadas);
    }
  }, [studentGradebook]);

  const obtenerCalificacionUnidad = (nombreUnidad: string) => {
    const tareas = tareasPorUnidad[nombreUnidad] || [];
    const tareasCalificadas = tareas.filter(tarea => tarea.score !== null);

    if (tareasCalificadas.length === 0) {
      return { grade: 'N/A', color: 'gray', completed: 0, total: tareas.length, tasks: tareas };
    }

    const puntuacionTotal = tareasCalificadas.reduce((sum, tarea) => sum + (tarea.score || 0), 0);
    const totalPuntosMaximos = tareasCalificadas.reduce((sum, tarea) => sum + tarea.maxPoints, 0);
    const porcentaje = (puntuacionTotal / totalPuntosMaximos) * 100;

    let color = 'red';
    if (porcentaje >= 90) color = 'green';
    else if (porcentaje >= 80) color = 'blue';
    else if (porcentaje >= 70) color = 'yellow';

    return { grade: `${porcentaje.toFixed(1)}%`, color, completed: tareasCalificadas.length, total: tareas.length, tasks: tareas };
  };


  // Manejador para calificación de UNIDAD
  const handleAsignarCalificacionUnidad = async (libroCalificaciones: any, unidadId: string) => {
    if (!onAssignUnitFinalGrade || !valorCalificacion.trim() || !unidadId) return;
    try {
      setAsignandoCalificacion(true);
      await onAssignUnitFinalGrade(unidadId, libroCalificaciones.studentId, valorCalificacion, courseId, retroalimentacion);
      setDialogoUnidadStudentId(null);
      setUnidadIdSeleccionada(null);
      setValorCalificacion('');
      setRetroalimentacion('');
    } catch (error) {
      console.error('Error al asignar la calificación de la unidad:', error);
    } finally {
      setAsignandoCalificacion(false);
    }
  };

  // Manejador para calificación final del CURSO
  const handleAsignarCalificacionCurso = async (libroCalificaciones: any) => {
    if (!onAssignCourseFinalGrade || !valorCalificacion.trim()) return;
    try {
      setAsignandoCalificacion(true);
      await onAssignCourseFinalGrade(libroCalificaciones.studentId, valorCalificacion, retroalimentacion);
      setDialogoCursoStudentId(null);
      setValorCalificacion('');
      setRetroalimentacion('');
    } catch (error) {
      console.error('Error al asignar la calificación del curso:', error);
    } finally {
      setAsignandoCalificacion(false);
    }
  };


  const handleAbrirDialogo = (studentId: string) => {
    setDialogoAbiertoStudentId(studentId);
    setValorCalificacion('');
    setRetroalimentacion('');
  };

  const handleCerrarDialogo = () => {
    setDialogoAbiertoStudentId(null);
    setUnidadIdSeleccionada(null);
    setValorCalificacion('');
    setRetroalimentacion('');
  };
if (cargandoUnidades) {
  return (
    <div className="flex justify-center items-center min-h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Cargando unidades...</span>
    </div>
  );
}

if (errorUnidades) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="pt-6">
        <div className="text-center text-destructive">
          <p>Error al cargar las unidades: {errorUnidades.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

return (
  <div className="space-y-6">
    {/* Barra de Búsqueda */}
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar unidades..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
        />
      </div>
    </div>

    {/* ── VISTA DE ESTUDIANTE ── */}
    {!isTeacher && studentGradebook && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unidadesFiltradas.map((unidad) => {
          const calificacionUnidad = obtenerCalificacionUnidad(unidad.name);
          return (
            <Card
              key={unidad.id}
              className="cursor-pointer transition-all border-border hover:border-primary hover:shadow-md hover:bg-secondary/30"
              onClick={() => onSelectUnit(unidad.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground flex items-center justify-between">
                  {unidad.name}
                  <Badge
                    variant="secondary"
                    className="bg-secondary text-foreground border border-border text-xs"
                  >
                    Unidad {unidad.numUnity}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-muted-foreground">{unidad.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-accent font-medium text-center pt-2 border-t border-border">
                  Haz clic para ver el desglose detallado de calificaciones
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}

    {/* ── VISTA DE PROFESOR ── */}
    {isTeacher && (
      <div className="space-y-6">
        {/* Tarjetas de unidades */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground">Gestionar Calificaciones de Estudiantes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Haz clic en una unidad para ver y gestionar las calificaciones de los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unidadesFiltradas.map((unidad) => (
                <Card
                  key={unidad.id}
                  className="cursor-pointer transition-all border-border hover:border-primary hover:shadow-md hover:bg-secondary/30"
                  onClick={() => onSelectUnit(unidad.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-foreground flex items-center justify-between">
                      {unidad.name}
                      <Badge
                        variant="secondary"
                        className="bg-secondary text-foreground border border-border text-xs"
                      >
                        Unidad {unidad.numUnity}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">{unidad.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Ver calificaciones de estudiantes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span>Asignar calificaciones finales</span>
                      </div>
                      <div className="text-xs text-accent font-medium text-center pt-2 border-t border-border">
                        Haz clic para gestionar calificaciones de esta unidad
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de calificaciones generales de estudiantes */}
        {courseGradebooks && courseGradebooks.length > 0 && (
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground">Calificaciones Generales de Estudiantes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Calificaciones finales para todos los estudiantes en este curso
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Nombre del Estudiante</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Calificación Final</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Total Calculado</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Última Actualización</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseGradebooks.map((libroCalificaciones) => (
                    <TableRow key={libroCalificaciones.studentId} className="border-border hover:bg-secondary/50 transition-colors">
                      <TableCell className="font-medium text-foreground">{libroCalificaciones.studentName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-base font-semibold bg-accent/10 text-accent-foreground border border-accent/20"
                        >
                          {libroCalificaciones.finalGrade || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {libroCalificaciones.calculatedTotal || 'No calculado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {libroCalificaciones.lastCalculated
                          ? new Date(libroCalificaciones.lastCalculated).toLocaleDateString()
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        {/* ── DIÁLOGO: Asignar Calificación Final del Curso ── */}
                        <Dialog
                          open={dialogoCursoStudentId === libroCalificaciones.studentId}
                          onOpenChange={(abierto) => {
                            if (!abierto) { setDialogoCursoStudentId(null); resetearEstadoDialogo(); }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => { setDialogoCursoStudentId(libroCalificaciones.studentId); resetearEstadoDialogo(); }}
                            >
                              Calificación del Curso
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="bg-card border-border">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Asignar Calificación Final del Curso</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Establecer la calificación final general para {libroCalificaciones.studentName} en este curso
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="course-grade" className="text-foreground">Calificación Final</Label>
                                <Input
                                  id="course-grade"
                                  value={valorCalificacion}
                                  onChange={(e) => setValorCalificacion(e.target.value)}
                                  placeholder="ej., 90"
                                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                                />
                              </div>
                              <div>
                                <Label htmlFor="course-feedback" className="text-foreground">Retroalimentación</Label>
                                <Textarea
                                  id="course-feedback"
                                  value={retroalimentacion}
                                  onChange={(e) => setRetroalimentacion(e.target.value)}
                                  placeholder="Retroalimentación opcional"
                                  rows={3}
                                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                className="border-border hover:bg-secondary"
                                onClick={() => { setDialogoCursoStudentId(null); resetearEstadoDialogo(); }}
                                disabled={asignandoCalificacion}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => handleAsignarCalificacionCurso(libroCalificaciones)}
                                disabled={!valorCalificacion.trim() || asignandoCalificacion}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                {asignandoCalificacion ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Asignando...
                                  </>
                                ) : (
                                  'Asignar Calificación del Curso'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    )}

    {/* Estados Vacíos */}
    {unidadesFiltradas.length === 0 && (
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6 pb-10">
          <div className="text-center text-muted-foreground py-4">
            <p className="font-medium text-foreground">No se encontraron unidades que coincidan con tu búsqueda.</p>
          </div>
        </CardContent>
      </Card>
    )}

    {!isTeacher && !studentGradebook && unidadesFiltradas.length > 0 && (
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6 pb-10">
          <div className="text-center text-muted-foreground space-y-1 py-4">
            <p className="font-medium text-foreground">Aún no hay información de calificaciones disponible.</p>
            <p className="text-sm">Tus calificaciones aparecerán aquí una vez que las tareas sean calificadas.</p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
}