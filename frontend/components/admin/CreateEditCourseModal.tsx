//DARK DUDOSO
"use client";

import { useState, useEffect, useRef } from "react";
import {
  useCreateCourseAdmin,
  useUpdateCourseAdmin,
  useAdminTeachersPaginated,
} from "@/components/admin/hooks/useCourses";

import {
  X,
  Search,
  ChevronDown,
  Loader2,
  User,
  Mail,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  Star,
  BookOpen,
} from "lucide-react";
import { ImageUploadWithValidation } from "../teacher-student/image-upload-with-validation";
import { AdminCourse } from "@/app/shared/models/admin-course.model";
import { CreateCourseCommand, UpdateCourseCommand } from "@/app/shared/dtos/commands/course.commands";
import { Teacher } from "@/app/shared/models/user.model";

interface CreateEditCourseModalProps {
  course?: AdminCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const getInitials = (fullName: string): string => {
  const parts = fullName.split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : fullName.substring(0, 2).toUpperCase();
};

export function CreateEditCourseModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: CreateEditCourseModalProps) {
  const isEdit = !!course;
  const createMutation = useCreateCourseAdmin();
  const updateMutation = useUpdateCourseAdmin();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    grade: "",
    group: "",
    teacherId: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [teacherSearch, setTeacherSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [teacherPage, setTeacherPage] = useState(0);
  const [teacherPageSize, setTeacherPageSize] = useState(10);
  const [teacherSort, setTeacherSort] = useState<"fullName,asc" | "email,asc">(
    "fullName,asc"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const teachersListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(teacherSearch);
      setTeacherPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [teacherSearch]);

  const {
    data: teachersData,
    isLoading: loadingTeachers,
    isFetching: fetchingTeachers,
    error: teachersError,
    refetch: refetchTeachers,
  } = useAdminTeachersPaginated({
    page: teacherPage,
    size: teacherPageSize,
    sort: teacherSort,
    search: debouncedSearch || undefined,
    active: true,
  });

  const teachers = teachersData?.content || [];
  const totalPages = teachersData?.totalPages || 0;
  const totalElements = teachersData?.totalElements || 0;

  const startItem = Math.min(teacherPage * teacherPageSize + 1, totalElements);
  const endItem = Math.min((teacherPage + 1) * teacherPageSize, totalElements);

  useEffect(() => {
    if (isOpen) {
      if (course) {
        setFormData({
          code: course.code,
          name: course.name,
          description: course.description,
          grade: course.grade,
          group: course.group,
          teacherId: course.teacherId,
          imageUrl: course.urlImage || "",
        });

        setImagePreview(course.urlImage || "");
        setImageFile(null);

        setTeacherSearch(`ID del Profesor: ${course.teacherId}`);
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          grade: "",
          group: "",
          teacherId: "",
          imageUrl: "",
        });
        setTeacherSearch("");
        setImagePreview("");
        setImageFile(null);
      }
    }
  }, [isOpen, course]);

  useEffect(() => {
    if (formData.teacherId && teachers.length > 0) {
      const teacher = teachers.find((t) => t.userId === formData.teacherId);
      if (teacher) {
        setTeacherSearch(teacher.fullName);
      }
    }
  }, [teachers, formData.teacherId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTeacherDropdown(false);
      }
    };

    if (showTeacherDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTeacherDropdown]);

  useEffect(() => {
    if (showTeacherDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showTeacherDropdown]);

  useEffect(() => {
    if (!isOpen) {
      setTeacherSearch("");
      setDebouncedSearch("");
      setTeacherPage(0);
      setShowTeacherDropdown(false);
      setImagePreview("");
      setImageFile(null);
    }
  }, [isOpen]);

  const handleImageChange = (
    imageData: { file: File; previewUrl: string; validationType: string } | null
  ) => {
    if (imageData) {
      setImageFile(imageData.file);
      setImagePreview(imageData.previewUrl);
      setFormData({ ...formData, imageUrl: imageData.previewUrl });
    } else {
      setImageFile(null);
      setImagePreview("");
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && course) {
        const command: UpdateCourseCommand = {
          name: formData.name,
          description: formData.description,
          grade: formData.grade,
          group: formData.group,
          teacherId: formData.teacherId,
          courseId: course.id

        };
        await updateMutation.mutateAsync({
          courseId: course.id,
          courseData: command,
          imageFile,
        });
      } else {
        let finalImageUrl = formData.imageUrl;

        if (imageFile) {
          // TODO: Implement image upload to your backend
          console.log("Imagen lista para subir:", imageFile);
        }

        const command: CreateCourseCommand = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          grade: formData.grade,
          group: formData.group,
          teacherId: formData.teacherId,
          urlImage: finalImageUrl,
        };
        await createMutation.mutateAsync({ courseData: command, imageFile });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al guardar el curso:", error);
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    if (!teacher.userId) {
      console.error("El objeto Teacher no tiene la propiedad userId:", teacher);
      return;
    }

    setFormData({ ...formData, teacherId: teacher.userId });
    setTeacherSearch(teacher.fullName);
    setShowTeacherDropdown(false);
    setTeacherPage(0);
  };

  const handleSearchChange = (value: string) => {
    setTeacherSearch(value);
    

    if (!value.trim()) {
      setFormData({ ...formData, teacherId: "" });
    }
  };

  const handleSearchFocus = () => {
    setShowTeacherDropdown(true);
    if (formData.teacherId) {
      setTeacherSearch("");
      setDebouncedSearch("");
    }
  };

  const handleNextPage = () => {
    if (teacherPage < totalPages - 1) {
      setTeacherPage(teacherPage + 1);
      if (teachersListRef.current) {
        teachersListRef.current.scrollTop = 0;
      }
    }
  };

  const handlePrevPage = () => {
    if (teacherPage > 0) {
      setTeacherPage(teacherPage - 1);
      if (teachersListRef.current) {
        teachersListRef.current.scrollTop = 0;
      }
    }
  };

  const handlePageSizeChange = (size: number) => {
    setTeacherPageSize(size);
    setTeacherPage(0);
  };

  const handleSortChange = (sort: "fullName,asc" | "email,asc") => {
    setTeacherSort(sort);
    setTeacherPage(0);
  };

  const selectedTeacher = teachers.find((t) => t.userId === formData.teacherId);
  const isLoading = loadingTeachers || fetchingTeachers;
  const error = teachersError;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(
        0,
        teacherPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage >= totalPages) {
        endPage = totalPages - 1;
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }

      if (startPage > 0) {
        pages.push(0);
        if (startPage > 1) pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) pages.push(-1);
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  if (!isOpen) return null;
return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-card rounded-3xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-border bg-card rounded-t-3xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {isEdit ? "Editar Curso" : "Crear Nuevo Curso"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? "Actualiza la información del curso y asigna profesor"
                : "Crea un nuevo curso con todos los detalles necesarios"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-5 py-6 sm:px-7 space-y-5 flex-1">

          {/* Course Code — create only */}
          {!isEdit && (
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Código del Curso *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="ej., CS-101, MATH-201, ENG-301"
                required
              />
              <p className="text-xs text-muted-foreground">
                Identificador único para el curso. Usa un formato consistente.
              </p>
            </div>
          )}

          {/* Course Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Nombre del Curso *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
              placeholder="ej., Introducción a la Computación"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Descripción *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all resize-none"
              rows={3}
              placeholder="Descripción breve del contenido, objetivos y requisitos del curso..."
              required
            />
          </div>

          {/* Grade + Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nivel / Grado *</label>
              <input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Grupo / Sección *</label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="ej., Sección A, Grupo 1"
                required
              />
            </div>
          </div>

          {/* Teacher picker */}
          <div className="relative space-y-1.5" ref={dropdownRef}>
            <label className="text-xs font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              Asignar Profesor *
            </label>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={teacherSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="Buscar profesor por nombre o correo..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTeacherDropdown ? "rotate-180" : ""}`} />
                )}
              </div>
            </div>

            {/* Selected teacher card */}
            {selectedTeacher && !showTeacherDropdown && (
              <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                    {getInitials(selectedTeacher.fullName)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground flex items-center gap-2 flex-wrap">
                      {selectedTeacher.fullName}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                        <Star className="w-3 h-3" />
                        Profesor
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{selectedTeacher.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setFormData({ ...formData, teacherId: "" }); setTeacherSearch(""); setDebouncedSearch(""); }}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
                  title="Eliminar profesor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dropdown */}
            {showTeacherDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-2xl shadow-xl max-h-[400px] overflow-hidden flex flex-col">

                {/* Dropdown header */}
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-foreground">
                      Seleccionar Profesor {totalElements > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                          {totalElements}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={teacherSort}
                        onChange={(e) => handleSortChange(e.target.value as any)}
                        className="text-xs px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                      >
                        <option value="fullName,asc">Por Nombre</option>
                        <option value="email,asc">Por Correo</option>
                      </select>
                      <select
                        value={teacherPageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="text-xs px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                      >
                        <option value="5">5 / página</option>
                        <option value="10">10 / página</option>
                        <option value="20">20 / página</option>
                      </select>
                    </div>
                  </div>
                  {debouncedSearch && (
                    <p className="text-xs text-muted-foreground">
                      Buscando: &ldquo;{debouncedSearch}&rdquo;
                    </p>
                  )}
                </div>

                {/* Loading */}
                {isLoading && teachers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" />
                    <p className="text-sm">Cargando profesores...</p>
                    {error && (
                      <p className="text-xs text-destructive mt-1">Error al cargar profesores. Por favor intenta de nuevo.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* List */}
                    <div ref={teachersListRef} className="flex-1 overflow-y-auto" style={{ maxHeight: "280px" }}>
                      {teachers.length > 0 ? (
                        teachers.map((teacher) => (
                          <button
                            key={teacher.userId}
                            type="button"
                            onClick={() => handleTeacherSelect(teacher)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs flex-shrink-0">
                                {getInitials(teacher.fullName)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {teacher.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{teacher.email}</span>
                                </p>
                              </div>
                            </div>
                            {formData.teacherId === teacher.userId && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <User className="w-10 h-10 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">
                            {debouncedSearch ? "No se encontraron profesores" : "No hay profesores disponibles"}
                          </p>
                          {debouncedSearch && (
                            <p className="text-xs text-muted-foreground/60 mt-1">Prueba con otro término de búsqueda</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dropdown pagination */}
                    {totalPages > 0 && (
                      <div className="border-t border-border bg-muted/30 flex-shrink-0">
                        <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground">{startItem}–{endItem}</span> de{" "}
                            <span className="font-medium text-foreground">{totalElements}</span> profesores
                          </span>
                          <span>
                            Página <span className="font-medium text-foreground">{teacherPage + 1}</span> de{" "}
                            <span className="font-medium text-foreground">{totalPages}</span>
                          </span>
                        </div>
                        <div className="px-4 py-2 flex items-center justify-between gap-1">
                          <button type="button" onClick={() => setTeacherPage(0)} disabled={teacherPage === 0}
                            className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronsLeft className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={handlePrevPage} disabled={teacherPage === 0}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Anterior
                          </button>
                          <div className="flex items-center gap-1">
                            {getPageNumbers().map((pageNum, index) =>
                              pageNum === -1 ? (
                                <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground text-xs select-none">…</span>
                              ) : (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => { setTeacherPage(pageNum); if (teachersListRef.current) teachersListRef.current.scrollTop = 0; }}
                                  className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                                    teacherPage === pageNum
                                      ? "bg-primary text-primary-foreground shadow-sm"
                                      : "border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                  }`}
                                >
                                  {pageNum + 1}
                                </button>
                              )
                            )}
                          </div>
                          <button type="button" onClick={handleNextPage} disabled={teacherPage >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            Siguiente
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => setTeacherPage(totalPages - 1)} disabled={teacherPage >= totalPages - 1}
                            className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronsRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Image upload — create only */}
          {!isEdit && (
            <ImageUploadWithValidation
              currentImageUrl={imagePreview}
              onImageChange={handleImageChange}
              label="Imagen de Portada del Curso"
              disabled={createMutation.isPending}
            />
          )}

        </div>

        {/* ── Footer ── */}
        <div className="border-t border-border bg-muted/30 px-5 py-4 sm:px-7 sticky bottom-0 flex-shrink-0 rounded-b-3xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending || updateMutation.isPending ||
                !formData.teacherId || !formData.name || !formData.description ||
                !formData.grade || !formData.group || (!isEdit && !formData.code)
              }
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Actualizando..." : "Creando..."}</>
              ) : (
                <><Check className="w-4 h-4" />{isEdit ? "Actualizar Curso" : "Crear Curso"}</>
              )}
            </button>
          </div>

          {/* Validation messages */}
          <div className="mt-3 space-y-2">
            {!formData.teacherId && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                <span className="font-semibold mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold">Profesor Requerido</p>
                  <p className="text-destructive/80">Por favor selecciona un profesor de la lista desplegable arriba.</p>
                </div>
              </div>
            )}
            {(createMutation.error || updateMutation.error) && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                <span className="font-semibold mt-0.5">❌</span>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-destructive/80">
                    {(createMutation.error || updateMutation.error)?.message || "Ocurrió un error al guardar el curso."}
                  </p>
                </div>
              </div>
            )}
            {(createMutation.isSuccess || updateMutation.isSuccess) && (
              <div className="flex items-start gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5">
                <span className="font-semibold mt-0.5">✅</span>
                <div>
                  <p className="font-semibold">¡Éxito!</p>
                  <p className="text-primary/80">{isEdit ? "¡Curso actualizado correctamente!" : "¡Curso creado correctamente!"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  </div>
);
}