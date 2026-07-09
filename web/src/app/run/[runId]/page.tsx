/**
 * Route: /run/[runId]
 * Owner: Felipe — GitHub issue #1 (live agent research stage).
 *
 * Build here: poll api.getRun(runId) every 1-2s, render AgentOrb per
 * AgentPlan, animate spawn on `agent.spawned` events, show the RunEvent
 * activity feed, and hand off to /reports/[runId] when status === "complete".
 * With no backend configured, getRun replays a mock 18s timeline (mockRunAt).
 */
export default async function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-xl font-medium">Research run {runId}</h1>
      <p className="text-sm text-muted-foreground">
        Issue #1 (Felipe): live agent orbs + activity feed go here.
      </p>
    </main>
  );
}
