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
