# SIGMA Admin — Full Store Management Upgrade

Turn the admin area into a real control room for the store: every section works with live data, nothing is a placeholder, and the shop front keeps working exactly as it does today.

## What you'll be able to do when it's done

**Dashboard** — See today's money and activity at a glance: revenue, orders, items sold, average order value, new customers, new signups. Plus an "Action Required" list (orders waiting to be packed, failed payments, low stock, sold out) where every line opens the exact order or product.

**Orders** — Search, filter and page through orders. Open an order to see everything, jump straight to the customer or a product, mark it Packed / Shipped / Delivered, cancel it, add a courier and tracking number, and keep private notes. Refunds are recorded as "refund recorded" only — never pretended to be a real bank refund.

**Products** — Everything you have now, plus: preview a product as shoppers will see it before publishing, a clear Draft → Preview → Published flow, archive instead of deleting, stronger checks on price and stock, In Stock / Low Stock / Sold Out labels, quick stock edits from the list, and a history of every stock change.

**Inventory** — A dedicated stock view built from your products: search, low-stock and sold-out filters, quick adjust and restock.

**Collections** — Create, rename, describe, give a cover image and web address, order them, add and reorder products, publish or hide. Published collections show on the shop.

**Customers** — Real list with orders count, total spent, last purchase, joined date. Open a customer to see contact details, shipping info, their full order history (click through to any order) and private notes. Export to CSV.

**Subscribers** — Real list of newsletter signups with search, sort, delete, count and CSV export.

**Discount Codes** — Percentage, fixed amount or free shipping codes with minimum spend, usage limit, expiry and on/off switch. Shoppers can actually enter them in the cart and the total changes.

**Payments** — Revenue, successful, pending, failed and refunded totals, plus a transaction list built from real orders. Structured so a South African provider can be plugged in later.

**Shipping** — Zones, rates and a free-shipping threshold that the cart actually uses, plus a fulfilment queue with packed / shipped / delivered actions and tracking.

**Analytics** — Revenue, orders, units, average order value, new vs returning customers and subscriber growth over Today / 7 / 30 / 90 days / This year / custom range. Best sellers, revenue by product and category, and profit once cost prices are entered.

**Profit** — Optional cost price per product (never shown to shoppers) feeding gross profit and margin.

**Notifications & Search** — The bell only shows things that genuinely need attention, and each one opens the right record. Search covers orders, products, customers, subscribers and discount codes, and opens the exact record.

**Activity Log** — A record of who changed what and when.

**Settings** — Organised into Store, Storefront (including the existing password gate), Checkout, Notifications and Admin — only settings that truly save.

## Technical notes

New tables (all with grants, RLS and staff-only write policies):
`collections`, `collection_products`, `discount_codes`, `discount_redemptions`, `inventory_movements`, `admin_activity_log`, `shipping_zones`, `shipping_rates`, plus `products.cost_price`, `products.archived_at`, and a generalised `site_settings` (JSON value column alongside the existing boolean so the password gate keeps working untouched).

Analytics and dashboard counts run through Postgres aggregate functions (`security definer`, staff-gated) rather than pulling rows into the browser. Lists use server-side pagination and filtering with React Query caching and precise invalidation after mutations.

Discounts and shipping rates are validated server-side in an edge function at checkout, so the client can't fake a discount. Cost price is never selectable by anonymous storefront queries.

Shared admin UI (drawer, table, filter bar, confirm dialog, toast patterns) is extracted from the existing Orders/Products pages so every new page looks identical to what's there now.

## Build order

1. Database migrations + shared admin UI primitives + activity logging helper
2. Products upgrade (preview, archive, stock status, quick adjust, inventory history, cost price) + Inventory page
3. Orders upgrade (fulfilment actions, tracking, notes, deep links) + Payments page
4. Customers, Subscribers, Collections (+ storefront collection support)
5. Discounts and Shipping, including the checkout edge function that enforces both
6. Dashboard rebuild, Analytics, Notifications, Global Search, Activity Log
7. Settings sections, security audit (RLS + linter), full click-through test of the whole flow

This is a large build and will run across several steps. The storefront's look and behaviour stays as it is, apart from the new discount field and collection pages.
