Title: Define shared frontend-backend contract and mock demo data

## Objective
- Create a shared contract and mock data set that lets frontend and backend
  develop independently without breaking the demo flow.

## Why
- The team has separate frontend/backend ownership and little time. A stable
  contract prevents Discord-driven schema drift.

## In Scope
- TypeScript contract for frontend.
- Backend model mirror or OpenAPI equivalent.
- Mock `Run` with query, 5 questions, 4 agents, events, scored opportunities,
  status labels, and final report segments.
- Example final report with placeholder audio URLs or no-audio fallback.
- Agreement on route names and status lifecycle.

## Out of Scope
- Production SDK generation.
- Deep schema validation tooling unless already available.

## Constraints
- Must be available early.
- Must be simple enough for all team members to understand.

## Tasks
1. Create `contract.ts` or equivalent shared schema.
2. Create `mockRun.ts` / `mock-report.json`.
3. Align backend response models to the same fields.
4. Document API endpoints and run lifecycle.
5. Review with all four team members.

## Acceptance Criteria
- Felipe can build chat/agent animation from mock run data.
- Marc can build final presentation/report list from mock report data.
- Backend can return the same shape from API endpoints.
- Any unresolved fields are marked optional.
- Mock opportunities include `goliathScore`, `status`, concise prediction,
  confidence, risk level, and evidence.

## Definition of Done
- One contract and one mock demo run are accepted by the full team.

## Dependencies / Notes
- Owners: all, with frontend/backend pair review.
- Start from `llm-wiki/backend-contract.md`.
