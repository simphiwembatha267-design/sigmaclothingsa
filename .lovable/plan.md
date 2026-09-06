# Refine the SIGMA mobile menu

## Changes
- Keep the current full-screen menu, existing SIGMA logo, close control, hero imagery, routes, cart behavior, currency selector, and newsletter sign-up functionality.
- Tighten the mobile spacing and typography so the complete navigation feels balanced on smaller screens while remaining smoothly scrollable.
- Reorder the Shop links to: New Arrivals, All Products, Tops, Bottoms, Outerwear, Accessories.
- Rename the secondary group to “More” and order it as: About, Size Guide, Shipping & Returns, Contact.
- Use restrained separators and the existing darkened, blurred homepage image treatment; reduce visual noise without adding cards, bright colors, or new decorative icons.
- Keep Cart prominent within the lower navigation controls and preserve all current behavior.

## Technical notes
- Limit changes to `src/components/Header.tsx`.
- Reuse the existing Inter body font, semantic foreground/background colors, Framer Motion transitions, responsive spacing, and safe-area scrolling.
- Verify the menu at the current phone viewport, including access to the final links and lower controls.
