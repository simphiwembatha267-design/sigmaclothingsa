import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Plus, AlertTriangle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KpiCard, PageHeader, Panel, StatusBadge, EmptyState, ErrorState, TableSkeleton } from '@/components/admin/AdminUI';
import { formatZAR, formatDate } from '@/lib/admin-format';

type Stats = {
  revenue_today: number;
  revenue_month: number;
  orders_today: number;
  units_today: number;
  aov: number;
  new_customers_today: number;
  new_subscribers_today: number;
  pending_orders: number;
  failed_payments: number;
  low_stock: number;
  sold_out: number;
  total_products: number;
  total_customers: number;
  total_subscribers: number;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const stats = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_dashboard_stats');
      if (error) throw error;
      return data as unknown as Stats;
    },
  });

  const attention = useQuery({
    queryKey: ['admin-attention'],
    queryFn: async () => {
      const [unfulfilled, failed, lowStock, soldOut, recent] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, customer_name, total, created_at')
          .in('shipping_status', ['unfulfilled', 'packed'])
          .order('created_at', { ascending: true })
          .limit(6),
        supabase
          .from('orders')
          .select('id, order_number, customer_name, total, created_at')
          .eq('payment_status', 'failed')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('products')
          .select('id, name, stock_quantity, low_stock_threshold')
          .is('archived_at', null)
          .eq('track_inventory', true)
          .gt('stock_quantity', 0)
          .order('stock_quantity', { ascending: true })
          .limit(20),
        supabase
          .from('products')
          .select('id, name')
          .is('archived_at', null)
          .eq('track_inventory', true)
          .lte('stock_quantity', 0)
          .limit(6),
        supabase
          .from('orders')
          .select('id, order_number, customer_name, total, payment_status, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);
      return {
        unfulfilled: unfulfilled.data ?? [],
        failed: failed.data ?? [],
        lowStock: (lowStock.data ?? []).filter(
          (p) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0),
        ),
        soldOut: soldOut.data ?? [],
        recent: recent.data ?? [],
      };
    },
  });

  const trend = useQuery({
    queryKey: ['admin-dashboard-trend'],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const { data, error } = await supabase.rpc('admin_analytics', {
        range_start: start.toISOString(),
        range_end: new Date().toISOString(),
      });
      if (error) throw error;
      return (data as unknown as { timeseries: { day: string; revenue: number | null }[] }).timeseries ?? [];
    },
  });

  const s = stats.data;
  const a = attention.data;
  const actionCount =
    (a?.unfulfilled.length ?? 0) + (a?.failed.length ?? 0) + (a?.lowStock.length ?? 0) + (a?.soldOut.length ?? 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of the SIGMA store."
        actions={
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Product
          </Link>
        }
      />

      {stats.error ? (
        <Panel>
          <ErrorState message={(stats.error as Error).message} onRetry={() => stats.refetch()} />
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard label="Revenue Today" value={formatZAR(s?.revenue_today ?? 0)} hint={`${formatZAR(s?.revenue_month ?? 0)} this month`} />
          <KpiCard label="Orders Today" value={s?.orders_today ?? 0} />
          <KpiCard label="Units Today" value={s?.units_today ?? 0} />
          <KpiCard label="Average Order" value={formatZAR(s?.aov ?? 0)} />
          <KpiCard label="New Customers" value={s?.new_customers_today ?? 0} hint="today" />
          <KpiCard label="New Subscribers" value={s?.new_subscribers_today ?? 0} hint="today" />
          <KpiCard label="Awaiting Fulfilment" value={s?.pending_orders ?? 0} />
          <KpiCard label="Failed Payments" value={s?.failed_payments ?? 0} />
          <KpiCard label="Low Stock" value={s?.low_stock ?? 0} />
          <KpiCard label="Sold Out" value={s?.sold_out ?? 0} />
        </div>
      )}

      <Panel className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Action Required</p>
          </div>
          <span className="text-[11px] text-muted-foreground">{actionCount} items</span>
        </div>
        {attention.isLoading ? (
          <TableSkeleton rows={4} />
        ) : actionCount === 0 ? (
          <EmptyState title="All clear" description="Nothing needs your attention right now." />
        ) : (
          <div className="divide-y divide-border">
            {a?.unfulfilled.map((o) => (
              <ActionRow
                key={`u-${o.id}`}
                title={`Waiting to be fulfilled · ${o.order_number}`}
                meta={`${o.customer_name ?? 'Guest'} · ${formatDate(o.created_at)}`}
                right={formatZAR(o.total as never)}
                onClick={() => navigate(`/admin/orders?order=${o.id}`)}
              />
            ))}
            {a?.failed.map((o) => (
              <ActionRow
                key={`f-${o.id}`}
                title={`Payment failed · ${o.order_number}`}
                meta={`${o.customer_name ?? 'Guest'} · ${formatDate(o.created_at)}`}
                right={formatZAR(o.total as never)}
                tone="danger"
                onClick={() => navigate(`/admin/orders?order=${o.id}`)}
              />
            ))}
            {a?.soldOut.map((p) => (
              <ActionRow
                key={`s-${p.id}`}
                title={`Sold out · ${p.name}`}
                meta="Restock or hide from the shop"
                tone="danger"
                onClick={() => navigate(`/admin/products?product=${p.id}`)}
              />
            ))}
            {a?.lowStock.slice(0, 6).map((p) => (
              <ActionRow
                key={`l-${p.id}`}
                title={`Low stock · ${p.name}`}
                meta={`${p.stock_quantity} left`}
                onClick={() => navigate(`/admin/products?product=${p.id}`)}
              />
            ))}
          </div>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Revenue · last 30 days</p>
          <div className="mt-6 h-56">
            {!trend.data?.length ? (
              <EmptyState title="No sales yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.data.map((d) => ({ day: d.day.slice(5), revenue: Number(d.revenue ?? 0) }))}>
                  <defs>
                    <linearGradient id="rev-dash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeOpacity={0.08} vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} />
                  <Tooltip formatter={(v: number) => formatZAR(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={1.5} fill="url(#rev-dash)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Latest Orders</p>
            <Link to="/admin/orders" className="text-[11px] text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {!a?.recent.length ? (
            <EmptyState title="No orders yet" description="Orders will appear here as they come in." />
          ) : (
            <div className="divide-y divide-border">
              {a.recent.map((o) => (
                <button
                  key={o.id}
                  onClick={() => navigate(`/admin/orders?order=${o.id}`)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-foreground/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.order_number}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.customer_name ?? 'Guest'} · {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge label={o.payment_status ?? 'pending'} />
                    <span className="text-sm tabular-nums">{formatZAR(o.total as never)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel className="mt-6 p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Quick Actions</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: 'Add Product', to: '/admin/products' },
            { label: 'Inventory', to: '/admin/inventory' },
            { label: 'Orders', to: '/admin/orders' },
            { label: 'Customers', to: '/admin/customers' },
            { label: 'Analytics', to: '/admin/analytics' },
            { label: 'Activity Log', to: '/admin/activity' },
          ].map((x) => (
            <Link
              key={x.to}
              to={x.to}
              className="rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
            >
              {x.label}
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ActionRow({
  title,
  meta,
  right,
  tone,
  onClick,
}: {
  title: string;
  meta: string;
  right?: string;
  tone?: 'danger';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-foreground/[0.03]"
    >
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${tone === 'danger' ? 'text-destructive' : ''}`}>{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {right && <span className="text-sm tabular-nums">{right}</span>}
        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
    </button>
  );
}
