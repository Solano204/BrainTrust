"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Users,
  UserCheck,
  UserX,
  MapPin,
  Shield,
  X,
  Save,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import {
  CreateCompleteUserCommand,
  UpdatePersonAddressCommand,
  UpdateUserInfoCommand,
} from "@/app/shared/dtos/commands/user.commands";
import { User } from "@/app/shared/models/user.model";
import { UserRole } from "@/app/shared/dtos/user.dto";
import { PaginationParams } from "@/app/shared/types/pagination";

// ─────────────────────────────────────────────
// UserFormModal  (Personal data + create user)
// ─────────────────────────────────────────────
interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: User;
  onSave: (
    userData:
      | CreateCompleteUserCommand
      | UpdateUserInfoCommand
      | UpdatePersonAddressCommand
  ) => void;
  isSaving?: boolean;
}

function UserFormModal({
  open,
  onClose,
  initialData,
  onSave,
  isSaving,
}: UserFormModalProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE",
    role: "STUDENT" as UserRole,
    password: "",
    addressStreet: "",
    addressColony: "",
    addressMunicipality: "",
    addressState: "",
    addressPostalCode: "",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          firstName: initialData.person.firstName,
          lastName: initialData.person.lastName,
          email: initialData.email,
          phone: initialData.person.phone || "",
          gender: initialData.person.gender || "MALE",
          role: initialData.role,
          password: "",
          addressStreet: initialData.person.address?.street || "",
          addressColony: initialData.person.address?.colony || "",
          addressMunicipality: initialData.person.address?.municipality || "",
          addressState: initialData.person.address?.state || "",
          addressPostalCode: initialData.person.address?.postalCode || "",
        });
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "MALE",
          role: "STUDENT",
          password: "",
          addressStreet: "",
          addressColony: "",
          addressMunicipality: "",
          addressState: "",
          addressPostalCode: "",
        });
      }
    }
  }, [open, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode) {
      const updateUserInfoData: UpdateUserInfoCommand = {
        userId: initialData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        phone: formData.phone,
      };
      const updateAddressData: UpdatePersonAddressCommand = {
        personId: initialData.person.id,
        street: formData.addressStreet,
        colony: formData.addressColony,
        municipality: formData.addressMunicipality,
        state: formData.addressState,
        postalCode: formData.addressPostalCode,
      };
      onSave({
        updateUserInfo: updateUserInfoData,
        updateAddress: updateAddressData,
      } as any);
    } else {
      const createData: CreateCompleteUserCommand = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        role: formData.role,
        addressStreet: formData.addressStreet || undefined,
        addressColony: formData.addressColony || undefined,
        addressMunicipality: formData.addressMunicipality || undefined,
        addressState: formData.addressState || undefined,
        addressPostalCode: formData.addressPostalCode || undefined,
      };
      onSave(createData as any);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              {isEditMode ? "Editar Datos Personales" : "Crear Persona"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSaving}
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-semibold">
                    Nombre *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    placeholder="Ej: Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-semibold">
                    Apellidos *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    placeholder="Ej: Pérez García"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-semibold">
                    Género *
                  </Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={isSaving}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="+52 961 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Account info — only shown on CREATE */}
            {!isEditMode && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">
                  Información de Cuenta
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    placeholder="usuario@universidad.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold">
                    Contraseña *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-semibold">
                    Rol *
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={isSaving}
                  >
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Profesor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección {!isEditMode && "(Opcional)"}
              </h3>
              <div className="space-y-2">
                <Label htmlFor="addressStreet">Calle</Label>
                <Input
                  id="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Calle Principal #123"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressColony">Colonia</Label>
                  <Input
                    id="addressColony"
                    value={formData.addressColony}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressMunicipality">Municipio</Label>
                  <Input
                    id="addressMunicipality"
                    value={formData.addressMunicipality}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="Comitán"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressState">Estado</Label>
                  <Input
                    id="addressState"
                    value={formData.addressState}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="Chiapas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressPostalCode">Código Postal</Label>
                  <Input
                    id="addressPostalCode"
                    value={formData.addressPostalCode}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="30000"
                    pattern="[0-9]{5}"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t bg-muted/50 sticky bottom-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 w-full sm:w-auto"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving
                ? "Guardando..."
                : isEditMode
                ? "Guardar Cambios"
                : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// UserDetailModal
// ─────────────────────────────────────────────
interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

function UserDetailModal({ user, open, onClose }: UserDetailModalProps) {
  if (!open || !user) return null;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles Personales
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.person.firstName[0]}
              {user.person.lastName[0]}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">
                {user.person.firstName} {user.person.lastName}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                ID Persona: <span className="font-mono">{user.person.id}</span>
              </p>
            </div>
          </div>

          {/* Personal info */}
          <div>
            <h4 className="font-semibold mb-3">Datos Personales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Teléfono</p>
                <p className="font-medium">
                  {user.person.phone || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Género</p>
                <p className="font-medium">
                  {user.person.gender === "MALE"
                    ? "Masculino"
                    : user.person.gender === "FEMALE"
                    ? "Femenino"
                    : user.person.gender || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de registro</p>
                <p className="font-medium">
                  {formatDate(user.person.registrationDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {user.person.address && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </h4>
              <div className="text-sm space-y-1">
                <p>{user.person.address.street}</p>
                <p>
                  Col. {user.person.address.colony},{" "}
                  {user.person.address.municipality}
                </p>
                <p>
                  {user.person.address.state}, CP{" "}
                  {user.person.address.postalCode}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t sticky bottom-0 bg-card">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
}

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
// PersonalDataView  (main export)
// ─────────────────────────────────────────────
export default function PersonalDataView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "student" | "teacher" | "admin"
  >("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  } = useSearchUsersPaginated(debouncedSearch.trim(), getSearchPaginationParams());

  const currentResponse = isSearching ? searchPaginatedResponse : paginatedResponse;
  const isLoading = isSearching ? isSearchLoading : isRegularLoading;
  const error = isSearching ? searchError : regularError;
  const refetch = isSearching ? refetchSearch : refetchRegular;

  const users = currentResponse?.content || [];
  const totalElements = currentResponse?.totalElements || 0;
  const totalPages = currentResponse?.totalPages || 0;

  const {
    createCompleteUser,
    updateUserInfo,
    activateUser,
    deactivateUser,
    deleteUser,
    updateAddress: updateAddressMutation,
  } = useUserMutations();

  // ── Handlers ──────────────────────────────
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowFormModal(true);
  };
  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
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

  const handleSave = (userData: any) => {
    if (selectedUser) {
      updateUserInfo.mutate(userData.updateUserInfo, {
        onSuccess: () => {
          const a = userData.updateAddress;
          const hasAddr =
            a.street || a.colony || a.municipality || a.state || a.postalCode;
          if (hasAddr) {
            updateAddressMutation.mutate(a, {
              onSuccess: () => {
                setShowFormModal(false);
                setSelectedUser(null);
                refetch();
              },
              onError: () => {
                setShowFormModal(false);
                setSelectedUser(null);
                refetch();
              },
            });
          } else {
            setShowFormModal(false);
            setSelectedUser(null);
            refetch();
          }
        },
      });
    } else {
      createCompleteUser.mutate(userData, {
        onSuccess: () => {
          setShowFormModal(false);
          setSelectedUser(null);
          refetch();
        },
      });
    }
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
          <h2 className="text-xl sm:text-2xl font-bold">Datos Personales</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consulta y edita la información personal de los usuarios
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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
          {/* ← Create user button lives here, not in Account view */}
          <Button
            onClick={() => {
              setSelectedUser(null);
              setShowFormModal(true);
            }}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
             Registrar Nueva Persona
          </Button>
        </div>
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
            placeholder="Buscar por nombre..."
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
                <TableHead className="min-w-[110px]">Teléfono</TableHead>
                <TableHead className="min-w-[100px]">Género</TableHead>
                <TableHead className="min-w-[220px]">Dirección</TableHead>
               
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 min-w-[110px]"
                  onClick={() => handleSort("createdAt")}
                >
                  Registro {sortIndicator("createdAt")}
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
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
                      {user.person.phone || (
                        <span className="italic text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.person.gender ? (
                        user.person.gender === "MALE" ? (
                          "Masculino"
                        ) : user.person.gender === "FEMALE" ? (
                          "Femenino"
                        ) : (
                          "Otro"
                        )
                      ) : (
                        <span className="italic text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[220px]">
                      {user.person.address ? (
                        <span className="truncate block">
                          {[
                            user.person.address.street,
                            user.person.address.colony,
                            user.person.address.municipality,
                            user.person.address.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground/60">
                          Sin dirección
                        </span>
                      )}
                    </TableCell>
                 
                 
                 
             
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(
                        user.person.registrationDate
                      ).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar datos personales
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
      <UserFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedUser(null);
        }}
        initialData={selectedUser || undefined}
        onSave={handleSave}
        isSaving={
          createCompleteUser.isPending || updateUserInfo.isPending
        }
      />

      <UserDetailModal
        user={selectedUser}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
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