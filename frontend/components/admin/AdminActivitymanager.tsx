//DARK
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

// ─── Mutation helper ──────────────────────────────────────────────
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

// ─── Pagination Bar ───────────────────────────────────────────────
interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
}
function PaginationBar({ page, totalPages, totalElements, onPage }: PaginationBarProps) {
  if (totalPages <= 1)
    
    return (
    // ✅ was: text-gray-400 → text-muted-foreground
    <p className="text-xs text-muted-foreground text-right">{totalElements} entries</p>
  );
  return (
    <div className="flex items-center justify-between">
      {/* ✅ was: text-gray-400 → text-muted-foreground */}
      <p className="text-xs text-muted-foreground">{totalElements} total entries</p>
      <div className="flex items-center gap-1">
        {/* ✅ was: border-gray-200 text-gray-500 hover:bg-gray-50 → border-border text-muted-foreground hover:bg-muted/50 */}
        <button onClick={() => onPage(page - 1)} disabled={page === 0}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
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
              // ✅ was: text-gray-400 → text-muted-foreground
              <span key={`dots-${idx}`} className="px-2 text-muted-foreground text-xs">…</span>
            ) : (
              <button key={item} onClick={() => onPage(item as number)}
                // ✅ was: inline style with hardcoded orange hex / gray hex → Tailwind theme classes
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  item === page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                }`}>
                {(item as number) + 1}
              </button>
            )
          )}
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  // ✅ was: hardcoded emerald/red/amber Tailwind classes
  // → success=primary, error=destructive, warning=accent
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

// ─── Role Activities Panel ────────────────────────────────────────
// ✅ was: const ACCENT = '#f97316' (hardcoded orange hex) → removed entirely, use CSS vars throughout

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
    if (!rid) return push('error', 'Select a role first');
    if (!newCode.trim() || !newActivity.trim()) return push('error', 'Code and Activity are required');
    setAddLoading(true);
    try {
      await handleMutation(
        () => create.mutateAsync({ roleId: rid, code: newCode.trim(), activity: newActivity.trim(), description: newDesc.trim() }),
        push, 'Activity created!', m => push('warning', m)
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
        push, 'Activity updated!', m => push('warning', m)
      );
      setEditingId(null);
    } finally { setEditLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try { await handleMutation(() => del.mutateAsync(id), push, 'Deleted!', m => push('warning', m)); }
    finally { setDeleting(null); }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* ✅ was: text-gray-500 → text-muted-foreground */}
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Filter by role:
        </label>
        {/* ✅ was: border-gray-200 bg-white text-gray-700 focus:ring-orange-300 → border-border bg-background text-foreground focus:ring-primary/40 */}
        <select
          value={filterRole ?? ''}
          onChange={e => { setFilterRole(e.target.value ? Number(e.target.value) : null); setPage(0); }}
          className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="">All roles</option>
          {allRoles.map(r => <option key={r.id} value={r.id}>{r.code} — {r.description}</option>)}
        </select>

        {/* ✅ was: style={{ background: ACCENT }} hardcoded orange → bg-primary text-primary-foreground */}
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />Add Activity
        </button>
      </div>

      {/* ── Add form ─────────────────────────────────────────── */}
      {showAdd && (
        // ✅ was: border-orange-200 bg-orange-50/40 → border-primary/20 bg-primary/5
        <div className="p-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5 flex flex-col gap-3">
          {/* ✅ was: text-gray-500 → text-muted-foreground */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Role Activity</p>

          {!filterRole && (
            <select
              value={newRoleId}
              onChange={e => setNewRoleId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            >
              <option value="">Select role *</option>
              {allRoles.map(r => <option key={r.id} value={r.id}>{r.code} — {r.description}</option>)}
            </select>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* ✅ was: border-gray-200 bg-white focus:ring-orange-300 text-gray-800 → border-border bg-background focus:ring-primary/40 text-foreground */}
            <input
              autoFocus value={newCode} onChange={e => setNewCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
              placeholder="Code *"
              className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
            <input
              value={newActivity} onChange={e => setNewActivity(e.target.value)}
              placeholder="Activity *"
              className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <input
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={addLoading || !newCode.trim() || !newActivity.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-all"
            >
              {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
            {/* ✅ was: border-gray-200 text-gray-600 hover:bg-gray-100 → border-border text-muted-foreground hover:bg-muted/50 */}
            <button
              onClick={() => { setShowAdd(false); setNewRoleId(''); setNewCode(''); setNewActivity(''); setNewDesc(''); }}
              className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────── */}
      {/* ✅ was: border-gray-100 bg-white → border-border bg-card */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
        {isLoading ? (
          // ✅ was: text-gray-400 → text-muted-foreground
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {filterRole ? 'No activities for this role.' : 'No activities yet.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {/* ✅ was: border-gray-100 bg-gray-50/80 text-gray-500 → border-border bg-muted/40 text-muted-foreground */}
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14">ID</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Code</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40">Activity</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            {/* ✅ was: divide-gray-50 → divide-border/50 */}
            <tbody className="divide-y divide-border/50">
              {items.map(act => (
                // ✅ was: hover:bg-gray-50/60 → hover:bg-muted/30
                <tr key={act.id} className="hover:bg-muted/30 transition-colors group">

                  {/* ID */}
                  <td className="px-5 py-3">
                    {/* ✅ was: text-gray-400 → text-muted-foreground */}
                    <span className="font-mono text-xs text-muted-foreground">#{act.id}</span>
                  </td>

                  {/* Code */}
                  <td className="px-3 py-3">
                    {editingId === act.id ? (
                      // ✅ was: border-orange-300 bg-orange-50/50 focus:ring-orange-400 text-gray-800 → border-primary/40 bg-primary/5 focus:ring-primary/50 text-foreground
                      <input
                        autoFocus value={editCode} onChange={e => setEditCode(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                    ) : (
                      // ✅ was: inline style ACCENT+'15' color ACCENT → bg-primary/10 text-primary
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                        {act.code}
                      </span>
                    )}
                  </td>

                  {/* Activity */}
                  <td className="px-3 py-3">
                    {editingId === act.id ? (
                      <input
                        value={editActivity} onChange={e => setEditActivity(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                    ) : (
                      // ✅ was: text-gray-700 → text-foreground
                      <span className="font-medium text-foreground text-xs">{act.activity}</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="px-3 py-3">
                    {editingId === act.id ? (
                      <input
                        value={editDesc} onChange={e => setEditDesc(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditingId(null); }}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                    ) : (
                      // ✅ was: text-gray-500 / text-gray-300 → text-muted-foreground
                      <span className="text-muted-foreground text-xs">
                        {act.description || <span className="opacity-40 italic">—</span>}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className={`flex items-center justify-end gap-1 transition-opacity ${editingId === act.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {editingId === act.id ? (
                        <>
                          {/* ✅ was: bg-emerald-100 text-emerald-700 hover:bg-emerald-200 → bg-primary/10 text-primary hover:bg-primary/20 */}
                          <button
                            onClick={handleUpdate}
                            disabled={editLoading || !editCode.trim() || !editActivity.trim()}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
                            title="Save"
                          >
                            {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          {/* ✅ was: bg-gray-100 text-gray-500 hover:bg-gray-200 → bg-muted text-muted-foreground hover:bg-muted/80 */}
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all" title="Cancel">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* ✅ was: hover:bg-orange-50 text-gray-400 hover:text-orange-600 → hover:bg-primary/10 text-muted-foreground hover:text-primary */}
                          <button onClick={() => startEdit(act)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {/* ✅ was: hover:bg-red-50 text-gray-400 hover:text-red-600 → hover:bg-destructive/10 text-muted-foreground hover:text-destructive */}
                          <button
                            onClick={() => handleDelete(act.id)}
                            disabled={deleting === act.id}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
                            title="Delete"
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

      {/* Pagination */}
      {!isLoading && raw && (
        <PaginationBar
          page={raw.page} totalPages={raw.totalPages}
          totalElements={raw.totalElements} onPage={setPage}
        />
      )}
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────
export function ActivityManager() {
  const { toasts, push } = useToasts();

  return (
    <>
      {/* ✅ was: bg-gradient-to-br from-slate-50 via-white to-orange-50/30 → bg-background */}
      <div className="min-h-screen bg-background p-6 font-sans">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            {/* ✅ was: inline style ACCENT+'18' / color ACCENT → bg-primary/10 text-primary */}
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </span>
            {/* ✅ was: text-gray-900 → text-foreground */}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Role Activities</h1>
          </div>
          {/* ✅ was: text-gray-500 → text-muted-foreground */}
          <p className="text-muted-foreground text-sm ml-[52px]">
            Manage permissions and activities assigned to each role
          </p>
        </div>

        {/* Card */}
        <div className="max-w-5xl mx-auto">
          {/* ✅ was: bg-white/80 border-gray-100 → bg-card/80 border-border */}
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-sm p-6">

            {/* Sub-header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                {/* ✅ was: text-gray-400 → text-muted-foreground */}
                <p className="text-xs text-muted-foreground">
                  Server-side pagination · 409 Conflict returns warnings
                </p>
              </div>
              {/* ✅ was: inline style ACCENT+'15' color ACCENT → bg-primary/10 text-primary */}
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                /api/catalogs/role-activities
              </div>
            </div>

            {/* Conflict notice */}
            {/* ✅ was: bg-amber-50 border-amber-200 text-amber-700 bg-amber-100 → accent tokens */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/30 mb-5 text-xs text-accent-foreground">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-foreground" />
              <span>
                <strong>Note:</strong> Delete returns{' '}
                <code className="font-mono bg-accent/20 px-1 rounded">409 Conflict</code>{' '}
                when the activity is currently assigned to users.
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