import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, Panel, StatusBadge } from '@/components/admin/AdminUI';
import { Field, fieldClass } from '@/components/admin/AdminDrawer';
import { useBooleanSetting, useJsonSetting } from '@/lib/site-settings';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { logActivity } from '@/lib/admin-log';

type StoreInfo = {
  name: string;
  email: string;
  phone: string;
  currency: string;
  address: string;
};

type CheckoutSettings = {
  discountsEnabled: boolean;
  defaultShippingCost: number;
  paymentProvider: string;
  paymentNote: string;
};

type NotificationSettings = {
  orders: boolean;
  payments: boolean;
  shipping: boolean;
  subscribers: boolean;
};

const SECTIONS = ['Store', 'Storefront', 'Checkout', 'Notifications', 'Admin'] as const;
type Section = (typeof SECTIONS)[number];

export default function AdminSettings() {
  const [section, setSection] = useState<Section>('Store');

  return (
    <div>
      <PageHeader title="Settings" subtitle="Store configuration, visibility and access." />

      <div className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
              section === s
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {section === 'Store' && <StoreSection />}
      {section === 'Storefront' && <StorefrontSection />}
      {section === 'Checkout' && <CheckoutSection />}
      {section === 'Notifications' && <NotificationsSection />}
      {section === 'Admin' && <AdminSection />}
    </div>
  );
}

function SectionPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="mb-6 max-w-2xl p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold">{title}</p>
      {description && <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-3">{children}</div>
    </Panel>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="rounded-full bg-foreground px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
    >
      {saving ? 'Saving' : 'Save Changes'}
    </button>
  );
}

function StoreSection() {
  const { value, save, isSaving } = useJsonSetting<StoreInfo>('store_info', {
    name: 'SIGMA',
    email: '',
    phone: '',
    currency: 'ZAR',
    address: '',
  });
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value.name, value.email, value.phone, value.currency, value.address]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SectionPanel title="Store Information" description="Used for internal records and customer contact.">
      <Field label="Store name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
      <Field label="Contact email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
      <Field label="Contact phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
      <select
        className={fieldClass}
        value={draft.currency}
        onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
      >
        <option value="ZAR">ZAR — South African Rand</option>
        <option value="USD">USD — US Dollar</option>
        <option value="EUR">EUR — Euro</option>
        <option value="GBP">GBP — British Pound</option>
      </select>
      <textarea
        className={`${fieldClass} min-h-24`}
        placeholder="Business address"
        value={draft.address}
        onChange={(e) => setDraft({ ...draft, address: e.target.value })}
      />
      <SaveButton
        saving={isSaving}
        onClick={async () => {
          try {
            await save(draft);
            await logActivity({ action: 'Settings changed', entityType: 'settings', entityLabel: 'Store information' });
            toast.success('Store information saved');
          } catch {
            toast.error('Could not save. Please try again.');
          }
        }}
      />
    </SectionPanel>
  );
}

function StorefrontSection() {
  const gate = useBooleanSetting('password_gate_enabled', true);
  const closed = useBooleanSetting('store_closed', false);

  return (
    <>
      <SectionPanel
        title="Password Gate"
        description="When on, visitors see the early-access screen and must enter the password before browsing the store."
      >
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border">
              <Lock className="h-4 w-4" strokeWidth={1.5} />
            </span>
            {gate.isLoading ? (
              <span className="text-muted-foreground">Loading…</span>
            ) : gate.enabled ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Visible to visitors
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <EyeOff className="h-3.5 w-3.5" /> Hidden — site is open
              </span>
            )}
          </p>
          <Switch
            checked={gate.enabled}
            disabled={gate.isLoading || gate.isSaving}
            label="Toggle password gate"
            onChange={async () => {
              try {
                await gate.setEnabled(!gate.enabled);
                await logActivity({ action: 'Settings changed', entityType: 'settings', entityLabel: 'Password gate' });
                toast.success(gate.enabled ? 'Password gate hidden' : 'Password gate visible');
              } catch {
                toast.error('Could not update the setting');
              }
            }}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Store Closed"
        description="Temporarily close the shop. Visitors see a short notice instead of the store."
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold">
            {closed.enabled ? 'Closed to shoppers' : 'Open for business'}
          </p>
          <Switch
            checked={closed.enabled}
            disabled={closed.isLoading || closed.isSaving}
            label="Toggle store closed"
            onChange={async () => {
              try {
                await closed.setEnabled(!closed.enabled);
                await logActivity({ action: 'Settings changed', entityType: 'settings', entityLabel: 'Store closed' });
                toast.success(closed.enabled ? 'Store reopened' : 'Store closed');
              } catch {
                toast.error('Could not update the setting');
              }
            }}
          />
        </div>
      </SectionPanel>
    </>
  );
}

function CheckoutSection() {
  const { value, save, isSaving } = useJsonSetting<CheckoutSettings>('checkout_settings', {
    discountsEnabled: true,
    defaultShippingCost: 0,
    paymentProvider: 'none',
    paymentNote: '',
  });
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value.discountsEnabled, value.defaultShippingCost, value.paymentProvider, value.paymentNote]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SectionPanel
        title="Shipping"
        description="Zones and rates live on the Shipping page and are applied to the cart. The fallback below is used when no rate matches."
      >
        <Field
          label="Fallback shipping cost (R)"
          type="number"
          min={0}
          value={draft.defaultShippingCost}
          onChange={(v) => setDraft({ ...draft, defaultShippingCost: Number(v) })}
        />
        <Link
          to="/admin/shipping"
          className="inline-block rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
        >
          Manage zones & rates
        </Link>
      </SectionPanel>

      <SectionPanel title="Discounts & Payment" description="Discount codes are validated on the server at checkout.">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
          Accept discount codes at checkout
          <input
            type="checkbox"
            checked={draft.discountsEnabled}
            onChange={(e) => setDraft({ ...draft, discountsEnabled: e.target.checked })}
            className="h-4 w-4 accent-current"
          />
        </label>
        <select
          className={fieldClass}
          value={draft.paymentProvider}
          onChange={(e) => setDraft({ ...draft, paymentProvider: e.target.value })}
        >
          <option value="none">No provider connected</option>
          <option value="yoco">Yoco (to be connected)</option>
          <option value="payfast">PayFast (to be connected)</option>
        </select>
        <textarea
          className={`${fieldClass} min-h-20`}
          placeholder="Internal note about payment setup"
          value={draft.paymentNote}
          onChange={(e) => setDraft({ ...draft, paymentNote: e.target.value })}
        />
        <p className="text-[11px] text-muted-foreground">
          No payment keys are stored here. Provider credentials are kept as server-side secrets only.
        </p>
        <SaveButton
          saving={isSaving}
          onClick={async () => {
            try {
              await save(draft);
              await logActivity({ action: 'Settings changed', entityType: 'settings', entityLabel: 'Checkout' });
              toast.success('Checkout settings saved');
            } catch {
              toast.error('Could not save. Please try again.');
            }
          }}
        />
      </SectionPanel>
    </>
  );
}

function NotificationsSection() {
  const { value, save, isSaving } = useJsonSetting<NotificationSettings>('notification_settings', {
    orders: true,
    payments: true,
    shipping: true,
    subscribers: false,
  });
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value.orders, value.payments, value.shipping, value.subscribers]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows: { key: keyof NotificationSettings; label: string }[] = [
    { key: 'orders', label: 'New orders' },
    { key: 'payments', label: 'Failed payments' },
    { key: 'shipping', label: 'Orders waiting to be fulfilled' },
    { key: 'subscribers', label: 'New subscribers' },
  ];

  return (
    <SectionPanel title="Admin Notifications" description="Choose what appears in the notification bell.">
      {rows.map((r) => (
        <label
          key={r.key}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm"
        >
          {r.label}
          <input
            type="checkbox"
            checked={draft[r.key]}
            onChange={(e) => setDraft({ ...draft, [r.key]: e.target.checked })}
            className="h-4 w-4 accent-current"
          />
        </label>
      ))}
      <SaveButton
        saving={isSaving}
        onClick={async () => {
          try {
            await save(draft);
            await logActivity({ action: 'Settings changed', entityType: 'settings', entityLabel: 'Notifications' });
            toast.success('Notification settings saved');
          } catch {
            toast.error('Could not save. Please try again.');
          }
        }}
      />
    </SectionPanel>
  );
}

function AdminSection() {
  const { user, role } = useAdminAuth();

  const { data: staff } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('id, user_id, role, created_at');
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <SectionPanel title="Your Account">
        <div className="rounded-xl border border-border px-4 py-3">
          <p className="text-sm font-semibold">{user?.email}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{role ?? 'staff'}</p>
        </div>
        <Link
          to="/admin/reset-password"
          className="inline-block rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
        >
          Change password
        </Link>
      </SectionPanel>

      <SectionPanel
        title="Roles & Permissions"
        description="Roles are stored separately from profiles and enforced by the database on every request."
      >
        {!staff?.length ? (
          <p className="text-xs text-muted-foreground">No roles assigned yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <p className="truncate text-xs text-muted-foreground">
                  {s.user_id === user?.id ? `${user?.email} (you)` : s.user_id}
                </p>
                <StatusBadge label={s.role} tone={s.role === 'admin' ? 'positive' : 'neutral'} />
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          New admins are granted access from the database for safety — roles cannot be changed from the browser.
        </p>
      </SectionPanel>
    </>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-foreground' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-background transition-all ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}
