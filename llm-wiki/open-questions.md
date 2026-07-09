# Open Questions

## ROI and scoring

- Use a numeric `Goliath Score` from 0 to 100 for each investment opportunity.
- The score is a custom opportunity score, not a strict financial ROI
  guarantee.
- What factors matter most: sector growth, team quality, round timing, prior
  investors, location, valuation, traction, strategic fit, risk?
- Do we need a visible formula, or only natural-language explanation?

## Backend implementation

- Resolved 2026-07-09: Josep's backend is FastAPI/Pydantic, with an in-memory
  run/report store, polling endpoints, and an SSE endpoint. It runs locally
  without provider keys using deterministic mock data.
- Integration work remains: add visible pacing to the mock pipeline; return
  absolute/proxied audio URLs that the frontend can load; populate report
  segment evidence/timing metadata; and preserve agent display metadata on the
  report route. See the [backend audit](sources/backend-local-integration-audit-2026-07-09.md).
- What Cala API fields are available for startup/funding-round data?
- What news/search source will backend use?

## ElevenLabs

- Do we have voice IDs?
- Backend has an ElevenLabs proxy and an in-memory audio store, but its returned
  `/api/audio/...` URL is relative to the backend and currently cannot be
  played by the separate frontend origin without a proxy or URL normalization.
- Word timing is available from the backend's transcript endpoint, but not
  populated on the report's presentation segments that the frontend consumes.

## Frontend implementation

Status: mostly closed on 2026-07-09.

- Frontend lives in this repo under `web/` (fresh Next.js scaffold). The old
  pixel scaffold in `Cala-Hackathon-Frontend-Dev` is abandoned.
- Visual style: orb-based (AI Elements Persona) on a clean shadcn UI, with
  simstudioai/sim as a component/pattern source. See `ui-foundation.md`.
- Still open: what "LLM will be in the frontend" means operationally.

## GitHub issues

Status: closed. Issues live in `marcvendrellf/GoliathFrontend` (#1-#8),
owner-labeled in the body (Felipe / Marc / all).
