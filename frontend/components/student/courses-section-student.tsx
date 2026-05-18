// DARK
"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Course } from "@/app/domain/entities/CourseEntities"
import { CourseId } from "@/app/domain/valueObjects/CourseValues"
import { useStudentCourses } from "@/app/presentation/hooks/course/student/student-hooks"

// ✅ was: returning hardcoded bg-blue-600, bg-purple-600, etc.
// Same palette pattern as CoursesSectionTeacher for visual consistency.
const COURSE_PALETTES = [
  { bg: "bg-primary",     text: "text-primary-foreground" },
  { bg: "bg-primary/75",  text: "text-primary-foreground" },
  { bg: "bg-accent",      text: "text-accent-foreground"  },
  { bg: "bg-accent/75",   text: "text-accent-foreground"  },
  { bg: "bg-primary/55",  text: "text-primary-foreground" },
] as const;

const getCourseColor = (id: CourseId) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_PALETTES[hash % COURSE_PALETTES.length];
};

interface StudentCoursesSectionProps {
  studentId: string;
}

export function CoursesSectionStudent({ studentId }: StudentCoursesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const initialItemsPerView = 2;
  const [showAllCourses, setShowAllCourses] = useState(false);

  const { data: courses = [], isLoading, error } = useStudentCourses(studentId);

  const canScrollUp   = currentIndex > 0 && !showAllCourses;
  const canScrollDown = currentIndex < courses.length - initialItemsPerView && !showAllCourses;

  const scrollUp   = () => { if (canScrollUp)   setCurrentIndex(currentIndex - 1); };
  const scrollDown = () => { if (canScrollDown) setCurrentIndex(currentIndex + 1); };

  const visibleCourses = showAllCourses
    ? courses
    : courses.slice(currentIndex, currentIndex + initialItemsPerView);

  const handleViewAllClick = () => {
    setShowAllCourses(prev => !prev);
    if (!showAllCourses) setCurrentIndex(0);
  };

  if (isLoading) {
    return (
      <Card className="p-6 h-64 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-primary font-medium">Cargando tus cursos...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 h-40 flex flex-col items-center justify-center space-y-3">
        <div className="text-destructive text-center">
          <p className="font-semibold">Error al cargar los cursos</p>
          <p className="text-sm mt-1">Por favor, inténtalo de nuevo más tarde</p>
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
        <p className="text-muted-foreground font-semibold">No se encontraron cursos inscritos.</p>
        <button className="text-sm font-medium text-primary hover:underline">
          Explorar Cursos Disponibles
        </button>
      </Card>
    );
  }

  const carouselHeight = showAllCourses ? 'auto' : 'h-[20rem]';
  const transformStyle = showAllCourses ? 'none' : `translateY(-${currentIndex * (200 + 16)}px)`;
  const activeCourses  = courses.filter(course => course.active).length;

  return (
  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">

    {/* ── Encabezado ── */}
    <div className="mb-6">
      <h2 className="text-lg font-bold text-foreground tracking-tight">Mis Cursos</h2>
      <p className="text-xs text-muted-foreground mt-0.5">Actualmente inscrito</p>
      <div className="flex flex-wrap gap-3 mt-3">
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          {activeCourses} cursos activos
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {courses.length} inscripciones totales
        </span>
      </div>
    </div>

    <div className="relative">

      {/* ── Flecha arriba ── */}
      {!showAllCourses && (
        <button
          onClick={scrollUp}
          disabled={!canScrollUp}
          className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center transition-all ${
            canScrollUp
              ? "hover:bg-primary hover:text-primary-foreground cursor-pointer opacity-100"
              : "opacity-30 cursor-not-allowed"
          }`}
          aria-label="Desplazar hacia arriba"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* ── Lista de cursos ── */}
      <div className={`overflow-hidden ${carouselHeight}`}>
        <div
          className={`transition-transform duration-500 ease-out space-y-3 ${showAllCourses ? 'grid grid-cols-1 sm:grid-cols-1 gap-3' : ''}`}
          style={{ transform: transformStyle }}
        >
          {visibleCourses.map((course) => {
            const palette        = getCourseColor(course.id);
            const studentsCount  = course.enrollments?.length || 0;
            const lastAccessTime = "Activo recientemente";

            return (
              <Link key={course.id} href={`/courses/${course.id}`} className="block">
                <div
                  className="group relative p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                  style={{ minHeight: '10rem' }}
                >
                  {/* Banda lateral izquierda coloreada */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${palette.bg} rounded-l-2xl`} />

                  {/* Etiqueta de archivado */}
                  {!course.active && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                      Archivado
                    </span>
                  )}

                  <div className="flex items-start gap-4 pl-2">
                    {/* Icono */}
                    <div className={`w-11 h-11 rounded-xl ${palette.bg} flex items-center justify-center flex-shrink-0`}>
                      <BookOpen className={`w-5 h-5 ${palette.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Etiqueta de código */}
                      <span className="inline-block mb-1.5 px-2 py-0.5 rounded-md bg-muted/50 border border-border text-xs font-semibold text-muted-foreground">
                        {course.code} • {course.grade}
                      </span>

                      {/* Nombre + descripción */}
                      <h3 className="font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {/* Fila de estadísticas */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {studentsCount} estudiantes
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {course.units?.length || 0} unidades
                        </span>
                      </div>

                      {/* Fila de pie de página */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/70">
                        <Clock className="w-3 h-3" />
                        <span>{lastAccessTime}</span>
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
      </div>

      {/* ── Flecha abajo ── */}
      {!showAllCourses && (
        <button
          onClick={scrollDown}
          disabled={!canScrollDown}
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center transition-all ${
            canScrollDown
              ? "hover:bg-primary hover:text-primary-foreground cursor-pointer opacity-100"
              : "opacity-30 cursor-not-allowed"
          }`}
          aria-label="Desplazar hacia abajo"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* ── Puntos de paginación ── */}
      {!showAllCourses && courses.length > initialItemsPerView && (
        <div className="flex justify-center gap-1.5 mt-6">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(Math.min(index, courses.length - initialItemsPerView))}
              className={`h-1.5 rounded-full transition-all ${
                index >= currentIndex && index < currentIndex + initialItemsPerView
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-border hover:bg-primary/50"
              }`}
              aria-label={`Ir al curso ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>

    {/* ── Ver todos / Mostrar menos ── */}
    {courses.length > initialItemsPerView && (
      <button
        onClick={handleViewAllClick}
        className="w-full mt-5 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs font-semibold text-muted-foreground hover:text-primary transition-all"
      >
        {showAllCourses
          ? `Mostrar Menos (${initialItemsPerView} cursos)`
          : `Ver Todos los Cursos (${courses.length})`}
      </button>
    )}

  </div>
);
}