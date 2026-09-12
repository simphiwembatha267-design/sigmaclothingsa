# Restore the Editorial Homepage Hero

## Goal
Bring back the full SIGMA campaign message over the existing black-and-white hero photograph, with more breathing room above the product section.

## Changes
- Restore the `FW25 COLLECTION` label, `Uncommon By Design` headline, and `Built for moguls.` subheading.
- Keep the existing hero photograph full-screen and add sufficient contrast for white typography.
- Position the complete text group slightly higher, with responsive spacing for mobile and desktop.
- Replace the former text link with a frosted pill button labeled `SHOP COLLECTION`.
- Give the button a white border and text, plus a circular right-arrow element matching the previous `FIND YOURS` treatment.
- Preserve the existing product section and all storefront behavior.

## Validation
- Check desktop and mobile layouts for readable copy, clear button contrast, and comfortable spacing above the next section.
- Confirm the button opens the shop and the page builds without errors.

## Technical Details
- Update only the homepage presentation in `src/pages/Index.tsx`.
- Reuse the existing hero asset, semantic color tokens, Framer Motion entrance, and Lucide arrow icon.
