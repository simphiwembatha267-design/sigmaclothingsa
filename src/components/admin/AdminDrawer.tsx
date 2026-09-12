import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Slide-over panel matching the existing Orders / Products drawers. */
export function AdminDrawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-foreground/20"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28 }}
        className={cn(
          'fixed inset-y-0 right-0 z-[90] flex w-full flex-col border-l border-border bg-background',
          wide ? 'max-w-xl' : 'max-w-lg',
        )}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-[-0.02em]">{title}</p>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="flex gap-3 border-t border-border bg-background px-6 py-4">{footer}</div>
        )}
      </motion.aside>
    </>
  );
}

export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-7 space-y-3 last:mb-0">
      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  );
}

export const fieldClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground placeholder:text-muted-foreground';

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </label>
  );
}

export function DrawerToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-current"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full bg-foreground px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  danger,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors disabled:opacity-40',
        danger
          ? 'border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground'
          : 'border-border hover:bg-foreground hover:text-background',
        className,
      )}
    >
      {children}
    </button>
  );
}
