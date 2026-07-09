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
 * Compact, inline evidence for a report section. Rendered *within* the section
 * it supports (a bordered card list), light-themed to match the document.
 * Renders nothing when there is no evidence and no supporting image.
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
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Evidence
      </h3>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Supporting chart"
          className="w-full rounded-lg border border-[#dedede] object-cover"
        />
      )}

      {evidence.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {evidence.map((ev) => (
            <li
              key={ev.id}
              className="rounded-lg border border-[#dedede] bg-card p-3 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="rounded-full border border-[#dedede] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {SOURCE_LABEL[ev.source]}
                </span>
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Open source"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
                {ev.title}
              </p>
              {ev.snippet && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {ev.snippet}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
