# Build app shell and navigation

## Objective
- Give the scaffolded `web/` app a shared shell so the three flows (query,
  live run, reports) feel like one product.

## Why
- Judges see the app for ~3 minutes; consistent navigation and a dark
  "command center" look make the demo read as a product, not a prototype.

## In Scope
- Root layout: app name, minimal top nav (`Goliath` → `/`, `Reports` → `/reports`).
- Dark theme as default, consistent typography and spacing.
- Shared loading and error states (simple, reusable).
- Page transition polish only if time allows.

## Out of Scope
- Auth, settings, responsive/mobile work.
- Any feature logic from issues #1-#3.

## Tasks
1. Update `web/src/app/layout.tsx` with nav and dark theme.
2. Add `loading.tsx` / basic error boundaries for the dynamic routes.
3. Pick 2-3 shadcn components (button, card, badge) and standardize on them.

## Acceptance Criteria
- All four routes share the same shell and theme.
- Navigation between query flow and reports works without dead ends.

## Dependencies / Notes
- Owner: shared (whoever touches it first — coordinate on Discord).
- Keep it under 30 minutes; this is polish infrastructure, not a feature.
