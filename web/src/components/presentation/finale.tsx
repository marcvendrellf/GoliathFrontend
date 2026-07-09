"use client";

import type { Opportunity } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { RotateCcw, TrendingUp } from "lucide-react";
import { STATUS_BADGE, STATUS_LABEL } from "./agents";

/**
 * Closing view shown after the last segment: opportunities ranked by Goliath
 * Score, plus replay / full-report actions.
 */
export function Finale({
  title,
  opportunities,
  onReplay,
}: {
  title: string;
  opportunities: Opportunity[];
  onReplay: () => void;
}) {
  const ranked = [...opportunities].sort(
    (a, b) => b.goliathScore - a.goliathScore,
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 py-12 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Briefing complete
        </p>
        <h2 className="text-3xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/50">
          Final ranking by Goliath Score
        </p>
      </div>

      <ol className="flex w-full flex-col gap-3 text-left">
        {ranked.map((opp, i) => (
          <li
            key={opp.id}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition-colors hover:border-white/20"
          >
            <span className="w-6 shrink-0 text-center text-lg font-semibold text-white/30">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">
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
                  <span className="text-xs text-white/40">{opp.sector}</span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
                <TrendingUp className="size-3.5 shrink-0 text-white/40" />
                {opp.prediction}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-semibold tabular-nums text-white">
                {opp.goliathScore}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-white/40">
                Goliath
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled
          title="Coming in the report detail view"
          className="cursor-not-allowed rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/40"
        >
          View full report
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
        >
          <RotateCcw className="size-4" />
          Replay briefing
        </button>
      </div>
    </div>
  );
}
