import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, X, Copy, Trash2, Pencil, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  TableSkeleton,
} from '@/components/admin/AdminUI';
import { formatZAR } from '@/lib/admin-format';

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
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
};

const EMPTY: Omit<ProductRow, 'id'> = {
  name: '',
  description: '',
  price: 0,
  compare_at_price: null,
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
};

const CATEGORIES = ['Tops', 'Hoodies', 'Pants', 'Outerwear', 'Accessories'];
const PAGE_SIZE = 12;

export default function AdminProducts() {
  const qc = useQueryClient();
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<(Partial<ProductRow> & { id?: string }) | null>(null);

  const { data: products, isLoading } = useQuery({
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

  const save = useMutation({
    mutationFn: async (p: Partial<ProductRow> & { id?: string }) => {
      const payload = {
        name: p.name,
        description: p.description,
        price: Number(p.price ?? 0),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
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
      if (!payload.name?.trim()) throw new Error('Product name is required.');
      if (p.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setEditing(null);
      toast.success('Product saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = products ?? [];
    const t = term.trim().toLowerCase();
    if (t)
      list = list.filter((p) =>
        [p.name, p.sku, p.category].filter(Boolean).some((v) =>
          String(v).toLowerCase().includes(t),
        ),
      );
    if (status !== 'all') list = list.filter((p) => p.status === status);
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
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground"
          >
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
        ) : current.length === 0 ? (
          <EmptyState title="No products yet" description="Create your first product to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
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
                {current.map((p) => (
                  <tr key={p.id} className="hover:bg-foreground/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
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
                      <StatusBadge
                        label={`${p.stock_quantity}`}
                        tone={p.stock_quantity <= p.low_stock_threshold ? 'danger' : 'neutral'}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={p.status}
                        tone={p.status === 'published' ? 'positive' : 'warning'}
                      />
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">{formatZAR(p.price)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <IconBtn label="Edit" onClick={() => setEditing(p)}>
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </IconBtn>
                        <IconBtn
                          label="Duplicate"
                          onClick={() => {
                            const { id, ...rest } = p;
                            setEditing({ ...rest, name: `${p.name} Copy`, status: 'draft' });
                          }}
                        >
                          <Copy className="h-4 w-4" strokeWidth={1.5} />
                        </IconBtn>
                        <IconBtn
                          label="Delete"
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"?`)) remove.mutate(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-full border border-border px-4 py-2 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page === pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-border px-4 py-2 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

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

  const field =
    'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground placeholder:text-muted-foreground';

  const images = value.images ?? [];

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
        className="fixed inset-y-0 right-0 z-[90] w-full max-w-xl overflow-y-auto border-l border-border bg-background"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-5">
          <p className="text-lg font-bold tracking-[-0.02em]">
            {value.id ? 'Edit Product' : 'New Product'}
          </p>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <Group title="Details">
            <input
              className={field}
              placeholder="Product name"
              value={value.name ?? ''}
              onChange={(e) => set({ name: e.target.value })}
            />
            <textarea
              className={`${field} min-h-24`}
              placeholder="Description"
              value={value.description ?? ''}
              onChange={(e) => set({ description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className={field}
                value={value.category ?? ''}
                onChange={(e) => set({ category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                className={field}
                value={value.status ?? 'draft'}
                onChange={(e) => set({ status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </Group>

          <Group title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput
                label="Price (R)"
                type="number"
                value={value.price ?? 0}
                onChange={(v) => set({ price: Number(v) })}
              />
              <LabeledInput
                label="Compare at (R)"
                type="number"
                value={value.compare_at_price ?? ''}
                onChange={(v) => set({ compare_at_price: v === '' ? null : Number(v) })}
              />
              <LabeledInput
                label="SKU"
                value={value.sku ?? ''}
                onChange={(v) => set({ sku: String(v) })}
              />
              <LabeledInput
                label="Barcode"
                value={value.barcode ?? ''}
                onChange={(v) => set({ barcode: String(v) })}
              />
            </div>
          </Group>

          <Group title="Inventory">
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput
                label="Stock quantity"
                type="number"
                value={value.stock_quantity ?? 0}
                onChange={(v) => set({ stock_quantity: Number(v) })}
              />
              <LabeledInput
                label="Low stock alert at"
                type="number"
                value={value.low_stock_threshold ?? 5}
                onChange={(v) => set({ low_stock_threshold: Number(v) })}
              />
            </div>
            <Toggle
              label="Track inventory"
              checked={value.track_inventory ?? true}
              onChange={(v) => set({ track_inventory: v })}
            />
            <Toggle
              label="Featured product"
              checked={value.featured ?? false}
              onChange={(v) => set({ featured: v })}
            />
          </Group>

          <Group title="Variants">
            <TagInput
              label="Sizes"
              values={value.sizes ?? []}
              onChange={(v) => set({ sizes: v })}
            />
            <TagInput
              label="Colours"
              values={value.colors ?? []}
              onChange={(v) => set({ colors: v })}
            />
          </Group>

          <Group title="Images">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              className="w-full text-xs file:mr-3 file:rounded-full file:border file:border-border file:bg-background file:px-4 file:py-2 file:text-xs"
            />
            <div className="flex gap-2">
              <input
                className={field}
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
                      if (dragIndex.current !== null && dragIndex.current !== i)
                        reorder(dragIndex.current, i);
                      dragIndex.current = null;
                    }}
                    className="flex cursor-grab items-center gap-3 rounded-xl border border-border p-2 active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <img src={src} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {src}
                    </span>
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
          </Group>

          <Group title="SEO">
            <input
              className={field}
              placeholder="SEO title"
              value={value.seo_title ?? ''}
              onChange={(e) => set({ seo_title: e.target.value })}
            />
            <textarea
              className={`${field} min-h-20`}
              placeholder="SEO description"
              value={value.seo_description ?? ''}
              onChange={(e) => set({ seo_description: e.target.value })}
            />
          </Group>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-background px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
          >
            {saving ? 'Saving' : 'Save Product'}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}

function Toggle({
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
