# SIGMA Product Page Reference-Matched Update

## Goal
Rebuild the existing product-detail page to follow the attached mobile reference flow closely while preserving SIGMA’s products, imagery, typography, colors, currency selection, cart, and image zoom.

## What will change
- Replace the current mobile gallery with one large contained product image and up to three square thumbnails beneath it.
- Make each thumbnail switch the main image and clearly mark the active thumbnail.
- Change the return control to a compact “Back Home” button at the top of the product content.
- Reorder the buying area to: product name, price, size label, size options, and one full-width purchase button.
- Keep existing color selection when a product has multiple color variants, without disrupting the requested hierarchy.
- Show a consistent XS–XXL size row; sizes not present in the selected product’s existing data will be disabled, greyed out, and struck through.
- Replace the current static details block and size-guide modal with stacked expandable sections in this order:
  1. Product Details
  2. Size Chart
  3. Size Reference
  4. Shipping
  5. Care Guide
- Keep “Complete the Fit” as the related-products section beneath the information rows.
- Preserve image proportions with `object-contain`; no product assets will be edited, cropped, compressed, resized, or regenerated.

## Responsive behavior
- Mobile will closely match the references as a single vertical flow.
- Larger screens will retain the same information order in a restrained two-column SIGMA layout, with the image area and purchase details aligned for easier browsing.

## Validation
- Verify thumbnail switching, size selection/disabled states, add-to-cart behavior, expandable sections, image zoom, and product navigation.
- Check the finished page at the current mobile viewport and at desktop width.
- Confirm the preview builds without errors.

## Technical details
- Update only the product-detail presentation and interactions in `src/pages/ProductPage.tsx`.
- Reuse the existing shared Button and Accordion controls and current product/cart data.
- Do not alter catalog data, image files, routing, header, footer, or checkout behavior.
