import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, Printer, Package, Truck, Ban, RotateCcw, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  TableSkeleton,
  ErrorState,
  Pagination,
  paymentTone,
  shippingTone,
} from '@/components/admin/AdminUI';
import { AdminDrawer, DrawerSection, fieldClass } from '@/components/admin/AdminDrawer';
import { formatZAR, formatDate, formatDateTime } from '@/lib/admin-format';
import { logActivity } from '@/lib/admin-log';

type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  payment_method: string | null;
  payment_status: string;
  shipping_status: string;
  tracking_number: string | null;
  courier: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
};

const PAGE_SIZE = 12;

export default function AdminOrders() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState('');
  const [payment, setPayment] = useState('all');
  const [shipping, setShipping] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'high' | 'low'>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  // Deep link: /admin/orders?order=<id>
  const focusId = params.get('order');
  useEffect(() => {
    if (!focusId || !orders) return;
    const found = orders.find((o) => o.id === focusId);
    if (found) {
      setSelected(found);
      params.delete('order');
      setParams(params, { replace: true });
    }
  }, [focusId, orders, params, setParams]);

  const { data: items } = useQuery({
    queryKey: ['admin-order-items', selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', selected!.id);
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      patch,
      action,
      label,
    }: {
      id: string;
      patch: Partial<OrderRow>;
      action?: string;
      label?: string;
    }) => {
      const { error } = await supabase.from('orders').update(patch as never).eq('id', id);
      if (error) throw error;
      if (action) await logActivity({ action, entityType: 'order', entityId: id, entityLabel: label });
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['fulfilment-queue'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin-payment-totals'] });
      setSelected((s) => (s ? ({ ...s, ...v.patch } as OrderRow) : s));
      toast.success('Order updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = orders ?? [];
    const t = term.trim().toLowerCase();
    if (t) {
      list = list.filter((o) =>
        [o.order_number, o.customer_name, o.customer_email, o.tracking_number, o.courier]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(t)),
      );
    }
    if (payment !== 'all') list = list.filter((o) => o.payment_status === payment);
    if (shipping !== 'all') list = list.filter((o) => o.shipping_status === shipping);
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'newest') return b.created_at.localeCompare(a.created_at);
      if (sort === 'oldest') return a.created_at.localeCompare(b.created_at);
      if (sort === 'high') return Number(b.total) - Number(a.total);
      return Number(a.total) - Number(b.total);
    });
    return sorted;
  }, [orders, term, payment, shipping, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const select =
    'rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground';

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${filtered.length} orders`} />

      <Panel className="mb-5 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search order number, customer, email, tracking, courier"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }} className={select}>
            <option value="all">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refund recorded</option>
          </select>
          <select value={shipping} onChange={(e) => { setShipping(e.target.value); setPage(1); }} className={select}>
            <option value="all">All fulfilment</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={select}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="high">Total: high to low</option>
            <option value="low">Total: low to high</option>
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No orders found" description="Orders placed on the storefront will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-4 font-semibold">Order</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Fulfilment</th>
                  <th className="px-5 py-4 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {current.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="cursor-pointer transition-colors hover:bg-foreground/[0.03]"
                  >
                    <td className="px-5 py-4 font-semibold">{o.order_number}</td>
                    <td className="px-5 py-4">
                      <p>{o.customer_name ?? 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge label={o.payment_status} tone={paymentTone(o.payment_status)} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={o.shipping_status} tone={shippingTone(o.shipping_status)} />
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">{formatZAR(o.total)}</td>
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
          <AdminDrawer
            title={selected.order_number}
            subtitle={formatDateTime(selected.created_at)}
            onClose={() => setSelected(null)}
          >
            <DrawerSection title="Customer">
              <div className="rounded-xl border border-border px-4 py-3">
                <p className="text-sm">{selected.customer_name ?? 'Guest'}</p>
                <p className="text-xs text-muted-foreground">{selected.customer_email}</p>
                <p className="text-xs text-muted-foreground">{selected.customer_phone}</p>
                {selected.customer_id && (
                  <button
                    onClick={() => {
                      setSelected(null);
                      navigate(`/admin/customers?customer=${selected.customer_id}`);
                    }}
                    className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] underline-offset-4 hover:underline"
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Open customer
                  </button>
                )}
              </div>
            </DrawerSection>

            <DrawerSection title="Shipping Address">
              <p className="rounded-xl border border-border px-4 py-3 text-xs text-muted-foreground">
                {[selected.shipping_address, selected.shipping_city, selected.shipping_postal_code, selected.shipping_country]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
            </DrawerSection>

            <DrawerSection title="Items">
              <div className="divide-y divide-border rounded-xl border border-border">
                {(items ?? []).length === 0 && (
                  <p className="px-4 py-4 text-xs text-muted-foreground">No line items.</p>
                )}
                {(items ?? []).map((it) => (
                  <div key={it.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      {it.product_id ? (
                        <button
                          onClick={() => {
                            setSelected(null);
                            navigate(`/admin/products?product=${it.product_id}`);
                          }}
                          className="truncate text-sm underline-offset-4 hover:underline"
                        >
                          {it.product_name}
                        </button>
                      ) : (
                        <p className="truncate text-sm">{it.product_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {[it.size, it.color].filter(Boolean).join(' · ')} × {it.quantity}
                      </p>
                    </div>
                    <span className="text-sm tabular-nums">{formatZAR(it.line_total as never)}</span>
                  </div>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title="Payment">
              <Row label="Method" value={selected.payment_method ?? '—'} />
              <Row label="Status" value={selected.payment_status} />
              <Row label="Subtotal" value={formatZAR(selected.subtotal)} />
              <Row label="Shipping" value={formatZAR(selected.shipping_cost)} />
              <Row label="Discount" value={`-${formatZAR(selected.discount)}`} />
              <Row label="Total" value={formatZAR(selected.total)} strong />
            </DrawerSection>

            <DrawerSection title="Fulfilment">
              <Row label="Status" value={selected.shipping_status} />
              <input
                defaultValue={selected.courier ?? ''}
                placeholder="Courier"
                onBlur={(e) =>
                  e.target.value !== (selected.courier ?? '') &&
                  update.mutate({ id: selected.id, patch: { courier: e.target.value }, action: 'Courier updated', label: selected.order_number })
                }
                className={fieldClass}
              />
              <input
                defaultValue={selected.tracking_number ?? ''}
                placeholder="Tracking number"
                onBlur={(e) =>
                  e.target.value !== (selected.tracking_number ?? '') &&
                  update.mutate({ id: selected.id, patch: { tracking_number: e.target.value }, action: 'Tracking updated', label: selected.order_number })
                }
                className={fieldClass}
              />
            </DrawerSection>

            <DrawerSection title="Order Notes">
              <textarea
                key={selected.id}
                defaultValue={selected.notes ?? ''}
                placeholder="Internal notes about this order"
                onBlur={(e) =>
                  e.target.value !== (selected.notes ?? '') &&
                  update.mutate({ id: selected.id, patch: { notes: e.target.value }, action: 'Order note saved', label: selected.order_number })
                }
                className={`${fieldClass} min-h-24`}
              />
            </DrawerSection>

            <DrawerSection title="Actions">
              <div className="grid grid-cols-2 gap-3">
                <Action
                  icon={<Package className="h-4 w-4" />}
                  label="Mark Packed"
                  onClick={() => update.mutate({ id: selected.id, patch: { shipping_status: 'packed' }, action: 'Order packed', label: selected.order_number })}
                />
                <Action
                  icon={<Truck className="h-4 w-4" />}
                  label="Mark Shipped"
                  onClick={() => update.mutate({ id: selected.id, patch: { shipping_status: 'shipped' }, action: 'Order shipped', label: selected.order_number })}
                />
                <Action
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Mark Delivered"
                  onClick={() => update.mutate({ id: selected.id, patch: { shipping_status: 'delivered' }, action: 'Order delivered', label: selected.order_number })}
                />
                <Action icon={<Printer className="h-4 w-4" />} label="Print Invoice" onClick={() => window.print()} />
                <Action
                  icon={<RotateCcw className="h-4 w-4" />}
                  label="Record Refund"
                  onClick={() => {
                    if (
                      confirm(
                        'Record a refund against this order?\n\nThis marks the order internally. No money is moved — refund the customer through your payment provider separately.',
                      )
                    )
                      update.mutate({
                        id: selected.id,
                        patch: { payment_status: 'refunded' },
                        action: 'Refund recorded',
                        label: selected.order_number,
                      });
                  }}
                />
                <Action
                  icon={<Ban className="h-4 w-4" />}
                  label="Cancel Order"
                  danger
                  onClick={() => {
                    if (confirm(`Cancel ${selected.order_number}? This cannot be undone from here.`))
                      update.mutate({
                        id: selected.id,
                        patch: { shipping_status: 'cancelled' },
                        action: 'Order cancelled',
                        label: selected.order_number,
                      });
                  }}
                />
              </div>
              <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
                Recording a refund is an internal note only — it does not contact a payment provider.
              </p>
            </DrawerSection>
          </AdminDrawer>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={strong ? 'font-semibold tabular-nums' : 'tabular-nums'}>{value}</span>
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
        danger
          ? 'border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground'
          : 'border-border hover:bg-foreground hover:text-background'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
