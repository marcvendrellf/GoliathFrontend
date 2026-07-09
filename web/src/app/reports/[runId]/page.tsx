/**
 * Route: /reports/[runId]
 * Owner: Marc — GitHub issue #2 (narrated presentation).
 *
 * Fetches the FinalReport via api.getReport(runId) (mock-backed when no
 * backend is configured) and hands it to the client FinalPresentation, which
 * runs the narrated multi-agent briefing (orbs, audio/subtitle sequencing,
 * evidence panel, finale). Issue #3 will add the opportunity detail view.
 */
import { FinalPresentation } from "@/components/presentation/final-presentation";
import { getReport } from "@/lib/api";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const report = await getReport(runId);
  return <FinalPresentation report={report} />;
}
