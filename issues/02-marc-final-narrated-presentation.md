Title: Build final narrated multi-agent presentation

## Objective
- Build the final report presentation where subagent orbs enter one at a time,
  speak with ElevenLabs audio, and display subtitles plus supporting evidence.

## Why
- This is the final demo payoff: the research team presents its findings like a
  polished VC briefing instead of showing a plain text answer.

## In Scope
- Presentation view for a completed run.
- Animated agent orbs entering and becoming active one by one.
- Playback of `PresentationSegment.audioUrl` when available.
- Subtitle display for the active segment.
- Segment title, agent role, and purpose.
- Evidence/data/image panel when segment data is available.
- Graceful fallback when audio is missing.
- Replay or restart presentation control if time allows.

## Out of Scope
- Generating ElevenLabs audio.
- Backend opportunity discovery.
- Initial orchestrator chat.
- Long-term report persistence.

## Constraints
- Must work from mock `FinalReport` data.
- Audio secrets must not be used in the frontend.
- If audio timing is unavailable, use segment-level subtitles rather than
  word-level sync.

## Tasks
1. Create `FinalPresentation` view/component.
2. Define mock `FinalReport` with several `PresentationSegment`s.
3. Render subagent orbs and active segment state.
4. Implement segment sequencing.
5. Play audio URL when present.
6. Display subtitles and evidence for the active segment.
7. Add fallback behavior for missing/failed audio.

## Acceptance Criteria
- A completed report can be presented as multiple agent-led segments.
- Only one subagent is active/speaking at a time.
- Subtitles are visible while the segment is active.
- Audio plays when `audioUrl` exists.
- Missing audio still produces a polished silent/subtitle presentation.

## Definition of Done
- Marc can demo the final presentation without backend by using mock data.
- The component can consume backend `FinalReport` data with minimal changes.

## Dependencies / Notes
- See `llm-wiki/agents-and-voices.md`.
- Owner: Marc.
