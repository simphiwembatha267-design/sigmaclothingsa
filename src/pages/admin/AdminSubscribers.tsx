import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  EmptyState,
  TableSkeleton,
  ErrorState,
  Pagination,
  KpiCard,
  downloadCsv,
} from '@/components/admin/AdminUI';
import { formatDateTime } from '@/lib/admin-format';
import { logActivity } from '@/lib/admin-log';

type Subscriber = {
  id: string;
  email: string;
  phone: string | null;
  source: string | null;
  created_at: string;
};

const PAGE_SIZE = 20;

export default function AdminSubscribers() {
  const qc = useQueryClient();
  const [term, setTerm] = useState('');
  const [source, setSource] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'email'>('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Subscriber[];
    },
  });

  const remove = useMutation({
    mutationFn: async (s: Subscriber) => {
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', s.id);
      if (error) throw error;
      await logActivity({
        action: 'Subscriber deleted',
        entityType: 'subscriber',
        entityId: s.id,
        entityLabel: s.email,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscribers'] });
      toast.success('Subscriber removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sources = useMemo(
    () => Array.from(new Set((data ?? []).map((s) => s.source ?? 'website'))),
    [data],
  );

  const filtered = useMemo(() => {
    let list = data ?? [];
    const t = term.trim().toLowerCase();
    if (t) list = list.filter((s) => [s.email, s.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(t)));
    if (source !== 'all') list = list.filter((s) => (s.source ?? 'website') === source);
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'oldest') return a.created_at.localeCompare(b.created_at);
      if (sort === 'email') return a.email.localeCompare(b.email);
      return b.created_at.localeCompare(a.created_at);
    });
    return sorted;
  }, [data, term, source, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const select =
    'rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground';

  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = (data ?? []).filter((s) => new Date(s.created_at).getTime() >= monthAgo).length;

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${data?.length ?? 0} newsletter subscribers`}
        actions={
          <button
            onClick={() => {
              if (!filtered.length) return toast.error('Nothing to export.');
              downloadCsv(
                `sigma-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
                filtered.map((s) => ({
                  email: s.email,
                  phone: s.phone ?? '',
                  source: s.source ?? 'website',
                  signed_up: s.created_at,
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

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Total subscribers" value={data?.length ?? 0} />
        <KpiCard label="Last 30 days" value={last30} />
        <KpiCard label="Sources" value={sources.length} />
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
              placeholder="Search email or phone"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={select}>
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={select}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="email">Email A–Z</option>
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No subscribers found" description="Signups from the site appear here." />
        ) : (
          <div className="divide-y divide-border">
            {current.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {[s.phone, s.source ?? 'website', formatDateTime(s.created_at)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <button
                  aria-label="Delete subscriber"
                  title="Delete subscriber"
                  onClick={() => {
                    if (confirm(`Remove ${s.email} from the list?`)) remove.mutate(s);
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />
    </div>
  );
}
