"use client";

import type { Opportunity } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { RotateCcw, TrendingUp } from "lucide-react";
import { STATUS_BADGE, STATUS_LABEL } from "./agents";

/**
 * Closing section of the report: opportunities ranked by Goliath Score, plus
 * replay / full-report actions. Rendered as the final appended block of the
 * scrolling document (the report's conclusion), not a separate takeover.
 */
export function Finale({
  opportunities,
  onReplay,
}: {
  opportunities: Opportunity[];
  onReplay: () => void;
}) {
  const ranked = [...opportunities].sort(
    (a, b) => b.goliathScore - a.goliathScore,
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Conclusion · Ranked by Goliath Score
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          The opportunities
        </h2>
      </div>

      <ol className="flex w-full flex-col gap-3">
        {ranked.map((opp, i) => (
          <li
            key={opp.id}
            className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20"
          >
            <span className="w-6 shrink-0 text-center text-lg font-semibold tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">
                  {opp.startupName}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    STATUS_BADGE[opp.status],
                  )}
                >
                  {STATUS_LABEL[opp.status]}
                </span>
                {opp.sector && (
                  <span className="text-xs text-muted-foreground">
                    {opp.sector}
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <TrendingUp className="size-3.5 shrink-0" />
                {opp.prediction}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-semibold tabular-nums text-foreground">
                {opp.goliathScore}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Goliath
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RotateCcw className="size-4" />
          Replay briefing
        </button>
        <button
          type="button"
          disabled
          title="Coming in the report detail view"
          className="cursor-not-allowed rounded-full border px-5 py-2.5 text-sm font-medium text-muted-foreground"
        >
          View full report
        </button>
      </div>
    </section>
  );
}
