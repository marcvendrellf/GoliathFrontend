/**
 * Route: /reports/[runId]
 * Owner: Marc — GitHub issues #2 (narrated presentation) and #3 (report detail).
 *
 * Build here: api.getReport(runId) → FinalPresentation (orbs enter one at a
 * time, ElevenLabs audioUrl playback, subtitles from segment.script, evidence
 * panel) plus the opportunity detail view. Components under
 * src/components/presentation/ and src/components/reports/.
 */
export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-xl font-medium">Report {runId}</h1>
      <p className="text-sm text-muted-foreground">
        Issues #2 and #3 (Marc): final presentation and opportunity detail go
        here.
      </p>
    </main>
  );
}
