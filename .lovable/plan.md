# Match the cart reference layout

## What will change
- Rebuild the cart as a near-full-screen white panel with the compact `CART` / `[ CLOSE ]` header from the reference.
- Restyle each cart item into the same image, product information, remove action, and inline quantity-control arrangement.
- Add a `DON'T MISS THESE` row using existing SIGMA products, with working add/select actions that respect available sizes.
- Add the shipping-policy and terms agreement checkbox, subtotal row, and full-width checkout button; checkout stays disabled until the agreement is selected.
- Keep the current SIGMA product images, Rand/currency formatting, cart storage, and existing checkout feedback.
- Preserve an empty-cart state and make the complete layout fit and scroll cleanly on mobile and desktop.

## Technical details
- Update only the cart presentation in `src/components/Cart.tsx`.
- Reuse existing product data, shared controls, cart actions, and semantic theme colours.
- Keep product imagery uncropped with `object-contain`.
- Verify the open cart visually at mobile and desktop sizes and confirm quantity, remove, recommendation, close, and agreement states work.
