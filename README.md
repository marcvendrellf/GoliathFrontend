# Goliath Frontend Handoff

Frontend owns the user-facing Goliath experience.

## Team Ownership

- Felipe: orchestrator chat, 5 clarifying questions, agent representation,
  subagent spawn animation, and live research/talking state.
- Marc: final narrated presentation, conversation-style final report, report
  list, report detail, and investment opportunity cards.

## Important Decisions

- No Polymarket/trading UI.
- No pixel-art office dependency.
- Goliath is a VC opportunity intelligence product.
- User enters a VC query, answers 5 questions, then sees spawned subagents
  research and present findings.
- Final presentation uses subagent orbs, subtitles, and ElevenLabs audio.
- Investment opportunities must show a score.
- Predictions should be concise and precise.

## Frontend Needs From Backend

- Run lifecycle and events.
- Orchestrator questions.
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
