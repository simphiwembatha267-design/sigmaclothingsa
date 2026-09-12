import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Archive, GripVertical, ArrowUp, ArrowDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  TableSkeleton,
  ErrorState,
} from '@/components/admin/AdminUI';
import { AdminDrawer, DrawerSection, Field, DrawerToggle, fieldClass } from '@/components/admin/AdminDrawer';
import { logActivity } from '@/lib/admin-log';

type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  cover_image: string | null;
  status: string;
  featured: boolean;
  position: number;
  archived_at: string | null;
};

type Draft = Partial<Collection> & { id?: string };

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function AdminCollections() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Collection[];
    },
  });

  const counts = useQuery({
    queryKey: ['admin-collection-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collection_products').select('collection_id');
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((r) => {
        map[r.collection_id] = (map[r.collection_id] ?? 0) + 1;
      });
      return map;
    },
  });

  const save = useMutation({
    mutationFn: async (c: Draft) => {
      if (!c.title?.trim()) throw new Error('Collection title is required.');
      const handle = slugify(c.handle || c.title);
      if (!handle) throw new Error('A valid web address is required.');
      const payload = {
        title: c.title.trim(),
        handle,
        description: c.description ?? null,
        cover_image: c.cover_image ?? null,
        status: c.status ?? 'draft',
        featured: c.featured ?? false,
        position: c.position ?? (data?.length ?? 0),
      };
      if (c.id) {
        const { error } = await supabase.from('collections').update(payload).eq('id', c.id);
        if (error) throw error;
        await logActivity({ action: 'Collection edited', entityType: 'collection', entityId: c.id, entityLabel: payload.title });
        return c.id;
      }
      const { data: row, error } = await supabase.from('collections').insert(payload).select('id').single();
      if (error) throw error;
      await logActivity({ action: 'Collection created', entityType: 'collection', entityId: row.id, entityLabel: payload.title });
      return row.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-collections'] });
      qc.invalidateQueries({ queryKey: ['storefront-collections'] });
      setEditing(null);
      toast.success('Collection saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = useMutation({
    mutationFn: async ({ list, from, to }: { list: Collection[]; from: number; to: number }) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      await Promise.all(
        next.map((c, i) => supabase.from('collections').update({ position: i }).eq('id', c.id)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-collections'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: async ({ c, restore }: { c: Collection; restore?: boolean }) => {
      const { error } = await supabase
        .from('collections')
        .update({ archived_at: restore ? null : new Date().toISOString(), status: restore ? 'draft' : 'draft' })
        .eq('id', c.id);
      if (error) throw error;
      await logActivity({
        action: restore ? 'Collection restored' : 'Collection archived',
        entityType: 'collection',
        entityId: c.id,
        entityLabel: c.title,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-collections'] });
      qc.invalidateQueries({ queryKey: ['storefront-collections'] });
      toast.success('Collection updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = data ?? [];

  return (
    <div>
      <PageHeader
        title="Collections"
        subtitle={`${list.length} collections`}
        actions={
          <button
            onClick={() => setEditing({ title: '', handle: '', status: 'draft', featured: false })}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Collection
          </button>
        }
      />

      <Panel className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState title="No collections yet" description="Group products into drops and edits." />
        ) : (
          <div className="divide-y divide-border">
            {list.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex flex-col">
                  <button
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => move.mutate({ list, from: i, to: i - 1 })}
                    className="text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    aria-label="Move down"
                    disabled={i === list.length - 1}
                    onClick={() => move.mutate({ list, from: i, to: i + 1 })}
                    className="text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                {c.cover_image ? (
                  <img src={c.cover_image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg border border-border" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{c.handle} · {counts.data?.[c.id] ?? 0} products
                  </p>
                </div>
                {c.featured && <StatusBadge label="Featured" tone="positive" />}
                <StatusBadge
                  label={c.archived_at ? 'archived' : c.status}
                  tone={c.status === 'published' && !c.archived_at ? 'positive' : 'warning'}
                />
                <button
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => setEditing(c)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  aria-label={c.archived_at ? 'Restore' : 'Archive'}
                  title={c.archived_at ? 'Restore' : 'Archive'}
                  onClick={() => {
                    if (c.archived_at) return archive.mutate({ c, restore: true });
                    if (confirm(`Archive "${c.title}"?`)) archive.mutate({ c });
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                >
                  <Archive className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {editing && (
          <CollectionDrawer
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

function CollectionDrawer({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Draft;
  onChange: (v: Draft) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const qc = useQueryClient();
  const set = (patch: Draft) => onChange({ ...value, ...patch });
  const dragIndex = useRef<number | null>(null);
  const [picker, setPicker] = useState('');

  const { data: products } = useQuery({
    queryKey: ['admin-products-lite'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images, status')
        .is('archived_at', null)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: members, refetch } = useQuery({
    queryKey: ['collection-products', value.id],
    enabled: !!value.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_products')
        .select('id, product_id, position, products(name, images)')
        .eq('collection_id', value.id!)
        .order('position');
      if (error) throw error;
      return data ?? [];
    },
  });

  const memberIds = useMemo(() => new Set((members ?? []).map((m) => m.product_id)), [members]);

  const add = async (productId: string) => {
    if (!value.id) return toast.error('Save the collection first.');
    const { error } = await supabase
      .from('collection_products')
      .insert({ collection_id: value.id, product_id: productId, position: members?.length ?? 0 });
    if (error) return toast.error(error.message);
    refetch();
    qc.invalidateQueries({ queryKey: ['admin-collection-counts'] });
    qc.invalidateQueries({ queryKey: ['storefront-collections'] });
    toast.success('Product added');
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from('collection_products').delete().eq('id', id);
    if (error) return toast.error(error.message);
    refetch();
    qc.invalidateQueries({ queryKey: ['admin-collection-counts'] });
    qc.invalidateQueries({ queryKey: ['storefront-collections'] });
  };

  const reorder = async (from: number, to: number) => {
    const next = [...(members ?? [])];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    await Promise.all(
      next.map((m, i) => supabase.from('collection_products').update({ position: i }).eq('id', m.id)),
    );
    refetch();
    qc.invalidateQueries({ queryKey: ['storefront-collections'] });
  };

  return (
    <AdminDrawer
      wide
      title={value.id ? 'Edit Collection' : 'New Collection'}
      onClose={onClose}
      footer={
        <>
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
            {saving ? 'Saving' : 'Save Collection'}
          </button>
        </>
      }
    >
      <DrawerSection title="Details">
        <Field label="Title" value={value.title ?? ''} onChange={(v) => set({ title: v })} />
        <Field
          label="Web address (handle)"
          value={value.handle ?? ''}
          placeholder="new-arrivals"
          onChange={(v) => set({ handle: v })}
        />
        <textarea
          className={`${fieldClass} min-h-24`}
          placeholder="Description"
          value={value.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
        />
        <Field
          label="Cover image URL"
          value={value.cover_image ?? ''}
          onChange={(v) => set({ cover_image: v })}
        />
        <select
          className={fieldClass}
          value={value.status ?? 'draft'}
          onChange={(e) => set({ status: e.target.value })}
        >
          <option value="draft">Draft — hidden</option>
          <option value="published">Published — live on shop</option>
        </select>
        <DrawerToggle
          label="Featured collection"
          checked={value.featured ?? false}
          onChange={(v) => set({ featured: v })}
        />
      </DrawerSection>

      <DrawerSection title="Products">
        {!value.id ? (
          <p className="rounded-xl border border-border px-4 py-4 text-xs text-muted-foreground">
            Save the collection to start adding products.
          </p>
        ) : (
          <>
            <select
              className={fieldClass}
              value={picker}
              onChange={(e) => {
                setPicker('');
                if (e.target.value) add(e.target.value);
              }}
            >
              <option value="">Add a product…</option>
              {(products ?? [])
                .filter((p) => !memberIds.has(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
            </select>

            {!members?.length ? (
              <p className="rounded-xl border border-border px-4 py-4 text-xs text-muted-foreground">
                No products in this collection yet.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((m, i) => {
                  const p = m.products as unknown as { name: string; images: string[] } | null;
                  return (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={() => (dragIndex.current = i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex.current !== null && dragIndex.current !== i)
                          reorder(dragIndex.current, i);
                        dragIndex.current = null;
                      }}
                      className="flex cursor-grab items-center gap-3 rounded-xl border border-border p-2"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      {p?.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-border" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm">{p?.name ?? 'Product'}</span>
                      <button onClick={() => removeMember(m.id)} aria-label="Remove product">
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </DrawerSection>
    </AdminDrawer>
  );
}
