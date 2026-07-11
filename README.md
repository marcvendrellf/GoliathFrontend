# Goliath Frontend Handoff

Frontend owns the user-facing Goliath experience.

## Quickstart

```bash
cd web
pnpm install
pnpm dev     # http://localhost:3000 — runs fully on mock data, no backend needed
```

See `web/README.md` for structure, ownership, and how to pull sim/shadcn
components. The backend contract is `web/src/lib/contract.ts`
(mirrored in `llm-wiki/backend-contract.md`).

## Team Ownership

- Felipe: orchestrator chat, agent representation, subagent spawn animation,
  and live research/talking state.
- Marc: final narrated presentation, conversation-style final report, report
  list, report detail, and investment opportunity cards.

## Important Decisions

- No Polymarket/trading UI.
- No pixel-art office dependency.
- Goliath is a VC opportunity intelligence product.
- User enters a VC query, the orchestrator immediately spawns subagents, then
  the user sees them research and present findings.
- Timebox is 2.5 hours; drop the clarifying-question flow.
- Final presentation uses subagent orbs, subtitles, and ElevenLabs audio.
- Investment opportunities must show a score.
- Predictions should be concise and precise.

## Frontend Needs From Backend

- Run lifecycle and events.
- Subagent plan.
- Agent messages/findings.
- Opportunities with score, status, prediction, confidence, risk, and evidence.
- Final report segments with optional audio URLs.

Read:

- `../llm-wiki/frontend-plan.md`
- `../llm-wiki/backend-contract.md`
- `../llm-wiki/product-requirements.md`
- `../issues/01-felipe-orchestrator-chat-agent-animation.md`
- `../issues/02-marc-final-narrated-presentation.md`
- `../issues/03-marc-report-list-and-detail.md`

## Git Workflow

- Main integration branch: `dev`.
- Create one branch per GitHub issue from `dev`.
- Branch naming: `issue-<number>-short-name`.
- Open pull requests back into `dev`.
- Keep `main` stable for demo-ready snapshots.
