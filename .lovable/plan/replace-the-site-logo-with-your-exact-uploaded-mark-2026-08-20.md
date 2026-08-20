# Replace the site logo with your exact uploaded mark

Yes — this is possible. Right now the logo is not your file at all: `src/components/Logo.tsx` draws a hand-coded SVG approximation of the script "S." That's why it never matched. The fix is to stop drawing it and render your actual artwork.

## What changes

- Trim the large white margins from the uploaded PNG and keep it as a tight, transparent-background black mark at full resolution (no redrawing, no regeneration).
- Rewrite `Logo` to render that image instead of the hand-drawn paths, keeping the same `className` prop so every existing placement keeps its current size and spacing.
- All five places that use `Logo` pick the change up automatically: header, mobile menu overlay, footer, splash screen, newsletter modal, password gate.
- The mobile menu uses the logo on a dark background via an `invert` class — with a transparent black PNG this still renders white correctly, so that placement is verified after the swap.
- Set the favicon from the same mark (square, padded, transparent) and point `index.html` at it, replacing the default `favicon.ico`.

## Not changing

Logo sizes, positions, header/footer layout, typography, colours, or anything else.

## Technical notes

- Asset trimmed with ImageMagick, then uploaded via the assets CLI so the binary stays out of the repo; `Logo.tsx` imports the pointer and uses its URL in an `<img>` with `alt="Sigma"`.
- Favicon is the one exception: a real `public/favicon.png` file, generated at 64x64 with padding so the mark isn't stretched, plus removal of `public/favicon.ico`.
- Verification: build + typecheck, and a visual check of the header, mobile menu (inverted), and footer.
