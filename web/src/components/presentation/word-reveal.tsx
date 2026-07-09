"use client";

import { cn } from "@/lib/utils";
import type { WordTiming } from "@/lib/contract";
import { useMemo } from "react";

type DisplayWord = Pick<WordTiming, "text"> & Partial<Pick<WordTiming, "startMs">>;

/**
 * Word-by-word text reveal.
 *
 * When the backend supplies audio-aligned word timings, words reveal at their
 * exact spoken offsets. Otherwise the existing progress-driven reveal remains
 * in place for mock data, missing alignment data, and audio failures.
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
  currentTimeMs,
  className,
}: {
  text: string;
  /** 0..1 position within the segment. Ignored when `active` is false. */
  progress: number;
  /** True only for the section currently being narrated. */
  active: boolean;
  /** Exact word offsets from the backend, measured from this clip's start. */
  wordTimings?: WordTiming[];
  /** Current playback position. Omit to use proportional progress fallback. */
  currentTimeMs?: number;
  className?: string;
}) {
  const fallbackWords: DisplayWord[] = useMemo(
    () => text.split(/\s+/).filter(Boolean).map((word) => ({ text: word })),
    [text],
  );
  const words: DisplayWord[] = wordTimings?.length ? wordTimings : fallbackWords;
  const usesTimings = active && currentTimeMs !== undefined && Boolean(wordTimings?.length);

  // How many words should be lit. Completed sections show everything; the
  // active section reveals proportionally to progress. We nudge by 1 so the
  // first word lights up immediately and the last word lands slightly before
  // progress hits exactly 1 (audio/timer end), avoiding a trailing dim word.
  const revealed = active
    ? Math.min(words.length, Math.floor(progress * words.length) + 1)
    : words.length;

  return (
    <p className={cn("text-lg leading-relaxed sm:text-xl", className)}>
      {words.map((word, i) => (
        <span
          key={`${word.text}-${i}`}
          className="transition-opacity duration-500 ease-out"
          style={{
            opacity:
              !active ||
              (usesTimings &&
                word.startMs !== undefined &&
                currentTimeMs !== undefined &&
                currentTimeMs >= word.startMs) ||
              (!usesTimings && i < revealed)
                ? 1
                : 0.15,
          }}
        >
          {word.text}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
