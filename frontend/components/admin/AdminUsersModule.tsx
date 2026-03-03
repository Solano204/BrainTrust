"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Ban,
  RotateCcw,
  Mail,
  KeyRound,
  Power,
} from "lucide-react";
import {
  useUsersPaginated,
  useUserMutations,
  useSearchUsersPaginated,
} from "@/components/admin/hooks/useUsers";
import { usePersonsSummary } from "@/components/admin/hooks/usePersons";
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
import { UserRole } from "@/app/shared/dtos/user.dto";
import { PaginationParams } from "@/app/shared/types/pagination";
import {
  registerUserForExistingPerson,
  changeEmail,
} from "@/components/admin/api/usersApi";
import { User } from "./dtos/user-dto";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(user: User) {
  return `${user.person.primerNombre?.[0] ?? ""}${user.person.apellidoPaterno?.[0] ?? ""}`.toUpperCase();
}
function getFullName(user: User) {
  return (
    user.person.nombreCompleto ||
    `${user.person.primerNombre} ${user.person.apellidoPaterno}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared field label wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

const inp = (extra = "") =>
  `w-full h-8 border border-slate-300 rounded px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition ${extra}`;

const roInp =
  "w-full h-8 border border-slate-200 rounded px-2 text-xs bg-slate-50 text-slate-500 cursor-not-allowed select-none flex items-center truncate";

// ─────────────────────────────────────────────────────────────────────────────
// Action Button
// ─────────────────────────────────────────────────────────────────────────────
function Btn({
  label,
  icon: Icon,
  bg,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  icon: React.ElementType;
  bg: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-1.5 w-full py-2 px-2 rounded font-bold text-[11px] uppercase tracking-wide text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${bg}`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role badge
// ─────────────────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const c: Record<UserRole, string> = {
    ADMIN: "bg-red-100    text-red-800",
    TEACHER: "bg-purple-100 text-purple-800",
    STUDENT: "bg-blue-100   text-blue-800",
  };
  return <Badge className={`${c[role]} text-[10px] px-1.5`}>{role}</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty form
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = {
  personId: "",
  email: "",
  password: "",
  role: "STUDENT" as UserRole,
  studentId: "",
  newEmail: "",
  newPassword: "",
};
type F = typeof EMPTY;

// ─────────────────────────────────────────────────────────────────────────────
// AccountManagementView
// ─────────────────────────────────────────────────────────────────────────────
export default function AccountManagementView() {
  // ── Pagination / search / tabs ─────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "student" | "teacher" | "admin"
  >("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState("createdAt,desc");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(searchTerm);
      setPage(0);
    }, 600);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const isSearching = debounced.trim().length >= 2;

  const getParams = (): PaginationParams => ({
    page,
    size: pageSize,
    sort,
    role: activeTab === "all" ? undefined : activeTab.toUpperCase(),
  });

  const {
    data: regData,
    isLoading: regLoad,
    error: regErr,
    refetch: refetchReg,
  } = useUsersPaginated(getParams());
  const {
    data: srcData,
    isLoading: srcLoad,
    error: srcErr,
    refetch: refetchSrc,
  } = useSearchUsersPaginated(debounced.trim(), {
    page,
    size: pageSize,
    sort,
    role: activeTab === "all" ? undefined : activeTab.toUpperCase(),
  });

  const data = isSearching ? srcData : regData;
  const isLoading = isSearching ? srcLoad : regLoad;
  const error = isSearching ? srcErr : regErr;
  const refetch = isSearching ? refetchSrc : refetchReg;
  const users = data?.content ?? [];
  const totalEl = data?.totalElements ?? 0;
  const totalPg = data?.totalPages ?? 0;

  const { data: personsSummary = [], isLoading: loadingPersons } =
    usePersonsSummary();
  const { activateUser, deactivateUser, deleteUser } = useUserMutations();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<F>(EMPTY);
  const [selected, setSelected] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // ── Confirm dialogs ────────────────────────────────────────────────────────
  const [showToggleActive, setShowToggleActive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (k: keyof F, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const clearForm = useCallback(() => {
    setForm(EMPTY);
    setSelected(null);
    setFormError(null);
    setFormSuccess(null);
  }, []);

  /** Click row → fill form */
  const selectRow = (u: User) => {
    setSelected(u);
    setFormError(null);
    setFormSuccess(null);
    setForm({
      personId: u.person.id,
      email: u.email,
      password: "",
      role: u.role,
      studentId: u.studentId ?? "",
      newEmail: u.email,
      newPassword: "",
    });
  };

  // ── ALTAS (create) ─────────────────────────────────────────────────────────
  const handleAltas = async () => {
    setFormError(null);
    setFormSuccess(null);
    if (!form.personId) {
      setFormError("Selecciona una persona.");
      return;
    }
    if (!form.email) {
      setFormError("El email es obligatorio.");
      return;
    }
    if (!form.password) {
      setFormError("La contraseña es obligatoria.");
      return;
    }
    setIsSaving(true);
    try {
      await registerUserForExistingPerson({
        personId: form.personId,
        email: form.email,
        password: form.password,
        role: form.role,
        studentId:
          form.role === "STUDENT" && form.studentId
            ? form.studentId
            : undefined,
      });
      setFormSuccess("Cuenta creada exitosamente.");
      clearForm();
      refetch();
    } catch (e: any) {
      setFormError(e?.message ?? "Error al crear la cuenta.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cambiar Email ──────────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    if (!selected) return;
    setFormError(null);
    setFormSuccess(null);
    if (!form.newEmail) {
      setFormError("Ingresa el nuevo email.");
      return;
    }
    setIsSaving(true);
    try {
      await changeEmail({ userId: selected.id, newEmail: form.newEmail });
      setFormSuccess("Email actualizado correctamente.");
      refetch();
    } catch (e: any) {
      setFormError(e?.message ?? "Error al cambiar email.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Reset Contraseña ───────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!selected) return;
    setFormError(null);
    setFormSuccess(null);
    if (!form.newPassword || form.newPassword.length < 8) {
      setFormError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setIsSaving(true);
    try {
      await adminChangePassword({
        userId: selected.id,
        newPassword: form.newPassword,
      });
      setFormSuccess("Contraseña reseteada correctamente.");
      set("newPassword", "");
    } catch (e: any) {
      setFormError(e?.message ?? "Error al resetear contraseña.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle Activo ──────────────────────────────────────────────────────────
  const confirmToggle = () => {
    if (!selected) return;
    const mut = selected.active ? deactivateUser : activateUser;
    mut.mutate(selected.id, {
      onSuccess: () => {
        setShowToggleActive(false);
        clearForm();
        refetch();
      },
    });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (!selected) return;
    deleteUser.mutate(selected.id, {
      onSuccess: () => {
        setShowDelete(false);
        clearForm();
        refetch();
      },
    });
  };

  // ── Sort ───────────────────────────────────────────────────────────────────
  const toggleSort = (f: string) => {
    const [cur, dir] = sort.split(",");
    setSort(cur === f ? `${f},${dir === "asc" ? "desc" : "asc"}` : `${f},desc`);
    setPage(0);
  };
  const arrow = (f: string) =>
    sort.startsWith(f) ? (sort.endsWith("desc") ? " ↓" : " ↑") : "";

  const isEdit = !!selected;

  if (error && page === 0)
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error al cargar usuarios.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Reintentar
        </button>
      </div>
    );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-slate-800 text-sm font-sans">
      {/* ══════════════════════════════════════════════════════════════════
          TOP STRIP
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-800 text-white flex items-center gap-3 px-4 py-2 flex-wrap">
        <span className="font-bold text-xs uppercase tracking-widest whitespace-nowrap">
          Gestión de Cuentas
        </span>
        <p className="text-xs text-slate-400">
          Una persona puede tener múltiples cuentas con distintos roles.
        </p>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="h-8 pl-7 pr-3 text-xs rounded border border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-52"
          />
        </div>
        {isSearching && (
          <span className="text-xs text-slate-300 border border-slate-500 rounded px-2 py-0.5">
            "{debounced}"
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FORM AREA  +  ACTION BUTTONS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex gap-3 p-3 flex-wrap xl:flex-nowrap">
        {/* ── Form panels ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {/* Panel: Datos de Cuenta */}
          <div className="bg-white rounded border border-slate-200 shadow-sm">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-700">
                Datos de la Cuenta
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {/* Row 1: Persona · Email · Rol · Matrícula */}
              <div className="grid grid-cols-4 gap-2">
                <Field label="Persona">
                  {isEdit ? (
                    <div className={roInp}>{getFullName(selected!)}</div>
                  ) : (
                    <select
                      value={form.personId}
                      onChange={(e) => set("personId", e.target.value)}
                      disabled={isSaving || loadingPersons}
                      className={inp()}
                    >
                      <option value="">
                        {loadingPersons ? "Cargando…" : "Selecciona…"}
                      </option>
                      {personsSummary.map((p) => (
                        <option key={p.personId} value={p.personId}>
                          {p.nombreCompleto}
                          {p.tieneUsuario ? " (ya tiene cuenta)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={isEdit ? form.newEmail : form.email}
                    onChange={(e) =>
                      isEdit
                        ? set("newEmail", e.target.value)
                        : set("email", e.target.value)
                    }
                    disabled={isSaving}
                    placeholder="usuario@universidad.edu"
                    className={inp()}
                  />
                </Field>

                <Field label="Rol">
                  {isEdit ? (
                    <div className={roInp}>
                      <RoleBadge role={selected!.role} />
                    </div>
                  ) : (
                    <select
                      value={form.role}
                      onChange={(e) => set("role", e.target.value as UserRole)}
                      disabled={isSaving}
                      className={inp()}
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="TEACHER">Profesor</option>
                      <option value="STUDENT">Estudiante</option>
                    </select>
                  )}
                </Field>

                <Field
                  label={
                    form.role === "STUDENT" || selected?.role === "STUDENT"
                      ? "Matrícula"
                      : "Student ID"
                  }
                >
                  {isEdit ? (
                    <div className={roInp}>
                      {selected!.studentId ?? (
                        <span className="italic text-slate-300">—</span>
                      )}
                    </div>
                  ) : (
                    <input
                      value={form.studentId}
                      onChange={(e) => set("studentId", e.target.value)}
                      disabled={isSaving || form.role !== "STUDENT"}
                      placeholder={
                        form.role === "STUDENT" ? "Ej: 2024001" : "N/A"
                      }
                      className={inp()}
                    />
                  )}
                </Field>
              </div>

              {/* Row 2: Contraseña (create) OR Nuevo Email hint + Nueva Contraseña (edit) */}
              <div className="grid grid-cols-4 gap-2">
                {!isEdit ? (
                  <>
                    <Field label="Contraseña">
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        disabled={isSaving}
                        placeholder="Mín. 8 caracteres"
                        minLength={8}
                        className={inp()}
                      />
                    </Field>
                    <div className="col-span-3" />
                  </>
                ) : (
                  <>
                    <Field label="Estado actual">
                      <div className={roInp}>
                        {selected!.active ? (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> Activo
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <UserX className="h-3 w-3" /> Inactivo
                          </span>
                        )}
                      </div>
                    </Field>
                    <Field label="Creado el">
                      <div className={roInp}>
                        {new Date(selected!.createdAt).toLocaleDateString(
                          "es-MX",
                        )}
                      </div>
                    </Field>
                    <Field label="Nueva Contraseña (para resetear)">
                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) => set("newPassword", e.target.value)}
                        disabled={isSaving}
                        placeholder="Mín. 8 caracteres"
                        className={inp()}
                      />
                    </Field>
                    <div />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 w-36 shrink-0 pt-7">
          <Btn
            label="⊕ Nueva Cta."
            icon={Plus}
            bg="bg-green-600 hover:bg-green-700"
            onClick={handleAltas}
            disabled={isSaving || isEdit}
            loading={isSaving && !isEdit}
          />
          <Btn
            label="@ Cambiar Email"
            icon={Mail}
            bg="bg-blue-600 hover:bg-blue-700"
            onClick={handleChangeEmail}
            disabled={isSaving || !isEdit}
            loading={isSaving && isEdit}
          />
          <Btn
            label="⚷ Reset Pwd"
            icon={KeyRound}
            bg="bg-amber-500 hover:bg-amber-600"
            onClick={handleResetPassword}
            disabled={isSaving || !isEdit || !form.newPassword}
          />
          <Btn
            label={selected?.active ? "Desactivar" : "Activar"}
            icon={Power}
            bg={
              selected?.active
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-teal-600 hover:bg-teal-700"
            }
            onClick={() => setShowToggleActive(true)}
            disabled={isSaving || !isEdit}
          />
          <Btn
            label="✕ Eliminar"
            icon={Trash2}
            bg="bg-red-600 hover:bg-red-700"
            onClick={() => setShowDelete(true)}
            disabled={isSaving || !isEdit}
          />
          <Btn
            label="Cancelar"
            icon={Ban}
            bg="bg-slate-500 hover:bg-slate-600"
            onClick={clearForm}
            disabled={isSaving}
          />
          <Btn
            label="Actualizar"
            icon={RotateCcw}
            bg="bg-zinc-700 hover:bg-zinc-800"
            onClick={() => refetch()}
            disabled={isLoading}
            loading={isLoading}
          />

          {/* selected indicator */}
          {isEdit && (
            <div className="mt-1 text-center bg-blue-50 border border-blue-200 rounded px-2 py-1">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">
                Editando
              </p>
              <p className="text-[10px] text-blue-800 font-semibold truncate">
                {getFullName(selected!)}
              </p>
              <RoleBadge role={selected!.role} />
            </div>
          )}
        </div>
      </div>

      {/* Error / success banners */}
      {formError && (
        <div className="mx-3 mb-2 bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{formError}</span>
          <button
            onClick={() => setFormError(null)}
            className="text-red-400 hover:text-red-600 text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}
      {formSuccess && (
        <div className="mx-3 mb-2 bg-green-50 border border-green-200 text-green-700 text-xs p-2 rounded flex items-start gap-2">
          <UserCheck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{formSuccess}</span>
          <button
            onClick={() => setFormSuccess(null)}
            className="text-green-400 hover:text-green-600 text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ROLE TABS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="mx-3 mb-2">
        <Tabs
          value={activeTab}
          onValueChange={(v: any) => {
            setActiveTab(v);
            setPage(0);
          }}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-2 text-xs">
              <Users className="h-3.5 w-3.5" /> Todos
              {activeTab === "all" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalEl}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="student" className="text-xs">
              Estudiantes
              {activeTab === "student" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalEl}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2 text-xs">
              <Shield className="h-3.5 w-3.5" /> Profesores
              {activeTab === "teacher" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalEl}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 text-xs">
              <Shield className="h-3.5 w-3.5" /> Admins
              {activeTab === "admin" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalEl}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TABLE
      ══════════════════════════════════════════════════════════════════ */}
      <div className="mx-3 mb-4 flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        {/* Thead */}
        <div
          className="grid bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wide select-none shrink-0"
          style={{ gridTemplateColumns: "44px 1fr 1fr 90px 85px 95px" }}
        >
          {(
            [
              ["#", ""],
              ["Nombre Completo", "primerNombre"],
              ["Email", "email"],
              ["Rol", ""],
              ["Estado", ""],
              ["Creado", "createdAt"],
            ] as [string, string][]
          ).map(([label, field]) => (
            <div
              key={label}
              onClick={() => field && toggleSort(field)}
              className={`px-2 py-2 border-r border-slate-700 last:border-0 truncate ${field ? "cursor-pointer hover:bg-slate-700" : ""}`}
            >
              {label}
              {arrow(field)}
            </div>
          ))}
        </div>

        {/* Tbody */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[46vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-xs">Cargando…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400">
              <Users className="h-10 w-10 mb-2 opacity-30" />
              <span className="text-xs">
                {isSearching
                  ? `Sin resultados para "${debounced}"`
                  : "No se encontraron cuentas"}
              </span>
            </div>
          ) : (
            users.map((user, idx) => {
              const isSel = selected?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => selectRow(user)}
                  title="Clic para cargar datos en el formulario"
                  className={[
                    "grid text-xs border-b border-slate-100 cursor-pointer transition-colors",
                    isSel
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500 font-semibold"
                      : idx % 2 === 0
                        ? "bg-white hover:bg-slate-50"
                        : "bg-slate-50/70 hover:bg-slate-100",
                  ].join(" ")}
                  style={{ gridTemplateColumns: "44px 1fr 1fr 90px 85px 95px" }}
                >
                  {/* Avatar */}
                  <div className="px-2 py-2 flex items-center justify-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0
                      ${isSel ? "bg-blue-600" : "bg-blue-500"}`}
                    >
                      {getInitials(user)}
                    </div>
                  </div>

                  {/* Nombre + matrícula */}
                  <div className="px-2 py-2 flex flex-col justify-center truncate text-slate-700">
                    <span className="truncate">{getFullName(user)}</span>
                    {user.studentId && (
                      <span className="text-[10px] text-slate-400 truncate">
                        Mat: {user.studentId}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="px-2 py-2 flex items-center truncate text-slate-500">
                    {user.email}
                  </div>

                  {/* Rol */}
                  <div className="px-2 py-2 flex items-center">
                    <RoleBadge role={user.role} />
                  </div>

                  {/* Estado */}
                  <div className="px-2 py-2 flex items-center">
                    {user.active ? (
                      <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap">
                        <UserCheck className="h-2.5 w-2.5" /> Activo
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap">
                        <UserX className="h-2.5 w-2.5" /> Inactivo
                      </span>
                    )}
                  </div>

                  {/* Creado */}
                  <div className="px-2 py-2 flex items-center text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("es-MX")}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {users.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-white text-xs border-t border-slate-600 shrink-0">
            <span className="text-slate-300">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalEl)}{" "}
              de {totalEl}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="bg-slate-700 border border-slate-500 text-white text-xs rounded px-1 py-0.5"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="disabled:opacity-30 hover:text-blue-300"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="disabled:opacity-30 hover:text-blue-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-1">
                Pág. {page + 1}/{totalPg}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPg - 1}
                className="disabled:opacity-30 hover:text-blue-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPg - 1)}
                disabled={page >= totalPg - 1}
                className="disabled:opacity-30 hover:text-blue-300"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DIALOGS  (confirmations only — no form modals)
      ══════════════════════════════════════════════════════════════════ */}

      {/* Toggle Active */}
      <AlertDialog open={showToggleActive} onOpenChange={setShowToggleActive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-orange-500" />
              {selected?.active ? "Desactivar" : "Activar"} Cuenta
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿{selected?.active ? "Desactivar" : "Activar"} la cuenta de{" "}
              <strong>{selected ? getFullName(selected) : ""}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={activateUser.isPending || deactivateUser.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
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

      {/* Delete */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" /> Eliminar Cuenta
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  ¿Eliminar la cuenta de{" "}
                  <strong>{selected ? getFullName(selected) : ""}</strong>?
                </p>
                <p className="text-muted-foreground">
                  La persona asociada{" "}
                  <strong className="text-foreground">NO se eliminará</strong>,
                  solo la cuenta con rol{" "}
                  <strong className="text-foreground">{selected?.role}</strong>.
                </p>
                <p className="text-red-600 font-semibold">
                  ⚠️ Esta acción no se puede deshacer.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
