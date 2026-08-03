import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Mail,
  Ticket,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';
import { formatZAR, formatDateTime } from '@/lib/admin-format';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/collections', label: 'Collections', icon: Layers },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { to: '/admin/discounts', label: 'Discount Codes', icon: Ticket },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/shipping', label: 'Shipping', icon: Truck },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, user, role } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-7">
        <p className="text-lg font-bold tracking-[0.35em]">SIGMA</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-foreground text-background font-semibold'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={1.6} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="px-3 pb-3">
          <p className="truncate text-xs font-semibold">{user?.email}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {role ?? 'staff'}
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate('/admin');
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.6} />
          Logout
        </button>
      </div>
    </div>
  );
}

function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['global-search', term],
    enabled: open && term.trim().length > 1,
    queryFn: async () => {
      const q = `%${term.trim()}%`;
      const [orders, products, customers, subs] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, customer_name, total')
          .or(`order_number.ilike.${q},customer_name.ilike.${q},customer_email.ilike.${q}`)
          .limit(5),
        supabase.from('products').select('id, name, price').ilike('name', q).limit(5),
        supabase
          .from('customers')
          .select('id, full_name, email')
          .or(`full_name.ilike.${q},email.ilike.${q}`)
          .limit(5),
        supabase
          .from('newsletter_subscribers')
          .select('id, email')
          .ilike('email', q)
          .limit(5),
      ]);
      return {
        orders: orders.data ?? [],
        products: products.data ?? [],
        customers: customers.data ?? [],
        subs: subs.data ?? [],
      };
    },
  });

  useEffect(() => {
    if (!open) setTerm('');
  }, [open]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-2xl px-6 pt-24">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search orders, products, customers, subscribers"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button onClick={onClose} aria-label="Close search">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] space-y-6 overflow-y-auto">
              {data?.orders.length ? (
                <SearchGroup title="Orders">
                  {data.orders.map((o) => (
                    <SearchRow
                      key={o.id}
                      onClick={() => go('/admin/orders')}
                      left={`${o.order_number} · ${o.customer_name ?? 'Guest'}`}
                      right={formatZAR(o.total as unknown as number)}
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {data?.products.length ? (
                <SearchGroup title="Products">
                  {data.products.map((p) => (
                    <SearchRow
                      key={p.id}
                      onClick={() => go('/admin/products')}
                      left={p.name}
                      right={formatZAR(p.price as unknown as number)}
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {data?.customers.length ? (
                <SearchGroup title="Customers">
                  {data.customers.map((c) => (
                    <SearchRow
                      key={c.id}
                      onClick={() => go('/admin/customers')}
                      left={c.full_name ?? c.email}
                      right={c.email}
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {data?.subs.length ? (
                <SearchGroup title="Subscribers">
                  {data.subs.map((s) => (
                    <SearchRow key={s.id} onClick={() => go('/admin/subscribers')} left={s.email} />
                  ))}
                </SearchGroup>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        {title}
      </p>
      <div className="rounded-xl border border-border divide-y divide-border">{children}</div>
    </div>
  );
}

function SearchRow({
  left,
  right,
  onClick,
}: {
  left: string;
  right?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-foreground/5"
    >
      <span className="truncate">{left}</span>
      {right && <span className="ml-4 shrink-0 text-xs text-muted-foreground">{right}</span>}
    </button>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const [orders, lowStock, subs] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, total, payment_status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('products')
          .select('id, name, stock_quantity, low_stock_threshold')
          .order('stock_quantity', { ascending: true })
          .limit(20),
        supabase
          .from('newsletter_subscribers')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);
      const low = (lowStock.data ?? []).filter(
        (p) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0),
      );
      const items = [
        ...(orders.data ?? []).map((o) => ({
          id: `o-${o.id}`,
          title:
            o.payment_status === 'failed'
              ? `Payment failed · ${o.order_number}`
              : o.payment_status === 'paid'
                ? `Payment received · ${o.order_number}`
                : `New order · ${o.order_number}`,
          meta: `${formatZAR(o.total as unknown as number)} · ${formatDateTime(o.created_at)}`,
        })),
        ...low.slice(0, 5).map((p) => ({
          id: `p-${p.id}`,
          title: `Low stock · ${p.name}`,
          meta: `${p.stock_quantity} left`,
        })),
        ...(subs.data ?? []).map((s) => ({
          id: `s-${s.id}`,
          title: `New subscriber · ${s.email}`,
          meta: formatDateTime(s.created_at),
        })),
      ];
      return items;
    },
  });

  const count = data?.length ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-full p-2 hover:bg-foreground/5"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
            {count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Notifications</p>
            </div>
            <div className="max-h-80 divide-y divide-border overflow-y-auto">
              {count === 0 && (
                <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Nothing new right now.
                </p>
              )}
              {data?.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <p className="text-xs font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{n.meta}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const title = useMemo(
    () => NAV.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Admin',
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 border-r border-border bg-card lg:hidden"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <button
            className="rounded-full p-2 hover:bg-foreground/5 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold">{title}</p>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="rounded-full p-2 hover:bg-foreground/5"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Notifications />
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="px-4 py-8 md:px-8 md:py-10"
        >
          <Outlet />
        </motion.main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
