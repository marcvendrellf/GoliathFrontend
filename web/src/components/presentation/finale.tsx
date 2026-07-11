"use client";

import type { Opportunity } from "@/lib/contract";
import { RotateCcw } from "lucide-react";
import { STATUS_LABEL } from "./agents";

/**
 * Closing section of the report: opportunities ranked by Goliath Score, plus
 * replay action. Rendered as the final appended block of the scrolling document
 * (the report's conclusion), not a separate takeover.
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

      <ol className="flex w-full flex-col gap-6">
        {ranked.map((opp, i) => (
          <li key={opp.id} className="flex items-start gap-4">
            <span className="w-6 shrink-0 pt-0.5 text-center text-lg font-semibold tabular-nums text-muted-foreground/60">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-semibold text-foreground">
                  {opp.startupName}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {STATUS_LABEL[opp.status]}
                </span>
                {opp.sector && (
                  <span className="text-xs text-muted-foreground">
                    {opp.sector}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
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
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1d1d1d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
        >
          <RotateCcw className="size-4" />
          Replay briefing
        </button>
      </div>
    </section>
  );
}
