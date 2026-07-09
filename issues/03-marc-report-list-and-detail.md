Title: Build report list and opportunity detail review

## Objective
- Build the final report list and detail experience so users can review
  completed Goliath opportunity reports after the animated presentation.

## Why
- The presentation is the emotional payoff, but the report list/detail is the
  durable VC workflow: review opportunities, compare predictions, and inspect
  evidence.

## In Scope
- Report list page or panel.
- Report cards with query, timestamp, status, top opportunities, and confidence.
- Report detail view for one run.
- Opportunity cards with startup name, sector, stage, concise prediction,
  confidence, risk, Goliath Score, status, score reason, and evidence snippets.
- Link from completed run/presentation to report detail.
- Mock report data.

## Out of Scope
- Real authentication.
- Editing reports.
- Export to PDF/Notion/CRM.
- Backend persistence beyond consuming `GET /api/reports` if available.

## Constraints
- Must tolerate incomplete backend fields.
- Use `Goliath Score` from 0 to 100 unless the team explicitly changes it.

## Tasks
1. Create report list UI.
2. Create report detail UI.
3. Create opportunity card component.
4. Render evidence snippets and source labels.
5. Add mock reports and integration hooks.
6. Link from presentation completion to report detail/list.

## Acceptance Criteria
- User can see a list of completed reports.
- User can open a report and inspect opportunities.
- Each opportunity shows concise prediction, status, Goliath Score, risk,
  confidence, score reason, and evidence.
- UI works with mock data.

## Definition of Done
- Report list/detail is demoable independently of backend.
- The UI aligns with `FinalReport` and `Opportunity` contract types.

## Dependencies / Notes
- Owner: Marc.
- Goliath Score is locked as a 0-100 custom opportunity score; exact factors can
  remain simple/explainable.
