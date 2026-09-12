# Replace the floating footer with a static footer

## Changes
- Remove the footer’s fixed positioning, floating inset, pointer-event overrides, blur, shadow, and pill-shaped container.
- Keep the existing social icons, centered SIGMA logo, and “Need Help?” menu in a standard full-width footer at the end of the page.
- Preserve the help menu behavior while opening it upward so it remains visible above the footer.
- Remove the extra bottom spacing previously reserved for the floating footer.

## Verification
- Confirm the footer appears only after the page content and never overlaps it.
- Check desktop and mobile layouts, including the “Need Help?” menu.
- Confirm the latest build remains clean.
