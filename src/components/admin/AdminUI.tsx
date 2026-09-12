import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        <h1 className="font-body text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card', className)}>{children}</div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          {label}
        </p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className="mt-4 text-2xl md:text-3xl font-bold tracking-[-0.03em] tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const TONE: Record<string, string> = {
  neutral: 'border-border text-muted-foreground',
  positive: 'border-foreground/30 text-foreground bg-foreground/5',
  warning: 'border-foreground/20 text-foreground/70',
  danger: 'border-destructive/40 text-destructive',
};

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-semibold whitespace-nowrap',
        TONE[tone],
      )}
    >
      {label}
    </span>
  );
}

export function paymentTone(status?: string | null): keyof typeof TONE {
  switch (status) {
    case 'paid':
      return 'positive';
    case 'failed':
    case 'refunded':
      return 'danger';
    default:
      return 'warning';
  }
}

export function shippingTone(status?: string | null): keyof typeof TONE {
  switch (status) {
    case 'delivered':
    case 'shipped':
      return 'positive';
    case 'cancelled':
      return 'danger';
    default:
      return 'warning';
  }
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3 w-1/5 animate-pulse rounded bg-muted-foreground/10" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-muted-foreground/10" />
          <div className="h-3 w-1/6 animate-pulse rounded bg-muted-foreground/10" />
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted-foreground/10" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold">Something went wrong</p>
      <p className="mt-2 text-xs text-muted-foreground">{message ?? 'Please try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full border border-border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  total,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
  total?: number;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pageCount}
        {typeof total === 'number' ? ` · ${total} total` : ''}
      </p>
      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="rounded-full border border-border px-4 py-2 text-xs disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          className="rounded-full border border-border px-4 py-2 text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export type StockStatus = 'in_stock' | 'low_stock' | 'sold_out' | 'untracked';

export function stockStatus(p: {
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  track_inventory?: boolean | null;
}): StockStatus {
  if (p.track_inventory === false) return 'untracked';
  const qty = p.stock_quantity ?? 0;
  if (qty <= 0) return 'sold_out';
  if (qty <= (p.low_stock_threshold ?? 0)) return 'low_stock';
  return 'in_stock';
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  sold_out: 'Sold Out',
  untracked: 'Untracked',
};

export function stockTone(s: StockStatus): 'neutral' | 'positive' | 'warning' | 'danger' {
  if (s === 'sold_out') return 'danger';
  if (s === 'low_stock') return 'warning';
  if (s === 'in_stock') return 'positive';
  return 'neutral';
}

/** Download rows as a CSV file. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

