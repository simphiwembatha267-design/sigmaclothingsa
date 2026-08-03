import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Plus, ShoppingBag, Users, Mail, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KpiCard, PageHeader, Panel, StatusBadge, EmptyState } from '@/components/admin/AdminUI';
import { formatZAR, formatDate } from '@/lib/admin-format';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [orders, products, customers, subs] = await Promise.all([
        supabase
          .from('orders')
          .select(
            'id, order_number, customer_name, total, payment_status, shipping_status, created_at',
          )
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('products')
          .select('id, name, stock_quantity, low_stock_threshold, price, status')
          .order('stock_quantity', { ascending: true })
          .limit(200),
        supabase
          .from('customers')
          .select('id, full_name, email, total_spent, created_at')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('newsletter_subscribers')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);
      return {
        orders: orders.data ?? [],
        products: products.data ?? [],
        customers: customers.data ?? [],
        subs: subs.data ?? [],
      };
    },
  });

  const orders = data?.orders ?? [];
  const today = startOfToday();
  const month = startOfMonth();
  const paid = orders.filter((o) => o.payment_status === 'paid');
  const num = (v: unknown) => Number(v ?? 0);

  const revenueToday = paid
    .filter((o) => o.created_at >= today)
    .reduce((s, o) => s + num(o.total), 0);
  const revenueMonth = paid
    .filter((o) => o.created_at >= month)
    .reduce((s, o) => s + num(o.total), 0);
  const ordersToday = orders.filter((o) => o.created_at >= today).length;
  const pending = orders.filter((o) =>
    ['unfulfilled', 'packed', 'processing'].includes(o.shipping_status ?? ''),
  ).length;
  const completed = orders.filter((o) => o.shipping_status === 'delivered').length;

  // Last 12 months revenue / order count
  const monthly = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - i));
    const key = d.toLocaleDateString('en-ZA', { month: 'short' });
    const from = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    const inRange = orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= from && t < to;
    });
    return {
      month: key,
      revenue: inRange
        .filter((o) => o.payment_status === 'paid')
        .reduce((s, o) => s + num(o.total), 0),
      orders: inRange.length,
    };
  });

  const lowStock = (data?.products ?? []).filter(
    (p) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0),
  );

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue Today" value={formatZAR(revenueToday)} />
        <KpiCard label="Revenue This Month" value={formatZAR(revenueMonth)} />
        <KpiCard label="Orders Today" value={ordersToday} icon={<ShoppingBag className="h-4 w-4" />} />
        <KpiCard label="Pending Orders" value={pending} />
        <KpiCard label="Completed Orders" value={completed} />
        <KpiCard label="Products" value={data?.products.length ?? 0} icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Customers" value={data?.customers.length ?? 0} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Subscribers" value={data?.subs.length ?? 0} icon={<Mail className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Revenue · 12 months</p>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={40} />
                <Tooltip formatter={(v: number) => formatZAR(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Sales · orders per month</p>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={30} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="currentColor" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionTitle title="Latest Orders" to="/admin/orders" />
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders will appear here as they come in." />
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-4 px-5 py-4">
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
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Low Stock" to="/admin/products" />
          {lowStock.length === 0 ? (
            <EmptyState title="Stock levels healthy" />
          ) : (
            <div className="divide-y divide-border">
              {lowStock.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-4">
                  <p className="truncate text-sm">{p.name}</p>
                  <StatusBadge label={`${p.stock_quantity} left`} tone="danger" />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Recent Customers" to="/admin/customers" />
          {(data?.customers.length ?? 0) === 0 ? (
            <EmptyState title="No customers yet" />
          ) : (
            <div className="divide-y divide-border">
              {data?.customers.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.full_name ?? '—'}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <span className="text-sm tabular-nums">{formatZAR(c.total_spent as never)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Recent Subscribers" to="/admin/subscribers" />
          {(data?.subs.length ?? 0) === 0 ? (
            <EmptyState title="No subscribers yet" />
          ) : (
            <div className="divide-y divide-border">
              {data?.subs.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-4">
                  <p className="truncate text-sm">{s.email}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(s.created_at)}</span>
                </div>
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
            { label: 'View Orders', to: '/admin/orders' },
            { label: 'Customers', to: '/admin/customers' },
            { label: 'Subscribers', to: '/admin/subscribers' },
            { label: 'Analytics', to: '/admin/analytics' },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </Panel>

      {isLoading && <p className="mt-6 text-xs text-muted-foreground">Loading live data…</p>}
    </div>
  );
}

function SectionTitle({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">{title}</p>
      <Link to={to} className="text-[11px] text-muted-foreground hover:text-foreground">
        View all
      </Link>
    </div>
  );
}
