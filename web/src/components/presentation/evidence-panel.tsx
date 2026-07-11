"use client";

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
 * Understated footnote-style evidence for a report section. Plain text lines,
 * no cards, borders, or badges, so the references support the narrative
 * without competing with it. Renders nothing when there is no evidence and no
 * supporting image.
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
    <div className={cn("flex flex-col gap-2", className)}>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Supporting chart"
          className="w-full max-w-md rounded-lg border border-[#dedede] object-cover"
        />
      )}

      {evidence.length > 0 && (
        <ul className="flex flex-col gap-1">
          {evidence.map((ev) => (
            <li
              key={ev.id}
              className="text-xs leading-relaxed text-muted-foreground"
            >
              <span className="font-medium text-foreground/70">{ev.title}</span>
              <span className="mx-1.5 text-[#dedede]">·</span>
              {SOURCE_LABEL[ev.source]}
              {ev.snippet && <span> · {ev.snippet}</span>}
              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1.5 inline-flex align-middle text-muted-foreground/70 transition-colors hover:text-foreground"
                  aria-label="Open source"
                >
                  <ExternalLink className="size-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
