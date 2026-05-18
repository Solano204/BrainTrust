"use client";

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Plus, Trash2, UserPlus, X, Search, Edit, MoreVertical, Loader2, Eye } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { UserId, CourseId } from "@/app/domain/valueObjects/CourseValues"
import { 
  Team,
  TeamWithIds,
} from "@/app/domain/entities/CourseEntities"
import { 
  useAvailableUsers, 
  useTeamMutations, 
  useTeamsByCourse 
} from "./hooks/team-hooks"

interface PropsGruposCurso {
  courseId: CourseId
}

interface Usuario {
  id: UserId
  name: string
  email: string
}

export function CourseGroups({ courseId }: PropsGruposCurso) {
  const { user: usuarioActual } = useAuth();
  const esProfesor = usuarioActual?.role === 'teacher';
  
  const {
    data: datosEquipos, 
    isLoading: cargandoEquipos,
    error: errorEquipos,
    refetch: recargarEquipos 
  } = useTeamsByCourse(courseId);
  
  const equipos = datosEquipos?.teams || [];
  
  const { 
    data: datosUsuariosDisponibles, 
    isLoading: cargandoUsuarios,
    error: errorUsuarios 
  } = useAvailableUsers(courseId);

  const usuariosDisponibles = datosUsuariosDisponibles?.users || [];

  const {
    createTeam: crearEquipo, 
    deleteTeam: eliminarEquipo,
    addMembers: agregarMiembros,
    removeMember: eliminarMiembro,
    updateTeamInfo: actualizarInfoEquipo
  } = useTeamMutations();

  const [mostrarModalCrear, setMostrarModalCrear] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [mostrarModalAgregarMiembro, setMostrarModalAgregarMiembro] = useState(false)
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Team | null>(null)
  const [nombreNuevoEquipo, setNombreNuevoEquipo] = useState("")
  const [descripcionNuevoEquipo, setDescripcionNuevoEquipo] = useState("")
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<UserId[]>([])
  const [consultaBusquedaMiembro, setConsultaBusquedaMiembro] = useState("")
  const [confirmacionEliminarEquipo, setConfirmacionEliminarEquipo] = useState<string | null>(null)
  const [mostrarDetalleEquipo, setMostrarDetalleEquipo] = useState(false)

  const handleCrearEquipo = async () => {
    if (!esProfesor) return;
    
const nuevosDatosEquipo: TeamWithIds = {
  courseId,
  createdAt: new Date(),
  teamId: "",
  name: nombreNuevoEquipo,
  description: descripcionNuevoEquipo,
  members: new Set(miembrosSeleccionados),
  active: true,
};

    crearEquipo.mutate(nuevosDatosEquipo, {
      onSuccess: () => {
        setMostrarModalCrear(false);
        setNombreNuevoEquipo("");
        setDescripcionNuevoEquipo("");
        setMiembrosSeleccionados([]);
      }
    });
  };

  const handleActualizarEquipo = async () => {
    if (!esProfesor || !equipoSeleccionado) return;
    
    actualizarInfoEquipo.mutate({
      courseId,
      teamId: equipoSeleccionado.teamId,
      updates: {
        name: nombreNuevoEquipo,
        description: descripcionNuevoEquipo
      }
    }, {
      onSuccess: () => {
        setMostrarModalEditar(false);
        setEquipoSeleccionado(null);
        setNombreNuevoEquipo("");
        setDescripcionNuevoEquipo("");
      }
    });
  };

  const handleEliminarEquipo = async (equipoId: string) => {
    if (!esProfesor) return;
    
    eliminarEquipo.mutate({ courseId, teamId: equipoId }, {
      onSuccess: () => {
        setConfirmacionEliminarEquipo(null);
      }
    });
  };

  const handleAgregarMiembro = async () => {
    if (!esProfesor || !equipoSeleccionado) return;
    
    if (miembrosSeleccionados.length > 0) {
      agregarMiembros.mutate({ 
        courseId, 
        teamId: equipoSeleccionado.teamId, 
        memberIds: miembrosSeleccionados 
      }, {
        onSuccess: () => {
          setMostrarModalAgregarMiembro(false);
          setMiembrosSeleccionados([]);
          setEquipoSeleccionado(null);
          setConsultaBusquedaMiembro("");
        }
      });
    }
  };

  const handleEliminarMiembro = async (equipoId: string, miembroId: UserId) => {
    if (!esProfesor) return;
    eliminarMiembro.mutate({ courseId, teamId: equipoId, memberId: miembroId });
  };

  const obtenerUsuarioPorId = (usuarioId: UserId): Usuario | undefined => {
    return usuariosDisponibles.find(usuario => usuario.id === usuarioId)
  }

  const obtenerIdsMiembrosEquipo = (equipo: Team): UserId[] => {
    return Array.from(equipo.members).map(miembro => miembro.userId)
  }

  const usuariosDisponiblesFiltrados = useMemo(() => {
    const usuariosEnOtrosEquipos = new Set<UserId>();
    equipos.forEach(equipo => {
      if (!equipoSeleccionado || equipo.teamId !== equipoSeleccionado.teamId) {
        equipo.members.forEach(miembro => usuariosEnOtrosEquipos.add(miembro.userId));
      }
    });
    
    return usuariosDisponibles.filter(usuario =>
      !usuariosEnOtrosEquipos.has(usuario.id) && 
      usuario.name.toLowerCase().includes(consultaBusquedaMiembro.toLowerCase())
    );
  }, [usuariosDisponibles, equipos, equipoSeleccionado, consultaBusquedaMiembro]);
if (!esProfesor) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Grupos de Clase</h1>
        </div>

        {cargandoEquipos ? (
          <div className="text-center text-muted-foreground py-12">
            <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            Cargando grupos...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {equipos.map((equipo) => (
              <TarjetaEquipoSoloLectura
                key={equipo.teamId}
                equipo={equipo}
                usuariosDisponibles={usuariosDisponibles}
                obtenerUsuarioPorId={obtenerUsuarioPorId}
                onViewDetails={(equipo) => {
                  setEquipoSeleccionado(equipo);
                  setMostrarDetalleEquipo(true);
                }}
              />
            ))}
          </div>
        )}

        {equipos.length === 0 && !cargandoEquipos && (
          <Card className="text-center p-12 border-2 border-dashed border-border">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aún no hay grupos</h3>
            <p className="text-muted-foreground mb-4">No se han creado grupos para este curso.</p>
          </Card>
        )}

        <Dialog open={mostrarDetalleEquipo} onOpenChange={setMostrarDetalleEquipo}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Detalles del Grupo</DialogTitle>
            </DialogHeader>
            {equipoSeleccionado && (
              <VistaDetalleEquipo
                equipo={equipoSeleccionado}
                obtenerUsuarioPorId={obtenerUsuarioPorId}
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarDetalleEquipo(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (cargandoEquipos) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        Cargando equipos...
      </div>
    );
  }

  if (errorEquipos) {
    return (
      <div className="p-8 text-center text-destructive">
        <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
        Error al cargar los equipos. Por favor, intente de nuevo.
        <Button onClick={() => recargarEquipos()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestión de Equipos</h1>
        <Button
          onClick={() => setMostrarModalCrear(true)}
          className="gap-2 w-full sm:w-auto"
          disabled={crearEquipo.isPending}
        >
          <Plus className="h-4 w-4" />
          {crearEquipo.isPending ? "Creando..." : "Crear Equipo"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {equipos.map((equipo) => (
          <TarjetaEquipo
            key={equipo.teamId}
            equipo={equipo}
            usuariosDisponibles={usuariosDisponibles}
            obtenerUsuarioPorId={obtenerUsuarioPorId}
            obtenerIdsMiembrosEquipo={obtenerIdsMiembrosEquipo}
            onEdit={(equipo) => {
              setEquipoSeleccionado(equipo);
              setNombreNuevoEquipo(equipo.name);
              setDescripcionNuevoEquipo(equipo.description);
              setMostrarModalEditar(true);
            }}
            onAddMember={(equipo) => {
              setEquipoSeleccionado(equipo);
              setMostrarModalAgregarMiembro(true);
            }}
            onRemoveMember={handleEliminarMiembro}
            onDeleteTeam={handleEliminarEquipo}
            deleteConfirmTeam={confirmacionEliminarEquipo}
            setDeleteConfirmTeam={setConfirmacionEliminarEquipo}
            isDeleting={eliminarEquipo.isPending}
            isUpdating={eliminarMiembro.isPending}
            isTeacher={esProfesor}
          />
        ))}
      </div>

      {equipos.length === 0 && !cargandoEquipos && (
        <Card className="text-center p-12 border-2 border-dashed border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aún no hay equipos</h3>
          <p className="text-muted-foreground mb-4">Cree su primer equipo para comenzar</p>
          <Button onClick={() => setMostrarModalCrear(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Crear Equipo
          </Button>
        </Card>
      )}

      {/* Modal de Crear Equipo */}
      <Dialog open={mostrarModalCrear} onOpenChange={setMostrarModalCrear}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Crear Nuevo Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-foreground font-semibold">Nombre del Equipo</Label>
              <Input
                id="name"
                value={nombreNuevoEquipo}
                onChange={(e) => setNombreNuevoEquipo(e.target.value)}
                placeholder="Ingrese el nombre del equipo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-foreground font-semibold">Descripción</Label>
              <Textarea
                id="description"
                value={descripcionNuevoEquipo}
                onChange={(e) => setDescripcionNuevoEquipo(e.target.value)}
                placeholder="Ingrese la descripción del equipo"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground font-semibold">Miembros (Opcional)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-border rounded-md p-2">
                {usuariosDisponibles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No hay usuarios disponibles
                  </p>
                ) : (
                  usuariosDisponibles.map((usuario) => (
                    <label
                      key={usuario.id}
                      className="flex items-center gap-3 p-2 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={miembrosSeleccionados.includes(usuario.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMiembrosSeleccionados([...miembrosSeleccionados, usuario.id]);
                          } else {
                            setMiembrosSeleccionados(miembrosSeleccionados.filter((id) => id !== usuario.id));
                          }
                        }}
                        className="accent-primary rounded"
                      />
                      <span className="text-sm text-foreground">
                        {usuario.name} ({usuario.email})
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalCrear(false);
                setNombreNuevoEquipo("");
                setDescripcionNuevoEquipo("");
                setMiembrosSeleccionados([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCrearEquipo}
              disabled={!nombreNuevoEquipo || crearEquipo.isPending}
            >
              {crearEquipo.isPending ? "Creando..." : "Crear Equipo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Equipo */}
      <Dialog open={mostrarModalEditar} onOpenChange={setMostrarModalEditar}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name" className="text-foreground font-semibold">Nombre del Equipo</Label>
              <Input
                id="edit-name"
                value={nombreNuevoEquipo}
                onChange={(e) => setNombreNuevoEquipo(e.target.value)}
                placeholder="Ingrese el nombre del equipo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-foreground font-semibold">Descripción</Label>
              <Textarea
                id="edit-description"
                value={descripcionNuevoEquipo}
                onChange={(e) => setDescripcionNuevoEquipo(e.target.value)}
                placeholder="Ingrese la descripción del equipo"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalEditar(false);
                setEquipoSeleccionado(null);
                setNombreNuevoEquipo("");
                setDescripcionNuevoEquipo("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActualizarEquipo}
              disabled={!nombreNuevoEquipo || actualizarInfoEquipo.isPending}
            >
              {actualizarInfoEquipo.isPending ? "Actualizando..." : "Actualizar Equipo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Agregar Miembro */}
      <Dialog open={mostrarModalAgregarMiembro} onOpenChange={setMostrarModalAgregarMiembro}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Miembros a {equipoSeleccionado?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiantes por nombre..."
                value={consultaBusquedaMiembro}
                onChange={(e) => setConsultaBusquedaMiembro(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-md p-2">
              {usuariosDisponiblesFiltrados.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No se encontraron estudiantes</p>
              ) : (
                usuariosDisponiblesFiltrados.map((usuario) => (
                  <label
                    key={usuario.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={miembrosSeleccionados.includes(usuario.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMiembrosSeleccionados([...miembrosSeleccionados, usuario.id]);
                        } else {
                          setMiembrosSeleccionados(miembrosSeleccionados.filter((id) => id !== usuario.id));
                        }
                      }}
                      className="accent-primary rounded"
                    />
                    <span className="text-sm text-foreground">
                      {usuario.name} ({usuario.email})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalAgregarMiembro(false);
                setMiembrosSeleccionados([]);
                setEquipoSeleccionado(null);
                setConsultaBusquedaMiembro("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarMiembro}
              disabled={miembrosSeleccionados.length === 0 || agregarMiembros.isPending}
            >
              {agregarMiembros.isPending ? "Agregando..." : "Agregar Miembros"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PropsTarjetaEquipo {
  equipo: Team;
  usuariosDisponibles: Usuario[];
  obtenerUsuarioPorId: (userId: UserId) => Usuario | undefined;
  obtenerIdsMiembrosEquipo: (equipo: Team) => UserId[];
  onEdit: (equipo: Team) => void;
  onAddMember: (equipo: Team) => void;
  onRemoveMember: (teamId: string, memberId: UserId) => void;
  onDeleteTeam: (teamId: string) => void;
  deleteConfirmTeam: string | null;
  setDeleteConfirmTeam: (teamId: string | null) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  isTeacher: boolean;
}

const TarjetaEquipo: React.FC<PropsTarjetaEquipo> = ({
  equipo,
  usuariosDisponibles,
  obtenerUsuarioPorId,
  obtenerIdsMiembrosEquipo,
  onEdit,
  onAddMember,
  onRemoveMember,
  onDeleteTeam,
  deleteConfirmTeam,
  setDeleteConfirmTeam,
  isDeleting,
  isUpdating,
  isTeacher
}) => {
  const pendienteEliminacion = deleteConfirmTeam === equipo.teamId;
return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{equipo.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {equipo.members.size} miembros
                </Badge>
                {!equipo.active && (
                  <Badge variant="outline" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(equipo)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Equipo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddMember(equipo)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Miembros
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmTeam(equipo.teamId)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Equipo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {equipo.description && (
          <p className="text-sm text-muted-foreground">{equipo.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Miembros del Equipo:</span>
            {isTeacher && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddMember(equipo)}
                className="gap-1 h-7 text-xs"
              >
                <UserPlus className="h-3 w-3" />
                Agregar
              </Button>
            )}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {equipo.members.size === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">Aún no hay miembros</p>
            ) : (
              Array.from(equipo.members).map((miembro) => {
                const usuario = obtenerUsuarioPorId(miembro.userId);
                return usuario ? (
                  <div
                    key={miembro.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm border border-border/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{usuario.name}</span>
                    </div>
                    {isTeacher && (
                      <button
                        onClick={() => onRemoveMember(equipo.teamId, miembro.userId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar Miembro"
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    key={miembro.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm border border-border/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{miembro.fullName}</span>
                    </div>
                    {isTeacher && (
                      <button
                        onClick={() => onRemoveMember(equipo.teamId, miembro.userId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar Miembro"
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {isTeacher && pendienteEliminacion && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onDeleteTeam(equipo.teamId)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              {isDeleting ? "Eliminando..." : "Confirmar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmTeam(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
          </div>
        )}

        {equipo.createdAt && (
          <div className="text-xs text-muted-foreground">
            Creado: {equipo.createdAt.toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
};
const TarjetaEquipoSoloLectura: React.FC<{
  equipo: Team;
  usuariosDisponibles: Usuario[];
  obtenerUsuarioPorId: (userId: UserId) => Usuario | undefined;
  onViewDetails: (equipo: Team) => void;
}> = ({ equipo, usuariosDisponibles, obtenerUsuarioPorId, onViewDetails }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewDetails(equipo)}>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{equipo.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {equipo.members.size} miembros
                </Badge>
                {!equipo.active && (
                  <Badge variant="outline" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>

        {equipo.description && (
          <p className="text-sm text-muted-foreground">{equipo.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Miembros del Equipo:</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Array.from(equipo.members).slice(0, 5).map((miembro) => {
              const usuario = obtenerUsuarioPorId(miembro.userId);
              return usuario ? (
                <div
                  key={miembro.userId}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm border border-border/40"
                >
                  <span className="text-foreground">{usuario.name}</span>
                </div>
              ) : (
                <div
                  key={miembro.userId}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm border border-border/40"
                >
                  <span className="text-foreground">{miembro.fullName}</span>
                </div>
              );
            })}
            {equipo.members.size > 5 && (
              <div className="text-xs text-muted-foreground text-center">
                +{equipo.members.size - 5} miembros más
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Haga clic para ver detalles
        </div>
      </div>
    </Card>
  );
};

const VistaDetalleEquipo: React.FC<{
  equipo: Team;
  obtenerUsuarioPorId: (userId: UserId) => Usuario | undefined;
}> = ({ equipo, obtenerUsuarioPorId }) => {
  return (
    <div className="space-y-6 py-4">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
          <Users className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{equipo.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {equipo.members.size} miembros
            </Badge>
            {!equipo.active && (
              <Badge variant="outline" className="text-xs">
                Inactivo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {equipo.description && (
        <div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Descripción</h3>
          <p className="text-muted-foreground">{equipo.description}</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg mb-3 text-foreground">Miembros del Equipo</h3>
        <div className="space-y-2">
          {equipo.members.size === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aún no hay miembros</p>
          ) : (
            Array.from(equipo.members).map((miembro) => {
              const usuario = obtenerUsuarioPorId(miembro.userId);
              return (
                <div
                  key={miembro.userId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                      {miembro.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{miembro.fullName}</div>
                      {usuario && (
                        <div className="text-sm text-muted-foreground">{usuario.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {equipo.createdAt && (
        <div className="text-sm text-muted-foreground">
          Creado: {equipo.createdAt.toLocaleDateString()}
        </div>
      )}
    </div>
  );
};