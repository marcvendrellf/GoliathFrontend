# LLM Wiki Log

## 2026-07-09

- Created Goliath planning wiki from updated product direction.
- Captured pivot from Polymarket/trading to VC opportunity intelligence.
- Captured team split: Felipe on chat/agent representation, Marc on final
  reports/presentation, Axel and Josep on backend multi-agent opportunity
  discovery.
- Captured ElevenLabs final report voice requirement.
- Added frontend and backend handoff folders.
- Locked opportunity scoring as a visible `Goliath Score` from 0 to 100.
- Added opportunity status labels: hot, warming, neutral, cooling, and not hot.
- Added current-opportunities subagent role and concise prediction requirement.
- Created `dev` as the active integration branch.
- Documented one-branch-per-issue workflow.
- Updated scope for 2.5-hour timebox and removed the clarifying-question flow.

- Scaffolded the app in `web/`: Next.js 15 + TypeScript + Tailwind v4 +
  shadcn, pnpm. `pnpm build` and `tsc --noEmit` pass.
- Decided simstudioai/sim is a component/pattern source only; its stack (Bun,
  Postgres, Better Auth) is not adopted. Documented in `ui-foundation.md`.
- Vendored AI Elements Persona orb and added shared `AgentOrb` wrapper.
- Locked the backend contract in `web/src/lib/contract.ts` (mirrored in
  `backend-contract.md`), added `CreateRunRequest` and `ReportSummary`, and
  wrote full mock demo data with an 18s replayable run timeline.
- Created route stubs with owner annotations: `/` and `/run/[runId]` (Felipe,
  issue #1), `/reports` and `/reports/[runId]` (Marc, issues #2-#3).
- Added issue drafts 04-06 and 08 and filed them on GitHub (#5-#8).

- Merged Felipe's Sim-style chat workflow into `dev`. Sim's UI layer is now
  fully vendored (workspace shell, chat, workflow canvas, primitives, icons,
  and utilities) while Goliath retains its mock/HTTP contract and final report.
- Preserved report dependencies and the `/reports/[runId]` narration route;
  completed research exposes an `Open final report` CTA. `pnpm build`, TypeScript,
  and a runtime smoke check of `/reports/run-mock-1` pass.

- Cloned and audited `josep-audenis/goliath-backend` at `be3bf7c` on this Mac.
  Its Python 3.13 mock mode, tests, CORS, polling, reports, and SSE boot work;
  recorded the local setup and remaining cross-repo integration gaps in a
  source audit.

- Completed the local frontend/backend integration: staged mock events, report
  speaker/evidence/timing metadata, browser-resolvable audio URLs, and
  alias-correct SSE. Backend tests (38) and the frontend build pass; the real
  browser flow now reaches the populated final report.

- Pulled Felipe's final briefing polish and the backend's scored run dump.
  Demo mode now uses the committed `run_dump/final` six-segment briefing with
  MP3 clips and word timings, while retaining the normal run/report API flow.
