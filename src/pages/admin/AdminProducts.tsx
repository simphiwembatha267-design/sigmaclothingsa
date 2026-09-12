import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, X, Copy, Pencil, GripVertical, Archive, Eye, History } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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
  stockStatus,
  stockTone,
  STOCK_LABEL,
} from '@/components/admin/AdminUI';
import { AdminDrawer, DrawerSection, Field, DrawerToggle, fieldClass } from '@/components/admin/AdminDrawer';
import { formatZAR, formatDateTime } from '@/lib/admin-format';
import { logActivity, logInventoryMovement } from '@/lib/admin-log';

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  sizes: string[];
  colors: string[];
  images: string[];
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  status: string;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  archived_at: string | null;
};

const EMPTY: Omit<ProductRow, 'id'> = {
  name: '',
  description: '',
  price: 0,
  compare_at_price: null,
  cost_price: null,
  sku: '',
  barcode: '',
  category: 'Tops',
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  colors: ['Black'],
  images: [],
  stock_quantity: 0,
  low_stock_threshold: 5,
  track_inventory: true,
  status: 'draft',
  featured: false,
  seo_title: '',
  seo_description: '',
  archived_at: null,
};

const CATEGORIES = ['Tops', 'Hoodies', 'Pants', 'Outerwear', 'Accessories'];
const PAGE_SIZE = 12;

export function validateProduct(p: Partial<ProductRow>): string | null {
  if (!p.name?.trim()) return 'Product name is required.';
  const price = Number(p.price ?? 0);
  if (!Number.isFinite(price) || price < 0) return 'Price must be zero or more.';
  if (p.compare_at_price != null && Number(p.compare_at_price) > 0 && Number(p.compare_at_price) < price)
    return 'Compare-at price must be higher than the price.';
  if (p.cost_price != null && Number(p.cost_price) < 0) return 'Cost price cannot be negative.';
  const stock = Number(p.stock_quantity ?? 0);
  if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a whole number of zero or more.';
  if (Number(p.low_stock_threshold ?? 0) < 0) return 'Low stock alert cannot be negative.';
  return null;
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<(Partial<ProductRow> & { id?: string }) | null>(null);
  const [historyFor, setHistoryFor] = useState<ProductRow | null>(null);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProductRow[];
    },
  });

  // Deep link: /admin/products?product=<id>
  const focusId = params.get('product');
  useEffect(() => {
    if (!focusId || !products) return;
    const found = products.find((p) => p.id === focusId);
    if (found) {
      setEditing(found);
      params.delete('product');
      setParams(params, { replace: true });
    }
  }, [focusId, products, params, setParams]);

  const save = useMutation({
    mutationFn: async (p: Partial<ProductRow> & { id?: string }) => {
      const message = validateProduct(p);
      if (message) throw new Error(message);
      const payload = {
        name: p.name!.trim(),
        description: p.description,
        price: Number(p.price ?? 0),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        cost_price: p.cost_price === null || p.cost_price === undefined || p.cost_price === ('' as never)
          ? null
          : Number(p.cost_price),
        sku: p.sku,
        barcode: p.barcode,
        category: p.category,
        sizes: p.sizes ?? [],
        colors: p.colors ?? [],
        images: p.images ?? [],
        stock_quantity: Number(p.stock_quantity ?? 0),
        low_stock_threshold: Number(p.low_stock_threshold ?? 5),
        track_inventory: p.track_inventory ?? true,
        status: p.status ?? 'draft',
        featured: p.featured ?? false,
        seo_title: p.seo_title,
        seo_description: p.seo_description,
      };

      if (p.id) {
        const before = products?.find((x) => x.id === p.id);
        const { error } = await supabase.from('products').update(payload).eq('id', p.id);
        if (error) throw error;
        const diff = payload.stock_quantity - (before?.stock_quantity ?? 0);
        if (diff !== 0) {
          await logInventoryMovement({
            productId: p.id,
            change: diff,
            resultingStock: payload.stock_quantity,
            reason: 'manual_adjustment',
            note: 'Edited from product form',
          });
        }
        await logActivity({
          action: before?.status !== payload.status ? `Product ${payload.status}` : 'Product edited',
          entityType: 'product',
          entityId: p.id,
          entityLabel: payload.name,
        });
        return p.id;
      }

      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) throw error;
      if (payload.stock_quantity > 0) {
        await logInventoryMovement({
          productId: data.id,
          change: payload.stock_quantity,
          resultingStock: payload.stock_quantity,
          reason: 'initial_stock',
        });
      }
      await logActivity({
        action: 'Product created',
        entityType: 'product',
        entityId: data.id,
        entityLabel: payload.name,
      });
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['storefront-products'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setEditing(null);
      toast.success('Product saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: async ({ p, restore }: { p: ProductRow; restore?: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({
          archived_at: restore ? null : new Date().toISOString(),
          status: restore ? 'draft' : 'archived',
        })
        .eq('id', p.id);
      if (error) throw error;
      await logActivity({
        action: restore ? 'Product restored' : 'Product archived',
        entityType: 'product',
        entityId: p.id,
        entityLabel: p.name,
      });
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['storefront-products'] });
      toast.success(v.restore ? 'Product restored' : 'Product archived');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adjustStock = useMutation({
    mutationFn: async ({ p, next }: { p: ProductRow; next: number }) => {
      if (!Number.isInteger(next) || next < 0) throw new Error('Stock must be zero or more.');
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: next })
        .eq('id', p.id);
      if (error) throw error;
      const diff = next - p.stock_quantity;
      await logInventoryMovement({
        productId: p.id,
        change: diff,
        resultingStock: next,
        reason: diff > 0 ? 'restock' : 'manual_adjustment',
        note: 'Quick adjustment',
      });
      await logActivity({
        action: 'Stock changed',
        entityType: 'product',
        entityId: p.id,
        entityLabel: p.name,
        detail: `${p.stock_quantity} → ${next}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['storefront-products'] });
      toast.success('Stock updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = products ?? [];
    const t = term.trim().toLowerCase();
    if (t)
      list = list.filter((p) =>
        [p.name, p.sku, p.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(t)),
      );
    if (status === 'active') list = list.filter((p) => !p.archived_at);
    else if (status !== 'all') list = list.filter((p) => p.status === status);
    return list;
  }, [products, term, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${filtered.length} products`}
        actions={
          <button
            onClick={() => setEditing({ ...EMPTY })}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Product
          </button>
        }
      />

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
              placeholder="Search products, SKU, category"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground"
          >
            <option value="active">Active (not archived)</option>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : current.length === 0 ? (
          <EmptyState title="No products found" description="Create your first product to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Price</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {current.map((p) => {
                  const s = stockStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-foreground/[0.03]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg border border-border" />
                          )}
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sku || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{p.category}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            defaultValue={p.stock_quantity}
                            key={`${p.id}-${p.stock_quantity}`}
                            onBlur={(e) => {
                              const next = Number(e.target.value);
                              if (next !== p.stock_quantity) adjustStock.mutate({ p, next });
                            }}
                            className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs tabular-nums outline-none focus:border-foreground"
                          />
                          <StatusBadge label={STOCK_LABEL[s]} tone={stockTone(s)} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={p.archived_at ? 'archived' : p.status}
                          tone={p.status === 'published' && !p.archived_at ? 'positive' : 'warning'}
                        />
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">{formatZAR(p.price)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <IconBtn label="Preview on storefront" onClick={() => window.open(`/product/${p.id}?preview=1`, '_blank')}>
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                          </IconBtn>
                          <IconBtn label="Inventory history" onClick={() => setHistoryFor(p)}>
                            <History className="h-4 w-4" strokeWidth={1.5} />
                          </IconBtn>
                          <IconBtn label="Edit" onClick={() => setEditing(p)}>
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                          </IconBtn>
                          <IconBtn
                            label="Duplicate"
                            onClick={() => {
                              const { id, archived_at, ...rest } = p;
                              setEditing({ ...rest, name: `${p.name} Copy`, status: 'draft' });
                            }}
                          >
                            <Copy className="h-4 w-4" strokeWidth={1.5} />
                          </IconBtn>
                          <IconBtn
                            label={p.archived_at ? 'Restore' : 'Archive'}
                            onClick={() => {
                              if (p.archived_at) return archive.mutate({ p, restore: true });
                              if (confirm(`Archive "${p.name}"? It will be hidden from the shop.`))
                                archive.mutate({ p });
                            }}
                          >
                            <Archive className="h-4 w-4" strokeWidth={1.5} />
                          </IconBtn>
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
        {editing && (
          <ProductDrawer
            value={editing}
            onChange={setEditing}
            onClose={() => setEditing(null)}
            onSave={() => save.mutate(editing)}
            saving={save.isPending}
          />
        )}
        {historyFor && (
          <InventoryHistoryDrawer product={historyFor} onClose={() => setHistoryFor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function InventoryHistoryDrawer({
  product,
  onClose,
}: {
  product: { id: string; name: string };
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-history', product.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const REASON: Record<string, string> = {
    initial_stock: 'Initial stock',
    restock: 'Restock',
    manual_adjustment: 'Manual adjustment',
    order: 'Order placed',
    cancellation: 'Order cancelled',
  };

  return (
    <AdminDrawer title="Inventory History" subtitle={product.name} onClose={onClose}>
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : !data?.length ? (
        <EmptyState title="No stock changes yet" description="Adjustments will be recorded here." />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {data.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{REASON[m.reason] ?? m.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(m.created_at)}
                  {m.note ? ` · ${m.note}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {m.change > 0 ? `+${m.change}` : m.change}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">{m.resulting_stock} left</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminDrawer>
  );
}

function ProductDrawer({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Partial<ProductRow> & { id?: string };
  onChange: (v: Partial<ProductRow> & { id?: string }) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [imageUrl, setImageUrl] = useState('');
  const dragIndex = useRef<number | null>(null);
  const set = (patch: Partial<ProductRow>) => onChange({ ...value, ...patch });
  const images = value.images ?? [];
  const problem = validateProduct(value);

  const margin =
    value.cost_price && Number(value.price) > 0
      ? ((Number(value.price) - Number(value.cost_price)) / Number(value.price)) * 100
      : null;

  const reorder = (from: number, to: number) => {
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set({ images: next });
  };

  const uploadFiles = async (files: FileList) => {
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '')}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = await supabase.storage
        .from('product-images')
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (data?.signedUrl) uploaded.push(data.signedUrl);
    }
    if (uploaded.length) set({ images: [...images, ...uploaded] });
  };

  return (
    <AdminDrawer
      wide
      title={value.id ? 'Edit Product' : 'New Product'}
      subtitle={value.id ? value.name ?? undefined : 'Saved as a draft until you publish'}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
          {value.id && (
            <button
              onClick={() => window.open(`/product/${value.id}?preview=1`, '_blank')}
              className="flex-1 rounded-full border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
            >
              Preview
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving || !!problem}
            className="flex-1 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
          >
            {saving ? 'Saving' : 'Save'}
          </button>
        </>
      }
    >
      {problem && (
        <p className="mb-5 rounded-xl border border-destructive/40 px-4 py-3 text-xs text-destructive">
          {problem}
        </p>
      )}

      <DrawerSection title="Details">
        <input
          className={fieldClass}
          placeholder="Product name"
          value={value.name ?? ''}
          onChange={(e) => set({ name: e.target.value })}
        />
        <textarea
          className={`${fieldClass} min-h-24`}
          placeholder="Description"
          value={value.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className={fieldClass}
            value={value.category ?? ''}
            onChange={(e) => set({ category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className={fieldClass}
            value={value.status ?? 'draft'}
            onChange={(e) => set({ status: e.target.value })}
          >
            <option value="draft">Draft — hidden from shop</option>
            <option value="published">Published — live on shop</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </DrawerSection>

      <DrawerSection title="Pricing">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (R)" type="number" min={0} value={value.price ?? 0} onChange={(v) => set({ price: Number(v) })} />
          <Field
            label="Compare at (R)"
            type="number"
            min={0}
            value={value.compare_at_price ?? ''}
            onChange={(v) => set({ compare_at_price: v === '' ? null : Number(v) })}
          />
          <Field
            label="Cost price (R) — private"
            type="number"
            min={0}
            value={value.cost_price ?? ''}
            onChange={(v) => set({ cost_price: v === '' ? null : Number(v) })}
          />
          <div className="self-end rounded-xl border border-border px-3 py-2.5 text-xs text-muted-foreground">
            {margin === null
              ? 'Margin — add a cost price'
              : `Margin ${margin.toFixed(1)}% · profit ${formatZAR(Number(value.price) - Number(value.cost_price))}`}
          </div>
          <Field label="SKU" value={value.sku ?? ''} onChange={(v) => set({ sku: v })} />
          <Field label="Barcode" value={value.barcode ?? ''} onChange={(v) => set({ barcode: v })} />
        </div>
      </DrawerSection>

      <DrawerSection title="Inventory">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Stock quantity"
            type="number"
            min={0}
            value={value.stock_quantity ?? 0}
            onChange={(v) => set({ stock_quantity: Number(v) })}
          />
          <Field
            label="Low stock alert at"
            type="number"
            min={0}
            value={value.low_stock_threshold ?? 5}
            onChange={(v) => set({ low_stock_threshold: Number(v) })}
          />
        </div>
        <DrawerToggle
          label="Track inventory"
          checked={value.track_inventory ?? true}
          onChange={(v) => set({ track_inventory: v })}
        />
        <DrawerToggle
          label="Featured product"
          checked={value.featured ?? false}
          onChange={(v) => set({ featured: v })}
        />
      </DrawerSection>

      <DrawerSection title="Variants">
        <TagInput label="Sizes" values={value.sizes ?? []} onChange={(v) => set({ sizes: v })} />
        <TagInput label="Colours" values={value.colors ?? []} onChange={(v) => set({ colors: v })} />
      </DrawerSection>

      <DrawerSection title="Images">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="w-full text-xs file:mr-3 file:rounded-full file:border file:border-border file:bg-background file:px-4 file:py-2 file:text-xs"
        />
        <div className="flex gap-2">
          <input
            className={fieldClass}
            placeholder="…or paste an image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (!imageUrl.trim()) return;
              set({ images: [...images, imageUrl.trim()] });
              setImageUrl('');
            }}
            className="shrink-0 rounded-xl border border-border px-4 text-xs"
          >
            Add
          </button>
        </div>
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Drag to reorder · first image is the cover
            </p>
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                draggable
                onDragStart={() => (dragIndex.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex.current !== null && dragIndex.current !== i) reorder(dragIndex.current, i);
                  dragIndex.current = null;
                }}
                className="flex cursor-grab items-center gap-3 rounded-xl border border-border p-2 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <img src={src} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{src}</span>
                <button
                  onClick={() => set({ images: images.filter((_, idx) => idx !== i) })}
                  aria-label="Remove image"
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </DrawerSection>

      <DrawerSection title="SEO">
        <input
          className={fieldClass}
          placeholder="SEO title"
          value={value.seo_title ?? ''}
          onChange={(e) => set({ seo_title: e.target.value })}
        />
        <textarea
          className={`${fieldClass} min-h-20`}
          placeholder="SEO description"
          value={value.seo_description ?? ''}
          onChange={(e) => set({ seo_description: e.target.value })}
        />
      </DrawerSection>
    </AdminDrawer>
  );
}

function TagInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 rounded-xl border border-border p-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
          >
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault();
              if (!values.includes(draft.trim())) onChange([...values, draft.trim()]);
              setDraft('');
            }
          }}
          placeholder="Add + Enter"
          className="min-w-24 flex-1 bg-transparent px-2 text-xs outline-none"
        />
      </div>
    </div>
  );
}
