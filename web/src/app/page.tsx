/**
 * Route: /
 * Owner: Felipe — GitHub issue #1 (orchestrator chat + live agent representation).
 *
 * Build here: query input, orchestrator chat, then navigate to /run/[runId]
 * after api.createRun(query). Use components under src/components/orchestrator/.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">Goliath</h1>
      <p className="text-muted-foreground">
        Your VC research team, assembled on demand.
      </p>
      <p className="text-sm text-muted-foreground">
        Issue #1 (Felipe): build the query input and orchestrator chat here.
      </p>
    </main>
  );
}
