import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './store';
import { products as staticProducts } from './products';

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  images: string[] | null;
  status: string;
};

const mapRow = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price ?? 0),
  image: row.images?.[0] ?? '',
  images: row.images ?? [],
  category: row.category ?? 'Tops',
  description: row.description ?? '',
  sizes: row.sizes?.length ? row.sizes : ['XS', 'S', 'M', 'L', 'XL'],
  color: row.colors?.[0],
});

/** Published products created in the admin dashboard, merged with the built-in catalog. */
export function useCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ['storefront-products'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, category, sizes, colors, images, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as ProductRow[]).map(mapRow);
    },
  });

  const products = useMemo(() => {
    const remote = data ?? [];
    const seen = new Set(remote.map((p) => p.id));
    return [...remote, ...staticProducts.filter((p) => !seen.has(p.id))];
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  return { products, categories, isLoading };
}

export function useCatalogProduct(id: string | undefined) {
  const { products, isLoading } = useCatalog();
  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  return { product, products, isLoading };
}
