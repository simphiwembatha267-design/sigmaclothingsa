import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  KpiCard,
  StatusBadge,
  EmptyState,
  TableSkeleton,
  ErrorState,
  Pagination,
  paymentTone,
} from '@/components/admin/AdminUI';
import { formatZAR, formatDateTime } from '@/lib/admin-format';

type Totals = {
  revenue: number;
  paid_count: number;
  pending_count: number;
  pending_amount: number;
  failed_count: number;
  failed_amount: number;
  refunded_count: number;
  refunded_amount: number;
};

type Txn = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: string | null;
  payment_status: string;
  total: number;
  created_at: string;
};

const PAGE_SIZE = 15;

export default function AdminPayments() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const totals = useQuery({
    queryKey: ['admin-payment-totals'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_payment_totals');
      if (error) throw error;
      return data as unknown as Totals;
    },
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_email, payment_method, payment_status, total, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Txn[];
    },
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    const t = term.trim().toLowerCase();
    if (t)
      list = list.filter((o) =>
        [o.order_number, o.customer_name, o.customer_email].filter(Boolean).some((v) =>
          String(v).toLowerCase().includes(t),
        ),
      );
    if (status !== 'all') list = list.filter((o) => o.payment_status === status);
    return list;
  }, [data, term, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const t = totals.data;

  return (
    <div>
      <PageHeader title="Payments" subtitle="Only payments confirmed as paid count towards revenue." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Revenue (paid)" value={formatZAR(t?.revenue ?? 0)} />
        <KpiCard label="Successful" value={t?.paid_count ?? 0} />
        <KpiCard label="Pending" value={t?.pending_count ?? 0} hint={formatZAR(t?.pending_amount ?? 0)} />
        <KpiCard label="Failed" value={t?.failed_count ?? 0} hint={formatZAR(t?.failed_amount ?? 0)} />
        <KpiCard label="Refunds recorded" value={t?.refunded_count ?? 0} hint={formatZAR(t?.refunded_amount ?? 0)} />
      </div>

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
              placeholder="Search order number, customer, email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refund recorded</option>
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No transactions found" description="Payments appear here once orders are placed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-4 font-semibold">Order</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Method</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {current.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/admin/orders?order=${o.id}`)}
                    className="cursor-pointer hover:bg-foreground/[0.03]"
                  >
                    <td className="px-5 py-4 font-semibold">{o.order_number}</td>
                    <td className="px-5 py-4">
                      <p>{o.customer_name ?? 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{o.payment_method ?? '—'}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{formatDateTime(o.created_at)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge label={o.payment_status} tone={paymentTone(o.payment_status)} />
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

      <Panel className="mt-6 p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Payment provider</p>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          No live payment provider is connected yet. Statuses shown here are recorded against the order
          only — marking an order as refunded records the intent, it does not move money. When a South
          African provider such as Yoco or PayFast is connected, its confirmations will drive these
          statuses automatically.
        </p>
      </Panel>
    </div>
  );
}
