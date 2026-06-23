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
import { UserRole } from "@/app/shared/dtos/user.dto";
import { PaginationParams } from "@/app/shared/types/pagination";
import { User } from "@/app/shared/models/user.model";

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

    <p className="text-xs text-muted-foreground">
      Mostrando{" "}
      <span className="font-medium text-foreground">{startItem}–{endItem}</span>
      {" "}de{" "}
      <span className="font-medium text-foreground">{totalElements}</span>
      {" "}usuarios
    </p>

    <div className="flex items-center gap-4">

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Filas por página:
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-16 h-8 rounded-xl border-border bg-background text-xs focus:ring-ring/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border bg-card">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Primera página"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="px-3 py-1 rounded-xl bg-muted/50 text-xs font-semibold text-foreground border border-border whitespace-nowrap">
          {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Página siguiente"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Última página"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  </div>
);
}

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
  <div className="space-y-5">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Gestión de Cuentas
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Administra emails, contraseñas y estado de las cuentas
        </p>
      </div>
      <button
        onClick={() => refetch()}
        disabled={isLoading}
        className="btn-ghost w-full md:w-auto"
      >
        <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Actualizar
      </button>
    </div>

    <Tabs
      value={activeTab}
      onValueChange={(v: any) => { setActiveTab(v); setPage(0); }}
    >
      <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50 p-1 h-auto">
        {[
          { value: "all",     icon: Users,  label: "Todos" },
          { value: "student", icon: Users,  label: "Estudiantes" },
          { value: "teacher", icon: Shield, label: "Profesores" },
          { value: "admin",   icon: Shield, label: "Administradores" },
        ].map(({ value, icon: Icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-1.5 rounded-xl text-xs font-semibold py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.slice(0, 3)}</span>
            {activeTab === value && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold leading-none">
                {totalElements}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>

    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />
      </div>
      {isSearching && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 text-xs text-muted-foreground whitespace-nowrap">
          <Search className="h-3 w-3" />
          &ldquo;{debouncedSearch}&rdquo;
        </span>
      )}
    </div>

    <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground min-w-[160px] text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors"
                onClick={() => handleSort("firstName")}
              >
                Nombre {sortIndicator("firstName")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground min-w-[200px] text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors"
                onClick={() => handleSort("email")}
              >
                Correo {sortIndicator("email")}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rol</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground min-w-[110px] text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                Creado {sortIndicator("createdAt")}
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Acciones de Cuenta
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  {isSearching ? (
                    <>
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        No se encontraron usuarios para &ldquo;{debouncedSearch}&rdquo;
                      </p>
                    </>
                  ) : (
                    <p className="text-sm">No se encontraron usuarios</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors group">

                  <TableCell>
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {user.person.firstName[0]}
                      {user.person.lastName[0]}
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-sm text-foreground">
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
                        <button className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-border bg-card shadow-lg min-w-[190px]">
                        <DropdownMenuItem
                          onClick={() => handleChangeEmail(user)}
                          className="rounded-xl gap-2 text-sm cursor-pointer"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Cambiar Correo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(user)}
                          className="rounded-xl gap-2 text-sm cursor-pointer"
                        >
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                          Restablecer Contraseña
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(user)}
                          className="rounded-xl gap-2 text-sm cursor-pointer"
                        >
                          {user.active ? (
                            <><UserX className="h-4 w-4 text-muted-foreground" />Desactivar</>
                          ) : (
                            <><UserCheck className="h-4 w-4 text-muted-foreground" />Activar</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(user)}
                          className="rounded-xl gap-2 text-sm cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <div className="border-t border-border">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          />
        </div>
      )}
    </div>

    <ChangeEmailModal
      user={selectedUser }
      open={showChangeEmailModal}
      onClose={() => { setShowChangeEmailModal(false); setSelectedUser(null); refetch(); }}
    />
    <AdminResetPasswordModal
      user={selectedUser}
      open={showResetPasswordModal}
      onClose={() => { setShowResetPasswordModal(false); setSelectedUser(null); refetch(); }}
    />

    <AlertDialog open={showActivateModal} onOpenChange={setShowActivateModal}>
      <AlertDialogContent className="rounded-3xl border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {selectedUser?.active ? "Desactivar Usuario" : "Activar Usuario"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            ¿Estás seguro que deseas{" "}
            {selectedUser?.active ? "desactivar" : "activar"} a{" "}
            <strong className="text-foreground">
              {selectedUser?.person.firstName} {selectedUser?.person.lastName}
            </strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={activateUser.isPending || deactivateUser.isPending}
            className="rounded-xl border-border text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmToggleActive}
            disabled={activateUser.isPending || deactivateUser.isPending}
            className="rounded-xl font-semibold"
          >
            {(activateUser.isPending || deactivateUser.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <AlertDialogContent className="rounded-3xl border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-destructive/10 flex-shrink-0">
              <Trash2 className="h-4 w-4 text-destructive" />
            </span>
            Eliminar Usuario
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            ¿Estás seguro que deseas eliminar permanentemente a{" "}
            <strong className="text-foreground">
              {selectedUser?.person.firstName} {selectedUser?.person.lastName}
            </strong>?
            <span className="flex items-center gap-1.5 mt-3 text-destructive font-semibold text-xs bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-xl">
              ⚠️ Esta acción NO se puede deshacer.
            </span>
            <span className="block mt-2 text-xs text-muted-foreground">
              Se eliminarán todos los datos asociados al usuario.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteUser.isPending}
            className="rounded-xl border-border text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            disabled={deleteUser.isPending}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
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
