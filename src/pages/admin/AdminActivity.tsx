import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  EmptyState,
  TableSkeleton,
  ErrorState,
  Pagination,
} from '@/components/admin/AdminUI';
import { formatDateTime } from '@/lib/admin-format';

type LogRow = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  detail: string | null;
  actor_email: string | null;
  created_at: string;
};

const PAGE_SIZE = 20;

const ROUTE: Record<string, (id: string) => string> = {
  product: (id) => `/admin/products?product=${id}`,
  order: (id) => `/admin/orders?order=${id}`,
  customer: (id) => `/admin/customers?customer=${id}`,
  collection: () => '/admin/collections',
  discount: () => '/admin/discounts',
  subscriber: () => '/admin/subscribers',
  shipping: () => '/admin/shipping',
  settings: () => '/admin/settings',
  inventory: () => '/admin/inventory',
};

export default function AdminActivity() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as LogRow[];
    },
  });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (data ?? []).filter(
      (r) =>
        !t ||
        [r.action, r.entity_label, r.actor_email, r.detail]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(t)),
    );
  }, [data, term]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Activity Log" subtitle="Every administrative change, newest first." />

      <Panel className="mb-5 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search actions, records or admins"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No activity yet" description="Admin changes will be recorded here." />
        ) : (
          <div className="divide-y divide-border">
            {current.map((r) => {
              const to = r.entity_type && r.entity_id ? ROUTE[r.entity_type]?.(r.entity_id) : undefined;
              return (
                <button
                  key={r.id}
                  disabled={!to}
                  onClick={() => to && navigate(to)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left enabled:hover:bg-foreground/[0.03] disabled:cursor-default"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {r.action}
                      {r.entity_label ? ` · ${r.entity_label}` : ''}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[r.actor_email, r.detail].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(r.created_at)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />
    </div>
  );
}
