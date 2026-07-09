"use client";

import type { Evidence } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";

const SOURCE_LABEL: Record<Evidence["source"], string> = {
  cala: "Cala",
  news: "News",
  web: "Web",
  manual: "Manual",
};

/**
 * Side panel listing the evidence referenced by the active segment. Renders
 * nothing when there is no evidence and no supporting image.
 */
export function EvidencePanel({
  evidence,
  imageUrl,
  className,
}: {
  evidence: Evidence[];
  imageUrl?: string;
  className?: string;
}) {
  if (evidence.length === 0 && !imageUrl) return null;

  return (
    <aside
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur",
        className,
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Evidence
      </h3>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Supporting chart"
          className="w-full rounded-lg border border-white/10 object-cover"
        />
      )}

      <ul className="flex flex-col gap-2">
        {evidence.map((ev) => (
          <li
            key={ev.id}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-white/20"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 shrink-0 text-white/40" />
              <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
                {SOURCE_LABEL[ev.source]}
              </span>
              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-white/40 transition-colors hover:text-white/80"
                  aria-label="Open source"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            <p className="mt-1.5 text-sm font-medium leading-snug text-white/90">
              {ev.title}
            </p>
            {ev.snippet && (
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {ev.snippet}
              </p>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
