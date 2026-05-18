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
  { key: 'first-names',    label: 'First Names',    icon: User,      color: '#6366f1' },
  { key: 'last-names',     label: 'Last Names',     icon: User,      color: '#8b5cf6' },
  { key: 'states',         label: 'States',         icon: MapPin,    color: '#0ea5e9' },
  { key: 'municipalities', label: 'Municipalities', icon: Building2, color: '#10b981' },
  { key: 'colonies',       label: 'Colonies',       icon: TreePine,  color: '#f59e0b' },
  { key: 'streets',        label: 'Streets',        icon: RouteIcon, color: '#ef4444' },
  { key: 'postal-codes',   label: 'Postal Codes',   icon: Hash,      color: '#ec4899' },
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
    <p className="text-xs text-gray-400 text-right">{totalElements} entries</p>
  );
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-400">{totalElements} total entries</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
              <span key={`dots-${idx}`} className="px-2 text-gray-400 text-xs">…</span>
            ) : (
              <button
                key={item}
                onClick={() => onPage(item as number)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                style={
                  item === page
                    ? { background: accentColor, color: 'white' }
                    : { background: 'transparent', color: '#6b7280' }
                }
              >
                {(item as number) + 1}
              </button>
            )
          )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
      {/* Search + Add */}
      <div className="flex gap-3 items-center">
        {!hideSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={e => { onSearch(e.target.value); onPage(0); }}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400 text-gray-700"
            />
          </div>
        )}
        <button
          onClick={() => setShowAdd(v => !v)}
          style={{ background: accentColor }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />{addLabel}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New entry</p>
          <input
            autoFocus value={newValue} onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewValue(''); } }}
            placeholder={addPlaceholder}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-800"
          />
          {addExtra}
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={addingLoading || !newValue.trim()} style={{ background: accentColor }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-all">
              {addingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Add
            </button>
            <button onClick={() => { setShowAdd(false); setNewValue(''); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {search ? 'No results found.' : 'No entries yet.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-mono">#{item.id}</span>
                  </td>
                  <td className="px-5 py-3">
                    {editingId === item.id ? (
                      <EditRow value={item.displayValue} onSave={v => handleUpdate(item.id, v)} onCancel={() => setEditingId(null)} loading={editLoading} />
                    ) : (
                      <span className="text-gray-800 font-medium">{item.displayValue}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId !== item.id && (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(item.id)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-all" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all disabled:opacity-40" title="Delete">
                          {deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* Pagination */}
      {!loading && pagedData && (
        <PaginationBar
          page={pagedData.page} totalPages={pagedData.totalPages}
          totalElements={pagedData.totalElements} onPage={onPage} accentColor={accentColor}
        />
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
    const msg = e?.response?.data?.message || e?.message || 'Operation failed';
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
      onAdd={async v => handleMutation(() => add.mutateAsync({ value: v }), push, `${addLabel} added!`)}
      onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, 'Updated!', m => push('warning', m))}
      onDelete={async id => handleMutation(() => del.mutateAsync(id), push, 'Deleted!', m => push('warning', m))}
      addLabel={`Add ${addLabel}`} addPlaceholder={addPlaceholder} accentColor={accentColor}
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
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">State:</label>
        <select value={filterState ?? ''} onChange={e => { setFilterState(e.target.value ? Number(e.target.value) : null); setPage(0); }}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700">
          <option value="">All states</option>
          {allStates.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
        </select>
      </div>
      <CatalogTable
        pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
        search={search} onSearch={v => { setSearch(v); setPage(0); }}
        onAdd={async v => {
          const sid = newStateId ? Number(newStateId) : filterState;
          if (!sid) return push('error', 'Select a state first');
          handleMutation(() => add.mutateAsync({ stateId: sid, municipalityName: v }), push, 'Municipality added!');
          setNewStateId('');
        }}
        onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, 'Updated!', m => push('warning', m))}
        onDelete={async id => handleMutation(() => del.mutateAsync(id), push, 'Deleted!', m => push('warning', m))}
        addLabel="Add Municipality" addPlaceholder="e.g. Comitán" accentColor={accentColor}
        addExtra={!filterState ? (
          <select value={newStateId} onChange={e => setNewStateId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700">
            <option value="">Select state *</option>
            {allStates.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
          </select>
        ) : null}
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
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Municipality:</label>
        <select value={filterMuni ?? ''} onChange={e => { setFilterMuni(e.target.value ? Number(e.target.value) : null); setPage(0); }}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 text-gray-700">
          <option value="">All municipalities</option>
          {allMunis.map(m => <option key={m.id} value={m.id}>{m.municipalityName}</option>)}
        </select>
      </div>
      <CatalogTable
        pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
        search={search} onSearch={v => { setSearch(v); setPage(0); }}
        onAdd={async v => {
          const mid = newMuniId ? Number(newMuniId) : filterMuni;
          if (!mid) return push('error', 'Select a municipality first');
          handleMutation(() => add.mutateAsync({ municipalityId: mid, colonyName: v }), push, 'Colony added!');
          setNewMuniId('');
        }}
        onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, 'Updated!', m => push('warning', m))}
        onDelete={async id => handleMutation(() => del.mutateAsync(id), push, 'Deleted!', m => push('warning', m))}
        addLabel="Add Colony" addPlaceholder="e.g. Centro" accentColor={accentColor}
        addExtra={!filterMuni ? (
          <select value={newMuniId} onChange={e => setNewMuniId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 text-gray-700">
            <option value="">Select municipality *</option>
            {allMunis.map(m => <option key={m.id} value={m.id}>{m.municipalityName}</option>)}
          </select>
        ) : null}
      />
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
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Colony:</label>
        <select value={filterColony ?? ''} onChange={e => { setFilterColony(e.target.value ? Number(e.target.value) : null); setPage(0); }}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-700">
          <option value="">All colonies</option>
          {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
        </select>
      </div>
      <CatalogTable
        pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
        search={search} onSearch={v => { setSearch(v); setPage(0); }}
        onAdd={async v => {
          const cid = newColonyId ? Number(newColonyId) : filterColony;
          if (!cid) return push('error', 'Select a colony first');
          handleMutation(() => add.mutateAsync({ colonyId: cid, streetName: v }), push, 'Street added!');
          setNewColonyId('');
        }}
        onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, 'Updated!', m => push('warning', m))}
        onDelete={async id => handleMutation(() => del.mutateAsync(id), push, 'Deleted!', m => push('warning', m))}
        addLabel="Add Street" addPlaceholder="e.g. Av. Central" accentColor={accentColor}
        addExtra={!filterColony ? (
          <select value={newColonyId} onChange={e => setNewColonyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-700">
            <option value="">Select colony *</option>
            {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
          </select>
        ) : null}
      />
    </div>
  );
}

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
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Colony:</label>
        <select value={filterColony ?? ''} onChange={e => { setFilterColony(e.target.value ? Number(e.target.value) : null); setPage(0); }}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700">
          <option value="">All colonies</option>
          {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
        </select>
      </div>
      <CatalogTable
        pagedData={mapped} loading={isLoading} page={page} onPage={setPage}
        search={search} onSearch={v => { setSearch(v); setPage(0); }}
        onAdd={async v => {
          const cid = newColonyId ? Number(newColonyId) : filterColony;
          if (!cid) return push('error', 'Select a colony first');
          handleMutation(() => add.mutateAsync({ colonyId: cid, postalCode: v }), push, 'Postal code added!');
          setNewColonyId('');
        }}
        onUpdate={async (id, v) => handleMutation(() => upd.mutateAsync({ id, req: { value: v } }), push, 'Updated!', m => push('warning', m))}
        onDelete={async id => handleMutation(() => del.mutateAsync(id), push, 'Deleted!', m => push('warning', m))}
        addLabel="Add Code" addPlaceholder="e.g. 29000" accentColor={accentColor}
        addExtra={!filterColony ? (
          <select value={newColonyId} onChange={e => setNewColonyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700">
            <option value="">Select colony *</option>
            {allColonies.map(c => <option key={c.id} value={c.id}>{c.colonyName}</option>)}
          </select>
        ) : null}
      />
    </div>
  );
}

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
      await handleMutation(() => create.mutateAsync({ code: newCode.trim(), description: newDesc.trim() }), push, 'Role created!', m => push('warning', m));
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
        push, 'Role updated!', m => push('warning', m)
      );
      setEditingId(null);
    } finally { setEditLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try { await handleMutation(() => del.mutateAsync(id), push, 'Role deleted!', m => push('warning', m)); }
    finally { setDeleting(null); }
  };

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(v => !v)} style={{ background: accentColor }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 transition-all active:scale-95">
          <Plus className="w-4 h-4" />Add Role
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Role</p>
          <input autoFocus value={newCode} onChange={e => setNewCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewCode(''); setNewDesc(''); }}}
            placeholder="Role code (e.g. ADMIN)"
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={addLoading || !newCode.trim()} style={{ background: accentColor }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-all">
              {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Create
            </button>
            <button onClick={() => { setShowAdd(false); setNewCode(''); setNewDesc(''); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">No roles yet.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(role => {
            const isExpanded = expandedId === role.id;
            const isEditing  = editingId  === role.id;
            return (
              <div key={role.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all">
                <div className="flex items-center gap-3 px-5 py-3.5 group hover:bg-gray-50/60 transition-colors">
                  <button onClick={() => toggleExpand(role.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0">
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-mono flex-shrink-0">
                    #{role.id}
                  </span>
                  <div className="w-36 flex-shrink-0">
                    {isEditing ? (
                      <input autoFocus value={editCode} onChange={e => setEditCode(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditingId(null); }}
                        className="w-full px-2.5 py-1 text-sm rounded-lg border border-teal-300 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800" />
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: accentColor + '18', color: accentColor }}>
                        {role.code}
                      </span>
                    )}
                  </div>
                  {/* {isEditing ? (
                    <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      placeholder="Description"
                      className="flex-1 px-2.5 py-1 text-sm rounded-lg border border-teal-300 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-600" />
                  ) : (
                    <span className="flex-1 text-sm text-gray-500 truncate">{role.description}</span>
                  )} */}
                  {!isEditing && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 flex-shrink-0">
                      <Activity className="w-3 h-3" />
                      {role.activities?.length ?? 0}
                    </span>
                  )}
                  <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isEditing ? (
                      <>
                        <button onClick={handleUpdate} disabled={editLoading || !editCode.trim()}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-40 transition-all">
                          {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(role)} className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-all" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(role.id)} disabled={deleting === role.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all disabled:opacity-40" title="Delete">
                          {deleting === role.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {!role.activities || role.activities.length === 0 ? (
                      <p className="px-12 py-4 text-xs text-gray-400 italic">No activities assigned to this role.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left px-12 py-2 text-gray-400 font-semibold uppercase tracking-wider w-16">ID</th>
                            <th className="text-left px-3 py-2 text-gray-400 font-semibold uppercase tracking-wider w-32">Code</th>
                            <th className="text-left px-3 py-2 text-gray-400 font-semibold uppercase tracking-wider w-40">Activity</th>
                            <th className="text-left px-3 py-2 text-gray-400 font-semibold uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {role.activities.map(act => (
                            <tr key={act.id} className="hover:bg-white/80 transition-colors">
                              <td className="px-12 py-2.5"><span className="font-mono text-gray-400">#{act.id}</span></td>
                              <td className="px-3 py-2.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                                  style={{ background: accentColor + '12', color: accentColor }}>{act.code}</span>
                              </td>
                              <td className="px-3 py-2.5 font-medium text-gray-700">{act.activity}</td>
                              <td className="px-3 py-2.5 text-gray-500">{act.description || <span className="text-gray-300 italic">—</span>}</td>
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

      {!isLoading && data && (
        <PaginationBar page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPage={setPage} accentColor={accentColor} />
      )}
    </div>
  );
}

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
      case 'first-names':    return <SimpleValuePanel {...props} useItems={useFirstNames} useAdd={useAddFirstName} useUpdate={useUpdateFirstName} useDelete={useDeleteFirstName} addLabel="First Name" addPlaceholder="e.g. Carlos" />;
      case 'last-names':     return <SimpleValuePanel {...props} useItems={useLastNames}  useAdd={useAddLastName}  useUpdate={useUpdateLastName}  useDelete={useDeleteLastName}  addLabel="Last Name"  addPlaceholder="e.g. González" />;
      case 'states':         return <SimpleValuePanel {...props} useItems={useStates}     useAdd={useAddState}     useUpdate={useUpdateState}     useDelete={useDeleteState}     addLabel="State"      addPlaceholder="e.g. Chiapas" />;
      case 'municipalities': return <MunicipalitiesPanel {...props} />;
      case 'colonies':       return <ColoniesPanel {...props} />;
      case 'streets':        return <StreetsPanel {...props} />;
      case 'postal-codes':   return <PostalCodesPanel {...props} />;
      case 'roles':          return <RolesPanel {...props} />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 font-sans">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catalog Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage system catalogs — names, addresses and roles</p>
        </div>

        <div className="flex gap-6 max-w-6xl mx-auto">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {CATALOG_SECTIONS.map(section => {
                const Icon    = section.icon;
                const isActive= activeSection === section.key;
                return (
                  <button key={section.key} onClick={() => setActiveSection(section.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left group ${isActive ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'}`}>
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: isActive ? section.color + '18' : 'transparent' }}>
                      <Icon className="w-4 h-4 transition-colors" style={{ color: isActive ? section.color : undefined }} />
                    </span>
                    <span className="flex-1">{section.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" style={{ color: section.color }} />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: active.color + '18' }}>
                  <active.icon className="w-5 h-5" style={{ color: active.color }} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{active.label}</h2>
                  <p className="text-xs text-gray-400">Server-side pagination · 409 Conflict returns warnings</p>
                </div>
                <div className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: active.color + '15', color: active.color }}>
                  /api/catalogs/{active.key}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5 text-xs text-amber-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Note:</strong> Update/Delete return <code className="font-mono bg-amber-100 px-1 rounded">409 Conflict</code> when the entry is in use or has dependent records.</span>
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