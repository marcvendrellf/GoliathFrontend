# UI Foundation

## Decisions

- The app lives in `web/`: Next.js 16 (App Router) + TypeScript + Tailwind
  3.4, package manager pnpm. The Tailwind configuration and global tokens are
  the Sim versions so the workspace looks and behaves consistently.
- [simstudioai/sim](https://github.com/simstudioai/sim) is now the full UI
  foundation, not just a pattern reference. Its workspace shell, chat/canvas
  layout, component primitives, icons, utilities, and workflow renderer are
  vendored under `web/src/vendor/` and aliased as `@sim/*`; Goliath-specific
  screens compose those primitives in `web/src/components/`.
- Only Sim's UI layer is adopted. Its infrastructure (Bun,
  PostgreSQL/Drizzle, Better Auth, Socket.io, Trigger.dev, stores, and backend
  hooks) remains out of scope; the Goliath mock/HTTP API contract is preserved.
- The final report keeps its WebGL `Orb` component in
  `web/src/components/ui/orb.tsx` and its narrated presentation implementation.
- ElevenLabs audio is backend-generated; frontend only plays
  `PresentationSegment.audioUrl`. The presentation must start from a user
  click because browsers block autoplay with sound.

## Repo Layout

```txt
web/src/lib/contract.ts          canonical backend contract (see backend-contract.md)
web/src/lib/mock/mock-run.ts     mock run/report + 18s replay timeline (mockRunAt)
web/src/lib/api.ts               API client, mock fallback when no NEXT_PUBLIC_API_BASE_URL
web/src/app/...                  routes: /, /reports, /reports/[runId]
web/src/components/chat/         Sim-style query and orchestration chat
web/src/components/canvas/       Sim-style agent workflow canvas
web/src/components/workspace/    Sim-style workspace shell and sidebar
web/src/components/presentation/ Marc (issue #2)
web/src/vendor/                  vendored Sim UI primitives and renderer
```

## Known Caveats

- The Sim vendor layer originates from a much larger application. Keep it
  vendored and self-contained; do not reintroduce its infrastructure or hidden
  backend dependencies when adding Goliath features.
- When a run completes, the workspace CTA must continue to link directly to
  `/reports/[runId]`, where the existing narrated report is rendered.
- `pnpm build` and `pnpm exec tsc --noEmit` pass after the Sim UI merge; keep
  them passing.
