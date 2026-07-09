Title: Build orchestrator chat and live agent representation

## Objective
- Build the initial user journey where a VC user submits a query, answers 5
  orchestrator questions, and sees subagents spawn and research in the UI.

## Why
- This is the first wow moment: Goliath feels like a VC partner that assembles a
  custom research team instead of returning a static chatbot answer.

## In Scope
- Query input for the initial VC research prompt.
- Orchestrator chat UI.
- Display and answer flow for 5 clarifying questions.
- Animated transition from clarifying questions to agent planning.
- Subagent orb/card representation.
- Spawn animation when backend returns agent plans.
- Research-state animation while backend is running.
- Agent-to-agent activity feed during research.
- Mock data fallback matching the backend contract.

## Out of Scope
- Final narrated report presentation.
- Report list/detail pages.
- Real backend agent implementation.
- ElevenLabs audio playback.

## Constraints
- Must work with mock data before backend integration is ready.
- Must consume `Run`, `AgentPlan`, and `RunEvent`-shaped data.
- Avoid pixel-map/tileset dependency.

## Tasks
1. Create the initial query input and submit action.
2. Render orchestrator messages and 5 clarifying questions.
3. Capture user answers.
4. Render planned agents from backend/mock response.
5. Animate subagent spawn and research states.
6. Render agent-to-agent events from `RunEvent`.
7. Expose a clear completion handoff to the final report route/view.

## Acceptance Criteria
- User can enter a query and see the orchestrator ask 5 questions.
- User can answer questions and trigger agent planning.
- At least 4 subagents spawn with role, purpose, and status.
- Research activity visibly updates while the run is in progress.
- UI works with mock data without backend running.
- When run is complete, UI can navigate to or reveal the final report view.

## Definition of Done
- The flow is demoable from query to research completion using mock data.
- Component boundaries are clear enough for backend integration.
- No dependency on pixel-art office assets remains in this flow.

## Dependencies / Notes
- See `llm-wiki/backend-contract.md`.
- Owner: Felipe.
