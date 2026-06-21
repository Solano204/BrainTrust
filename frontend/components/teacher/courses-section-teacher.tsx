
"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Users, Clock, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Course } from "@/app/domain/entities/CourseEntities"
import { CourseId } from "@/app/domain/valueObjects/CourseValues"
import { useCoursesByTeacher } from "@/components/teacher/hooks/courses-hooks"

const COURSE_PALETTES = [
  { bg: "bg-primary",         text: "text-primary-foreground"  },  // navy / gold
  { bg: "bg-primary/75",      text: "text-primary-foreground"  },  // navy 75%
  { bg: "bg-accent",          text: "text-accent-foreground"   },  // gold
  { bg: "bg-accent/75",       text: "text-accent-foreground"   },  // gold 75%
  { bg: "bg-primary/55",      text: "text-primary-foreground"  },  // navy 55%
] as const;

const getCourseColor = (id: CourseId) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_PALETTES[hash % COURSE_PALETTES.length];
};

interface CoursesSectionProps {
  teacherId: string;
}

export function CoursesSectionTeacher({ teacherId }: CoursesSectionProps) {
  const initialItemsPerView = 2;
  const [showAllCourses, setShowAllCourses] = useState(false);

  const { data: courses = [], isLoading, error } = useCoursesByTeacher(teacherId);

  const visibleCourses = showAllCourses
    ? courses
    : courses.slice(0, initialItemsPerView);

  const handleViewAllClick = () => setShowAllCourses(prev => !prev);

  if (isLoading) {
    return (
      <Card className="p-6 h-64 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-primary font-medium">Cargando cursos...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 h-40 flex flex-col items-center justify-center space-y-3">
        <div className="text-destructive text-center">
          <p className="font-semibold">Error al cargar cursos</p>
          <p className="text-sm mt-1">Por favor, intenta de nuevo más tarde</p>
        </div>
        <button
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="p-6 h-40 flex flex-col items-center justify-center space-y-3">
        <p className="text-muted-foreground font-semibold">No se encontraron cursos activos.</p>
        <button className="text-sm font-medium text-primary hover:underline">
          Ver Cursos Archivados
        </button>
      </Card>
    );
  }

  const totalStudents = courses.reduce((total, course) => total + (course.enrollments?.length || 0), 0);
  const activeCourses = courses.filter(course => course.active).length;

  return (
  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">

    <div className="mb-6">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Mis Cursos</h2>
      <p className="text-xs text-muted-foreground mt-0.5">Activos este semestre</p>
      <div className="flex flex-wrap gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          {activeCourses} cursos activos
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {totalStudents} estudiantes totales
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-3">
          {visibleCourses.map((course) => {
            const palette       = getCourseColor(course.id);
            const studentsCount = course.enrollments?.length || 0;
            const lastAccess    = "Activo recientemente";

            return (
              <Link key={course.id} href={`/courses/${course.id}`} className="block">
                <div
                  className="group relative p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-muted/10 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  style={{ minHeight: '10rem' }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${palette.bg}`} />

                  {!course.active && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                      Archivado
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${palette.bg} flex items-center justify-center flex-shrink-0`}>
                      <BookOpen className={`w-5 h-5 ${palette.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold mb-2">
                        {course.code} • {course.grade}
                      </span>
                      <h3 className="font-semibold text-sm text-foreground leading-tight">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {studentsCount} estudiantes
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {course.units?.length || 0} unidades
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{lastAccess}</span>
                        {course.group && (
                          <>
                            <span>•</span>
                            <span>Grupo: {course.group}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
    </div>

    {courses.length > initialItemsPerView && (
      <button
        onClick={handleViewAllClick}
        className="w-full mt-6 py-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-xs font-semibold text-muted-foreground hover:text-primary transition-all"
      >
        {showAllCourses
          ? `Mostrar Menos (${initialItemsPerView} cursos)`
          : `Ver Todos los Cursos (${courses.length})`}
      </button>
    )}

  </div>
);
}
