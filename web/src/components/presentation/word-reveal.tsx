"use client";

import { cn } from "@/lib/utils";
import type { TranscriptWord } from "@/lib/contract";
import { useMemo } from "react";

/**
 * Word-by-word text reveal.
 *
 * The reveal is *driven* by a `progress` fraction (0..1), not by an internal
 * timer. The parent's sequencing engine already computes progress from either
 * the playing HTMLAudioElement's `currentTime / duration` or the silent timer
 * fallback, so pausing the segment freezes `progress` and therefore freezes the
 * reveal for free. This also keeps the component ready for the upcoming
 * ElevenLabs issue: feed it audio-derived progress and nothing else changes.
 *
 * - `active`  → words fill in as `progress` climbs; unrevealed words sit at a
 *               low resting opacity and CSS-transition to full opacity.
 * - inactive  → the section is complete (already narrated, or skipped), so every
 *               word renders fully opaque.
 */
export function WordReveal({
  text,
  progress,
  active,
  wordTimings,
  durationMs,
  className,
}: {
  text: string;
  /** 0..1 position within the segment. Ignored when `active` is false. */
  progress: number;
  /** True only for the section currently being narrated. */
  active: boolean;
  wordTimings?: TranscriptWord[];
  durationMs?: number;
  className?: string;
}) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const elapsedMs = progress * (durationMs ?? 0);
  const hasUsableTimings =
    Boolean(durationMs) && wordTimings?.length === words.length;

  // How many words should be lit. Completed sections show everything; the
  // active section reveals proportionally to progress. We nudge by 1 so the
  // first word lights up immediately and the last word lands slightly before
  // progress hits exactly 1 (audio/timer end), avoiding a trailing dim word.
  const revealed = active
    ? hasUsableTimings
      ? wordTimings!.filter((word) => word.startMs <= elapsedMs).length
      : Math.min(words.length, Math.floor(progress * words.length) + 1)
    : words.length;

  return (
    <p className={cn("text-lg leading-relaxed sm:text-xl", className)}>
      {words.map((word, i) => (
        <span
          key={i}
          className="transition-opacity duration-500 ease-out"
          style={{ opacity: i < revealed ? 1 : 0.15 }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
