# Cherry-pick sim components for the chat UI (timeboxed)

## Objective
- Reuse UI code/patterns from https://github.com/simstudioai/sim (`apps/sim`)
  to speed up the orchestrator chat, instead of designing from zero.

## Why
- Sim has a polished Next.js + shadcn chat/agent UI; borrowing its patterns
  saves design time in a 2.5-hour build.

## In Scope
- Browse `apps/sim` for chat message list, input, and agent status UI.
- Copy/adapt individual components into `web/src/components/orchestrator/`.
- Strip sim-specific deps (auth, socket.io, stores) while porting.

## Out of Scope
- Adopting sim's stack (Bun, Postgres, Better Auth, Trigger.dev, ReactFlow
  workflow canvas).
- Porting anything not needed by issue #1.

## Tasks
1. Timebox 20 minutes of browsing sim's chat UI source.
2. Port at most 2-3 components; rewrite from scratch if porting fights back.

## Acceptance Criteria
- Either useful components are ported and used by issue #1, or the timebox
  expires and we consciously build simple custom chat UI instead.

## Dependencies / Notes
- Owner: Felipe (support for issue #1 — not a separate deliverable).
- Hard timebox: if extraction takes longer than building, stop porting.
