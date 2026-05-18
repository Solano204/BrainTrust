"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { useGradebook } from './hooks/gradebooks-hooks';

interface PropsLibroCalificacionesCurso {
  courseId: string;
}

export function LibroCalificacionesCurso({ courseId }: PropsLibroCalificacionesCurso) {
  const {
    gradebook: libroCalificaciones,
    courseGradebooks: librosCalificacionesCurso,
    loading: cargando,
    error: error,
    isStudent: esEstudiante,
    isTeacher: esProfesor,
    exportGrades: exportarCalificaciones,
    refresh: actualizar
  } = useGradebook(courseId);
if (cargando) {
  return (
    <div className="flex justify-center items-center min-h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Cargando libro de calificaciones...</span>
    </div>
  );
}

if (error) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="pt-6">
        <div className="text-center text-destructive space-y-4">
          <p>Error al cargar el libro de calificaciones: {error}</p>
          <Button onClick={actualizar} variant="outline" className="border-border hover:bg-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

if (!esEstudiante && !esProfesor) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="pt-10 pb-10">
        <div className="text-center text-muted-foreground">
          <p className="font-medium text-foreground">No tienes permiso para ver el libro de calificaciones.</p>
        </div>
      </CardContent>
    </Card>
  );
}

return (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Libro de Calificaciones</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {esEstudiante ? 'Ver tus calificaciones de unidad y progreso' : 'Gestionar calificaciones de unidad de estudiantes'}
        </p>
      </div>

      <div className="flex gap-2 self-start sm:self-auto">
        {esEstudiante && libroCalificaciones && (
          <Button
            onClick={async () => {
              try {
                const blob = await exportarCalificaciones(libroCalificaciones.studentId);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `calificaciones-${courseId}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error('Error al exportar:', err);
              }
            }}
            variant="outline"
            className="border-border hover:bg-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Calificaciones
          </Button>
        )}

        <Button onClick={actualizar} variant="outline" className="border-border hover:bg-secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    </div>

    <Card className="border-border shadow-sm">
      <CardContent className="pt-8 pb-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Por favor, usa la navegación superior para cambiar entre la vista de Unidades y la Vista General del Curso.</p>
        </div>
      </CardContent>
    </Card>
  </div>
);
}