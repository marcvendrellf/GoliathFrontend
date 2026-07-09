# Project Overview

## Current State

### Facts

- Product name: Goliath.
- Goliath is a VC opportunity intelligence product.
- Target user: venture capital users asking questions about startups, funding
  rounds, markets, and investment opportunities.
- The current product direction no longer involves Polymarket or trading.
- Data direction: news plus Cala AI. Cala should support structured startup and
  financial/company context such as startup funding rounds.
- User starts by entering a query such as: "Show me startup opportunities of
  investment in Barcelona related to AI."
- The orchestrator is framed as the user's partner.
- The 5-question clarification flow has been dropped due to a 2.5-hour timebox.
- The orchestrator should go directly from user query to subagent planning.
- Example target: 4 subagents for the initial demo.
- Felipe owns frontend chat plus agent representation and animation during
  orchestration/research.
- Marc owns the final conversation report and final report list/frontend
  reporting experience.
- Axel and Josep own backend: a multi-agent system that finds investment
  opportunities.
- ElevenLabs will be used for final report voice. Each subagent should have a
  voice and a clear purpose.

### Wow Moments

- The orchestrator dynamically decides how many agents to spawn.
- The frontend animates spawned subagents and their research/talking activity.
- The final presentation shows subagent orbs entering one at a time.
- Each subagent speaks with real ElevenLabs audio.
- Subtitles show what the speaking subagent says.
- Ideally, the presentation also shows images or data supporting each subagent's
  finding.

### Team Split

- Felipe: initial chat, orchestrator interaction, agent spawning animation, and
  subagents talking to each other during research.
- Marc: final presentation/report experience, conversation-style final report,
  and final report list.
- Axel and Josep: backend multi-agent orchestration, research, opportunity
  discovery, final predictions, structured API responses, and ElevenLabs audio
  generation or integration.

### Recommended Build Strategy

- Use a clean non-pixel UI with animated orbs/nodes for agents.
- Prioritize a complete end-to-end demo over broad data coverage.
- Use mock data immediately on frontend and backend.
- Backend should stream or return structured run state so frontend can animate
  stages without needing backend internals.
- ElevenLabs calls should go through backend to avoid exposing API keys.

### Current Unknowns

- Exact backend stack and API mechanism.
- Whether reports are persisted or in memory.
- Exact factors for the `Goliath Score`.
- Exact implementation meaning of "LLM is in the frontend".
- Exact Cala data fields available during the hackathon.
- Whether final audio is generated as one file, per-agent clips, or streamed.
