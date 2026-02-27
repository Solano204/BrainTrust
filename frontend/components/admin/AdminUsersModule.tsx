"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  KeyRound,
} from "lucide-react";
import {
  useUsersPaginated,
  useUserMutations,
  useSearchUsersPaginated,
} from "@/components/admin/hooks/useUsers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeEmailModal } from "@/components/admin/ChangeEmailModal";
import { AdminResetPasswordModal } from "@/components/admin/AdminResetPasswordModal";
import { User } from "@/app/shared/models/user.model";
import { UserRole } from "@/app/shared/dtos/user.dto";
import { PaginationParams } from "@/app/shared/types/pagination";

// ─────────────────────────────────────────────
// PaginationControls
// ─────────────────────────────────────────────
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 pb-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalElements} usuarios
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filas por página:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Página {currentPage + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AccountManagementView  (main export)
// ─────────────────────────────────────────────
export default function AccountManagementView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "student" | "teacher" | "admin"
  >("all");

  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState("createdAt,desc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length >= 2;

  const getPaginationParams = (): PaginationParams => {
    const params: PaginationParams = { page, size: pageSize, sort };
    if (activeTab === "student") params.role = "STUDENT";
    else if (activeTab === "teacher") params.role = "TEACHER";
    else if (activeTab === "admin") params.role = "ADMIN";
    return params;
  };

  const getSearchPaginationParams = (): Omit<PaginationParams, "search"> => ({
    page,
    size: pageSize,
    sort,
    role:
      activeTab === "all"
        ? undefined
        : activeTab === "student"
        ? "STUDENT"
        : activeTab === "teacher"
        ? "TEACHER"
        : "ADMIN",
  });

  const {
    data: paginatedResponse,
    isLoading: isRegularLoading,
    error: regularError,
    refetch: refetchRegular,
  } = useUsersPaginated(getPaginationParams());

  const {
    data: searchPaginatedResponse,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchUsersPaginated(
    debouncedSearch.trim(),
    getSearchPaginationParams()
  );

  const currentResponse = isSearching
    ? searchPaginatedResponse
    : paginatedResponse;
  const isLoading = isSearching ? isSearchLoading : isRegularLoading;
  const error = isSearching ? searchError : regularError;
  const refetch = isSearching ? refetchSearch : refetchRegular;

  const users = currentResponse?.content || [];
  const totalElements = currentResponse?.totalElements || 0;
  const totalPages = currentResponse?.totalPages || 0;

  const { activateUser, deactivateUser, deleteUser } = useUserMutations();

  // ── Handlers ──────────────────────────────
  const handleChangeEmail = (user: User) => {
    setSelectedUser(user);
    setShowChangeEmailModal(true);
  };
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };
  const handleToggleActive = (user: User) => {
    setSelectedUser(user);
    setShowActivateModal(true);
  };
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSort = (field: "firstName" | "email" | "createdAt") => {
    const [currentField, currentDirection] = sort.split(",");
    setSort(
      currentField === field
        ? `${field},${currentDirection === "asc" ? "desc" : "asc"}`
        : `${field},desc`
    );
    setPage(0);
  };

  const confirmToggleActive = () => {
    if (!selectedUser) return;
    const mutation = selectedUser.active ? deactivateUser : activateUser;
    mutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setShowActivateModal(false);
        setSelectedUser(null);
        refetch();
      },
    });
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    deleteUser.mutate(selectedUser.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setSelectedUser(null);
        refetch();
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Helpers ───────────────────────────────
  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      TEACHER:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      STUDENT:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    };
    return <Badge className={colors[role]}>{role}</Badge>;
  };

  const getStatusBadge = (active: boolean) =>
    active ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      >
        <UserCheck className="h-3 w-3 mr-1" />
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <UserX className="h-3 w-3 mr-1" />
        Inactivo
      </Badge>
    );

  const sortIndicator = (field: string) =>
    sort.startsWith(field) ? (
      <span className="ml-1 text-xs">
        {sort.endsWith("desc") ? "↓" : "↑"}
      </span>
    ) : null;

  // ── Loading / Error ────────────────────────
  if (isLoading && page === 0) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">
          {isSearching ? "Buscando usuarios..." : "Cargando usuarios..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <div className="text-4xl mb-4">⚠️</div>
        <p>Error al cargar usuarios. Por favor intenta de nuevo.</p>
        <Button onClick={() => refetch()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Gestión de Cuentas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra emails, contraseñas y estado de las cuentas
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <Loader2
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
        {/* ← NO "Nuevo Usuario" button here */}
      </div>

      {/* ── Role filter tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v: any) => {
          setActiveTab(v);
          setPage(0);
        }}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            Todos
            {activeTab === "all" && (
              <Badge variant="secondary" className="ml-1">
                {totalElements}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="student" className="gap-2">
            <Users className="h-4 w-4" />
            Estudiantes
            {activeTab === "student" && (
              <Badge variant="secondary" className="ml-1">
                {totalElements}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="teacher" className="gap-2">
            <Shield className="h-4 w-4" />
            Profesores
            {activeTab === "teacher" && (
              <Badge variant="secondary" className="ml-1">
                {totalElements}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-2">
            <Shield className="h-4 w-4" />
            Admins
            {activeTab === "admin" && (
              <Badge variant="secondary" className="ml-1">
                {totalElements}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Search bar ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {isSearching && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            Buscando: &quot;{debouncedSearch}&quot;
          </Badge>
        )}
      </div>

      {/* ── Table ── */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 min-w-[160px]"
                  onClick={() => handleSort("firstName")}
                >
                  Nombre {sortIndicator("firstName")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 min-w-[200px]"
                  onClick={() => handleSort("email")}
                >
                  Email {sortIndicator("email")}
                </TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 min-w-[110px]"
                  onClick={() => handleSort("createdAt")}
                >
                  Creado {sortIndicator("createdAt")}
                </TableHead>
                <TableHead className="text-right">Acciones de Cuenta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {isSearching ? (
                      <>
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>
                          No se encontraron usuarios para &quot;
                          {debouncedSearch}&quot;
                        </p>
                      </>
                    ) : (
                      "No se encontraron usuarios"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.person.firstName[0]}
                        {user.person.lastName[0]}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.person.firstName} {user.person.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.active)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleChangeEmail(user)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Cambiar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user)}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Resetear Contraseña
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {users.length > 0 && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(0);
            }}
          />
        )}
      </Card>

      {/* ── Modals ── */}
      <ChangeEmailModal
        user={selectedUser}
        open={showChangeEmailModal}
        onClose={() => {
          setShowChangeEmailModal(false);
          setSelectedUser(null);
          refetch();
        }}
      />

      <AdminResetPasswordModal
        user={selectedUser}
        open={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedUser(null);
          refetch();
        }}
      />

      {/* Activate / Deactivate dialog */}
      <AlertDialog
        open={showActivateModal}
        onOpenChange={setShowActivateModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.active
                ? "Desactivar Usuario"
                : "Activar Usuario"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas{" "}
              {selectedUser?.active ? "desactivar" : "activar"} a{" "}
              <strong>
                {selectedUser?.person.firstName}{" "}
                {selectedUser?.person.lastName}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={activateUser.isPending || deactivateUser.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleActive}
              disabled={activateUser.isPending || deactivateUser.isPending}
            >
              {(activateUser.isPending || deactivateUser.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar Usuario
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar permanentemente a{" "}
              <strong>
                {selectedUser?.person.firstName}{" "}
                {selectedUser?.person.lastName}
              </strong>
              ?
              <br />
              <span className="text-destructive mt-2 inline-block font-semibold">
                ⚠️ Esta acción NO se puede deshacer.
              </span>
              <br />
              <span className="text-muted-foreground text-sm mt-2 inline-block">
                Se eliminarán todos los datos asociados al usuario.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}