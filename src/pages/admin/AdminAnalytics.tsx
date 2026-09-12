import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  KpiCard,
  EmptyState,
  TableSkeleton,
  ErrorState,
} from '@/components/admin/AdminUI';
import { formatZAR } from '@/lib/admin-format';

type Analytics = {
  revenue: number;
  orders: number;
  units: number;
  aov: number;
  new_customers: number;
  returning_customers: number;
  subscribers: number;
  gross_profit: number;
  timeseries: { day: string; revenue: number | null; orders: number }[];
  top_products: { product_id: string | null; name: string; units: number; revenue: number }[];
  by_category: { category: string; revenue: number; units: number }[];
};

type RangeKey = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'year', label: 'This year' },
  { key: 'custom', label: 'Custom' },
];

function rangeDates(key: RangeKey, from: string, to: string) {
  const end = new Date();
  const start = new Date();
  if (key === 'today') start.setHours(0, 0, 0, 0);
  else if (key === '7d') start.setDate(end.getDate() - 7);
  else if (key === '30d') start.setDate(end.getDate() - 30);
  else if (key === '90d') start.setDate(end.getDate() - 90);
  else if (key === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    return {
      start: from ? new Date(from).toISOString() : new Date(end.getFullYear(), 0, 1).toISOString(),
      end: to ? new Date(`${to}T23:59:59`).toISOString() : end.toISOString(),
    };
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function AdminAnalytics() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { start, end } = useMemo(() => rangeDates(range, from, to), [range, from, to]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-analytics', start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_analytics', {
        range_start: start,
        range_end: end,
      });
      if (error) throw error;
      return data as unknown as Analytics;
    },
  });

  const series = (data?.timeseries ?? []).map((d) => ({
    day: d.day.slice(5),
    revenue: Number(d.revenue ?? 0),
    orders: Number(d.orders ?? 0),
  }));

  const margin =
    data && Number(data.revenue) > 0 ? (Number(data.gross_profit) / Number(data.revenue)) * 100 : null;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Calculated live from your store data." />

      <Panel className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                range === r.key ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
              />
            </div>
          )}
        </div>
      </Panel>

      {error ? (
        <Panel>
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        </Panel>
      ) : isLoading ? (
        <Panel>
          <TableSkeleton />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Revenue" value={formatZAR(data?.revenue ?? 0)} />
            <KpiCard label="Orders" value={data?.orders ?? 0} />
            <KpiCard label="Units sold" value={data?.units ?? 0} />
            <KpiCard label="Average order" value={formatZAR(data?.aov ?? 0)} />
            <KpiCard label="New customers" value={data?.new_customers ?? 0} />
            <KpiCard label="Returning customers" value={data?.returning_customers ?? 0} />
            <KpiCard label="New subscribers" value={data?.subscribers ?? 0} />
            <KpiCard
              label="Gross profit"
              value={formatZAR(data?.gross_profit ?? 0)}
              hint={margin === null ? 'Add cost prices for margin' : `${margin.toFixed(1)}% margin`}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel className="p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Revenue over time</p>
              <div className="mt-6 h-56">
                {series.length === 0 ? (
                  <EmptyState title="No data in this range" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series}>
                      <defs>
                        <linearGradient id="rev-an" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} />
                      <Tooltip formatter={(v: number) => formatZAR(v)} />
                      <Area type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={1.5} fill="url(#rev-an)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>

            <Panel className="p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Orders over time</p>
              <div className="mt-6 h-56">
                {series.length === 0 ? (
                  <EmptyState title="No data in this range" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series}>
                      <CartesianGrid strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} width={30} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="currentColor" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel>
              <div className="border-b border-border px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Best sellers</p>
              </div>
              {!data?.top_products?.length ? (
                <EmptyState title="No sales in this range" />
              ) : (
                <div className="divide-y divide-border">
                  {data.top_products.map((p, i) => (
                    <div key={`${p.product_id ?? p.name}-${i}`} className="flex items-center justify-between px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.units} units</p>
                      </div>
                      <span className="text-sm tabular-nums">{formatZAR(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <div className="border-b border-border px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Revenue by category</p>
              </div>
              {!data?.by_category?.length ? (
                <EmptyState title="No sales in this range" />
              ) : (
                <div className="divide-y divide-border">
                  {data.by_category.map((c) => (
                    <div key={c.category} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold">{c.category}</p>
                        <p className="text-xs text-muted-foreground">{c.units} units</p>
                      </div>
                      <span className="text-sm tabular-nums">{formatZAR(c.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
