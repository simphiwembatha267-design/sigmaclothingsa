import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Search, History, PackagePlus } from 'lucide-react';
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
  KpiCard,
  stockStatus,
  stockTone,
  STOCK_LABEL,
} from '@/components/admin/AdminUI';
import { InventoryHistoryDrawer } from './AdminProducts';
import { logActivity, logInventoryMovement } from '@/lib/admin-log';

type Row = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  archived_at: string | null;
};

const PAGE_SIZE = 15;

export default function AdminInventory() {
  const qc = useQueryClient();
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [historyFor, setHistoryFor] = useState<Row | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, category, sizes, colors, stock_quantity, low_stock_threshold, track_inventory, archived_at')
        .is('archived_at', null)
        .order('stock_quantity', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const adjust = useMutation({
    mutationFn: async ({ row, next, reason }: { row: Row; next: number; reason: 'restock' | 'manual_adjustment' }) => {
      if (!Number.isInteger(next) || next < 0) throw new Error('Stock must be zero or more.');
      const { error } = await supabase.from('products').update({ stock_quantity: next }).eq('id', row.id);
      if (error) throw error;
      await logInventoryMovement({
        productId: row.id,
        change: next - row.stock_quantity,
        resultingStock: next,
        reason,
      });
      await logActivity({
        action: 'Stock changed',
        entityType: 'product',
        entityId: row.id,
        entityLabel: row.name,
        detail: `${row.stock_quantity} → ${next}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['storefront-products'] });
      toast.success('Stock updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];
  const lowCount = rows.filter((r) => stockStatus(r) === 'low_stock').length;
  const outCount = rows.filter((r) => stockStatus(r) === 'sold_out').length;
  const units = rows.reduce((s, r) => s + (r.stock_quantity ?? 0), 0);

  const filtered = useMemo(() => {
    let list = rows;
    const t = term.trim().toLowerCase();
    if (t)
      list = list.filter((r) =>
        [r.name, r.sku, r.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(t)),
      );
    if (filter !== 'all') list = list.filter((r) => stockStatus(r) === filter);
    return list;
  }, [rows, term, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock levels across every active product." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Products" value={rows.length} />
        <KpiCard label="Units in stock" value={units} />
        <KpiCard label="Low stock" value={lowCount} />
        <KpiCard label="Sold out" value={outCount} />
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
              placeholder="Search product, SKU, category"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground"
          >
            <option value="all">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="sold_out">Sold out</option>
            <option value="untracked">Untracked</option>
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">SKU</th>
                  <th className="px-5 py-4 font-semibold">Variants</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Low at</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {current.map((r) => {
                  const s = stockStatus(r);
                  return (
                    <tr key={r.id} className="hover:bg-foreground/[0.03]">
                      <td className="px-5 py-4 font-semibold">{r.name}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{r.sku || '—'}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {[r.sizes?.join('/'), r.colors?.join('/')].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          min={0}
                          key={`${r.id}-${r.stock_quantity}`}
                          defaultValue={r.stock_quantity}
                          onBlur={(e) => {
                            const next = Number(e.target.value);
                            if (next !== r.stock_quantity)
                              adjust.mutate({ row: r, next, reason: 'manual_adjustment' });
                          }}
                          className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs tabular-nums outline-none focus:border-foreground"
                        />
                      </td>
                      <td className="px-5 py-4 text-xs tabular-nums text-muted-foreground">
                        {r.low_stock_threshold}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={STOCK_LABEL[s]} tone={stockTone(s)} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            title="Restock"
                            aria-label="Restock"
                            onClick={() => {
                              const input = prompt(`Add how many units to "${r.name}"?`, '10');
                              if (!input) return;
                              const add = Number(input);
                              if (!Number.isInteger(add) || add <= 0) return toast.error('Enter a whole number above zero.');
                              adjust.mutate({ row: r, next: r.stock_quantity + add, reason: 'restock' });
                            }}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                          >
                            <PackagePlus className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                          <button
                            title="History"
                            aria-label="History"
                            onClick={() => setHistoryFor(r)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                          >
                            <History className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />

      <AnimatePresence>
        {historyFor && (
          <InventoryHistoryDrawer product={historyFor} onClose={() => setHistoryFor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
