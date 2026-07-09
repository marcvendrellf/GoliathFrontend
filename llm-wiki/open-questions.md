# Open Questions

## ROI and scoring

- Use a numeric `Goliath Score` from 0 to 100 for each investment opportunity.
- The score is a custom opportunity score, not a strict financial ROI
  guarantee.
- What factors matter most: sector growth, team quality, round timing, prior
  investors, location, valuation, traction, strategic fit, risk?
- Do we need a visible formula, or only natural-language explanation?

## Backend implementation

- What stack are Axel and Josep using?
- Will backend support streaming events or simple polling?
- Will reports be persisted or in memory?
- What Cala API fields are available for startup/funding-round data?
- What news/search source will backend use?

## ElevenLabs

- Do we have voice IDs?
- Will backend generate audio files before the final presentation starts?
- Where are audio files stored or served from?
- Do we need per-word/per-sentence subtitle timing, or segment-level subtitles?

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
