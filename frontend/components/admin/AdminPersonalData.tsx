"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, Loader2, Users, Ban,
  RotateCcw, AlertTriangle, Search, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import {
  usePersonsPaginated,
  usePersonMutations,
  useSearchPersonsPaginated,
} from "@/components/admin/hooks/usePersons";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Person } from "./dtos/Person-dto";
import {
  extractInfoFromCurp,
  formatBirthDateDisplay,
  validateCurpFormat,
} from "../admin/utils/Curp.utils";

// ─────────────────────────────────────────────────────────────────────────────
// Shared tiny field label + input helpers
// ─────────────────────────────────────────────────────────────────────────────
const inp = (extra = "") =>
  `w-full h-8 border border-slate-300 rounded px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition ${extra}`;

const roInp =
  "w-full h-8 border border-slate-200 rounded px-2 text-xs bg-slate-50 text-slate-500 cursor-not-allowed select-none flex items-center";

function LabeledField({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Button
// ─────────────────────────────────────────────────────────────────────────────
function Btn({
  label, icon: Icon, bg, onClick, disabled, loading,
}: {
  label: string; icon: React.ElementType; bg: string;
  onClick: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-1.5 w-full py-2 px-2 rounded font-bold text-[11px] uppercase tracking-wide text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${bg}`}
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty form shape
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = {
  primerNombre: "", segundoNombre: "",
  apellidoPaterno: "", apellidoMaterno: "",
  curp: "", rfc: "",
  gender: "MALE", phone: "",
  street: "", colony: "", municipality: "", state: "", postalCode: "",
};
type F = typeof EMPTY;

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────
export default function PersonalDataView() {
  // ── Pagination / search ────────────────────────────────────────────────────
  const [search, setSearch]       = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage]           = useState(0);
  const [pageSize, setPageSize]   = useState(20);
  const [sort, setSort]           = useState("registrationDate,desc");

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(0); }, 600);
    return () => clearTimeout(t);
  }, [search]);

  const isSearching = debounced.trim().length >= 2;

  const { data: regData,  isLoading: regLoad,  refetch: refetchReg } =
    usePersonsPaginated({ page, size: pageSize, sort });
  const { data: srcData,  isLoading: srcLoad,  refetch: refetchSrc } =
    useSearchPersonsPaginated(debounced.trim(), { page, size: pageSize });

  const data         = isSearching ? srcData   : regData;
  const isLoading    = isSearching ? srcLoad   : regLoad;
  const refetch      = isSearching ? refetchSrc : refetchReg;
  const persons      = data?.content       ?? [];
  const totalEl      = data?.totalElements ?? 0;
  const totalPg      = data?.totalPages    ?? 0;

  const { createPerson, updatePersonInfo, updatePersonAddress, deletePerson } =
    usePersonMutations();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm]               = useState<F>(EMPTY);
  const [selected, setSelected]       = useState<Person | null>(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);
  const [curpInfo, setCurpInfo]       = useState<{ birthDate: string; age: number; valid: boolean; error?: string } | null>(null);
  const [curpErr, setCurpErr]         = useState<string | null>(null);

  // ── Delete dialogs ─────────────────────────────────────────────────────────
  const [showDel, setShowDel]         = useState(false);
  const [showLinked, setShowLinked]   = useState(false);
  const [delErr, setDelErr]           = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (k: keyof F, v: string) => setForm(p => ({ ...p, [k]: v }));

  const clearForm = useCallback(() => {
    setForm(EMPTY);
    setSelected(null);
    setCurpInfo(null);
    setCurpErr(null);
    setFormError(null);
  }, []);

  /** Click a row → fill the form */
  const selectRow = (p: Person) => {
    setSelected(p);
    setFormError(null);
    setCurpErr(null);
    setForm({
      primerNombre: p.primerNombre,
      segundoNombre: p.segundoNombre ?? "",
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno ?? "",
      curp:  p.curp  ?? "",
      rfc:   p.rfc   ?? "",
      gender: p.gender ?? "MALE",
      phone:  p.phone  ?? "",
      street:       p.address?.street       ?? "",
      colony:       p.address?.colony       ?? "",
      municipality: p.address?.municipality ?? "",
      state:        p.address?.state        ?? "",
      postalCode:   p.address?.postalCode   ?? "",
    });
    // derive curpInfo
    if (p.curp && p.curp.length === 18) {
      setCurpInfo(extractInfoFromCurp(p.curp));
    } else if (p.birthDate && p.age != null) {
      setCurpInfo({ birthDate: p.birthDate, age: p.age, valid: true });
    } else {
      setCurpInfo(null);
    }
  };

  /** CURP change — only in create mode */
  const onCurpChange = (v: string) => {
    const u = v.toUpperCase();
    set("curp", u);
    setCurpErr(null);
    if (u.length === 18) {
      if (!validateCurpFormat(u)) { setCurpErr("Formato inválido"); setCurpInfo(null); return; }
      const info = extractInfoFromCurp(u);
      setCurpInfo(info);
      if (info?.valid) setForm(p => ({ ...p, curp: u, gender: info.gender }));
    } else {
      setCurpInfo(null);
    }
  };

  // ── ALTAS ──────────────────────────────────────────────────────────────────
  const handleAltas = async () => {
    setFormError(null);
    if (!form.primerNombre.trim() || !form.apellidoPaterno.trim()) {
      setFormError("Primer nombre y apellido paterno son obligatorios.");
      return;
    }
    setIsSaving(true);
    try {
      await new Promise<void>((ok, fail) =>
        createPerson.mutate({
          primerNombre: form.primerNombre, segundoNombre: form.segundoNombre || undefined,
          apellidoPaterno: form.apellidoPaterno, apellidoMaterno: form.apellidoMaterno || undefined,
          curp: form.curp || undefined, rfc: form.rfc || undefined,
          gender: form.gender, phone: form.phone || undefined,
          street: form.street || "", colony: form.colony || "",
          municipality: form.municipality || "", state: form.state || "", 
          postalCode: form.postalCode || "",
        }, { onSuccess: () => ok(), onError: (e: any) => fail(e) })
      );
      clearForm(); refetch();
    } catch (e: any) { setFormError(e?.message ?? "Error al registrar."); }
    finally { setIsSaving(false); }
  };

  // ── MODIFICAR ──────────────────────────────────────────────────────────────
  const handleModificar = async () => {
    if (!selected) return;
    setFormError(null);
    setIsSaving(true);
    try {
      await new Promise<void>((ok, fail) =>
        updatePersonInfo.mutate({
          personId: selected.id,
          primerNombre: form.primerNombre, segundoNombre: form.segundoNombre || undefined,
          apellidoPaterno: form.apellidoPaterno, apellidoMaterno: form.apellidoMaterno || undefined,
          gender: form.gender, phone: form.phone || undefined,
        }, {
          onSuccess: () => {
            if (form.street && form.postalCode) {
              updatePersonAddress.mutate({
                personId: selected.id, street: form.street, colony: form.colony,
                municipality: form.municipality, state: form.state, postalCode: form.postalCode,
              }, { onSuccess: () => ok(), onError: (e: any) => fail(e) });
            } else ok();
          },
          onError: (e: any) => fail(e),
        })
      );
      clearForm(); refetch();
    } catch (e: any) { setFormError(e?.message ?? "Error al actualizar."); }
    finally { setIsSaving(false); }
  };

  // ── BAJAS ──────────────────────────────────────────────────────────────────
  const handleBajas = () => {
    if (!selected) return;
    if (selected.tieneUsuario) {
      setDelErr(`${selected.nombreCompleto} tiene una cuenta vinculada. Elimina primero la cuenta.`);
      setShowLinked(true);
    } else { setShowDel(true); }
  };

  const confirmDelete = () => {
    if (!selected) return;
    deletePerson.mutate(selected.id, {
      onSuccess: (r) => {
        if (r.success) { setShowDel(false); clearForm(); refetch(); }
        else { setDelErr(r.message); setShowDel(false); setShowLinked(true); }
      },
    });
  };

  // ── Sort ───────────────────────────────────────────────────────────────────
  const toggleSort = (f: string) => {
    const [cur, dir] = sort.split(",");
    setSort(cur === f ? `${f},${dir === "asc" ? "desc" : "asc"}` : `${f},desc`);
    setPage(0);
  };
  const arrow = (f: string) => sort.startsWith(f) ? (sort.endsWith("desc") ? " ↓" : " ↑") : "";

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  const isEdit = !!selected;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-slate-800 text-sm font-sans">

      {/* ══════════════════════════════════════════════════════════════════
          TOP STRIP  — CURP · RFC
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-800 text-white flex items-center gap-3 px-4 py-2 flex-wrap">
        <span className="font-bold text-xs uppercase tracking-widest whitespace-nowrap">
          Registro de Personas
        </span>

        {/* CURP */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">CURP</span>
          <input
            value={form.curp}
            onChange={(e) => !isEdit && onCurpChange(e.target.value)}
            disabled={isSaving || isEdit}
            maxLength={18}
            placeholder="CURP"
            className="h-8 w-44 border border-slate-600 rounded px-2 text-xs bg-slate-700 text-white placeholder:text-slate-400 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
          />
        </div>

        {/* RFC */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">RFC</span>
          <input
            value={form.rfc}
            onChange={(e) => !isEdit && set("rfc", e.target.value.toUpperCase())}
            disabled={isSaving || isEdit}
            maxLength={13}
            placeholder="RFC"
            className="h-8 w-36 border border-slate-600 rounded px-2 text-xs bg-slate-700 text-white placeholder:text-slate-400 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
          />
        </div>

        {/* CURP validation hint */}
        {(curpErr || (curpInfo && !curpInfo.valid)) && (
          <span className="text-red-400 text-[11px] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {curpErr ?? curpInfo?.error}
          </span>
        )}
        {curpInfo?.valid && (
          <span className="text-green-400 text-[11px]">✅ CURP válido</span>
        )}

        {/* Search */}
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="h-8 pl-7 pr-3 text-xs rounded border border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-44"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FORM AREA  +  ACTION BUTTONS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex gap-3 p-3 flex-wrap xl:flex-nowrap">

        {/* ── Left: Datos Personales + Datos Dirección ───────────────── */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">

          {/* Datos Personales */}
          <div className="bg-white rounded border border-slate-200 shadow-sm">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-700">Datos Personales</h3>
            </div>
            <div className="p-3 space-y-2">

              {/* Row 1: Primer Nombre · Apellido Paterno · Apellido Materno · Género */}
              <div className="grid grid-cols-4 gap-2">
                <LabeledField label="Primer Nombre">
                  <input
                    value={form.primerNombre}
                    onChange={(e) => set("primerNombre", e.target.value)}
                    disabled={isSaving}
                    placeholder="Nombre"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Apellido Paterno">
                  <input
                    value={form.apellidoPaterno}
                    onChange={(e) => set("apellidoPaterno", e.target.value)}
                    disabled={isSaving}
                    placeholder="Paterno"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Apellido Materno">
                  <input
                    value={form.apellidoMaterno}
                    onChange={(e) => set("apellidoMaterno", e.target.value)}
                    disabled={isSaving}
                    placeholder="Materno"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Género">
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    disabled={isSaving}
                    className={inp()}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </LabeledField>
              </div>

              {/* Row 2: Segundo Nombre · F. Nacimiento (read-only) · Edad (read-only) · Teléfono */}
              <div className="grid grid-cols-4 gap-2">
                <LabeledField label="Segundo Nombre">
                  <input
                    value={form.segundoNombre}
                    onChange={(e) => set("segundoNombre", e.target.value)}
                    disabled={isSaving}
                    placeholder="Segundo (opcional)"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Fecha de Nacimiento">
                  <div className={roInp}>
                    {curpInfo?.valid
                      ? formatBirthDateDisplay(curpInfo.birthDate)
                      : <span className="text-slate-300 italic">—</span>}
                  </div>
                </LabeledField>
                <LabeledField label="Edad">
                  <div className={roInp}>
                    {curpInfo?.valid
                      ? `${curpInfo.age} años`
                      : <span className="text-slate-300 italic">—</span>}
                  </div>
                </LabeledField>
                <LabeledField label="Teléfono">
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    disabled={isSaving}
                    placeholder="+52 961 …"
                    className={inp()}
                  />
                </LabeledField>
              </div>
            </div>
          </div>

          {/* Datos Dirección */}
          <div className="bg-white rounded border border-slate-200 shadow-sm">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-700">Datos Dirección</h3>
            </div>
            <div className="p-3 space-y-2">
              {/* Row 1: Calle · Colonia */}
              <div className="grid grid-cols-3 gap-2">
                <LabeledField label="Calle y Número" >
                  <input
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                    disabled={isSaving}
                    placeholder="Calle y número"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Colonia">
                  <input
                    value={form.colony}
                    onChange={(e) => set("colony", e.target.value)}
                    disabled={isSaving}
                    placeholder="Colonia"
                    className={inp()}
                  />
                </LabeledField>
              </div>
              {/* Row 2: Municipio · Estado · CP */}
              <div className="grid grid-cols-3 gap-2">
                <LabeledField label="Municipio">
                  <input
                    value={form.municipality}
                    onChange={(e) => set("municipality", e.target.value)}
                    disabled={isSaving}
                    placeholder="Municipio"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Estado">
                  <input
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    disabled={isSaving}
                    placeholder="Estado"
                    className={inp()}
                  />
                </LabeledField>
                <LabeledField label="Código Postal">
                  <input
                    value={form.postalCode}
                    onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))}
                    disabled={isSaving}
                    placeholder="CP"
                    maxLength={5}
                    inputMode="numeric"
                    className={inp()}
                  />
                </LabeledField>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Action buttons ──────────────────────────────────── */}
        <div className="flex flex-col gap-2 w-32 shrink-0 pt-7">
          <Btn label="⊕ Altas"     icon={Plus}      bg="bg-green-600 hover:bg-green-700"
            onClick={handleAltas}    disabled={isSaving || isEdit}   loading={isSaving && !isEdit} />
          <Btn label="✎ Modificar" icon={Edit2}     bg="bg-amber-500 hover:bg-amber-600"
            onClick={handleModificar} disabled={isSaving || !isEdit} loading={isSaving && isEdit} />
          <Btn label="✕ Bajas"     icon={Trash2}    bg="bg-red-600 hover:bg-red-700"
            onClick={handleBajas}    disabled={isSaving || !isEdit} />
          <Btn label="Cancelar"    icon={Ban}       bg="bg-slate-500 hover:bg-slate-600"
            onClick={clearForm}      disabled={isSaving} />
          <Btn label="Actualizar"  icon={RotateCcw} bg="bg-zinc-700 hover:bg-zinc-800"
            onClick={() => refetch()} disabled={isLoading} loading={isLoading} />

          {/* selected indicator */}
          {isEdit && (
            <div className="mt-1 text-center bg-blue-50 border border-blue-200 rounded px-2 py-1">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">Editando</p>
              <p className="text-[10px] text-blue-800 font-semibold truncate">
                {selected!.primerNombre} {selected!.apellidoPaterno}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {formError && (
        <div className="mx-3 mb-2 bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{formError}</span>
          <button onClick={() => setFormError(null)} className="text-red-400 hover:text-red-600 text-base leading-none">✕</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TABLE  — click any row to load into form
      ══════════════════════════════════════════════════════════════════ */}
      <div className="mx-3 mb-4 flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden">

        {/* Thead */}
        <div
          className="grid bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wide select-none shrink-0"
          style={{ gridTemplateColumns: "50px 1fr 1fr 160px 95px 45px 1fr 90px" }}
        >
          {([
            ["Consec.",        ""],
            ["Nombre Completo","primerNombre"],
            ["Ap. Pat. / Mat.","apellidoPaterno"],
            ["CURP",           "curp"],
            ["Fecha Nac.",     ""],
            ["Edad",           ""],
            ["Dirección",      ""],
            ["Estado",         ""],
          ] as [string, string][]).map(([label, field]) => (
            <div
              key={label}
              onClick={() => field && toggleSort(field)}
              className={`px-2 py-2 border-r border-slate-700 last:border-0 truncate
                ${field ? "cursor-pointer hover:bg-slate-700" : ""}`}
            >
              {label}{arrow(field)}
            </div>
          ))}
        </div>

        {/* Tbody */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[46vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-xs">Cargando…</span>
            </div>
          ) : persons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400">
              <Users className="h-10 w-10 mb-2 opacity-30" />
              <span className="text-xs">
                {isSearching
                  ? `Sin resultados para "${debounced}"`
                  : "No hay personas registradas"}
              </span>
            </div>
          ) : (
            persons.map((person, idx) => {
              const isSel = selected?.id === person.id;
              return (
                <div
                  key={person.id}
                  onClick={() => selectRow(person)}
                  title="Clic para cargar datos en el formulario"
                  className={[
                    "grid text-xs border-b border-slate-100 cursor-pointer transition-colors",
                    isSel
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500 font-semibold"
                      : idx % 2 === 0
                        ? "bg-white hover:bg-slate-50"
                        : "bg-slate-50/70 hover:bg-slate-100",
                  ].join(" ")}
                  style={{ gridTemplateColumns: "50px 1fr 1fr 160px 95px 45px 1fr 90px" }}
                >
                  {/* Consecutivo / avatar */}
                  <div className="px-2 py-2 flex items-center justify-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0
                        ${isSel ? "bg-blue-600" : "bg-emerald-600"}`}
                    >
                      {person.primerNombre[0]}{person.apellidoPaterno[0]}
                    </div>
                  </div>

                  {/* Nombre completo */}
                  <div className="px-2 py-2 flex items-center truncate text-slate-700">
                    {person.primerNombre}
                    {person.segundoNombre ? ` ${person.segundoNombre}` : ""}
                  </div>

                  {/* Apellidos */}
                  <div className="px-2 py-2 flex items-center truncate text-slate-600">
                    {person.apellidoPaterno}
                    {person.apellidoMaterno ? ` ${person.apellidoMaterno}` : ""}
                  </div>

                  {/* CURP */}
                  <div className="px-2 py-2 flex items-center">
                    {person.curp
                      ? <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">{person.curp}</span>
                      : <span className="italic text-slate-300">—</span>}
                  </div>

                  {/* F. Nacimiento */}
                  <div className="px-2 py-2 flex items-center text-slate-500">
                    {person.birthDate
                      ? formatBirthDateDisplay(person.birthDate)
                      : <span className="italic text-slate-300">—</span>}
                  </div>

                  {/* Edad */}
                  <div className="px-2 py-2 flex items-center text-slate-500">
                    {person.age != null ? person.age : <span className="italic text-slate-300">—</span>}
                  </div>

                  {/* Dirección */}
                  <div className="px-2 py-2 flex items-center truncate text-slate-500">
                    {person.address
                      ? [person.address.street, person.address.colony, person.address.municipality]
                          .filter(Boolean).join(", ")
                      : <span className="italic text-slate-300">Sin dirección</span>}
                  </div>

                  {/* Estado */}
                  <div className="px-2 py-2 flex items-center">
                    {person.tieneUsuario
                      ? <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">Con cuenta</span>
                      : <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">Sin cuenta</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {persons.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-white text-xs border-t border-slate-600 shrink-0">
            <span className="text-slate-300">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalEl)} de {totalEl}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="bg-slate-700 border border-slate-500 text-white text-xs rounded px-1 py-0.5"
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button onClick={() => setPage(0)} disabled={page === 0} className="disabled:opacity-30 hover:text-blue-300"><ChevronsLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="disabled:opacity-30 hover:text-blue-300"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-1">Pág. {page + 1}/{totalPg}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPg - 1} className="disabled:opacity-30 hover:text-blue-300"><ChevronRight className="h-4 w-4" /></button>
              <button onClick={() => setPage(totalPg - 1)} disabled={page >= totalPg - 1} className="disabled:opacity-30 hover:text-blue-300"><ChevronsRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DELETE DIALOGS  (only dialogs left — no form modals)
      ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showDel} onOpenChange={setShowDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" /> Eliminar Persona
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar a <strong>{selected?.nombreCompleto}</strong>?{" "}
              <span className="text-red-600 font-semibold">⚠️ Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePerson.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deletePerson.isPending}
            >
              {deletePerson.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLinked} onOpenChange={setShowLinked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> No se puede eliminar
            </AlertDialogTitle>
            <AlertDialogDescription>{delErr}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setShowLinked(false); setDelErr(""); }}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}