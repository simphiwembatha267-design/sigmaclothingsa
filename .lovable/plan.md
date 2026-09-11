# Password Gate On/Off Toggle in Admin

Add a switch in the admin dashboard that hides or shows the website's password gate (the early-access screen visitors see before entering the store).

## What you'll get

- A real **Settings** page in the admin dashboard (it is currently a placeholder).
- A **Password Gate** toggle on that page:
  - **On** — visitors see the early-access/password screen as they do today.
  - **Off** — the gate is hidden and everyone goes straight into the site.
- The change takes effect on the live site immediately for new visitors; the admin can flip it back at any time.

## How it works

1. **Database (Lovable Cloud)**
   - New `site_settings` table storing the flag `password_gate_enabled` (default: on).
   - Anyone can read the setting (the public site needs it); only admin users can change it (row-level security + grants).

2. **Public website**
   - `src/App.tsx` fetches the setting once on load (via a small `useSiteGate()` hook in `src/lib/`).
   - If the gate is disabled, the site renders directly without the password screen.
   - If enabled, current behavior is unchanged — including the "I'm already in this session" behavior.

3. **Admin dashboard**
   - New `src/pages/admin/AdminSettings.tsx` replacing the placeholder at `/admin/settings`.
   - A clean panel matching the existing admin style with a visible/hidden switch, a short explanation, and a saved/loading state.
   - Route updated in `src/App.tsx` to point to the new page.

## Safety notes

- The gate password itself stays server-side; this only controls whether the gate appears.
- Turning the gate off does not affect the admin login — the admin area stays protected separately.

## Verification

- Build passes.
- Browser check: toggle off → public site opens without the gate; toggle on → gate returns.
