# Agents And Voices

## Core Model

The orchestrator is the user's VC partner. It reads the user's query, decides
which subagents are needed, and coordinates the final synthesis.

Subagents should have:

- role
- purpose
- clear research scope
- unique voice/personality
- final presentation segment

## Suggested Demo Agents

### Orchestrator / Partner

- Purpose: interpret the user query, decide the research plan, and coordinate
  the final recommendation.
- Voice: calm senior VC partner.
- Presentation role: intro and conclusion if time allows.

### Market Mapper

- Purpose: identify relevant AI/startup market segments in the target geography.
- Voice: analytical and concise.
- Output: market map, demand signals, sector attractiveness.

### Company Scout

- Purpose: find candidate startups and summarize funding history, stage, and
  traction signals.
- Voice: energetic scout.
- Output: startup shortlist and evidence.

### Current Opportunities Agent

- Purpose: classify current opportunity heat and produce concise opportunity
  cards.
- Voice: fast, current, and decisive.
- Output: status labels such as hot, warming, neutral, cooling, or not hot,
  plus concise predictions.

### Funding Analyst

- Purpose: inspect rounds, timing, investor participation, and likely next raise
  windows using Cala/company data.
- Voice: precise finance analyst.
- Output: round history and timing prediction.

### Risk Analyst

- Purpose: identify risks, weak signals, competitive threats, and data gaps.
- Voice: skeptical partner.
- Output: risk assessment and confidence calibration.

### Synthesis / Investment Memo Agent

- Purpose: turn agent findings into final opportunity ranking and presentation
  segments.
- Voice: polished presenter.
- Output: final report.

## ElevenLabs Assumptions

- ElevenLabs should be called from backend.
- Backend returns `audioUrl` per presentation segment.
- Backend also returns clip-relative `wordTimings` so subtitles can reveal at
  the exact spoken word; use ElevenLabs timestamped generation or forced
  alignment against the final audio and script.
- Each subagent can have a distinct voice ID.
- Frontend should degrade gracefully to subtitles if audio is unavailable.
- Minimum demo target: at least two distinct voices working.

## Final Presentation Behavior

For each segment:

1. Orb enters or becomes active.
2. Agent name, role, and purpose appear.
3. Audio starts.
4. Subtitle words reveal at their audio-aligned timestamps (with a
   proportional fallback when timing data is unavailable).
5. Supporting data/image/evidence appears when available.
6. Next orb enters after segment completes.
