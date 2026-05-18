"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, UserPlus, Settings, Mail, Trash2, Loader2, BookOpen, Eye, Users } from "lucide-react";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { useAuth } from "@/app/context/AuthContext";
import { 
  useEnrollmentsByCourse, 
  useEnrollmentStats, 
  useAvailableUsersSearch,
  useStudentMutations 
} from "@/app/presentation/hooks/student/student-hooks";
import { Enrollment } from "@/app/domain/entities/CourseEntities";
import { User } from "@/app/domain/entities/IdentityEntities";

interface PropsEstudiantesCurso {
  courseId: CourseId;
}

export function CourseStudents({ courseId }: PropsEstudiantesCurso) {
  const { user: usuarioActual } = useAuth();
  const esProfesor = usuarioActual?.role === 'teacher';
  
  const {
    data: inscripciones = [], 
    isLoading: cargandoInscripciones,
    error: errorInscripciones,
    refetch: recargarInscripciones 
  } = useEnrollmentsByCourse(courseId);
  
  const { data: estadisticas } = useEnrollmentStats(courseId);

  const {
    createEnrollment: crearInscripcion, 
    bulkEnroll: inscripcionMasiva, 
    deleteEnrollment: eliminarInscripcion 
  } = useStudentMutations();

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarDetalleEstudiante, setMostrarDetalleEstudiante] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState<Enrollment | null>(null);
  const [terminoBusquedaInscripcion, setTerminoBusquedaInscripcion] = useState("");
  const [idsUsuarioSeleccionados, setIdsUsuarioSeleccionados] = useState<UserId[]>([]);

  const {
    data: resultadosBusqueda = [], 
    isLoading: buscando 
  } = useAvailableUsersSearch(courseId, terminoBusquedaInscripcion);

  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter((inscripcion) => {
      const busquedaLower = terminoBusqueda.toLowerCase();
      return (
        inscripcion.studentName.toLowerCase().includes(busquedaLower) ||
        inscripcion.studentEmail.toLowerCase().includes(busquedaLower)
      );
    });
  }, [inscripciones, terminoBusqueda]);

  const handleInscribirUsuario = (usuarioId: UserId) => {
    if (!esProfesor) return;
    
    crearInscripcion.mutate({
      courseId,
      studentId: usuarioId
    }, {
      onSuccess: () => {
        setTerminoBusquedaInscripcion('');
        setIdsUsuarioSeleccionados([]);
        setMostrarModalInscripcion(false);
      }
    });
  };

  const handleInscripcionMasiva = () => {
    if (!esProfesor || idsUsuarioSeleccionados.length === 0) return;
    
    inscripcionMasiva.mutate({
      courseId,
      studentIds: idsUsuarioSeleccionados
    }, {
      onSuccess: () => {
        setIdsUsuarioSeleccionados([]);
        setTerminoBusquedaInscripcion('');
        setMostrarModalInscripcion(false);
      }
    });
  };

  const handleEliminarEstudiante = () => {
    if (!esProfesor || !inscripcionSeleccionada) return;
    
    eliminarInscripcion.mutate({
      courseId,
      studentId: inscripcionSeleccionada.studentId
    }, {
      onSuccess: () => {
        setMostrarModalEliminar(false);
        setInscripcionSeleccionada(null);
      }
    });
  };

  const handleAlternarSeleccionUsuario = (usuarioId: UserId) => {
    if (!esProfesor) return;
    setIdsUsuarioSeleccionados(prev => 
      prev.includes(usuarioId) 
        ? prev.filter(id => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const formatearFecha = (fechaString: string) => {
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };
if (!esProfesor) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Compañeros de Clase</h1>
            {estadisticas && (
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {estadisticas.total} estudiantes
                </span>
                <span>Activos: {estadisticas.active}</span>
              </div>
            )}
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar compañeros..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {inscripcionesFiltradas.map((inscripcion) => (
            <TarjetaEstudianteSoloLectura
              key={inscripcion.id}
              inscripcion={inscripcion}
              onViewDetails={(e) => {
                setInscripcionSeleccionada(e);
                setMostrarDetalleEstudiante(true);
              }}
            />
          ))}
        </div>

        {!cargandoInscripciones && inscripcionesFiltradas.length === 0 && (
          <Card className="text-center p-12 border-2 border-dashed border-border">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron compañeros</h3>
            <p className="text-muted-foreground">No hay estudiantes que coincidan con tu criterio de búsqueda.</p>
          </Card>
        )}

        <DialogoDetalleEstudiante
          isOpen={mostrarDetalleEstudiante}
          onClose={() => setMostrarDetalleEstudiante(false)}
          inscripcion={inscripcionSeleccionada}
          formatDate={formatearFecha}
          isTeacher={false}
        />
      </div>
    );
  }

  if (cargandoInscripciones) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Cargando estudiantes...</p>
      </div>
    );
  }

  if (errorInscripciones) {
    return (
      <div className="p-8 text-center text-destructive">
        <div className="text-4xl mb-4">⚠️</div>
        <p>Error al cargar los estudiantes. Por favor, intente de nuevo.</p>
        <Button onClick={() => recargarInscripciones()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestión de Estudiantes</h1>
          {estadisticas && (
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Total: {estadisticas.total}</span>
              <span>Activos: {estadisticas.active}</span>
              {estadisticas.averageGrade > 0 && <span>Promedio: {estadisticas.averageGrade}%</span>}
            </div>
          )}
        </div>
        <Button
          onClick={() => setMostrarModalInscripcion(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          Inscribir Estudiantes
        </Button>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {inscripcionesFiltradas.map((inscripcion) => (
          <TarjetaEstudiante
            key={inscripcion.id}
            inscripcion={inscripcion}
            onViewDetails={(e) => {
              setInscripcionSeleccionada(e);
              setMostrarDetalleEstudiante(true);
            }}
            onDelete={(e) => {
              setInscripcionSeleccionada(e);
              setMostrarModalEliminar(true);
            }}
            isDeleting={eliminarInscripcion.isPending}
          />
        ))}
      </div>

      {inscripcionesFiltradas.length === 0 && (
        <Card className="text-center p-12 border-2 border-dashed border-border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay estudiantes inscritos</h3>
          <p className="text-muted-foreground mb-4">Comience inscribiendo estudiantes en este curso</p>
          <Button onClick={() => setMostrarModalInscripcion(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Inscribir Estudiantes
          </Button>
        </Card>
      )}

      {/* Modal de Inscripción */}
      <Dialog open={mostrarModalInscripcion} onOpenChange={setMostrarModalInscripcion}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Inscribir Estudiantes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="font-semibold mb-2 block text-foreground">Buscar Estudiantes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={terminoBusquedaInscripcion}
                  onChange={(e) => setTerminoBusquedaInscripcion(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {idsUsuarioSeleccionados.length > 0 && (
              <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  {idsUsuarioSeleccionados.length} estudiante(s) seleccionado(s)
                </p>
              </div>
            )}

            <div className="border border-border rounded-md max-h-96 overflow-y-auto">
              {buscando && (
                <div className="p-4 text-center flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                </div>
              )}

              {!buscando && resultadosBusqueda.length === 0 && terminoBusquedaInscripcion && (
                <div className="p-4 text-center text-muted-foreground">
                  No se encontraron estudiantes disponibles que coincidan con "{terminoBusquedaInscripcion}"
                </div>
              )}

              {resultadosBusqueda.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={idsUsuarioSeleccionados.includes(usuario.id)}
                      onChange={() => handleAlternarSeleccionUsuario(usuario.id)}
                      className="rounded accent-primary"
                    />
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {usuario.person.firstName[0]}{usuario.person.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {usuario.person.lastName}, {usuario.person.firstName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {usuario.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInscribirUsuario(usuario.id)}
                    disabled={crearInscripcion.isPending}
                  >
                    {crearInscripcion.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                    Inscribir
                  </Button>
                </div>
              ))}

              {!terminoBusquedaInscripcion && (
                <div className="p-4 text-center text-muted-foreground italic">
                  Comience a escribir para buscar estudiantes
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalInscripcion(false);
                setIdsUsuarioSeleccionados([]);
                setTerminoBusquedaInscripcion('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInscripcionMasiva}
              disabled={idsUsuarioSeleccionados.length === 0 || inscripcionMasiva.isPending}
              className="gap-2"
            >
              {inscripcionMasiva.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Inscribir {idsUsuarioSeleccionados.length} Seleccionado(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <Dialog open={mostrarModalEliminar} onOpenChange={setMostrarModalEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              ¿Está seguro de que desea eliminar a {inscripcionSeleccionada?.studentName} de este curso?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarModalEliminar(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminarEstudiante}
              disabled={eliminarInscripcion.isPending}
            >
              {eliminarInscripcion.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogoDetalleEstudiante
        isOpen={mostrarDetalleEstudiante}
        onClose={() => setMostrarDetalleEstudiante(false)}
        inscripcion={inscripcionSeleccionada}
        formatDate={formatearFecha}
        isTeacher={true}
      />
    </div>
  );
};


interface PropsTarjetaEstudiante {
  inscripcion: Enrollment;
  onViewDetails: (inscripcion: Enrollment) => void;
  onDelete: (inscripcion: Enrollment) => void;
  isDeleting: boolean;
}

const TarjetaEstudiante: React.FC<PropsTarjetaEstudiante> = ({
  inscripcion,
  onViewDetails,
  onDelete,
  isDeleting
}) => {
  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'ACTIVE': return 'bg-green-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const iniciales = inscripcion.studentName.split(' ').map(n => n[0]).join('').substring(0, 2);
return (
    <Card className="group hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Badge className={obtenerColorEstado(inscripcion.status)}>
            {inscripcion.status === 'ACTIVE' ? 'ACTIVO' : inscripcion.status === 'COMPLETED' ? 'COMPLETADO' : 'CANCELADO'}
          </Badge>
        </div>

        <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center">
          <div
            className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold cursor-pointer group-hover:scale-110 transition-transform"
            onClick={() => onViewDetails(inscripcion)}
          >
            {iniciales}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div
          className="text-center cursor-pointer"
          onClick={() => onViewDetails(inscripcion)}
        >
          <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors">
            {inscripcion.studentName}
          </h3>
          <p className="text-sm text-muted-foreground">{inscripcion.studentEmail}</p>
        </div>

        {inscripcion.finalGrade && (
          <div className="text-center">
            <Badge variant="secondary">
              Calificación: {inscripcion.finalGrade.grade}%
            </Badge>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-2 border-t border-border">
          <button
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => onViewDetails(inscripcion)}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <Mail className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(inscripcion)}
            className="p-2 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
const TarjetaEstudianteSoloLectura: React.FC<{
  inscripcion: Enrollment;
  onViewDetails: (inscripcion: Enrollment) => void;
}> = ({ inscripcion, onViewDetails }) => {
  const iniciales = inscripcion.studentName.split(' ').map(n => n[0]).join('').substring(0, 2);
return (
    <Card className="group hover:shadow-xl transition-all duration-300">
      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center">
        <div
          className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold cursor-pointer group-hover:scale-110 transition-transform"
          onClick={() => onViewDetails(inscripcion)}
        >
          {iniciales}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div
          className="text-center cursor-pointer"
          onClick={() => onViewDetails(inscripcion)}
        >
          <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors">
            {inscripcion.studentName}
          </h3>
          <p className="text-sm text-muted-foreground">{inscripcion.studentEmail}</p>
        </div>

        <div className="flex justify-center pt-2 border-t border-border">
          <button
            className="p-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => onViewDetails(inscripcion)}
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm">Ver Detalles</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

const DialogoDetalleEstudiante: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  inscripcion: Enrollment | null;
  formatDate: (date: string) => string;
  isTeacher: boolean;
}> = ({ isOpen, onClose, inscripcion, formatDate, isTeacher }) => {
  if (!inscripcion) return null;

  const iniciales = inscripcion.studentName.split(' ').map(n => n[0]).join('').substring(0, 2);
return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isTeacher ? 'Detalles del Estudiante' : 'Detalles del Compañero'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
              {iniciales}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{inscripcion.studentName}</h2>
              <p className="text-muted-foreground">{inscripcion.studentEmail}</p>
              <Badge className="mt-2">
                {inscripcion.status === 'ACTIVE' ? 'ACTIVO' : inscripcion.status === 'COMPLETED' ? 'COMPLETADO' : 'CANCELADO'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Información de Inscripción</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Fecha de Inscripción:</span>
                  <span className="text-foreground">{formatDate(inscripcion.enrollmentDate)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="text-foreground">
                    {inscripcion.status === 'ACTIVE' ? 'ACTIVO' : inscripcion.status === 'COMPLETED' ? 'COMPLETADO' : 'CANCELADO'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Ref. Estudiante:</span>
                  <span className="font-mono text-xs text-foreground">{inscripcion.studentRefId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};