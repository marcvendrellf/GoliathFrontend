# Backend Local-Integration Audit — 2026-07-09

## Source

- Repository: [josep-audenis/goliath-backend](https://github.com/josep-audenis/goliath-backend)
- Local clone: `../GoliathBackend`
- Reviewed revision: `be3bf7c` on `main`
- Scope: local boot, tests, live mock API, and compatibility with the current
  frontend at `GoliathFrontend/web`.

## Verified on this Mac

- macOS arm64, Python 3.13.12.
- `python3 -m venv .venv` plus `pip install -r requirements.txt -r requirements-dev.txt`
  completes successfully; `pytest` reports **36 passed**.
- No `.env`, LLM key, Cala key, or ElevenLabs key is necessary for the
  deterministic mock pipeline.
- `uvicorn app.main:app --host 127.0.0.1 --port 8000` boots successfully.
- `GET /health`, CORS preflight, `POST /api/runs`, run polling, report list,
  report detail, transcript, and SSE all responded successfully.

## Local run topology

```bash
# terminal 1 — backend
cd ../GoliathBackend
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000

# web/.env.local — local-only, never commit
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# terminal 2 — frontend (restart it after adding the env file)
cd GoliathFrontend/web
pnpm dev
```

The frontend otherwise intentionally uses its own mock API. Backend CORS is
currently `*`, which is sufficient for this local development topology.

## Compatibility assessment

| Area | Status | Evidence / required change |
| --- | --- | --- |
| Core HTTP flow | Works | Core polling endpoints and JSON aliases provide `id`, agent/event data, opportunities, and report/list shapes. |
| Mock demo choreography | Fix required | The backend mock pipeline completes in roughly a millisecond, so the frontend's 1-second polling sees the completed run and skips visible planning/spawn/research states. Add deliberate, cancellable stage delays in mock mode or consume/replay event timestamps in the frontend. |
| Report agent labels | Fix required | Backend segment IDs such as `agent-0-market_mapper` do not match the frontend mock roster IDs. Report detail fetches only `FinalReport`, so its fallback renders a numeric name and generic `Specialist` role. Include speaker metadata with reports, use shared stable IDs, or improve the frontend adapter. |
| Segment evidence | Fix required | Every real response segment currently has `evidenceIds: []`, so the report's evidence panel renders nothing. Associate each segment with IDs from the selected opportunities' evidence. |
| Silent narration timing | Fix required | Report segments return `durationMs: null`; the frontend falls back to eight seconds. The backend already estimates durations in `/api/reports/{runId}/transcript`; copy that data onto the report segments or have the frontend fetch the transcript. |
| ElevenLabs playback | Fix required when TTS is enabled | Backend assigns relative URLs such as `/api/audio/{id}`, but the frontend calls `new Audio(audioUrl)` from port 3000 and has no `/api` rewrite. Return a configurable absolute backend URL or normalize/proxy it in the frontend. |
| Word-level timing | Follow-up | TTS timings are stored server-side and exposed by the transcript endpoint, but the report response leaves `wordTimings` empty and the frontend does not request that endpoint. It is not required for silent fallback, but is required for exact audio sync. |
| SSE contract | Fix before use | Direct run polling uses `timestamp`; SSE currently calls `model_dump_json()` without aliases and emits `ts`. Use alias serialization so both transports return the contract field. Current frontend polling does not consume SSE. |
| Persistence | Accepted hackathon limitation | Runs, reports, and generated audio are in-memory and disappear when the backend restarts. This is compatible with the local demo but not report reuse across restarts. |

## Conclusions

No secret or platform blocker prevents a working local mock demo. Add the
frontend API-base environment variable and restart Next.js to use the cloned
backend immediately. The four practical fixes for a polished integrated demo
are mock pacing, report speaker metadata, populated evidence/duration fields,
and an audio URL that resolves from the frontend origin.

## Updated project pages

- [Backend contract](../backend-contract.md)
- [Open questions](../open-questions.md)
- [Project log](../log.md)
