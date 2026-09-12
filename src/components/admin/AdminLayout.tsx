import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Layers,
  Users,
  Mail,
  Ticket,
  CreditCard,
  Truck,
  BarChart3,
  History,
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
import { useJsonSetting } from '@/lib/site-settings';
import sigmaLockup from '@/assets/sigma-lockup.png';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/collections', label: 'Collections', icon: Layers },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { to: '/admin/discounts', label: 'Discount Codes', icon: Ticket },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/shipping', label: 'Shipping', icon: Truck },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/activity', label: 'Activity Log', icon: History },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];


function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, user, role } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-7">
        <img
          src={sigmaLockup}
          alt="Sigma Clothing"
          className="h-7 w-auto object-contain select-none"
          draggable={false}
        />
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
  const trimmed = term.trim();

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', trimmed],
    enabled: open && trimmed.length > 1,
    queryFn: async () => {
      const q = `%${trimmed}%`;
      const [orders, products, customers, subs, discounts] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, customer_name, total')
          .or(`order_number.ilike.${q},customer_name.ilike.${q},customer_email.ilike.${q},tracking_number.ilike.${q}`)
          .limit(5),
        supabase.from('products').select('id, name, price').ilike('name', q).limit(5),
        supabase
          .from('customers')
          .select('id, full_name, email')
          .or(`full_name.ilike.${q},email.ilike.${q}`)
          .limit(5),
        supabase.from('newsletter_subscribers').select('id, email').ilike('email', q).limit(5),
        supabase.from('discount_codes').select('id, code, type, value').ilike('code', q).limit(5),
      ]);
      return {
        orders: orders.data ?? [],
        products: products.data ?? [],
        customers: customers.data ?? [],
        subs: subs.data ?? [],
        discounts: discounts.data ?? [],
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

  const total =
    (data?.orders.length ?? 0) +
    (data?.products.length ?? 0) +
    (data?.customers.length ?? 0) +
    (data?.subs.length ?? 0) +
    (data?.discounts.length ?? 0);

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
                placeholder="Search orders, products, customers, subscribers, codes"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button onClick={onClose} aria-label="Close search">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] space-y-6 overflow-y-auto">
              {trimmed.length > 1 && !isFetching && total === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">No results found.</p>
              )}
              {data?.orders.length ? (
                <SearchGroup title="Orders">
                  {data.orders.map((o) => (
                    <SearchRow
                      key={o.id}
                      onClick={() => go(`/admin/orders?order=${o.id}`)}
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
                      onClick={() => go(`/admin/products?product=${p.id}`)}
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
                      onClick={() => go(`/admin/customers?customer=${c.id}`)}
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
              {data?.discounts.length ? (
                <SearchGroup title="Discount Codes">
                  {data.discounts.map((d) => (
                    <SearchRow
                      key={d.id}
                      onClick={() => go('/admin/discounts')}
                      left={d.code}
                      right={d.type === 'percentage' ? `${d.value}%` : d.type}
                    />
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

type NotificationItem = { id: string; title: string; meta: string; to: string; urgent?: boolean };

function Notifications() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { value: prefs } = useJsonSetting('notification_settings', {
    orders: true,
    payments: true,
    shipping: true,
    subscribers: false,
  });

  const { data } = useQuery({
    queryKey: ['admin-notifications', prefs],
    staleTime: 30_000,
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [newOrders, failed, unfulfilled, stock, subs] = await Promise.all([
        prefs.orders
          ? supabase
              .from('orders')
              .select('id, order_number, total, created_at')
              .gte('created_at', since)
              .eq('shipping_status', 'unfulfilled')
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] }),
        prefs.payments
          ? supabase
              .from('orders')
              .select('id, order_number, total, created_at')
              .eq('payment_status', 'failed')
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] }),
        prefs.shipping
          ? supabase
              .from('orders')
              .select('id, order_number, created_at')
              .eq('shipping_status', 'packed')
              .order('created_at', { ascending: true })
              .limit(5)
          : Promise.resolve({ data: [] }),
        supabase
          .from('products')
          .select('id, name, stock_quantity, low_stock_threshold')
          .is('archived_at', null)
          .eq('track_inventory', true)
          .order('stock_quantity', { ascending: true })
          .limit(20),
        prefs.subscribers
          ? supabase
              .from('newsletter_subscribers')
              .select('id, email, created_at')
              .gte('created_at', since)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] }),
      ]);

      const products = (stock.data ?? []) as { id: string; name: string; stock_quantity: number; low_stock_threshold: number }[];

      const items: NotificationItem[] = [
        ...((failed.data ?? []) as { id: string; order_number: string; total: number; created_at: string }[]).map((o) => ({
          id: `f-${o.id}`,
          title: `Payment failed · ${o.order_number}`,
          meta: `${formatZAR(o.total)} · ${formatDateTime(o.created_at)}`,
          to: `/admin/orders?order=${o.id}`,
          urgent: true,
        })),
        ...((newOrders.data ?? []) as { id: string; order_number: string; total: number; created_at: string }[]).map((o) => ({
          id: `n-${o.id}`,
          title: `New order · ${o.order_number}`,
          meta: `${formatZAR(o.total)} · ${formatDateTime(o.created_at)}`,
          to: `/admin/orders?order=${o.id}`,
        })),
        ...((unfulfilled.data ?? []) as { id: string; order_number: string; created_at: string }[]).map((o) => ({
          id: `p-${o.id}`,
          title: `Packed, awaiting shipping · ${o.order_number}`,
          meta: formatDateTime(o.created_at),
          to: `/admin/orders?order=${o.id}`,
        })),
        ...products
          .filter((p) => (p.stock_quantity ?? 0) <= 0)
          .slice(0, 5)
          .map((p) => ({
            id: `so-${p.id}`,
            title: `Sold out · ${p.name}`,
            meta: 'Restock or hide from the shop',
            to: `/admin/products?product=${p.id}`,
            urgent: true,
          })),
        ...products
          .filter((p) => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0))
          .slice(0, 5)
          .map((p) => ({
            id: `ls-${p.id}`,
            title: `Low stock · ${p.name}`,
            meta: `${p.stock_quantity} left`,
            to: `/admin/products?product=${p.id}`,
          })),
        ...((subs.data ?? []) as { id: string; email: string; created_at: string }[]).map((s) => ({
          id: `s-${s.id}`,
          title: `New subscriber · ${s.email}`,
          meta: formatDateTime(s.created_at),
          to: '/admin/subscribers',
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
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">Needs Attention</p>
            </div>
            <div className="max-h-80 divide-y divide-border overflow-y-auto">
              {count === 0 && (
                <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Nothing needs your attention.
                </p>
              )}
              {data?.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setOpen(false);
                    navigate(n.to);
                  }}
                  className="block w-full px-4 py-3 text-left hover:bg-foreground/5"
                >
                  <p className={cn('text-xs font-semibold', n.urgent && 'text-destructive')}>{n.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{n.meta}</p>
                </button>
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
          <motion.div
            key="admin-mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden"
          >
            <div
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-foreground/20"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 border-r border-border bg-card"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </motion.div>
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
