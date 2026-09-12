import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  TableSkeleton,
  ErrorState,
} from '@/components/admin/AdminUI';
import { AdminDrawer, DrawerSection, Field, DrawerToggle, fieldClass } from '@/components/admin/AdminDrawer';
import { formatZAR, formatDate } from '@/lib/admin-format';
import { logActivity } from '@/lib/admin-log';

type Discount = {
  id: string;
  code: string;
  type: string;
  value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
};

type Draft = Partial<Discount> & { id?: string };

const TYPE_LABEL: Record<string, string> = {
  percentage: 'Percentage',
  fixed: 'Fixed amount',
  free_shipping: 'Free shipping',
};

export default function AdminDiscounts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [term, setTerm] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Discount[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const code = (d.code ?? '').trim().toUpperCase();
      if (!code) throw new Error('A code is required.');
      if (!/^[A-Z0-9_-]{3,32}$/.test(code))
        throw new Error('Codes use 3–32 letters, numbers, dashes or underscores.');
      const type = d.type ?? 'percentage';
      const value = Number(d.value ?? 0);
      if (type === 'percentage' && (value <= 0 || value > 100))
        throw new Error('Percentage must be between 1 and 100.');
      if (type === 'fixed' && value <= 0) throw new Error('Amount must be more than zero.');
      if (Number(d.min_purchase ?? 0) < 0) throw new Error('Minimum purchase cannot be negative.');
      if (d.max_uses != null && Number(d.max_uses) < 0) throw new Error('Maximum uses cannot be negative.');

      const payload = {
        code,
        type,
        value: type === 'free_shipping' ? 0 : value,
        min_purchase: Number(d.min_purchase ?? 0),
        max_uses: d.max_uses ? Number(d.max_uses) : null,
        starts_at: d.starts_at || null,
        expires_at: d.expires_at || null,
        active: d.active ?? true,
      };

      if (d.id) {
        const { error } = await supabase.from('discount_codes').update(payload).eq('id', d.id);
        if (error) throw error;
        await logActivity({ action: 'Discount edited', entityType: 'discount', entityId: d.id, entityLabel: code });
      } else {
        const { data: row, error } = await supabase.from('discount_codes').insert(payload).select('id').single();
        if (error) throw error;
        await logActivity({ action: 'Discount created', entityType: 'discount', entityId: row.id, entityLabel: code });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-discounts'] });
      setEditing(null);
      toast.success('Discount saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (d: Discount) => {
      const { error } = await supabase.from('discount_codes').delete().eq('id', d.id);
      if (error) throw error;
      await logActivity({ action: 'Discount deleted', entityType: 'discount', entityId: d.id, entityLabel: d.code });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-discounts'] });
      toast.success('Discount deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (data ?? []).filter((d) => !t || d.code.toLowerCase().includes(t));
  }, [data, term]);

  const describe = (d: Discount) =>
    d.type === 'percentage' ? `${d.value}%` : d.type === 'fixed' ? formatZAR(d.value) : 'Free shipping';

  const expired = (d: Discount) => !!d.expires_at && new Date(d.expires_at) < new Date();

  return (
    <div>
      <PageHeader
        title="Discount Codes"
        subtitle={`${filtered.length} codes`}
        actions={
          <button
            onClick={() => setEditing({ code: '', type: 'percentage', value: 10, active: true, min_purchase: 0 })}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Code
          </button>
        }
      />

      <Panel className="mb-5 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search codes"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No discount codes" description="Create a code and shoppers can use it at checkout." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-4 font-semibold">Code</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Value</th>
                  <th className="px-5 py-4 font-semibold">Minimum</th>
                  <th className="px-5 py-4 font-semibold">Usage</th>
                  <th className="px-5 py-4 font-semibold">Expires</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-foreground/[0.03]">
                    <td className="px-5 py-4 font-semibold tracking-[0.08em]">{d.code}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{TYPE_LABEL[d.type] ?? d.type}</td>
                    <td className="px-5 py-4 tabular-nums">{describe(d)}</td>
                    <td className="px-5 py-4 tabular-nums text-xs text-muted-foreground">
                      {Number(d.min_purchase) > 0 ? formatZAR(d.min_purchase) : '—'}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-xs">
                      {d.used_count}
                      {d.max_uses ? ` / ${d.max_uses}` : ''}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {d.expires_at ? formatDate(d.expires_at) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={expired(d) ? 'expired' : d.active ? 'active' : 'inactive'}
                        tone={expired(d) ? 'danger' : d.active ? 'positive' : 'warning'}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          aria-label="Edit"
                          onClick={() => setEditing(d)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          aria-label="Delete"
                          onClick={() => {
                            if (confirm(`Delete code ${d.code}?`)) remove.mutate(d);
                          }}
                          className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {editing && (
          <AdminDrawer
            title={editing.id ? 'Edit Code' : 'New Code'}
            onClose={() => setEditing(null)}
            footer={
              <>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-full border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => save.mutate(editing)}
                  disabled={save.isPending}
                  className="flex-1 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
                >
                  {save.isPending ? 'Saving' : 'Save Code'}
                </button>
              </>
            }
          >
            <DrawerSection title="Code">
              <Field
                label="Code"
                value={editing.code ?? ''}
                onChange={(v) => setEditing({ ...editing, code: v.toUpperCase() })}
                placeholder="SIGMA10"
              />
              <select
                className={fieldClass}
                value={editing.type ?? 'percentage'}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </select>
              {editing.type !== 'free_shipping' && (
                <Field
                  label={editing.type === 'fixed' ? 'Amount off (R)' : 'Percentage off (%)'}
                  type="number"
                  min={0}
                  value={editing.value ?? 0}
                  onChange={(v) => setEditing({ ...editing, value: Number(v) })}
                />
              )}
            </DrawerSection>

            <DrawerSection title="Conditions">
              <Field
                label="Minimum purchase (R)"
                type="number"
                min={0}
                value={editing.min_purchase ?? 0}
                onChange={(v) => setEditing({ ...editing, min_purchase: Number(v) })}
              />
              <Field
                label="Maximum uses (blank = unlimited)"
                type="number"
                min={0}
                value={editing.max_uses ?? ''}
                onChange={(v) => setEditing({ ...editing, max_uses: v === '' ? null : Number(v) })}
              />
              <Field
                label="Starts"
                type="date"
                value={editing.starts_at ? editing.starts_at.slice(0, 10) : ''}
                onChange={(v) => setEditing({ ...editing, starts_at: v ? new Date(v).toISOString() : null })}
              />
              <Field
                label="Expires"
                type="date"
                value={editing.expires_at ? editing.expires_at.slice(0, 10) : ''}
                onChange={(v) => setEditing({ ...editing, expires_at: v ? new Date(v).toISOString() : null })}
              />
              <DrawerToggle
                label="Active"
                checked={editing.active ?? true}
                onChange={(v) => setEditing({ ...editing, active: v })}
              />
            </DrawerSection>
          </AdminDrawer>
        )}
      </AnimatePresence>
    </div>
  );
}
