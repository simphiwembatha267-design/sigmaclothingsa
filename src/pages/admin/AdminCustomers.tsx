import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  EmptyState,
  TableSkeleton,
  ErrorState,
  Pagination,
  StatusBadge,
  downloadCsv,
} from '@/components/admin/AdminUI';
import { AdminDrawer, DrawerSection, fieldClass } from '@/components/admin/AdminDrawer';
import { formatZAR, formatDate } from '@/lib/admin-format';
import { logActivity } from '@/lib/admin-log';

type Customer = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
  total_spent: number;
  orders_count: number;
  last_purchase_at: string | null;
  created_at: string;
};

const PAGE_SIZE = 15;

export default function AdminCustomers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState<'recent' | 'spend' | 'orders' | 'name'>('recent');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Customer[];
    },
  });

  const focusId = params.get('customer');
  useEffect(() => {
    if (!focusId || !data) return;
    const found = data.find((c) => c.id === focusId);
    if (found) {
      setSelected(found);
      params.delete('customer');
      setParams(params, { replace: true });
    }
  }, [focusId, data, params, setParams]);

  const saveNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from('customers').update({ notes }).eq('id', id);
      if (error) throw error;
      await logActivity({ action: 'Customer note saved', entityType: 'customer', entityId: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Note saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    const t = term.trim().toLowerCase();
    if (t)
      list = list.filter((c) =>
        [c.full_name, c.email, c.phone, c.city].filter(Boolean).some((v) =>
          String(v).toLowerCase().includes(t),
        ),
      );
    if (filter === 'repeat') list = list.filter((c) => (c.orders_count ?? 0) > 1);
    if (filter === 'new') list = list.filter((c) => (c.orders_count ?? 0) <= 1);
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'spend') return Number(b.total_spent) - Number(a.total_spent);
      if (sort === 'orders') return (b.orders_count ?? 0) - (a.orders_count ?? 0);
      if (sort === 'name') return (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email);
      return b.created_at.localeCompare(a.created_at);
    });
    return sorted;
  }, [data, term, sort, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const select =
    'rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground';

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${filtered.length} customers`}
        actions={
          <button
            onClick={() => {
              if (!filtered.length) return toast.error('Nothing to export.');
              downloadCsv(
                `sigma-customers-${new Date().toISOString().slice(0, 10)}.csv`,
                filtered.map((c) => ({
                  name: c.full_name ?? '',
                  email: c.email,
                  phone: c.phone ?? '',
                  city: c.city ?? '',
                  country: c.country ?? '',
                  orders: c.orders_count,
                  total_spent: c.total_spent,
                  last_purchase: c.last_purchase_at ?? '',
                  customer_since: c.created_at,
                })),
              );
              toast.success('Export started');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            <Download className="h-4 w-4" strokeWidth={1.8} />
            Export CSV
          </button>
        }
      />

      <Panel className="mb-5 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone, city"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={select}>
            <option value="all">All customers</option>
            <option value="repeat">Repeat buyers</option>
            <option value="new">First-time / no orders</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={select}>
            <option value="recent">Newest first</option>
            <option value="spend">Highest spend</option>
            <option value="orders">Most orders</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No customers found" description="Customers appear here after their first order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Phone</th>
                  <th className="px-5 py-4 font-semibold">Orders</th>
                  <th className="px-5 py-4 font-semibold">Last purchase</th>
                  <th className="px-5 py-4 font-semibold">Since</th>
                  <th className="px-5 py-4 text-right font-semibold">Total spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {current.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer transition-colors hover:bg-foreground/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{c.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{c.phone ?? '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge label={`${c.orders_count ?? 0}`} tone={(c.orders_count ?? 0) > 1 ? 'positive' : 'neutral'} />
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(c.last_purchase_at)}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-4 text-right tabular-nums">{formatZAR(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />

      <AnimatePresence>
        {selected && (
          <CustomerDrawer
            customer={selected}
            onClose={() => setSelected(null)}
            onOpenOrder={(id) => {
              setSelected(null);
              navigate(`/admin/orders?order=${id}`);
            }}
            onSaveNotes={(notes) => saveNotes.mutate({ id: selected.id, notes })}
            saving={saveNotes.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerDrawer({
  customer,
  onClose,
  onOpenOrder,
  onSaveNotes,
  saving,
}: {
  customer: Customer;
  onClose: () => void;
  onOpenOrder: (id: string) => void;
  onSaveNotes: (notes: string) => void;
  saving: boolean;
}) {
  const [notes, setNotes] = useState(customer.notes ?? '');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders', customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total, payment_status, shipping_status, created_at')
        .or(`customer_id.eq.${customer.id},customer_email.eq.${customer.email}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AdminDrawer
      title={customer.full_name ?? customer.email}
      subtitle={`Customer since ${formatDate(customer.created_at)}`}
      onClose={onClose}
      footer={
        <button
          onClick={() => onSaveNotes(notes)}
          disabled={saving}
          className="flex-1 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
        >
          {saving ? 'Saving' : 'Save Notes'}
        </button>
      }
    >
      <DrawerSection title="Contact">
        <div className="rounded-xl border border-border px-4 py-3 text-sm">
          <p>{customer.email}</p>
          <p className="text-xs text-muted-foreground">{customer.phone ?? 'No phone'}</p>
        </div>
      </DrawerSection>

      <DrawerSection title="Shipping">
        <div className="rounded-xl border border-border px-4 py-3 text-xs text-muted-foreground">
          {[customer.address, customer.city, customer.postal_code, customer.country]
            .filter(Boolean)
            .join(', ') || 'No address on file'}
        </div>
      </DrawerSection>

      <DrawerSection title="Summary">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Orders" value={String(customer.orders_count ?? 0)} />
          <Stat label="Spent" value={formatZAR(customer.total_spent)} />
          <Stat label="Last" value={formatDate(customer.last_purchase_at)} />
        </div>
      </DrawerSection>

      <DrawerSection title="Order History">
        {isLoading ? (
          <TableSkeleton rows={3} />
        ) : !orders?.length ? (
          <p className="rounded-xl border border-border px-4 py-4 text-xs text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => onOpenOrder(o.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-foreground/5"
              >
                <div>
                  <p className="text-sm font-semibold">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.created_at)} · {o.payment_status} · {o.shipping_status}
                  </p>
                </div>
                <span className="text-sm tabular-nums">{formatZAR(o.total as never)}</span>
              </button>
            ))}
          </div>
        )}
      </DrawerSection>

      <DrawerSection title="Private Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes — never shown to the customer"
          className={`${fieldClass} min-h-28`}
        />
      </DrawerSection>
    </AdminDrawer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
