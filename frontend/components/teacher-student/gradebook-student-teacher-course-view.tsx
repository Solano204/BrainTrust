"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentGradebook } from '../student/api/student-gradebooks';

interface PropsVistaLibroCalificacionesCurso {
  courseId: string;
  isTeacher: boolean;
  studentGradebook?: StudentGradebook | null;
  courseGradebooks?: any[];
}

export function GradebookCourseView({
  isTeacher,
  studentGradebook,
  courseGradebooks
}: PropsVistaLibroCalificacionesCurso) {

  const calcularCalificacionGeneral = (): { percentage: number; grade: string; completed: number; total: number } => {
    if (!studentGradebook) return { percentage: 0, grade: 'N/A', completed: 0, total: 0 };

    const tareasCalificadas = studentGradebook.tasks.filter(task => task.score !== null);
    const totalTareas = studentGradebook.tasks.length;
    
    if (tareasCalificadas.length === 0) {
      return { percentage: 0, grade: 'N/A', completed: 0, total: totalTareas };
    }

    const puntuacionTotal = tareasCalificadas.reduce((sum, task) => sum + (task.score || 0), 0);
    const totalPuntosMaximos = tareasCalificadas.reduce((sum, task) => sum + task.maxPoints, 0);
    const porcentaje = totalPuntosMaximos > 0 ? (puntuacionTotal / totalPuntosMaximos) * 100 : 0;

    return {
      percentage: porcentaje,
      grade: `${porcentaje.toFixed(1)}%`,
      completed: tareasCalificadas.length,
      total: totalTareas
    };
  };

  
  const obtenerColorCalificacion = (porcentaje: number): string => {
    if (porcentaje >= 90) return 'text-green-600';
    if (porcentaje >= 80) return 'text-blue-600';
    if (porcentaje >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const { percentage, grade, completed, total } = calcularCalificacionGeneral();

  const calcularEstadisticasCurso = () => {
    if (!courseGradebooks || courseGradebooks.length === 0) {
      return { average: 'N/A', highest: 'N/A', lowest: 'N/A', totalStudents: 0 };
    }

    const calificaciones = courseGradebooks
      .filter(gb => gb.finalGrade && gb.finalGrade !== 'N/A')
      .map(gb => {
        const valorCalificacion = parseFloat(gb.finalGrade);
        return isNaN(valorCalificacion) ? 0 : valorCalificacion;
      });

    if (calificaciones.length === 0) {
      return { average: 'N/A', highest: 'N/A', lowest: 'N/A', totalStudents: courseGradebooks.length };
    }

    const promedio = calificaciones.reduce((sum, calificacion) => sum + calificacion, 0) / calificaciones.length;
    const masAlta = Math.max(...calificaciones);
    const masBaja = Math.min(...calificaciones);

    return {
      average: `${promedio.toFixed(1)}%`,
      highest: `${masAlta.toFixed(1)}%`,
      lowest: `${masBaja.toFixed(1)}%`,
      totalStudents: courseGradebooks.length
    };
  };

  const estadisticasCurso = calcularEstadisticasCurso();
  const calificacionMostrada = studentGradebook?.finalGrade && studentGradebook.finalGrade !== 'N/A' ? studentGradebook.finalGrade : null;
  const obtenerCalificacionesPorUnidad = () => {
    if (!studentGradebook) return [];

    const mapaUnidades = new Map<string, {
      name: string;
      tasks: any[];
      gradedTasks: any[];
      totalScore: number;
      totalMaxPoints: number;
    }>();

    studentGradebook.tasks.forEach(tarea => {
      const nombreUnidad = tarea.unitName;
      if (!mapaUnidades.has(nombreUnidad)) {
        mapaUnidades.set(nombreUnidad, {
          name: nombreUnidad,
          tasks: [],
          gradedTasks: [],
          totalScore: 0,
          totalMaxPoints: 0
        });
      }
      
      const unidad = mapaUnidades.get(nombreUnidad)!;
      unidad.tasks.push(tarea);
      
      if (tarea.score !== null) {
        unidad.gradedTasks.push(tarea);
        unidad.totalScore += tarea.score;
        unidad.totalMaxPoints += tarea.maxPoints;
      }
    });

    return Array.from(mapaUnidades.values()).map(unidad => ({
      name: unidad.name,
      percentage: unidad.totalMaxPoints > 0 ? (unidad.totalScore / unidad.totalMaxPoints) * 100 : 0,
      grade: unidad.totalMaxPoints > 0 ? `${((unidad.totalScore / unidad.totalMaxPoints) * 100).toFixed(1)}%` : 'N/A',
      completed: unidad.gradedTasks.length,
      total: unidad.tasks.length,
      isComplete: unidad.gradedTasks.length === unidad.tasks.length
    }));
  };

  const calificacionesPorUnidad = obtenerCalificacionesPorUnidad();
  return (
  <div className="space-y-6">
    {!isTeacher && studentGradebook && (
      <>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground">Resumen del Curso</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tu progreso general y resumen de calificación final
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
              <span className="text-sm font-medium text-foreground">Calificación Final del Curso</span>
              <span className={`text-3xl font-bold ${obtenerColorCalificacion(percentage)}`}>
                {studentGradebook.calculatedTotal}
              </span>
            </div>

            {calificacionMostrada && (
              <div className="p-4 rounded-xl bg-muted border border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-bold text-lg ${obtenerColorCalificacion(percentage)}`}>
                    {calificacionMostrada}
                  </span>
                </div>
                {studentGradebook.finalFeedback && (
                  <div className="text-sm text-muted-foreground border-t border-border pt-3 mt-2">
                    <p className="font-medium text-foreground">Retroalimentación:</p>
                    <p className="mt-1">{studentGradebook.finalFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )}

    {isTeacher && courseGradebooks && courseGradebooks.length > 0 && (
      <>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground">Estadísticas del Curso</CardTitle>
            <CardDescription className="text-muted-foreground">
              Resumen del rendimiento de los estudiantes en este curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                <div className="text-2xl font-bold text-primary">{estadisticasCurso.totalStudents}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Estudiantes</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                <div className="text-2xl font-bold text-accent">{estadisticasCurso.average}</div>
                <div className="text-xs text-muted-foreground mt-1">Calificación Promedio</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                <div className="text-2xl font-bold text-primary">{estadisticasCurso.highest}</div>
                <div className="text-xs text-muted-foreground mt-1">Calificación Más Alta</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                <div className="text-2xl font-bold text-muted-foreground">{estadisticasCurso.lowest}</div>
                <div className="text-xs text-muted-foreground mt-1">Calificación Más Baja</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground">Calificaciones Finales de los Estudiantes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Calificaciones finales del curso para todos los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Nombre del Estudiante</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Calificación Final</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Total Calculado</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Última Actualización</TableHead>
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
                    <TableCell>
                      <Badge
                        variant={libroCalificaciones.finalGrade && libroCalificaciones.finalGrade !== 'N/A' ? "default" : "outline"}
                        className={
                          libroCalificaciones.finalGrade && libroCalificaciones.finalGrade !== 'N/A'
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border text-muted-foreground"
                        }
                      >
                        {libroCalificaciones.finalGrade && libroCalificaciones.finalGrade !== 'N/A' ? 'Calificado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {libroCalificaciones.lastCalculated
                        ? new Date(libroCalificaciones.lastCalculated).toLocaleDateString()
                        : 'Nunca'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    )}

    {isTeacher && (!courseGradebooks || courseGradebooks.length === 0) && (
      <Card className="border-border shadow-sm">
        <CardContent className="pt-10 pb-10">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">No hay datos de estudiantes disponibles.</p>
            <p className="text-sm">Los estudiantes aparecerán aquí una vez que estén inscritos en el curso.</p>
          </div>
        </CardContent>
      </Card>
    )}

    {!isTeacher && !studentGradebook && (
      <Card className="border-border shadow-sm">
        <CardContent className="pt-10 pb-10">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">No hay datos del libro de calificaciones disponibles.</p>
            <p className="text-sm">Tus calificaciones aparecerán aquí una vez que las tareas sean calificadas.</p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
}