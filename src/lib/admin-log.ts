import { supabase } from '@/integrations/supabase/client';

export type ActivityEntity =
  | 'product'
  | 'order'
  | 'collection'
  | 'discount'
  | 'customer'
  | 'subscriber'
  | 'shipping'
  | 'settings'
  | 'inventory';

/**
 * Record an administrative action. Never pass credentials or payment details.
 * Failures are swallowed — logging must never block the actual operation.
 */
export async function logActivity(entry: {
  action: string;
  entityType?: ActivityEntity;
  entityId?: string;
  entityLabel?: string;
  detail?: string;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from('admin_activity_log').insert({
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      entity_label: entry.entityLabel ?? null,
      detail: entry.detail ?? null,
      actor_id: user.id,
      actor_email: user.email ?? null,
    });
  } catch {
    /* non-blocking */
  }
}

/** Record a stock change alongside the product update. */
export async function logInventoryMovement(entry: {
  productId: string;
  change: number;
  resultingStock: number;
  reason: 'initial_stock' | 'restock' | 'manual_adjustment' | 'order' | 'cancellation';
  note?: string;
  orderId?: string;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from('inventory_movements').insert({
      product_id: entry.productId,
      change: entry.change,
      resulting_stock: entry.resultingStock,
      reason: entry.reason,
      note: entry.note ?? null,
      order_id: entry.orderId ?? null,
      created_by: user.id,
    });
  } catch {
    /* non-blocking */
  }
}
