import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type Item = { productId: string; quantity: number };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return json({ error: 'No items provided' }, 400);
    }

    const items: Item[] = body.items
      .filter((i: Item) => typeof i?.productId === 'string' && Number.isFinite(Number(i?.quantity)))
      .map((i: Item) => ({ productId: i.productId, quantity: Math.max(1, Math.min(99, Math.floor(Number(i.quantity)))) }))
      .slice(0, 50);

    if (items.length === 0) return json({ error: 'No valid items provided' }, 400);

    const code = typeof body.code === 'string' ? body.code.trim().slice(0, 50) : '';
    const country = typeof body.country === 'string' ? body.country.trim().slice(0, 60) : '';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    // Prices always come from the database, never from the client.
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, status, archived_at, stock_quantity, track_inventory')
      .in('id', items.map((i) => i.productId));
    if (productError) throw productError;

    const lines: { productId: string; name: string; quantity: number; unitPrice: number; lineTotal: number }[] = [];
    const unavailable: string[] = [];

    for (const item of items) {
      const p = (products ?? []).find((row) => row.id === item.productId);
      if (!p || p.status !== 'published' || p.archived_at) {
        unavailable.push(item.productId);
        continue;
      }
      const qty = p.track_inventory ? Math.min(item.quantity, Math.max(0, p.stock_quantity ?? 0)) : item.quantity;
      if (qty <= 0) {
        unavailable.push(p.name);
        continue;
      }
      const unitPrice = Number(p.price ?? 0);
      lines.push({ productId: p.id, name: p.name, quantity: qty, unitPrice, lineTotal: unitPrice * qty });
    }

    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

    // Shipping: first matching active rate in a zone that covers the country.
    let shipping = 0;
    let shippingLabel = 'Calculated at checkout';
    let freeShipping = false;

    const { data: zones } = await supabase
      .from('shipping_zones')
      .select('id, name, countries, free_shipping_threshold, active, position')
      .eq('active', true)
      .order('position', { ascending: true });

    const zone = (zones ?? []).find(
      (z) => !country || (z.countries ?? []).some((c: string) => c.toLowerCase() === country.toLowerCase()),
    );

    if (zone) {
      const threshold = zone.free_shipping_threshold == null ? null : Number(zone.free_shipping_threshold);
      if (threshold != null && subtotal >= threshold) {
        shipping = 0;
        freeShipping = true;
        shippingLabel = `Free shipping · ${zone.name}`;
      } else {
        const { data: rates } = await supabase
          .from('shipping_rates')
          .select('id, name, price, min_order_total, max_order_total, estimated_days, active, position')
          .eq('zone_id', zone.id)
          .eq('active', true)
          .order('position', { ascending: true });
        const rate = (rates ?? []).find(
          (r) =>
            subtotal >= Number(r.min_order_total ?? 0) &&
            (r.max_order_total == null || subtotal <= Number(r.max_order_total)),
        );
        if (rate) {
          shipping = Number(rate.price ?? 0);
          shippingLabel = rate.estimated_days ? `${rate.name} · ${rate.estimated_days}` : rate.name;
        }
      }
    }

    // Discount: validated entirely server-side.
    let discount = 0;
    let discountLabel = '';
    let discountError = '';

    if (code) {
      const { data: rows } = await supabase
        .from('discount_codes')
        .select('id, code, type, value, min_purchase, max_uses, used_count, starts_at, expires_at, active')
        .ilike('code', code)
        .limit(1);
      const d = rows?.[0];
      const now = Date.now();

      if (!d || !d.active) discountError = 'That code is not valid.';
      else if (d.starts_at && new Date(d.starts_at).getTime() > now) discountError = 'That code is not active yet.';
      else if (d.expires_at && new Date(d.expires_at).getTime() < now) discountError = 'That code has expired.';
      else if (d.max_uses != null && (d.used_count ?? 0) >= d.max_uses) discountError = 'That code has been fully used.';
      else if (subtotal < Number(d.min_purchase ?? 0)) discountError = 'Your order does not meet the minimum for this code.';
      else {
        if (d.type === 'percentage') {
          discount = Math.min(subtotal, (subtotal * Number(d.value ?? 0)) / 100);
          discountLabel = `${d.code} · ${Number(d.value)}% off`;
        } else if (d.type === 'free_shipping') {
          discount = 0;
          shipping = 0;
          freeShipping = true;
          shippingLabel = `${d.code} · free shipping`;
          discountLabel = `${d.code} · free shipping`;
        } else {
          discount = Math.min(subtotal, Number(d.value ?? 0));
          discountLabel = `${d.code} · R${Number(d.value).toFixed(2)} off`;
        }
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    return json({
      lines,
      unavailable,
      subtotal,
      shipping,
      shippingLabel,
      freeShipping,
      discount,
      discountLabel,
      discountError,
      total,
      currency: 'ZAR',
    });
  } catch (e) {
    console.error('checkout-quote failed', e);
    return json({ error: 'Could not calculate your order right now.' }, 500);
  }
});
