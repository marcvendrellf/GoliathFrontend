"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Evidence } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const SOURCE_LABEL: Record<Evidence["source"], string> = {
  cala: "Cala",
  news: "News",
  web: "Web",
  manual: "Manual",
};

/**
 * Compact, inline evidence for a report section. Rendered *within* the section
 * it supports as a tidy vertical list of flat cards (hairline border, no
 * shadow), light-themed to match the document. Renders nothing when there is no
 * evidence and no supporting image.
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
        <ul className="flex flex-col gap-2">
          {evidence.map((ev) => (
            <li key={ev.id}>
              <Card
                size="sm"
                className="gap-2 rounded-lg border border-[#dedede] bg-white p-3 ring-0"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-[#dedede] text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {SOURCE_LABEL[ev.source]}
                  </Badge>
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
                <p className="text-sm font-medium leading-snug text-foreground">
                  {ev.title}
                </p>
                {ev.snippet && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {ev.snippet}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
