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
  completes successfully; `pytest` reports **38 passed** after the integration
  regressions were added.
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
| Mock demo choreography | Implemented | The deterministic pipeline uses `MOCK_EVENT_DELAY_MS` (600 ms by default), letting the polling UI render planning, each spawn, research, and synthesis. Tests set it to zero. |
| Report agent labels | Implemented | Segments now carry `speaker` metadata, and the frontend uses it before falling back to its mock roster. |
| Segment evidence | Implemented | Each segment now references evidence IDs from its relevant scored opportunities, so the report evidence panel renders. |
| Silent narration timing | Implemented | Every segment carries estimated `durationMs` and `wordTimings`; provider timings replace them when TTS runs. |
| ElevenLabs playback | Implemented | Backend audio URLs use configurable `PUBLIC_BASE_URL`; frontend resolves a relative legacy URL defensively. |
| Word-level timing | Implemented | The frontend uses exact timings when their word count matches the report script, with proportional reveal as its fallback. |
| SSE contract | Implemented | SSE now serializes Pydantic aliases and emits the contract field `timestamp`. |
| Persistence | Accepted hackathon limitation | Runs, reports, and generated audio are in-memory and disappear when the backend restarts. This is compatible with the local demo but not report reuse across restarts. |

## Conclusions

No secret or platform blocker prevents a working local mock demo. The local
frontend API-base environment is configured and the browser-verified flow now
goes from staged research to a populated final report. Persistence remains the
only deliberate hackathon limitation.

## Updated project pages

- [Backend contract](../backend-contract.md)
- [Open questions](../open-questions.md)
- [Project log](../log.md)
