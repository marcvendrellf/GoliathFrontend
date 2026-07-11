# Repo LLM Wiki Contract

This planning workspace uses `llm-wiki/` for durable project context and
`issues/` for GitHub-ready issue drafts.

Before non-trivial work, read:

1. `llm-wiki/index.md`
2. `llm-wiki/overview.md`
3. Relevant linked topic pages
4. `llm-wiki/open-questions.md`
5. Recent entries in `llm-wiki/log.md`

Raw user decisions and implementation repos remain authoritative. Keep this
workspace focused on shared product requirements, contracts, and issue drafts.

## Git Workflow

- Use `dev` as the active integration branch.
- Create one branch per GitHub issue from `dev`.
- Use branch names like `issue-1-agent-chat` or
  `issue-2-final-presentation`.
- Pull requests should target `dev`.
- Keep `main` stable for demo-ready snapshots.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
