'use client';


import { useState, useEffect } from "react";
import {
  useAdminCoursesPaginated,
  useDeleteCourseAdmin,
} from "@/components/admin/hooks/useCourses";
import {
  Trash2,
  Edit,
  Users,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { AdminCourse } from "@/app/shared/models/admin-course.model";

interface AdminCoursesListProps {
  onEditCourse?: (course: AdminCourse) => void;
  onManageEnrollments?: (course: AdminCourse) => void;
  onManageGrades?: (course: AdminCourse) => void;
  onCreateCourse?: () => void;
}

export function AdminCoursesList({
  onEditCourse,
  onManageEnrollments,
  onManageGrades,
  onCreateCourse,
}: AdminCoursesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState("createdAt,desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams = {
    page,
    size: pageSize,
    sort,
    search: debouncedSearch || undefined,
    active: filterStatus === "all" ? undefined : filterStatus === "active",
  };

  const {
    data: paginatedResponse,
    isLoading,
    error,
    refetch,
  } = useAdminCoursesPaginated(queryParams);
  const deleteMutation = useDeleteCourseAdmin();

  const courses = paginatedResponse?.content || [];
  const totalElements = paginatedResponse?.totalElements || 0;
  const totalPages = paginatedResponse?.totalPages || 0;

  const handleDelete = async (courseId: string) => {
    if (deleteConfirm === courseId) {
      try {
        await deleteMutation.mutateAsync(courseId);
        setDeleteConfirm(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    } else {
      setDeleteConfirm(courseId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (field: string) => {
    const [currentField, currentDirection] = sort.split(",");
    const newSort =
      currentField === field
        ? `${field},${currentDirection === "asc" ? "desc" : "asc"}`
        : `${field},desc`;
    setSort(newSort);
    setPage(0);
  };
  if (isLoading && page === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mr-2" />
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl">
        Error loading courses: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4  ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Gestión de Cursos{" "}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Administra todos los cursos, inscripciones y calificaciones
          </p>
        </div>
        <button
          onClick={onCreateCourse}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
        >
          <span className="text-base leading-none">+</span>
          Crear Nuevo Curso{" "}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Busca cursos por nombre, código o profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setPage(0);
              }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 appearance-none transition-all"
            >
              <option value="all">Todos los Cursos</option>
              <option value="active">Activos Solo</option>
              <option value="inactive">Inactivos Solo</option>
            </select>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          >
            <option value="12">12 / pagina</option>
            <option value="24">24 / pagina</option>
            <option value="48">48 / pagina</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Total de Cursos
          </p>
          <p className="text-2xl font-bold text-foreground">{totalElements}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Active Courses
          </p>
          <p className="text-2xl font-bold text-primary">
            {courses.filter((c) => c.active).length}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              / {courses.length}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => handleSortChange("name")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            sort.startsWith("name")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          Nombre {sort.startsWith("name") && (sort.endsWith("asc") ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSortChange("createdAt")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            sort.startsWith("createdAt")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          Fecha{" "}
          {sort.startsWith("createdAt") && (sort.endsWith("asc") ? "↑" : "↓")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`bg-card rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
              course.active ? "border-border" : "border-border opacity-60"
            }`}
          >
            <div className="h-40 bg-gradient-to-br from-primary to-primary/50 relative">
              {course.urlImage ? (
                <img
                  src={course.urlImage}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-foreground text-lg font-bold tracking-widest opacity-80">
                  {course.code}
                </div>
              )}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold shadow-sm ${
                    course.active
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {course.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-bold text-base text-foreground line-clamp-1">
                  {course.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {course.code}
                </p>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {course.description}
              </p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    Profesor: {course.teacherName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    {course.studentCount} Estudiantes
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    {course.unitCount} Unidades
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
                  Grado:{" "}
                  <span className="font-medium text-foreground">
                    {course.grade}
                  </span>{" "}
                  · Grupo:{" "}
                  <span className="font-medium text-foreground">
                    {course.group}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditCourse?.(course)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-all"
                  title="Editar Curso "
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only">Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  disabled={deleteMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    deleteConfirm === course.id
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}
                  title={
                    deleteConfirm === course.id
                      ? "Confirmar Eliminación"
                      : "Eliminar Curso"
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only">
                    {deleteConfirm === course.id ? "Confirm" : "Delete"}
                  </span>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <button
                  onClick={() => onManageEnrollments?.(course)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:opacity-80 transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  Inscripciones
                </button>
                <button
                  onClick={() => onManageGrades?.(course)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 text-accent-foreground text-xs font-semibold hover:bg-accent/20 transition-all"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Calificaciones
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
           Mostrando {" "}
            <span className="font-medium text-foreground">
              {page * pageSize + 1}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>
            {" de "}
            <span className="font-medium text-foreground">{totalElements}</span>
            {" cursos"}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(0)}
              disabled={page === 0}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Primera Página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i;
                else if (page < 3) pageNum = i;
                else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
                else pageNum = page - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                      page === pageNum
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Página Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Última Página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No se encontraron cursos para los criterios de búsqueda y filtro seleccionados.
        </div>
      )}

      {isLoading && page > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
