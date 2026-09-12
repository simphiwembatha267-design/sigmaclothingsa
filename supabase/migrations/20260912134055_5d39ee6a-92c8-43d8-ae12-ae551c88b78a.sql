
-- ============ PRODUCTS: cost price + archive ============
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_price numeric,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Public storefront view without cost price
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'published' AND archived_at IS NULL);

-- ============ SITE SETTINGS: flexible value ============
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS value jsonb;

-- ============ COLLECTIONS ============
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  handle text NOT NULL UNIQUE,
  description text,
  cover_image text,
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published collections"
  ON public.collections FOR SELECT TO anon, authenticated
  USING (status = 'published' AND archived_at IS NULL);
CREATE POLICY "Staff can manage collections"
  ON public.collections FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, product_id)
);
GRANT SELECT ON public.collection_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_products TO authenticated;
GRANT ALL ON public.collection_products TO service_role;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view products in published collections"
  ON public.collection_products FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.collections c
                 WHERE c.id = collection_id AND c.status = 'published' AND c.archived_at IS NULL));
CREATE POLICY "Staff can manage collection products"
  ON public.collection_products FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

-- ============ DISCOUNT CODES ============
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percentage',
  value numeric NOT NULL DEFAULT 0,
  min_purchase numeric NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage discount codes"
  ON public.discount_codes FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER discount_codes_updated_at BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.discount_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id uuid NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.discount_redemptions TO authenticated;
GRANT ALL ON public.discount_redemptions TO service_role;
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view redemptions"
  ON public.discount_redemptions FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- ============ INVENTORY MOVEMENTS ============
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change integer NOT NULL,
  resulting_stock integer NOT NULL,
  reason text NOT NULL DEFAULT 'manual_adjustment',
  note text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_product_idx ON public.inventory_movements(product_id, created_at DESC);
GRANT SELECT, INSERT ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view inventory movements"
  ON public.inventory_movements FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "Staff can record inventory movements"
  ON public.inventory_movements FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()) AND created_by = auth.uid());

-- ============ ADMIN ACTIVITY LOG ============
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  entity_label text,
  detail text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_activity_log_created_idx ON public.admin_activity_log(created_at DESC);
GRANT SELECT, INSERT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view activity log"
  ON public.admin_activity_log FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "Staff can write activity log"
  ON public.admin_activity_log FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()) AND actor_id = auth.uid());

-- ============ SHIPPING ============
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  free_shipping_threshold numeric,
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shipping_zones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_zones TO authenticated;
GRANT ALL ON public.shipping_zones TO service_role;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active zones"
  ON public.shipping_zones FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Staff can manage zones"
  ON public.shipping_zones FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  min_order_total numeric NOT NULL DEFAULT 0,
  max_order_total numeric,
  estimated_days text,
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shipping_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_rates TO authenticated;
GRANT ALL ON public.shipping_rates TO service_role;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active rates"
  ON public.shipping_rates FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Staff can manage rates"
  ON public.shipping_rates FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER shipping_rates_updated_at BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AGGREGATES (staff only, computed in the database) ============
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  day_start timestamptz := date_trunc('day', now());
BEGIN
  IF NOT private.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  SELECT jsonb_build_object(
    'revenue_today', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status='paid' AND created_at >= day_start),0),
    'revenue_month', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status='paid' AND created_at >= date_trunc('month', now())),0),
    'orders_today', (SELECT COUNT(*) FROM orders WHERE created_at >= day_start),
    'units_today', COALESCE((SELECT SUM(oi.quantity) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.created_at >= day_start),0),
    'aov', COALESCE((SELECT AVG(total) FROM orders WHERE payment_status='paid'),0),
    'new_customers_today', (SELECT COUNT(*) FROM customers WHERE created_at >= day_start),
    'new_subscribers_today', (SELECT COUNT(*) FROM newsletter_subscribers WHERE created_at >= day_start),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE shipping_status IN ('unfulfilled','packed') AND shipping_status <> 'cancelled'),
    'failed_payments', (SELECT COUNT(*) FROM orders WHERE payment_status='failed'),
    'low_stock', (SELECT COUNT(*) FROM products WHERE archived_at IS NULL AND track_inventory AND stock_quantity > 0 AND stock_quantity <= low_stock_threshold),
    'sold_out', (SELECT COUNT(*) FROM products WHERE archived_at IS NULL AND track_inventory AND stock_quantity <= 0),
    'total_products', (SELECT COUNT(*) FROM products WHERE archived_at IS NULL),
    'total_customers', (SELECT COUNT(*) FROM customers),
    'total_subscribers', (SELECT COUNT(*) FROM newsletter_subscribers)
  ) INTO result;

  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_analytics(range_start timestamptz, range_end timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT private.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  SELECT jsonb_build_object(
    'revenue', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status='paid' AND created_at BETWEEN range_start AND range_end),0),
    'orders', (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN range_start AND range_end),
    'units', COALESCE((SELECT SUM(oi.quantity) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.created_at BETWEEN range_start AND range_end),0),
    'aov', COALESCE((SELECT AVG(total) FROM orders WHERE payment_status='paid' AND created_at BETWEEN range_start AND range_end),0),
    'new_customers', (SELECT COUNT(*) FROM customers WHERE created_at BETWEEN range_start AND range_end),
    'returning_customers', (SELECT COUNT(*) FROM (
        SELECT customer_id FROM orders
        WHERE customer_id IS NOT NULL AND created_at BETWEEN range_start AND range_end
        GROUP BY customer_id HAVING COUNT(*) > 1) t),
    'subscribers', (SELECT COUNT(*) FROM newsletter_subscribers WHERE created_at BETWEEN range_start AND range_end),
    'gross_profit', COALESCE((SELECT SUM((oi.unit_price - COALESCE(p.cost_price,0)) * oi.quantity)
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.payment_status='paid' AND o.created_at BETWEEN range_start AND range_end),0),
    'timeseries', COALESCE((SELECT jsonb_agg(x ORDER BY x->>'day') FROM (
        SELECT jsonb_build_object(
          'day', to_char(date_trunc('day', created_at), 'YYYY-MM-DD'),
          'revenue', SUM(total) FILTER (WHERE payment_status='paid'),
          'orders', COUNT(*)
        ) AS x
        FROM orders WHERE created_at BETWEEN range_start AND range_end
        GROUP BY date_trunc('day', created_at)) s), '[]'::jsonb),
    'top_products', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT jsonb_build_object(
          'product_id', oi.product_id,
          'name', oi.product_name,
          'units', SUM(oi.quantity),
          'revenue', SUM(oi.line_total)
        ) AS x
        FROM order_items oi JOIN orders o ON o.id=oi.order_id
        WHERE o.created_at BETWEEN range_start AND range_end
        GROUP BY oi.product_id, oi.product_name
        ORDER BY SUM(oi.line_total) DESC LIMIT 10) s), '[]'::jsonb),
    'by_category', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT jsonb_build_object(
          'category', COALESCE(p.category,'Uncategorised'),
          'revenue', SUM(oi.line_total),
          'units', SUM(oi.quantity)
        ) AS x
        FROM order_items oi
        JOIN orders o ON o.id=oi.order_id
        LEFT JOIN products p ON p.id=oi.product_id
        WHERE o.created_at BETWEEN range_start AND range_end
        GROUP BY COALESCE(p.category,'Uncategorised')
        ORDER BY SUM(oi.line_total) DESC) s), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_analytics(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics(timestamptz, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_payment_totals()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;
  RETURN (SELECT jsonb_build_object(
    'revenue', COALESCE(SUM(total) FILTER (WHERE payment_status='paid'),0),
    'paid_count', COUNT(*) FILTER (WHERE payment_status='paid'),
    'pending_count', COUNT(*) FILTER (WHERE payment_status='pending'),
    'pending_amount', COALESCE(SUM(total) FILTER (WHERE payment_status='pending'),0),
    'failed_count', COUNT(*) FILTER (WHERE payment_status='failed'),
    'failed_amount', COALESCE(SUM(total) FILTER (WHERE payment_status='failed'),0),
    'refunded_count', COUNT(*) FILTER (WHERE payment_status='refunded'),
    'refunded_amount', COALESCE(SUM(total) FILTER (WHERE payment_status='refunded'),0)
  ) FROM orders);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_payment_totals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_payment_totals() TO authenticated;
