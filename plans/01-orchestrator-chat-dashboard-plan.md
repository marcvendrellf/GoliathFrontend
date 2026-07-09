# Plan — Goliath Chat Dashboard (Remaining Work Only)

Work only in `web/` on `dev` in the main repo:
`/Users/felipetrejos/Developer/Personal/hackathons/GoliathFrontend`.

No worktrees. The Claude worktree under `.claude/worktrees/` has been removed.
`reference/sim/` is a gitignored source checkout for copying UI patterns; leave it
as read-only reference material.

Changes so far are uncommitted in the `dev` working tree. Verify from `web/` with:

```bash
pnpm build
pnpm exec tsc --noEmit
```

## Already Done

- Sim-style foundation is in place: Tailwind v3.4, Sim `tailwind.config.ts`,
  Sim-style `postcss.config.mjs`, Sim `globals.css`, light theme.
- Sim packages are vendored/aliased under `web/src/vendor/`:
  `@sim/emcn`, `@sim/workflow-renderer`, `@sim/utils`.
- Dependencies for the Sim-style UI are installed (`reactflow@11`, radix set,
  `lucide-react@0.479`, `streamdown`, `input-otp`, `prismjs`,
  `react-virtual`, `remark-breaks`).
- Workspace chrome exists:
  `web/src/components/workspace/workspace-shell.tsx`
  and `web/src/components/workspace/sidebar.tsx`.
- Goliath mock contract/data/client are preserved:
  `web/src/lib/contract.ts`,
  `web/src/lib/mock/mock-run.ts`,
  `web/src/lib/api.ts`,
  `web/src/lib/goliath/nav-data.ts`.
- Canvas work has started:
  `web/src/components/canvas/agent-node.tsx` renders a Goliath agent as a real
  Sim `WorkflowBlockView`.

## Still Missing

### R4 — Center Chat Panel

Create `web/src/components/chat/`.

Copy/adapt the relevant Sim chat leaves from:

```txt
reference/sim/apps/sim/app/workspace/[workspaceId]/home/
```

Use:

- `components/mothership-chat`
- `components/message-content`
- `components/message-content/components/chat-content`
- `components/message-content/components/agent-group`
- `components/message-content/components/options`
- `components/message-content/components/special-tags`
- `components/user-message-content`
- `components/user-input`
- `components/suggested-actions`
- `types.ts`

Important simplifications:

- Keep the Sim look, but make it self-contained.
- Drop mentions, skills, mic, attachments, server streaming, Redis,
  React Query, and global stores.
- Add a local `use-mock-chat.ts` driver that emits Sim-compatible content blocks
  from the Goliath mock data.
- The chat should seed a demo conversation for:
  `Show me startup opportunities of investment in Barcelona related to AI.`
- On submit, the chat should call a callback such as `onRunCreated(runId)` or
  `onRunStarted(run)` so the page can start polling/replaying the mock run.
- Export `ChatPanel`, designed to fill the center pane.

### R5 — Finish Workflow Canvas

Complete `web/src/components/canvas/`.

Already present:

- `agent-node.tsx`

Add:

- `graph-from-run.ts`: builds ReactFlow nodes/edges from a `Run`.
  Include one orchestrator node plus one node per `AgentPlan`, with edges from
  orchestrator to each agent.
- `workflow-canvas.tsx`: registers the `AgentNode`, renders `ReactFlow`,
  `Background`, `Controls`, and `fitView`, and accepts `run?: Run`.

Notes:

- Use `AgentNode` as the node renderer; do not bring the old orb/Rive UI back.
- Keep node status driven by `AgentPlan.status` from `mockRunAt`.
- The current `web/src/app/page.tsx` still has placeholder ReactFlow nodes and
  should be replaced in R6.

### R6 — Compose, Wire, Verify

Rewrite `web/src/app/page.tsx` as a client page:

- `WorkspaceShell` + `Sidebar`.
- Main content split: center `ChatPanel`, right `WorkflowCanvas`.
- When chat submits, call `createRun(query)` from `web/src/lib/api.ts`.
- Poll `getRun(runId)` every 1-2 seconds until status is `complete` or `error`.
- Pass the current `Run` to `WorkflowCanvas`.
- Show a clear completion CTA to `/reports/[runId]`.
- Keep `/reports` routes for Marc; do not delete report files.

Verification:

- Run `pnpm build`.
- Run `pnpm exec tsc --noEmit`.
- Start `pnpm dev`, inspect the page, and take a screenshot.
- Compare visually against Sim's light workspace/chat/canvas feel.

## Prompt For The Next Agent

```txt
You are taking over the Goliath hackathon frontend in
/Users/felipetrejos/Developer/Personal/hackathons/GoliathFrontend.

Read AGENTS.md, then read llm-wiki/index.md, llm-wiki/overview.md,
llm-wiki/frontend-plan.md, llm-wiki/backend-contract.md,
llm-wiki/ui-foundation.md, llm-wiki/open-questions.md, and the latest
llm-wiki/log.md entries.

Then read plans/01-orchestrator-chat-dashboard-plan.md and implement only the
remaining web work:

1. R4: create web/src/components/chat/ by adapting the listed Sim chat leaf
   components from reference/sim/apps/sim/app/workspace/[workspaceId]/home/.
   Keep the Sim visual style but replace Sim's backend hooks with a local
   use-mock-chat.ts driver.
2. R5: finish web/src/components/canvas/ by adding graph-from-run.ts and
   workflow-canvas.tsx around the existing agent-node.tsx.
3. R6: rewrite web/src/app/page.tsx to compose WorkspaceShell + Sidebar +
   ChatPanel + WorkflowCanvas, submit via createRun(), poll getRun(), animate
   the 18s mock timeline, and link completion to /reports/[runId].

Do not use worktrees or subagents. Do not revive the old orb/Rive UI. Work only
inside web/ unless you must update this plan. Preserve web/src/lib/contract.ts,
web/src/lib/mock/mock-run.ts, web/src/lib/api.ts, and the /reports routes.

Before finishing, run from web/:
pnpm build
pnpm exec tsc --noEmit

If you start a dev server, provide the local URL and note any visual gaps.
```
