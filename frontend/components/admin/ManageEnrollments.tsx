'use client';

import { useState } from 'react';
import {
  useAdminCourseEnrollments,
  useSearchStudentsForCourse,
  useBulkEnrollStudents,
  useBulkUnenrollStudents,
  useUnenrollStudentAdmin,
} from '@/components/admin/hooks/useCourses';
import { X, Search, UserPlus, UserMinus, Mail, Calendar, Loader2 } from 'lucide-react';
import { AdminCourse } from '@/app/shared/models/admin-course.model';

interface ManageEnrollmentsProps {
  course: AdminCourse;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageEnrollments({ course, isOpen, onClose }: ManageEnrollmentsProps) {
  const { data: enrollments, isLoading, refetch } = useAdminCourseEnrollments(course.id);
  const bulkEnrollMutation = useBulkEnrollStudents();
  const bulkUnenrollMutation = useBulkUnenrollStudents();
  const unenrollMutation = useUnenrollStudentAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [enrolledSelectedStudents, setEnrolledSelectedStudents] = useState<string[]>([]);
  const [showAddStudents, setShowAddStudents] = useState(false);

  const { data: availableStudents, isLoading: searchingStudents } = useSearchStudentsForCourse(
    course.id,
    showAddStudents ? searchTerm : ''
  );

  const handleBulkEnroll = async () => {
    if (selectedStudents.length === 0) return;

    try {
      await bulkEnrollMutation.mutateAsync({
        courseId: course.id,
        studentIds: selectedStudents,
      });
      setSelectedStudents([]);
      setSearchTerm('');
      setShowAddStudents(false);
      refetch();
    } catch (error) {
      console.error('Error al inscribir estudiantes:', error);
    }
  };

  const handleBulkUnenroll = async () => {
    if (enrolledSelectedStudents.length === 0) return;

 

    try {
      await bulkUnenrollMutation.mutateAsync({
        courseId: course.id,
        studentIds: enrolledSelectedStudents,
      });
      setEnrolledSelectedStudents([]);
      refetch();
    } catch (error) {
      console.error('Error al desinscribir estudiantes:', error);
    }
  };

  const handleUnenrollSingle = async (studentId: string) => {
   
    try {
      await unenrollMutation.mutateAsync({ courseId: course.id, studentId });
      refetch();
    } catch (error) {
      console.error('Error al desinscribir estudiante:', error);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleEnrolledSelection = (studentId: string) => {
    setEnrolledSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!isOpen) return null;
return (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      className="bg-card rounded-3xl border border-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
            <UserPlus className="w-4 h-4 text-primary" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Gestionar Inscripciones
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{course.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Total Inscritos
            </p>
            <p className="text-2xl font-bold text-foreground">
              {enrollments?.length || 0}
            </p>
          </div>
        </div>

        {/* Add Students */}
        {!showAddStudents ? (
          <button
            onClick={() => setShowAddStudents(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary/10 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Agregar Estudiantes al Curso
          </button>
        ) : (
          <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">

            {/* Add students header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Agregar Estudiantes
              </h3>
              <button
                onClick={() => { setShowAddStudents(false); setSelectedStudents([]); setSearchTerm(''); }}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar estudiantes por nombre o correo..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {searchingStudents ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Available students list */}
            {availableStudents && availableStudents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableStudents.map((student) => (
                  <div
                    key={student.userId}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => toggleStudentSelection(student.userId)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.userId)}
                      onChange={() => toggleStudentSelection(student.userId)}
                      className="w-4 h-4 accent-primary flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {student.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      <p className="text-xs text-muted-foreground/60">ID: {student.studentRefId}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length > 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                {searchingStudents ? 'Buscando...' : 'No se encontraron estudiantes disponibles'}
              </p>
            ) : (
              <p className="text-center py-8 text-sm text-muted-foreground">
                Ingresa un término de búsqueda para encontrar estudiantes
              </p>
            )}

            {selectedStudents.length > 0 && (
              <button
                onClick={handleBulkEnroll}
                disabled={bulkEnrollMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
              >
                {bulkEnrollMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Inscribiendo...</>
                ) : (
                  <><UserPlus className="w-4 h-4" />Inscribir {selectedStudents.length} Estudiante(s)</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Enrolled students */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Estudiantes Inscritos
            </h3>
            {enrolledSelectedStudents.length > 0 && (
              <button
                onClick={handleBulkUnenroll}
                disabled={bulkUnenrollMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 disabled:opacity-40 transition-all"
              >
                {bulkUnenrollMutation.isPending ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Desinscribiendo...</>
                ) : (
                  <><UserMinus className="w-3.5 h-3.5" />Desinscribir {enrolledSelectedStudents.length} Seleccionado(s)</>
                )}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando inscripciones...</span>
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:bg-muted/20 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={enrolledSelectedStudents.includes(enrollment.studentId)}
                    onChange={() => toggleEnrolledSelection(enrollment.studentId)}
                    className="w-4 h-4 accent-primary flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {enrollment.studentName}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-md font-semibold ${
                        enrollment.status === 'ACTIVE'
                          ? 'bg-primary/10 text-primary'
                          : enrollment.status === 'COMPLETED'
                          ? 'bg-accent/20 text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {enrollment.status === 'ACTIVE' ? 'ACTIVO' : enrollment.status === 'COMPLETED' ? 'COMPLETADO' : enrollment.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{enrollment.studentEmail}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {new Date(enrollment.enrollmentDate).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    {enrollment.finalGrade && (
                      <p className="mt-1 text-xs font-semibold text-primary">
                        Calificación: {enrollment.finalGrade.value}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnenrollSingle(enrollment.studentId)}
                    disabled={unenrollMutation.isPending}
                    className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-40 transition-all flex-shrink-0"
                    title="Desinscribir estudiante"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-sm text-muted-foreground">
              No hay estudiantes inscritos aún
            </p>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
);
}