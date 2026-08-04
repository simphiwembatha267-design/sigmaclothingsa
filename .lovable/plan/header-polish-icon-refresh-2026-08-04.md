# Header Polish + Icon Refresh

## 1. Top-left readability
Today the header sits fully transparent over the hero photo, so the menu icon and DURBAN/time rely on whatever is behind them. Instead of a heavy black block:

- Add a soft, feathered scrim that only sits behind the left cluster (menu icon + DURBAN/time), fading out horizontally and vertically so there is no visible edge.
- Low opacity, blurred falloff — enough contrast to read, never a visible box.
- The scrim disappears once the header goes to its solid scrolled state.

## 2. Header icons
- Search: swap to a thinner, better-balanced outline magnifying glass with a reduced stroke weight to match the editorial feel.
- Cart: replace the custom bag glyph with a matching thin-outline shopping trolley/cart icon from the same family. Same size, same spacing, same count badge behaviour.

## 3. Cart consistency
- Cart drawer empty state and any other bag glyphs use the same trolley icon and stroke weight as the header.
- The mobile menu "Cart (n)" row uses it too.

## 4. Hero text
- "The Art of Silence" becomes "Uncommon By Design", same serif display type, size and spacing. Line break kept for editorial balance on narrow screens.

## 5. Out of scope
No layout, colour system, branding or content changes beyond the above.

## Technical notes
- `src/components/Header.tsx`: feathered gradient overlay element behind the left cluster (radial/linear mask, token-based foreground colour at low alpha); replace `BagIcon` with lucide `ShoppingCart` at `strokeWidth={1.25}`; `Search` at `strokeWidth={1.25}`.
- `src/components/Cart.tsx`: `ShoppingBag` -> `ShoppingCart`, matching stroke weight.
- `src/pages/Index.tsx`: hero `h1` copy change only.
