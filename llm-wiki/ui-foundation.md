# UI Foundation

## Decisions

- The app lives in `web/`: Next.js 15 (App Router) + TypeScript + Tailwind v4
  + shadcn, package manager pnpm. Scaffolded fresh on 2026-07-09.
- [simstudioai/sim](https://github.com/simstudioai/sim) is the component and
  pattern SOURCE, not the starting stack. Cherry-pick UI code from its
  `apps/sim` (chat layout, agent panels) when it saves time. Do not adopt its
  infrastructure: Bun, PostgreSQL/Drizzle, Better Auth, Socket.io,
  Trigger.dev are all out of scope for the hackathon.
- Agent orbs use the AI Elements **Persona** component
  (https://elements.ai-sdk.dev/components/persona), vendored at
  `web/src/components/ai-elements/persona.tsx`. It is a Rive/WebGL2 animated
  orb with states `idle | listening | thinking | speaking | asleep` and six
  visual variants. Shared wrapper: `web/src/components/agents/agent-orb.tsx`
  maps `AgentPlan.status` → orb state.
- ElevenLabs audio is backend-generated; frontend only plays
  `PresentationSegment.audioUrl`. The presentation must start from a user
  click because browsers block autoplay with sound.

## Repo Layout

```txt
web/src/lib/contract.ts          canonical backend contract (see backend-contract.md)
web/src/lib/mock/mock-run.ts     mock run/report + 18s replay timeline (mockRunAt)
web/src/lib/api.ts               API client, mock fallback when no NEXT_PUBLIC_API_BASE_URL
web/src/app/...                  routes: / , /run/[runId], /reports, /reports/[runId]
web/src/components/agents/       shared AgentOrb
web/src/components/orchestrator/ Felipe (issue #1)
web/src/components/presentation/ Marc (issue #2)
web/src/components/reports/      Marc (issue #3)
```

## Known Caveats

- Persona streams `.riv` files from a Vercel blob URL → demo machine needs
  network. If venue wifi is a risk, download the `.riv` files and serve from
  `web/public/` (see issue on demo polish).
- `pnpm build` and `tsc --noEmit` pass on the scaffold; keep them passing.
