# Fix: product images missing on the GitHub Pages site

## What's happening

All product photos (except Medusa Noir, which you added manually) are stored as CDN pointer files — `.asset.json` files in `src/assets/` whose URLs look like `/__l5e/assets-v1/.../sigma-gallery-top-black-front.jpg`.

That `/__l5e/` path is served only by Lovable's own hosting. On GitHub Pages nothing answers that path, so every one of those images returns 404 and shows blank. Medusa Noir works because it's a real `.png` file in the repo that Vite bundles into `dist/`.

## The fix

Bring the images back into the repo as real files so Vite bundles them and they ship with the GitHub Pages build (respecting the `/sigmaclothingsa/` base path).

1. Download each CDN-hosted image back into `src/assets/` as a real `.jpg`.
2. Update `src/lib/products.ts` to import the image files directly instead of the `.asset.json` pointers (`import x from '@/assets/x.jpg'` → used as `x`, not `x.url`).
3. Do the same for the other CDN-pointer images still in use: the Lookbook SS25 cover, `sigma-lookbook-ss25`, and `sigma-exclusive-cover` (checked in `src/pages/Lookbook.tsx`).
4. Remove the now-unused `.asset.json` pointer files.
5. Keep `ProductCard.tsx` / `ProductPage.tsx` / `Cart.tsx` logic intact — bundled URLs still pass their `startsWith('/')`/`http` checks in dev, and in production Vite emits base-prefixed paths.

## Verify

- Run a production build and confirm every product image is emitted into `dist/assets/`.
- Grep the built output for any remaining `/__l5e/` references — there should be none.
- Load the built site locally under the GitHub Pages base path and confirm all product cards render images.

## Notes

- 18 product images, roughly 1.4 MB total — small enough to live in the repo comfortably.
- No design, pricing, product titles, or layout changes.
