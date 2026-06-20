'use client';

import { useState, useCallback } from 'react';
import {
  useRolesList,
  useRoleActivities,
  useRoleActivitiesByRole,
  useCreateRoleActivity,
  useUpdateRoleActivity,
  useDeleteRoleActivity,
} from './hooks/useCatalogs';
import type { CatalogRoleActivity } from '@/app/shared/admin/catalog.models';
import {
  Plus, Pencil, Trash2, X, Check, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, Activity,
} from 'lucide-react';

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

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
}
function PaginationBar({ page, totalPages, totalElements, onPage }: PaginationBarProps) {
 if (totalPages <= 1)
  return (
    <p className="text-xs text-muted-foreground text-right">{totalElements} entradas</p>
  );

return (
  <div className="flex items-center justify-between">

    <p className="text-xs text-muted-foreground">{totalElements} entradas totales</p>

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
        .reduce<(number | "...")[]>((acc, cur, idx, arr) => {
          if (idx > 0 && (cur as number) - (arr[idx - 1] as number) > 1) acc.push("...");
          acc.push(cur);
          return acc;
        }, [])
        .map((item, idx) =>
          item === "..." ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-muted-foreground text-xs select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPage(item as number)}
              className={`w-7 h-7 rounded-xl text-xs font-semibold transition-all ${
                item === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const cfg = {
    success: { Icon: Check,         classes: 'bg-primary/10 border-primary/30 text-primary',             ic: 'text-primary' },
    error:   { Icon: X,             classes: 'bg-destructive/10 border-destructive/30 text-destructive', ic: 'text-destructive' },
    warning: { Icon: AlertTriangle, classes: 'bg-accent/10 border-accent/30 text-accent-foreground',     ic: 'text-accent-foreground' },
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

function RoleActivitiesPanel({ push }: { push: PushFn }) {
  const [page, setPage]               = useState(0);
  const [filterRole, setFilterRole]   = useState<number | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [newRoleId, setNewRoleId]     = useState('');
  const [newCode, setNewCode]         = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [addLoading, setAddLoading]   = useState(false);
  const [deleting, setDeleting]       = useState<number | null>(null);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editCode, setEditCode]       = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const { data: rolesData } = useRolesList();
  const allRoles = rolesData ?? [];

  const { data: allData,    isLoading: loadingAll }      = useRoleActivities({ page, size: 20 });
  const { data: filterData, isLoading: loadingFiltered } = useRoleActivitiesByRole(filterRole, { page, size: 20 });

  const raw       = filterRole ? filterData : allData;
  const isLoading = filterRole ? loadingFiltered : loadingAll;
  const items     = (raw?.content ?? []) as CatalogRoleActivity[];

  const create = useCreateRoleActivity();
  const update = useUpdateRoleActivity();
  const del    = useDeleteRoleActivity();

  const handleAdd = async () => {
    const rid = newRoleId ? Number(newRoleId) : filterRole;
    if (!rid) return push('error', 'Selecciona un rol primero');
    if (!newCode.trim() || !newActivity.trim()) return push('error', 'El código y la actividad son requeridos');
    setAddLoading(true);
    try {
      await handleMutation(
        () => create.mutateAsync({ roleId: rid, code: newCode.trim(), activity: newActivity.trim(), description: newDesc.trim() }),
        push, '¡Actividad creada!', m => push('warning', m)
      );
      setNewRoleId(''); setNewCode(''); setNewActivity(''); setNewDesc(''); setShowAdd(false);
    } finally { setAddLoading(false); }
  };

  const startEdit = (act: CatalogRoleActivity) => {
    setEditingId(act.id);
    setEditCode(act.code);
    setEditActivity(act.activity);
    setEditDesc(act.description);
  };

  const handleUpdate = async () => {
    if (!editingId || !editCode.trim() || !editActivity.trim()) return;
    setEditLoading(true);
    try {
      await handleMutation(
        () => update.mutateAsync({ id: editingId, req: { roleId: 0, code: editCode.trim(), activity: editActivity.trim(), description: editDesc.trim() } }),
        push, '¡Actividad actualizada!', m => push('warning', m)
      );
      setEditingId(null);
    } finally { setEditLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try { await handleMutation(() => del.mutateAsync(id), push, '¡Eliminado!', m => push('warning', m)); }
    finally { setDeleting(null); }
  };
return (
  <div className="flex flex-col gap-4">

    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        Filtrar por rol
      </label>
      <select
        value={filterRole ?? ''}
        onChange={e => { setFilterRole(e.target.value ? Number(e.target.value) : null); setPage(0); }}
        className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
      >
        <option value="">Todos los roles</option>
        {allRoles.map(r => <option key={r.id} value={r.id}>{r.code} — {r.description}</option>)}
      </select>

      <button
        onClick={() => setShowAdd(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        Agregar actividad
      </button>
    </div>

    {showAdd && (
      <div className="p-5 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Nueva Actividad de Rol
        </p>

        {!filterRole && (
          <select
            value={newRoleId}
            onChange={e => setNewRoleId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
          >
            <option value=""> Selecciona un rol</option>
            {allRoles.map(r => <option key={r.id} value={r.id}>{r.code} — {r.description}</option>)}
          </select>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            autoFocus value={newCode} onChange={e => setNewCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
            placeholder="Código *"
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
          />
          <input
            value={newActivity} onChange={e => setNewActivity(e.target.value)}
            placeholder="Actividad *"
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
          />
        </div>

        <input
          value={newDesc} onChange={e => setNewDesc(e.target.value)}
          placeholder="Descripción (opcional)"
          className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
        />

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleAdd}
            disabled={addLoading || !newCode.trim() || !newActivity.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
          >
            {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewRoleId(''); setNewCode(''); setNewActivity(''); setNewDesc(''); }}
            className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted/50 hover:text-foreground transition-all"
          >
              Cancelar
          </button>
        </div>
      </div>
    )}

    <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
      {isLoading ? (
        <div className="flex items-center justify-center py-14 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground text-sm">
          {filterRole ? 'No hay actividades para este rol.' : 'Aún no hay actividades.'}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14">ID</th>
              <th className="text-left px-3 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Código</th>
              <th className="text-left px-3 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40">Actividad</th>
              <th className="text-left px-3 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descripción</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map(act => (
              <tr key={act.id} className="hover:bg-muted/30 transition-colors group">

                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs text-muted-foreground">#{act.id}</span>
                </td>

                <td className="px-3 py-3.5">
                  {editingId === act.id ? (
                    <input
                      autoFocus value={editCode} onChange={e => setEditCode(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
                    />
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                      {act.code}
                    </span>
                  )}
                </td>

                <td className="px-3 py-3.5">
                  {editingId === act.id ? (
                    <input
                      value={editActivity} onChange={e => setEditActivity(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
                    />
                  ) : (
                    <span className="font-medium text-foreground text-xs">{act.activity}</span>
                  )}
                </td>

                <td className="px-3 py-3.5">
                  {editingId === act.id ? (
                    <input
                      value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground transition-all"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {act.description || <span className="opacity-40 italic">—</span>}
                    </span>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <div className={`flex items-center justify-end gap-1 transition-opacity ${editingId === act.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {editingId === act.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          disabled={editLoading || !editCode.trim() || !editActivity.trim()}
                          className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
                          title="Guardar"
                        >
                          {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(act)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(act.id)}
                          disabled={deleting === act.id}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
                          title="Eliminar"
                        >
                          {deleting === act.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {!isLoading && raw && (
      <PaginationBar
        page={raw.page} totalPages={raw.totalPages}
        totalElements={raw.totalElements} onPage={setPage}
      />
    )}

  </div>
);
}
export function ActivityManager() {
  const { toasts, push } = useToasts();
return (
  <>
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans">

      <div className="mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
            <Activity className="w-5 h-5 text-primary" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Actividades de rol
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[52px]">
          Administra las actividades asignadas a cada rol. Estas actividades definen los permisos y acciones disponibles para los usuarios según su rol en la plataforma.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-sm p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <p className="text-xs text-muted-foreground">
              Paginación del lado del servidor · Los conflictos 409 muestran advertencias
            </p>
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap self-start sm:self-auto">
              /api/catalogs/role-activities
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent/10 border border-accent/30 mb-5 text-xs text-accent-foreground">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Nota:</strong> Eliminar devuelve{' '}
              <code className="font-mono bg-accent/20 px-1.5 py-0.5 rounded-md">409 Conflict</code>{' '}
              cuando la actividad está asignada actualmente a usuarios.
            </span>
          </div>

          <RoleActivitiesPanel push={push} />
        </div>
      </div>

    </div>

    <ToastContainer toasts={toasts} />
  </>
);
}
export default ActivityManager;