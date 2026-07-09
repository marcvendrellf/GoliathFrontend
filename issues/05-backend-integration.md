# Wire frontend to the real backend

## Objective
- Point the app at the backend repo's API and verify the contract end to end,
  keeping the mock fallback intact.

## Why
- Both frontend flows are built against mocks; this issue is the moment of
  truth where real `Run`/`FinalReport` data flows through the same UI.

## In Scope
- Set `NEXT_PUBLIC_API_BASE_URL` via `.env.local` (assumed `http://localhost:8000`).
- Verify all four endpoints against `web/src/lib/contract.ts`.
- Confirm CORS from `http://localhost:3000` works.
- Verify polling cadence (1-2s) and the `complete` handoff to reports.
- Verify at least one real ElevenLabs `audioUrl` plays in the presentation.
- Keep automatic mock fallback working when the backend is down.

## Out of Scope
- Changing backend internals.
- SSE streaming (optional endpoint; polling is fine).

## Tasks
1. Confirm backend base URL and route paths with Axel/Josep.
2. Run one real query end to end; diff response shapes against the contract.
3. Fix mismatches on whichever side is cheaper; update contract + wiki together.
4. Test the backend-down path still demos on mocks.

## Acceptance Criteria
- One real query flows: create run → live events → final report with audio.
- No contract drift: `contract.ts`, wiki, and backend responses agree.
- Killing the backend mid-demo still leaves a working mock demo.

## Dependencies / Notes
- Owner: Marc + one backend member (pair).
- Blocked until backend exposes `POST /api/runs` and `GET /api/runs/:runId`.
