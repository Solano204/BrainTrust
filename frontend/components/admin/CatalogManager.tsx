'use client';

// ============================================================
// FILE 4: components/CatalogManager.tsx
// (role-activities section removed — now lives in ActivityManager)
// ============================================================

import { useState, useCallback } from 'react';
import {
  useFirstNames, useAddFirstName, useUpdateFirstName, useDeleteFirstName,
  useLastNames, useAddLastName, useUpdateLastName, useDeleteLastName,
  useStates, useAddState, useUpdateState, useDeleteState,
  useMunicipalities, useMunicipalitiesByState, useAddMunicipality, useUpdateMunicipality, useDeleteMunicipality,
  useColonies, useColoniesByMunicipality, useAddColony, useUpdateColony, useDeleteColony,
  useStreets, useStreetsByColony, useAddStreet, useUpdateStreet, useDeleteStreet,
  usePostalCodes, usePostalCodesByColony, useAddPostalCode, useUpdatePostalCode, useDeletePostalCode,
  useRoles, useCreateRole, useUpdateRole, useDeleteRole,
} from './hooks/useCatalogs';
import type { CatRole, PagedResponse, CatalogSectionKey } from '@/app/shared/admin/catalog.models';
import {
  Search, Plus, Pencil, Trash2, X, Check, AlertTriangle, Loader2,
  ChevronRight, ChevronLeft, User, MapPin, Building2, TreePine,
  RouteIcon, Hash, ShieldCheck, Activity,
} from 'lucide-react';

// ─── Toast ───────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning';
interface Toast { id: number; type: ToastType; message: string }

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);
  return { toasts, push };
}

// ─── Catalog Section Config (role-activities removed) ─────────────
const CATALOG_SECTIONS = [
  { key: 'first-names',    label: 'Nombres',    icon: User,      color: '#6366f1' },
  { key: 'last-names',     label: 'Apellidos',     icon: User,      color: '#8b5cf6' },
  { key: 'states',         label: 'Estados',         icon: MapPin,    color: '#0ea5e9' },
  { key: 'municipalities', label: 'Municipios', icon: Building2, color: '#10b981' },
  { key: 'colonies',       label: 'Colonias',       icon: TreePine,  color: '#f59e0b' },
  { key: 'streets',        label: 'Calles',        icon: RouteIcon, color: '#ef4444' },
  { key: 'postal-codes',   label: 'Códigos Postales',   icon: Hash,      color: '#ec4899' },
  { key: 'roles',          label: 'Roles',          icon: ShieldCheck, color: '#14b8a6' },
] as const;

// Narrow the key type to only what's in this component
type CatalogSectionKeyLocal = typeof CATALOG_SECTIONS[number]['key'];

// ─── Pagination Bar ───────────────────────────────────────────────
interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
  accentColor: string;
}
function PaginationBar({ page, totalPages, totalElements, onPage, accentColor }: PaginationBarProps) {
  if (totalPages <= 1) return (
    <p className="text-xs text-gray-400 text-right">{totalElements} entradas</p>
  );return (
  <div className="flex items-center justify-between">

    <p className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{totalElements}</span> entradas totales
    </p>

    <div className="flex items-center gap-1">

      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i)
        .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
        .reduce<(number | '...')[]>((acc, cur, idx, arr) => {
          if (idx > 0 && (cur as number) - (arr[idx - 1] as number) > 1) acc.push('...');
          acc.push(cur);
          return acc;
        }, [])
        .map((item, idx) =>
          item === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-muted-foreground text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPage(item as number)}
              className={`w-7 h-7 rounded-xl text-xs font-semibold transition-all ${
                item === page
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {(item as number) + 1}
            </button>
          )
        )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

    </div>
  </div>
);
}
// ─── Inline Edit Row ─────────────────────────────────────────────
interface EditRowProps { value: string; onSave: (v: string) => Promise<void>; onCancel: () => void; loading?: boolean }
function EditRow({ value, onSave, onCancel, loading }: EditRowProps) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex gap-2 items-center">
      <input
        autoFocus value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel(); }}
        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-indigo-300 bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
      />
      <button onClick={() => onSave(val)} disabled={loading || !val.trim()} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-40 transition-all">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button onClick={onCancel} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"><X className="w-4 h-4" /></button>
    </div>
  );
}

// ─── Generic Catalog Table ────────────────────────────────────────
interface CatalogTableProps {
  pagedData: PagedResponse<{ id: number; displayValue: string }> | undefined;
  loading: boolean;
  page: number;
  onPage: (p: number) => void;
  search: string;
  onSearch: (v: string) => void;
  onAdd: (value: string) => Promise<void>;
  onUpdate: (id: number, value: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  addLabel: string;
  addPlaceholder: string;
  accentColor: string;
  addExtra?: React.ReactNode;
  hideSearch?: boolean;
}
function CatalogTable({
  pagedData, loading, page, onPage, search, onSearch, onAdd, onUpdate, onDelete,
  addLabel, addPlaceholder, accentColor, addExtra, hideSearch,
}: CatalogTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);

  const items = pagedData?.content ?? [];

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setAddingLoading(true);
    try { await onAdd(newValue.trim()); setNewValue(''); setShowAdd(false); }
    finally { setAddingLoading(false); }
  };

  const handleUpdate = async (id: number, value: string) => {
    setEditLoading(true);
    try { await onUpdate(id, value); setEditingId(null); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try { await onDelete(id); }
    finally { setDeleting(null); }
  };
return (
  <div className="flex flex-col gap-4">

    {/* ── Search + Add ── */}
    <div className="flex gap-3 items-center">
      {!hideSearch && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { onSearch(e.target.value); onPage(0); }}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground transition-all"
          />
        </div>
      )}
      <button
        onClick={() => setShowAdd(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>

    {/* ── Add Form ── */}
    {showAdd && (
      <div className="p-5 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Nueva entrada
        </p>
        <input
          autoFocus
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewValue(''); } }}
          placeholder={addPlaceholder}
          className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />
        {addExtra}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleAdd}
            disabled={addingLoading || !newValue.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
          >
            {addingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewValue(''); }}
            className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted/50 hover:text-foreground transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    )}

    {/* ── Table ── */}
    <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
      {loading ? (
        <div className="flex items-center justify-center py-14 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground text-sm">
          {search ? 'No se encontraron resultados.' : 'Aún no hay entradas.'}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">ID</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">

                {/* ID */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono">
                    #{item.id}
                  </span>
                </td>

                {/* Value */}
                <td className="px-5 py-3.5">
                  {editingId === item.id ? (
                    <EditRow
                      value={item.displayValue}
                      onSave={v => handleUpdate(item.id, v)}
                      onCancel={() => setEditingId(null)}
                      loading={editLoading}
                    />
                  ) : (
                    <span className="font-medium text-foreground">{item.displayValue}</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  {editingId !== item.id && (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="p-1.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
                        title="Eliminar"
                      >
                        {deleting === item.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* ── Pagination ── */}
    {!loading && pagedData && (
      <PaginationBar
        page={pagedData.page}
        totalPages={pagedData.totalPages}
        totalElements={pagedData.totalElements}
        onPage={onPage} accentColor={''}      />
    )}

  </div>
);
}
// ─────────────────────────────────────────────────────────────────
// PANEL HELPERS
// ─────────────────────────────────────────────────────────────────
type PushFn = (t: ToastType, m: string) => void;

async function handleMutation<T>(
  fn: () => Promise<T>,
  push: PushFn,
  successMsg: string,
  onConflict?: (msg: string) => void,
) {
  try {
    await fn();
    push('success', successMsg);
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || 'Operación fallida';
    if (e?.response?.status === 409) {
      onConflict ? onConflict(msg) : push('warning', msg);
    } else {
      push('error', msg);
    }
  }
}

// ─── Simple Value Panel (first-names, last-names, states) ─────────
interface SimpleValuePanelProps {
  accentColor: string;
  push: PushFn;
  useItems: (p: any) => { data: PagedResponse<any> | undefined; isLoading: boolean };
  useAdd: () => { mutateAsync: (r: any) => Promise<any> };
  useUpdate: () => { mutateAsync: (r: any) => Promise<any> };
  useDelete: () => { mutateAsync: (r: any) => Promise<any> };
  addLabel: string;
  addPlaceholder: string;
}
function SimpleValuePanel({ accentColor, push, useItems, useAdd, useUpdate, useDelete, addLabel, addPlaceholder }: SimpleValuePanelProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading } = useItems({ page, size: 20, search: search || undefined });
  const add = useAdd();
  const upd = useUpdate();
  const del = useDelete();

  const mapped = data ? { ...data, content: data.content.map((d: any) => ({ id: d.id, displayValue: d.value })) } : undefined;

  return (
    <CatalogTable
      pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
      search={search} onSearch={v => { setSearch(v); setPage(0); }}
      onAdd={async v => handleMutation(() => add.mutateAsync({ value: v }), push, `¡${addLabel} agregado!`)}
      onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, '¡Actualizado!', m => push('warning', m))}
      onDelete={async id => handleMutation(() => del.mutateAsync(id), push, '¡Eliminado!', m => push('warning', m))}
      addLabel={`Agregar ${addLabel}`} addPlaceholder={addPlaceholder} accentColor={accentColor}
    />
  );
}

// ─── Municipalities Panel ─────────────────────────────────────────
function MunicipalitiesPanel({ accentColor, push }: { accentColor: string; push: PushFn }) {
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(0);
  const [filterState, setFilterState] = useState<number | null>(null);
  const [newStateId, setNewStateId]   = useState('');

  const { data: statesData }     = useStates({ size: 200 });
  const allStates                = statesData?.content ?? [];

  const { data: allData,    isLoading: loadingAll }      = useMunicipalities({ page, size: 20, search: search || undefined });
  const { data: filterData, isLoading: loadingFiltered } = useMunicipalitiesByState(filterState, { page, size: 20 });

  const raw       = filterState ? filterData : allData;
  const isLoading = filterState ? loadingFiltered : loadingAll;
  const mapped    = raw ? { ...raw, content: raw.content.map(d => ({ id: d.id, displayValue: d.municipalityName })) } : undefined;

  const add = useAddMunicipality();
  const upd = useUpdateMunicipality();
  const del = useDeleteMunicipality();
return (
  <div className="flex flex-col gap-4">

    {/* ── State filter ── */}
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        Estado:
      </label>
      <select
        value={filterState ?? ''}
        onChange={e => { setFilterState(e.target.value ? Number(e.target.value) : null); setPage(0); }}
        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
      >
        <option value="">Todos los estados</option>
        {allStates.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
      </select>
    </div>

    <CatalogTable
      pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
      search={search} onSearch={v => { setSearch(v); setPage(0); }}
      onAdd={async (v) => {
        const sid = newStateId ? Number(newStateId) : filterState;
        if (!sid) return push('error', 'Selecciona un estado primero');
        handleMutation(() => add.mutateAsync({ stateId: sid, municipalityName: v }), push, '¡Municipio agregado!');
        setNewStateId('');
      }}
      onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, '¡Actualizado!', m => push('warning', m))}
      onDelete={async (id) => handleMutation(() => del.mutateAsync(id), push, '¡Eliminado!', m => push('warning', m))}
      addLabel="Agregar Municipio"
      addPlaceholder="ej. Comitán"
      addExtra={!filterState ? (
        <select
          value={newStateId}
          onChange={e => setNewStateId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        >
          <option value="">Selecciona estado *</option>
          {allStates.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
        </select>
      ) : null}
      accentColor={''}
    />

  </div>
);
}
// ─── Colonies Panel ───────────────────────────────────────────────
function ColoniesPanel({ accentColor, push }: { accentColor: string; push: PushFn }) {
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(0);
  const [filterMuni, setFilterMuni] = useState<number | null>(null);
  const [newMuniId, setNewMuniId]   = useState('');

  const { data: munisData }  = useMunicipalities({ size: 200 });
  const allMunis             = munisData?.content ?? [];

  const { data: allData,    isLoading: loadingAll }      = useColonies({ page, size: 20, search: search || undefined });
  const { data: filterData, isLoading: loadingFiltered } = useColoniesByMunicipality(filterMuni, { page, size: 20 });

  const raw       = filterMuni ? filterData : allData;
  const isLoading = filterMuni ? loadingFiltered : loadingAll;
  const mapped    = raw ? { ...raw, content: raw.content.map(d => ({ id: d.id, displayValue: d.colonyName })) } : undefined;

  const add = useAddColony();
  const upd = useUpdateColony();
  const del = useDeleteColony();
return (
  <div className="flex flex-col gap-4">

    {/* ── Municipality filter ── */}
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        Municipio:
      </label>
      <select
        value={filterMuni ?? ''}
        onChange={e => { setFilterMuni(e.target.value ? Number(e.target.value) : null); setPage(0); }}
        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
      >
        <option value="">Todos los municipios</option>
        {allMunis.map(m => <option key={m.id} value={m.id}>{m.municipalityName}</option>)}
      </select>
    </div>

    <CatalogTable
      pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
      search={search} onSearch={v => { setSearch(v); setPage(0); } }
      onAdd={async (v) => {
        const mid = newMuniId ? Number(newMuniId) : filterMuni;
        if (!mid) return push('error', 'Selecciona un municipio primero');
        handleMutation(() => add.mutateAsync({ municipalityId: mid, colonyName: v }), push, '¡Colonia agregada!');
        setNewMuniId('');
      } }
      onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, '¡Actualizado!', m => push('warning', m))}
      onDelete={async (id) => handleMutation(() => del.mutateAsync(id), push, '¡Eliminado!', m => push('warning', m))}
      addLabel="Agregar Colonia"
      addPlaceholder="ej. Centro"
      addExtra={!filterMuni ? (
        <select
          value={newMuniId}
          onChange={e => setNewMuniId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        >
          <option value="">Selecciona municipio *</option>
          {allMunis.map(m => <option key={m.id} value={m.id}>{m.municipalityName}</option>)}
        </select>
      ) : null} accentColor={''}    />

  </div>
);
}
// ─── Streets Panel ────────────────────────────────────────────────
function StreetsPanel({ accentColor, push }: { accentColor: string; push: PushFn }) {
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(0);
  const [filterColony, setFilterColony] = useState<number | null>(null);
  const [newColonyId, setNewColonyId]   = useState('');

  const { data: coloniesData } = useColonies({ size: 200 });
  const allColonies            = coloniesData?.content ?? [];

  const { data: allData,    isLoading: loadingAll }      = useStreets({ page, size: 20, search: search || undefined });
  const { data: filterData, isLoading: loadingFiltered } = useStreetsByColony(filterColony, { page, size: 20 });

  const raw       = filterColony ? filterData : allData;
  const isLoading = filterColony ? loadingFiltered : loadingAll;
  const mapped    = raw ? { ...raw, content: raw.content.map(d => ({ id: d.id, displayValue: d.streetName })) } : undefined;

  const add = useAddStreet();
  const upd = useUpdateStreet();
  const del = useDeleteStreet();
return (
  <div className="flex flex-col gap-4">

    {/* ── Colony filter ── */}
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        Colonia:
      </label>
      <select
        value={filterColony ?? ''}
        onChange={e => { setFilterColony(e.target.value ? Number(e.target.value) : null); setPage(0); }}
        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      >
        <option value="">Todas las colonias</option>
        {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
      </select>
    </div>

    <CatalogTable
      pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
      search={search} onSearch={v => { setSearch(v); setPage(0); } }
      onAdd={async (v) => {
        const cid = newColonyId ? Number(newColonyId) : filterColony;
        if (!cid) return push('error', 'Selecciona una colonia primero');
        handleMutation(() => add.mutateAsync({ colonyId: cid, streetName: v }), push, '¡Calle agregada!');
        setNewColonyId('');
      } }
      onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, '¡Actualizado!', m => push('warning', m))}
      onDelete={async (id) => handleMutation(() => del.mutateAsync(id), push, '¡Eliminado!', m => push('warning', m))}
      addLabel="Agregar Calle"
      addPlaceholder="ej. Av. Central"
      addExtra={!filterColony ? (
        <select
          value={newColonyId}
          onChange={e => setNewColonyId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        >
          <option value="">Selecciona colonia *</option>
          {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
        </select>
      ) : null} accentColor={''}    />

  </div>
);}
// ─── Postal Codes Panel ───────────────────────────────────────────
function PostalCodesPanel({ accentColor, push }: { accentColor: string; push: PushFn }) {
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(0);
  const [filterColony, setFilterColony] = useState<number | null>(null);
  const [newColonyId, setNewColonyId]   = useState('');

  const { data: coloniesData } = useColonies({ size: 200 });
  const allColonies            = coloniesData?.content ?? [];

  const { data: allData,    isLoading: loadingAll }      = usePostalCodes({ page, size: 20, search: search || undefined });
  const { data: filterData, isLoading: loadingFiltered } = usePostalCodesByColony(filterColony, { page, size: 20 });

  const raw       = filterColony ? filterData : allData;
  const isLoading = filterColony ? loadingFiltered : loadingAll;
  const mapped    = raw ? { ...raw, content: raw.content.map(d => ({ id: d.id, displayValue: d.postalCode })) } : undefined;

  const add = useAddPostalCode();
  const upd = useUpdatePostalCode();
  const del = useDeletePostalCode();
return (
  <div className="flex flex-col gap-4">

    {/* ── Colony filter ── */}
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        Colonia:
      </label>
      <select
        value={filterColony ?? ''}
        onChange={e => { setFilterColony(e.target.value ? Number(e.target.value) : null); setPage(0); }}
        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      >
        <option value="">Todas las colonias</option>
        {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
      </select>
    </div>

    <CatalogTable
      pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
      search={search} onSearch={v => { setSearch(v); setPage(0); } }
      onAdd={async (v) => {
        const cid = newColonyId ? Number(newColonyId) : filterColony;
        if (!cid) return push('error', 'Selecciona una colonia primero');
        handleMutation(() => add.mutateAsync({ colonyId: cid, postalCode: v }), push, '¡Código postal agregado!');
        setNewColonyId('');
      } }
      onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, '¡Actualizado!', m => push('warning', m))}
      onDelete={async (id) => handleMutation(() => del.mutateAsync(id), push, '¡Eliminado!', m => push('warning', m))}
      addLabel="Agregar Código"
      addPlaceholder="ej. 29000"
      addExtra={!filterColony ? (
        <select
          value={newColonyId}
          onChange={e => setNewColonyId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        >
          <option value="">Selecciona colonia *</option>
          {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
        </select>
      ) : null} accentColor={''}    />

  </div>
);}

// ─── Roles Panel ─────────────────────────────────────────────────
function RolesPanel({ accentColor, push }: { accentColor: string; push: PushFn }) {
  const [page, setPage]               = useState(0);
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editCode, setEditCode]       = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting]       = useState<number | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [newCode, setNewCode]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [addLoading, setAddLoading]   = useState(false);

  const { data, isLoading } = useRoles({ page, size: 20 });
  const items = data?.content ?? [];

  const create = useCreateRole();
  const update = useUpdateRole();
  const del    = useDeleteRole();

  const handleAdd = async () => {
    if (!newCode.trim()) return;
    setAddLoading(true);
    try {
      await handleMutation(() => create.mutateAsync({ code: newCode.trim(), description: newDesc.trim() }), push, '¡Rol creado!', m => push('warning', m));
      setNewCode(''); setNewDesc(''); setShowAdd(false);
    } finally { setAddLoading(false); }
  };

  const startEdit = (role: CatRole) => {
    setEditingId(role.id);
    setEditCode(role.code);
    setEditDesc(role.description);
    setExpandedId(role.id);
  };

  const handleUpdate = async () => {
    if (!editingId || !editCode.trim()) return;
    setEditLoading(true);
    try {
      await handleMutation(
        () => update.mutateAsync({ id: editingId, req: { code: editCode.trim(), description: editDesc.trim() } }),
        push, '¡Rol actualizado!', m => push('warning', m)
      );
      setEditingId(null);
    } finally { setEditLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try { await handleMutation(() => del.mutateAsync(id), push, '¡Rol eliminado!', m => push('warning', m)); }
    finally { setDeleting(null); }
  };

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id);
return (
  <div className="flex flex-col gap-4">

    {/* ── Add button ── */}
    <div className="flex justify-end">
      <button
        onClick={() => setShowAdd(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4" />
        Agregar Rol
      </button>
    </div>

    {/* ── Add form ── */}
    {showAdd && (
      <div className="p-5 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nuevo Rol</p>
        <input
          autoFocus value={newCode} onChange={e => setNewCode(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewCode(''); setNewDesc(''); } }}
          placeholder="Código del rol (ej. ADMIN)"
          className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />
        <input
          value={newDesc} onChange={e => setNewDesc(e.target.value)}
          placeholder="Descripción (opcional)"
          className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleAdd} disabled={addLoading || !newCode.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
          >
            {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Crear
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewCode(''); setNewDesc(''); }}
            className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted/50 hover:text-foreground transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    )}

    {/* ── List ── */}
    {isLoading ? (
      <div className="flex items-center justify-center py-14 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando...</span>
      </div>
    ) : items.length === 0 ? (
      <div className="text-center py-14 text-muted-foreground text-sm bg-card rounded-2xl border border-border">
        Aún no hay roles.
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        {items.map(role => {
          const isExpanded = expandedId === role.id;
          const isEditing  = editingId  === role.id;
          return (
            <div key={role.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">

              {/* ── Row ── */}
              <div className="flex items-center gap-3 px-5 py-3.5 group hover:bg-muted/30 transition-colors">

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(role.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
                >
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* ID */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono flex-shrink-0">
                  #{role.id}
                </span>

                {/* Code / edit input */}
                <div className="w-36 flex-shrink-0">
                  {isEditing ? (
                    <input
                      autoFocus value={editCode} onChange={e => setEditCode(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-full px-2.5 py-1 text-sm rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
                    />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {role.code}
                    </span>
                  )}
                </div>

                {/* Activity count */}
                {!isEditing && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground flex-shrink-0">
                    <Activity className="w-3 h-3" />
                    {role.activities?.length ?? 0}
                  </span>
                )}

                {/* Action buttons */}
                <div className={`flex items-center gap-1 flex-shrink-0 ml-auto transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdate} disabled={editLoading || !editCode.trim()}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
                      >
                        {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(role)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)} disabled={deleting === role.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
                        title="Eliminar"
                      >
                        {deleting === role.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ── Expanded activities ── */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/20">
                  {!role.activities || role.activities.length === 0 ? (
                    <p className="px-12 py-4 text-xs text-muted-foreground italic">
                      No hay actividades asignadas a este rol.
                    </p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-12 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider w-16">ID</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider w-32">Código</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider w-40">Actividad</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {role.activities.map(act => (
                          <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-12 py-2.5">
                              <span className="font-mono text-muted-foreground">#{act.id}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                                {act.code}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-foreground">{act.activity}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {act.description || <span className="opacity-40 italic">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    )}

    {/* ── Pagination ── */}
    {!isLoading && data && (
      <PaginationBar
        page={data.page} totalPages={data.totalPages}
        totalElements={data.totalElements} onPage={setPage} accentColor={''}      />
    )}

  </div>
);}
// ─── Toast Container ──────────────────────────────────────────────
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const cfg = {
    success: { Icon: Check,         classes: 'bg-emerald-50 border-emerald-200 text-emerald-800', ic: 'text-emerald-500' },
    error:   { Icon: X,             classes: 'bg-red-50 border-red-200 text-red-800',             ic: 'text-red-500' },
    warning: { Icon: AlertTriangle, classes: 'bg-amber-50 border-amber-200 text-amber-800',       ic: 'text-amber-500' },
  };
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map(t => {
        const { Icon, classes, ic } = cfg[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-medium max-w-xs ${classes}`}>
            <Icon className={`w-4 h-4 flex-shrink-0 ${ic}`} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export function CatalogManager() {
  const [activeSection, setActiveSection] = useState<CatalogSectionKeyLocal>('first-names');
  const { toasts, push } = useToasts();

  const active = CATALOG_SECTIONS.find(s => s.key === activeSection)!;

  const renderPanel = () => {
    const props = { accentColor: active.color, push };
    switch (activeSection) {
      case 'first-names':    return <SimpleValuePanel {...props} useItems={useFirstNames} useAdd={useAddFirstName} useUpdate={useUpdateFirstName} useDelete={useDeleteFirstName} addLabel="Nombre" addPlaceholder="ej. Carlos" />;
      case 'last-names':     return <SimpleValuePanel {...props} useItems={useLastNames}  useAdd={useAddLastName}  useUpdate={useUpdateLastName}  useDelete={useDeleteLastName}  addLabel="Apellido"  addPlaceholder="ej. González" />;
      case 'states':         return <SimpleValuePanel {...props} useItems={useStates}     useAdd={useAddState}     useUpdate={useUpdateState}     useDelete={useDeleteState}     addLabel="Estado"      addPlaceholder="ej. Chiapas" />;
      case 'municipalities': return <MunicipalitiesPanel {...props} />;
      case 'colonies':       return <ColoniesPanel {...props} />;
      case 'streets':        return <StreetsPanel {...props} />;
      case 'postal-codes':   return <PostalCodesPanel {...props} />;
      case 'roles':          return <RolesPanel {...props} />;
    }
  };
return (
  <>
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans">

      {/* ── Header ── */}
      <div className="mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
            <active.icon className="w-5 h-5 text-primary" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Gestión de Catálogos
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[52px]">
          Gestiona los catálogos del sistema — nombres, direcciones y roles
        </p>
      </div>

      <div className="flex gap-6 max-w-6xl mx-auto">

        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0 hidden sm:block">
          <nav className="flex flex-col gap-1">
            {CATALOG_SECTIONS.map(section => {
              const Icon     = section.icon;
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-card shadow-md text-foreground border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive ? 'bg-primary/10' : 'bg-transparent'
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </span>
                  <span className="flex-1">{section.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Mobile section picker ── */}
        <div className="sm:hidden w-full mb-2">
          <select
            value={activeSection}
            onChange={e => setActiveSection( e.target.value as CatalogSectionKeyLocal )}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          >
            {CATALOG_SECTIONS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-sm p-4 sm:p-6">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
                  <active.icon className="w-5 h-5 text-primary" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-foreground">{active.label}</h2>
                  <p className="text-xs text-muted-foreground">
                    Paginación del lado del servidor · Conflictos 409 muestran advertencias
                  </p>
                </div>
              </div>
              <div className="sm:ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap self-start sm:self-auto">
                /api/catalogs/{active.key}
              </div>
            </div>

            {/* Conflict notice */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent/10 border border-accent/30 mb-5 text-xs text-accent-foreground">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Nota:</strong> Actualizar/Eliminar devuelve{' '}
                <code className="font-mono bg-accent/20 px-1.5 py-0.5 rounded-md">409 Conflict</code>{' '}
                cuando la entrada está en uso o tiene registros dependientes.
              </span>
            </div>

            {renderPanel()}
          </div>
        </main>

      </div>
    </div>

    <ToastContainer toasts={toasts} />
  </>
);
}

export default CatalogManager;