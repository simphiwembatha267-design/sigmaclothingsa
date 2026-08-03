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
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.03em]">{title}</h1>
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
