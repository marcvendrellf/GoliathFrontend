# Demo polish and rehearsal

## Objective
- Make the end-to-end demo reliable and rehearsed before judging.

## Why
- The demo IS the deliverable; a broken autoplay or missing wifi asset kills
  an otherwise finished product.

## In Scope
- Full run-through: query → agent spawn → research → presentation → report.
- Audio unlock: presentation starts from an explicit user click (browsers
  block autoplay with sound).
- Offline resilience: download the Persona `.riv` animation files into
  `web/public/` and point the vendored component at them if venue wifi is a risk.
- Mock-fallback drill: rehearse the demo once with the backend killed.
- 3-minute demo script: who talks, which query, what to click.
- Freeze risky changes 30 minutes before demo.

## Out of Scope
- New features of any kind.

## Acceptance Criteria
- Two clean consecutive run-throughs (one real backend, one mock-only).
- Audio plays reliably after the initial click.
- Every team member knows the script.

## Dependencies / Notes
- Owner: all four.
- Depends on issues #1, #2, #3; #5 if backend is ready.
