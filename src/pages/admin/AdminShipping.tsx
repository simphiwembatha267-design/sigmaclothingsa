import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Truck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  TableSkeleton,
  ErrorState,
  shippingTone,
} from '@/components/admin/AdminUI';
import { AdminDrawer, DrawerSection, Field, DrawerToggle, fieldClass } from '@/components/admin/AdminDrawer';
import { formatZAR, formatDate } from '@/lib/admin-format';
import { logActivity } from '@/lib/admin-log';

type Zone = {
  id: string;
  name: string;
  countries: string[];
  free_shipping_threshold: number | null;
  active: boolean;
  position: number;
};

type Rate = {
  id: string;
  zone_id: string;
  name: string;
  price: number;
  min_order_total: number;
  max_order_total: number | null;
  estimated_days: string | null;
  active: boolean;
};

type FulfilOrder = {
  id: string;
  order_number: string;
  customer_name: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_status: string;
  courier: string | null;
  tracking_number: string | null;
  created_at: string;
};

export default function AdminShipping() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [zoneDraft, setZoneDraft] = useState<(Partial<Zone> & { id?: string }) | null>(null);
  const [rateDraft, setRateDraft] = useState<(Partial<Rate> & { id?: string }) | null>(null);

  const zones = useQuery({
    queryKey: ['admin-zones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shipping_zones').select('*').order('position');
      if (error) throw error;
      return (data ?? []) as unknown as Zone[];
    },
  });

  const rates = useQuery({
    queryKey: ['admin-rates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shipping_rates').select('*').order('position');
      if (error) throw error;
      return (data ?? []) as unknown as Rate[];
    },
  });

  const queue = useQuery({
    queryKey: ['fulfilment-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, shipping_city, shipping_country, shipping_status, courier, tracking_number, created_at')
        .in('shipping_status', ['unfulfilled', 'packed', 'shipped'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as FulfilOrder[];
    },
  });

  const saveZone = useMutation({
    mutationFn: async (z: Partial<Zone> & { id?: string }) => {
      if (!z.name?.trim()) throw new Error('Zone name is required.');
      const payload = {
        name: z.name.trim(),
        countries: z.countries ?? [],
        free_shipping_threshold:
          z.free_shipping_threshold === null || z.free_shipping_threshold === undefined
            ? null
            : Number(z.free_shipping_threshold),
        active: z.active ?? true,
        position: z.position ?? (zones.data?.length ?? 0),
      };
      if (z.id) {
        const { error } = await supabase.from('shipping_zones').update(payload).eq('id', z.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('shipping_zones').insert(payload);
        if (error) throw error;
      }
      await logActivity({ action: 'Shipping zone saved', entityType: 'shipping', entityLabel: payload.name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-zones'] });
      qc.invalidateQueries({ queryKey: ['shipping-options'] });
      setZoneDraft(null);
      toast.success('Zone saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveRate = useMutation({
    mutationFn: async (r: Partial<Rate> & { id?: string }) => {
      if (!r.name?.trim()) throw new Error('Rate name is required.');
      if (!r.zone_id) throw new Error('Choose a zone.');
      if (Number(r.price ?? 0) < 0) throw new Error('Price cannot be negative.');
      const payload = {
        zone_id: r.zone_id,
        name: r.name.trim(),
        price: Number(r.price ?? 0),
        min_order_total: Number(r.min_order_total ?? 0),
        max_order_total: r.max_order_total ? Number(r.max_order_total) : null,
        estimated_days: r.estimated_days ?? null,
        active: r.active ?? true,
      };
      if (r.id) {
        const { error } = await supabase.from('shipping_rates').update(payload).eq('id', r.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('shipping_rates').insert(payload);
        if (error) throw error;
      }
      await logActivity({ action: 'Shipping rate saved', entityType: 'shipping', entityLabel: payload.name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-rates'] });
      qc.invalidateQueries({ queryKey: ['shipping-options'] });
      setRateDraft(null);
      toast.success('Rate saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeZone = useMutation({
    mutationFn: async (z: Zone) => {
      const { error } = await supabase.from('shipping_zones').delete().eq('id', z.id);
      if (error) throw error;
      await logActivity({ action: 'Shipping zone deleted', entityType: 'shipping', entityLabel: z.name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-zones'] });
      qc.invalidateQueries({ queryKey: ['admin-rates'] });
      qc.invalidateQueries({ queryKey: ['shipping-options'] });
      toast.success('Zone deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRate = useMutation({
    mutationFn: async (r: Rate) => {
      const { error } = await supabase.from('shipping_rates').delete().eq('id', r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-rates'] });
      qc.invalidateQueries({ queryKey: ['shipping-options'] });
      toast.success('Rate deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fulfil = useMutation({
    mutationFn: async ({ o, patch }: { o: FulfilOrder; patch: Partial<FulfilOrder> }) => {
      const { error } = await supabase.from('orders').update(patch as never).eq('id', o.id);
      if (error) throw error;
      await logActivity({
        action: `Order ${patch.shipping_status ?? 'updated'}`,
        entityType: 'order',
        entityId: o.id,
        entityLabel: o.order_number,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fulfilment-queue'] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Shipping"
        subtitle="Zones and rates are used to work out shipping at checkout."
        actions={
          <button
            onClick={() => setZoneDraft({ name: '', countries: ['South Africa'], active: true })}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Zone
          </button>
        }
      />

      <Panel className="mb-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Zones & Rates</p>
          <button
            onClick={() => {
              if (!zones.data?.length) return toast.error('Create a zone first.');
              setRateDraft({ zone_id: zones.data[0].id, name: 'Standard', price: 0, min_order_total: 0, active: true });
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Add rate
          </button>
        </div>
        {zones.isLoading ? (
          <TableSkeleton rows={3} />
        ) : zones.error ? (
          <ErrorState message={(zones.error as Error).message} onRetry={() => zones.refetch()} />
        ) : !zones.data?.length ? (
          <EmptyState title="No shipping zones" description="Add a zone to start charging shipping." />
        ) : (
          <div className="divide-y divide-border">
            {zones.data.map((z) => (
              <div key={z.id} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{z.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {z.countries.join(', ') || 'Any country'}
                      {z.free_shipping_threshold != null
                        ? ` · free over ${formatZAR(z.free_shipping_threshold)}`
                        : ''}
                    </p>
                  </div>
                  <StatusBadge label={z.active ? 'active' : 'inactive'} tone={z.active ? 'positive' : 'warning'} />
                  <button aria-label="Edit zone" onClick={() => setZoneDraft(z)} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    aria-label="Delete zone"
                    onClick={() => {
                      if (confirm(`Delete zone "${z.name}" and its rates?`)) removeZone.mutate(z);
                    }}
                    className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mt-3 space-y-2 pl-1">
                  {(rates.data ?? []).filter((r) => r.zone_id === z.id).length === 0 && (
                    <p className="text-xs text-muted-foreground">No rates in this zone yet.</p>
                  )}
                  {(rates.data ?? [])
                    .filter((r) => r.zone_id === z.id)
                    .map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{r.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Orders {formatZAR(r.min_order_total)}
                            {r.max_order_total ? ` – ${formatZAR(r.max_order_total)}` : '+'}
                            {r.estimated_days ? ` · ${r.estimated_days}` : ''}
                          </p>
                        </div>
                        <span className="tabular-nums text-sm">{formatZAR(r.price)}</span>
                        <button aria-label="Edit rate" onClick={() => setRateDraft(r)} className="p-1.5 text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          aria-label="Delete rate"
                          onClick={() => {
                            if (confirm(`Delete rate "${r.name}"?`)) removeRate.mutate(r);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Fulfilment Queue</p>
        </div>
        {queue.isLoading ? (
          <TableSkeleton rows={3} />
        ) : !queue.data?.length ? (
          <EmptyState title="Nothing to fulfil" description="Orders awaiting action will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {queue.data.map((o) => (
              <div key={o.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate(`/admin/orders?order=${o.id}`)}
                    className="text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {o.order_number}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {o.customer_name ?? 'Guest'} · {[o.shipping_city, o.shipping_country].filter(Boolean).join(', ') || '—'} ·{' '}
                    {formatDate(o.created_at)}
                  </span>
                  <StatusBadge label={o.shipping_status} tone={shippingTone(o.shipping_status)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    defaultValue={o.courier ?? ''}
                    placeholder="Courier"
                    onBlur={(e) =>
                      e.target.value !== (o.courier ?? '') &&
                      fulfil.mutate({ o, patch: { courier: e.target.value } })
                    }
                    className="w-40 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                  />
                  <input
                    defaultValue={o.tracking_number ?? ''}
                    placeholder="Tracking number"
                    onBlur={(e) =>
                      e.target.value !== (o.tracking_number ?? '') &&
                      fulfil.mutate({ o, patch: { tracking_number: e.target.value } })
                    }
                    className="w-48 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                  />
                  <QueueAction icon={<Package className="h-3.5 w-3.5" />} label="Packed" onClick={() => fulfil.mutate({ o, patch: { shipping_status: 'packed' } })} />
                  <QueueAction icon={<Truck className="h-3.5 w-3.5" />} label="Shipped" onClick={() => fulfil.mutate({ o, patch: { shipping_status: 'shipped' } })} />
                  <QueueAction icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Delivered" onClick={() => fulfil.mutate({ o, patch: { shipping_status: 'delivered' } })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {zoneDraft && (
          <AdminDrawer
            title={zoneDraft.id ? 'Edit Zone' : 'New Zone'}
            onClose={() => setZoneDraft(null)}
            footer={
              <>
                <button onClick={() => setZoneDraft(null)} className="flex-1 rounded-full border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Cancel
                </button>
                <button
                  onClick={() => saveZone.mutate(zoneDraft)}
                  disabled={saveZone.isPending}
                  className="flex-1 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
                >
                  {saveZone.isPending ? 'Saving' : 'Save Zone'}
                </button>
              </>
            }
          >
            <DrawerSection title="Zone">
              <Field label="Name" value={zoneDraft.name ?? ''} onChange={(v) => setZoneDraft({ ...zoneDraft, name: v })} />
              <Field
                label="Countries (comma separated, blank = everywhere)"
                value={(zoneDraft.countries ?? []).join(', ')}
                onChange={(v) =>
                  setZoneDraft({
                    ...zoneDraft,
                    countries: v.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <Field
                label="Free shipping over (R) — blank for none"
                type="number"
                min={0}
                value={zoneDraft.free_shipping_threshold ?? ''}
                onChange={(v) =>
                  setZoneDraft({ ...zoneDraft, free_shipping_threshold: v === '' ? null : Number(v) })
                }
              />
              <DrawerToggle label="Active" checked={zoneDraft.active ?? true} onChange={(v) => setZoneDraft({ ...zoneDraft, active: v })} />
            </DrawerSection>
          </AdminDrawer>
        )}

        {rateDraft && (
          <AdminDrawer
            title={rateDraft.id ? 'Edit Rate' : 'New Rate'}
            onClose={() => setRateDraft(null)}
            footer={
              <>
                <button onClick={() => setRateDraft(null)} className="flex-1 rounded-full border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Cancel
                </button>
                <button
                  onClick={() => saveRate.mutate(rateDraft)}
                  disabled={saveRate.isPending}
                  className="flex-1 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
                >
                  {saveRate.isPending ? 'Saving' : 'Save Rate'}
                </button>
              </>
            }
          >
            <DrawerSection title="Rate">
              <select
                className={fieldClass}
                value={rateDraft.zone_id ?? ''}
                onChange={(e) => setRateDraft({ ...rateDraft, zone_id: e.target.value })}
              >
                {(zones.data ?? []).map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
              <Field label="Name" value={rateDraft.name ?? ''} onChange={(v) => setRateDraft({ ...rateDraft, name: v })} />
              <Field label="Price (R)" type="number" min={0} value={rateDraft.price ?? 0} onChange={(v) => setRateDraft({ ...rateDraft, price: Number(v) })} />
              <Field
                label="Applies from order total (R)"
                type="number"
                min={0}
                value={rateDraft.min_order_total ?? 0}
                onChange={(v) => setRateDraft({ ...rateDraft, min_order_total: Number(v) })}
              />
              <Field
                label="Up to order total (R) — blank for no limit"
                type="number"
                min={0}
                value={rateDraft.max_order_total ?? ''}
                onChange={(v) => setRateDraft({ ...rateDraft, max_order_total: v === '' ? null : Number(v) })}
              />
              <Field
                label="Estimated delivery"
                value={rateDraft.estimated_days ?? ''}
                placeholder="2–4 working days"
                onChange={(v) => setRateDraft({ ...rateDraft, estimated_days: v })}
              />
              <DrawerToggle label="Active" checked={rateDraft.active ?? true} onChange={(v) => setRateDraft({ ...rateDraft, active: v })} />
            </DrawerSection>
          </AdminDrawer>
        )}
      </AnimatePresence>
    </div>
  );
}

function QueueAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background"
    >
      {icon}
      {label}
    </button>
  );
}
