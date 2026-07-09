/**
 * Route: /reports
 * Owner: Marc — GitHub issue #3 (report list).
 *
 * Build here: api.getReports() → report cards (query, timestamp, status, top
 * opportunities with Goliath Score). Link each card to /reports/[runId].
 */
export default function ReportsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-xl font-medium">Reports</h1>
      <p className="text-sm text-muted-foreground">
        Issue #3 (Marc): report list goes here.
      </p>
    </main>
  );
}
