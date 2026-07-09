# Frontend Plan

## Shared Frontend Principles

- Build one coherent app with a clear handoff from research to final report.
- Use animated orbs/cards/nodes to represent agents.
- Avoid pixel-art room complexity.
- Use mock data from a shared contract immediately.
- Keep the UI understandable to judges within 30 seconds.
- Timebox is 2.5 hours; skip the clarifying-question flow.

## Felipe Scope

Felipe owns the live orchestration and research experience:

- Initial query input.
- Chat UI between user and orchestrator.
- Animated orchestrator decision.
- Dynamic subagent spawn animation.
- Subagent representation during research.
- Subagents "talking" to each other before final presentation.
- Research state/progress based on backend events or mock events.

Likely views/components:

- `OrchestratorChat`
- `AgentSpawnAnimation`
- `AgentOrb`
- `AgentResearchStage`
- `AgentConversationFeed`

## Marc Scope

Marc owns the final reporting experience:

- Final animated presentation.
- Subagent orbs entering one at a time.
- Playing subagent ElevenLabs audio.
- Subtitles synchronized to the current report segment at a basic level.
- Supporting data/images per segment when available.
- Final report list.
- Report detail or replay page.
- Conversation-style final report summary.

Likely views/components:

- `FinalPresentation`
- `SpeakingAgentOrb`
- `ReportSubtitle`
- `ReportEvidencePanel`
- `ReportList`
- `ReportDetail`
- `OpportunityCard`

## Recommended Routes

```txt
/                 query + orchestrator chat
/run/:runId       live agent research state
/reports          final report list
/reports/:runId   report detail and final presentation replay
```

For hackathon speed, `/` and `/reports/:runId` can be enough if routing is kept
minimal.

## Handoff Between Felipe And Marc

Felipe's flow should navigate to Marc's report view once backend returns:

- `run.status = "complete"`
- `finalReport`
- `opportunities`
- `presentationSegments`

Marc's report presentation should work from mock data even if backend audio is
not ready.
