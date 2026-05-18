'use client';

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
// UserFormModal  (Datos personales + crear usuario)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">

          {/* ── Header ── */}
          <div className="flex justify-between items-center px-5 py-4 sm:px-7 sm:py-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                {isEditMode ? "Editar Datos Personales" : "Crear Persona"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-5 py-6 sm:px-7 space-y-8 flex-1 overflow-y-auto">

            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-foreground">
                    Nombre *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    placeholder="Ej: Juan"
                    className="rounded-xl border-border bg-background focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-foreground">
                    Apellidos *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    placeholder="Ej: Pérez García"
                    className="rounded-xl border-border bg-background focus:ring-ring/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-foreground">
                    Género *
                  </Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all disabled:opacity-50"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="+52 961 123 4567"
                    className="rounded-xl border-border bg-background focus:ring-ring/50"
                  />
                </div>
              </div>
            </div>

            {/* Información de Cuenta — SOLO CREAR */}
            {!isEditMode && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Información de Cuenta
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">
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
                    className="rounded-xl border-border bg-background focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
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
                    className="rounded-xl border-border bg-background focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-semibold text-foreground">
                    Rol *
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all disabled:opacity-50"
                  >
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Profesor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dirección */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                Dirección
                {!isEditMode && (
                  <span className="normal-case font-normal text-muted-foreground/60">(Opcional)</span>
                )}
              </h3>
              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="addressStreet" className="text-xs font-semibold text-foreground">
                    Calle
                  </Label>
                  <Input
                    id="addressStreet"
                    value={formData.addressStreet}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="Calle Principal #123"
                    className="rounded-xl border-border bg-background focus:ring-ring/50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="addressColony" className="text-xs font-semibold text-foreground">
                      Colonia
                    </Label>
                    <Input
                      id="addressColony"
                      value={formData.addressColony}
                      onChange={handleChange}
                      disabled={isSaving}
                      placeholder="Centro"
                      className="rounded-xl border-border bg-background focus:ring-ring/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="addressMunicipality" className="text-xs font-semibold text-foreground">
                      Municipio
                    </Label>
                    <Input
                      id="addressMunicipality"
                      value={formData.addressMunicipality}
                      onChange={handleChange}
                      disabled={isSaving}
                      placeholder="Comitán"
                      className="rounded-xl border-border bg-background focus:ring-ring/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="addressState" className="text-xs font-semibold text-foreground">
                      Estado
                    </Label>
                    <Input
                      id="addressState"
                      value={formData.addressState}
                      onChange={handleChange}
                      disabled={isSaving}
                      placeholder="Chiapas"
                      className="rounded-xl border-border bg-background focus:ring-ring/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="addressPostalCode" className="text-xs font-semibold text-foreground">
                      Código Postal
                    </Label>
                    <Input
                      id="addressPostalCode"
                      value={formData.addressPostalCode}
                      onChange={handleChange}
                      disabled={isSaving}
                      placeholder="30000"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      className="rounded-xl border-border bg-background focus:ring-ring/50"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4 sm:px-7 border-t border-border bg-muted/30 sticky bottom-0 rounded-b-3xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto rounded-xl gap-2 font-semibold"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </div>

        </form>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="flex justify-between items-center px-5 py-4 sm:px-7 sm:py-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
              <Eye className="h-4 w-4 text-primary" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Detalles Personales
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-6 sm:px-7 space-y-6 flex-1">

          {/* Avatar + nombre */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border">
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0 shadow-md">
              {user.person.firstName[0]}
              {user.person.lastName[0]}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {user.person.firstName} {user.person.lastName}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                ID Persona:{" "}
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md text-foreground">
                  {user.person.id}
                </span>
              </p>
            </div>
          </div>

          {/* Información personal */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Datos Personales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                <p className="text-sm font-semibold text-foreground">
                  {user.person.phone || "No registrado"}
                </p>
              </div>
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Género</p>
                <p className="text-sm font-semibold text-foreground">
                  {user.person.gender === "MALE"
                    ? "Masculino"
                    : user.person.gender === "FEMALE"
                    ? "Femenino"
                    : user.person.gender || "No especificado"}
                </p>
              </div>
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Fecha de registro</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(user.person.registrationDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Dirección */}
          {user.person.address && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                Dirección
              </h4>
              <div className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-4 text-sm space-y-1">
                <p className="font-medium text-foreground">{user.person.address.street}</p>
                <p className="text-muted-foreground">
                  Col. {user.person.address.colony},{" "}
                  {user.person.address.municipality}
                </p>
                <p className="text-muted-foreground">
                  {user.person.address.state}, CP {user.person.address.postalCode}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 sm:px-7 border-t border-border sticky bottom-0 bg-card rounded-b-3xl">
          <Button
            onClick={onClose}
            className="w-full rounded-2xl font-semibold"
          >
            Cerrar
          </Button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Controles de Paginación
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

      {/* Contador */}
      <p className="text-xs text-muted-foreground">
        Mostrando{" "}
        <span className="font-medium text-foreground">{startItem}–{endItem}</span>
        {" "}de{" "}
        <span className="font-medium text-foreground">{totalElements}</span>
        {" "}usuarios
      </p>

      <div className="flex items-center gap-4">

        {/* Tamaño de página */}
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

        {/* Navegación */}
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

// ─────────────────────────────────────────────
// Vista de Datos Personales (exportación principal)
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

  // ── Manejadores ──────────────────────────────
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

  // ── Funciones Auxiliares ───────────────────────────────
  const getRoleBadge = (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      ADMIN: "Administrador",
      TEACHER: "Profesor",
      STUDENT: "Estudiante",
    };

    const colors: Record<UserRole, string> = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      TEACHER:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      STUDENT:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    };
    return <Badge className={colors[role]}>{roleLabels[role]}</Badge>;
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

  // ── Cargando / Error ────────────────────────
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

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Datos Personales
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consulta y edita la información personal de los usuarios
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all"
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={() => { setSelectedUser(null); setShowFormModal(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Registrar Nueva Persona
          </button>
        </div>
      </div>

      {/* ── Pestañas de filtro por rol ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v: any) => { setActiveTab(v); setPage(0); }}
      >
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50 p-1 h-auto">
          {[
            { value: "all",     icon: Users,  label: "Todos" },
            { value: "student", icon: Users,  label: "Estudiantes" },
            { value: "teacher", icon: Shield, label: "Profesores" },
            { value: "admin",   icon: Shield, label: "Admins" },
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

      {/* ── Barra de búsqueda ── */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por nombre..."
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

      {/* ── Tabla ── */}
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
                <TableHead className="min-w-[110px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teléfono</TableHead>
                <TableHead className="min-w-[100px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Género</TableHead>
                <TableHead className="min-w-[220px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dirección</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground min-w-[110px] text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  Registro {sortIndicator("createdAt")}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
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

                    {/* Avatar */}
                    <TableCell>
                      <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {user.person.firstName[0]}
                        {user.person.lastName[0]}
                      </div>
                    </TableCell>

                    {/* Nombre */}
                    <TableCell className="font-semibold text-sm text-foreground">
                      {user.person.firstName} {user.person.lastName}
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell className="text-sm text-muted-foreground">
                      {user.person.phone || (
                        <span className="italic opacity-40">—</span>
                      )}
                    </TableCell>

                    {/* Género */}
                    <TableCell className="text-sm text-muted-foreground">
                      {user.person.gender ? (
                        user.person.gender === "MALE" ? "Masculino"
                        : user.person.gender === "FEMALE" ? "Femenino"
                        : "Otro"
                      ) : (
                        <span className="italic opacity-40">—</span>
                      )}
                    </TableCell>

                    {/* Dirección */}
                    <TableCell className="text-sm text-muted-foreground max-w-[220px]">
                      {user.person.address ? (
                        <span className="truncate block">
                          {[
                            user.person.address.street,
                            user.person.address.colony,
                            user.person.address.municipality,
                            user.person.address.state,
                          ].filter(Boolean).join(", ")}
                        </span>
                      ) : (
                        <span className="italic opacity-40">Sin dirección</span>
                      )}
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.person.registrationDate).toLocaleDateString("es-MX")}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-border bg-card shadow-lg min-w-[180px]">
                          <DropdownMenuItem
                            onClick={() => handleView(user)}
                            className="rounded-xl gap-2 text-sm cursor-pointer"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(user)}
                            className="rounded-xl gap-2 text-sm cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            Editar datos personales
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

      {/* ── Modales ── */}
      <UserFormModal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setSelectedUser(null); }}
        initialData={selectedUser || undefined}
        onSave={handleSave}
        isSaving={createCompleteUser.isPending || updateUserInfo.isPending}
      />
      <UserDetailModal
        user={selectedUser}
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedUser(null); }}
      />

      {/* ── Diálogo de Activar / Desactivar ── */}
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

      {/* ── Diálogo de Eliminar ── */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-destructive/10">
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

// CÓDIGO FINAL