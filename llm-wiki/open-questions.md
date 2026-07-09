# Open Questions

## ROI and scoring

- Use a numeric `Goliath Score` from 0 to 100 for each investment opportunity.
- The score is a custom opportunity score, not a strict financial ROI
  guarantee.
- What factors matter most: sector growth, team quality, round timing, prior
  investors, location, valuation, traction, strategic fit, risk?
- Do we need a visible formula, or only natural-language explanation?

## User clarification questions

- Are the 5 questions generated dynamically or can they be templated?
- Should the user answer all 5 at once or one by one?
- What exact questions should be used for the demo scenario?

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

- Which current frontend repo should be used after the product pivot?
- Should the existing pixel scaffold be discarded or repurposed?
- What visual style should replace pixel art: command center, VC memo, graph,
  or orb-based presentation?
- Clarify what "LLM will be in the frontend" means operationally: browser-side
  model calls, frontend-owned prompt orchestration, or just frontend-owned LLM
  UX/chat state.

## GitHub issues

- Which GitHub repo(s) should receive the issues?
- Should issues be assigned to named team members or only owner-labeled?
