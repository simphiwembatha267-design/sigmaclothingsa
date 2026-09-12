CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  day_start timestamptz := date_trunc('day', now());
BEGIN
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_payment_totals()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_analytics(range_start timestamp with time zone, range_end timestamp with time zone)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
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
$function$;