"use client";

import { AgentOrb } from "@/components/agents/agent-orb";
import {
  ScrubBarContainer,
  ScrubBarProgress,
  ScrubBarThumb,
  ScrubBarTimeLabel,
  ScrubBarTrack,
} from "@/components/ui/scrub-bar";
import type { AgentPlan, Evidence, FinalReport } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildEvidenceMap, deriveAgents } from "./agents";
import { EvidencePanel } from "./evidence-panel";
import { Finale } from "./finale";
import { WordReveal } from "./word-reveal";

const DEFAULT_SEGMENT_MS = 8000;

/** Sim brand accent. Used sparingly for active markers, progress, primary CTA. */
const ACCENT = "#33c482";

type Phase = "idle" | "playing" | "finished";

export function FinalPresentation({ report }: { report: FinalReport }) {
  const agents = useMemo(() => deriveAgents(report), [report]);
  const evidenceMap = useMemo(() => buildEvidenceMap(report), [report]);
  const segments = report.segments;

  /** First segment index at which each agent speaks. Drives orb entrance. */
  const firstSpeakAt = useMemo(() => {
    const m = new Map<string, number>();
    segments.forEach((s, i) => {
      if (!m.has(s.agentId)) m.set(s.agentId, i);
    });
    return m;
  }, [segments]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 within current segment
  const [durationSec, setDurationSec] = useState(DEFAULT_SEGMENT_MS / 1000);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const durationSecRef = useRef(DEFAULT_SEGMENT_MS / 1000);
  // Timer fallback bookkeeping (so pause/resume preserves remaining time).
  const timer = useRef<{
    id: number;
    startedAt: number;
    remaining: number;
    total: number;
  } | null>(null);

  const activeSectionRef = useRef<HTMLElement | null>(null);
  const finaleRef = useRef<HTMLDivElement | null>(null);

  const currentSegment = segments[index];

  const setDuration = useCallback((sec: number) => {
    durationSecRef.current = sec;
    setDurationSec(sec);
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i >= segments.length - 1) {
        setPhase("finished");
        return i;
      }
      return i + 1;
    });
  }, [segments.length]);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current.id);
      timer.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    clearTimer();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, [clearTimer]);

  // Set up playback whenever we enter a new segment while playing.
  useEffect(() => {
    if (phase !== "playing" || !currentSegment) return;

    setProgress(0);
    const durationMs = currentSegment.durationMs ?? DEFAULT_SEGMENT_MS;
    setDuration(durationMs / 1000);

    const startTimerFallback = (ms: number) => {
      const startedAt = Date.now();
      const id = window.setTimeout(advance, ms);
      timer.current = { id, startedAt, remaining: ms, total: ms };
      setDuration(ms / 1000);
    };

    if (currentSegment.audioUrl) {
      const audio = new Audio(currentSegment.audioUrl);
      audioRef.current = audio;
      audio.onended = advance;
      audio.onloadedmetadata = () => {
        if (audio.duration > 0) setDuration(audio.duration);
      };
      audio.onerror = () => {
        // Audio failed to load/play. Fall back to the silent timer.
        audioRef.current = null;
        startTimerFallback(durationMs);
      };
      audio.play().catch(() => {
        audioRef.current = null;
        startTimerFallback(durationMs);
      });
    } else {
      startTimerFallback(durationMs);
    }

    // Progress ticker. Drives both the scrub bar and the word-by-word reveal.
    // Frozen while paused so the reveal stops advancing.
    const tick = () => {
      if (!pausedRef.current) {
        const audio = audioRef.current;
        if (audio && audio.duration > 0) {
          setProgress(Math.min(1, audio.currentTime / audio.duration));
        } else if (timer.current) {
          const t = timer.current;
          const remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
          setProgress(Math.min(1, (t.total - remaining) / t.total));
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return teardown;
    // Re-run when the active segment changes or playback (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  // Pause / resume without tearing down the current segment.
  useEffect(() => {
    pausedRef.current = paused;
    if (phase !== "playing") return;

    if (paused) {
      if (audioRef.current) audioRef.current.pause();
      if (timer.current) {
        const t = timer.current;
        window.clearTimeout(t.id);
        t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
      }
    } else {
      if (audioRef.current) audioRef.current.play().catch(() => {});
      if (timer.current) {
        const t = timer.current;
        t.startedAt = Date.now();
        t.id = window.setTimeout(advance, t.remaining);
      }
    }
  }, [paused, phase, advance]);

  useEffect(() => teardown, [teardown]);

  // Auto-scroll: keep the section being written (or the finale) in view.
  useEffect(() => {
    if (phase === "idle") return;
    const el = phase === "finished" ? finaleRef.current : activeSectionRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [phase, index]);

  // Seek to an absolute time (seconds) within the current segment.
  //   Audio path: set audio.currentTime, the ticker picks up the new progress.
  //   Timer path: rewrite the timer bookkeeping so the segment still ends at
  //   the correct wall-clock moment, and jump the reveal to the new fraction.
  //   Paused in either path: fraction is applied to progress but stays paused.
  const seek = useCallback(
    (timeSec: number) => {
      const dur = durationSecRef.current;
      if (dur <= 0) return;
      const fraction = Math.min(1, Math.max(0, timeSec / dur));

      const audio = audioRef.current;
      if (audio && audio.duration > 0) {
        audio.currentTime = fraction * audio.duration;
      } else if (timer.current) {
        const t = timer.current;
        t.remaining = Math.max(0, Math.round(t.total * (1 - fraction)));
        if (!pausedRef.current) {
          window.clearTimeout(t.id);
          t.startedAt = Date.now();
          t.id = window.setTimeout(advance, t.remaining);
        }
      }
      setProgress(fraction);
    },
    [advance],
  );

  const start = () => {
    setIndex(0);
    setPaused(false);
    setPhase("playing");
  };

  const replay = () => {
    teardown();
    setIndex(0);
    setPaused(false);
    setProgress(0);
    setPhase("playing");
  };

  const skip = () => {
    teardown();
    setPaused(false);
    advance();
  };

  const activeAgentId = phase === "playing" ? currentSegment?.agentId : undefined;

  // Orbs that have entered the stage: any agent whose first segment has started.
  // Sorted by first appearance so they fill the row left to right in order.
  const enteredAgents: AgentPlan[] =
    phase === "idle"
      ? []
      : agents
          .filter((a) => (firstSpeakAt.get(a.id) ?? Infinity) <= index)
          .sort(
            (a, b) =>
              (firstSpeakAt.get(a.id) ?? 0) - (firstSpeakAt.get(b.id) ?? 0),
          );

  const evidenceFor = (segment: (typeof segments)[number]): Evidence[] =>
    segment.evidenceIds
      .map((id) => evidenceMap.get(id))
      .filter((e): e is Evidence => Boolean(e));

  // Sections written so far (append-only), oldest first.
  const visibleSegments = segments.slice(0, index + 1);

  if (phase === "idle") {
    return (
      <div className="min-h-screen w-full bg-white text-foreground">
        <IdleView
          title={report.title}
          summary={report.executiveSummary}
          onStart={start}
          segmentCount={segments.length}
        />
      </div>
    );
  }

  const elapsedSec = progress * durationSec;

  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      {/* Sticky header band: the orb stage. */}
      <header className="sticky top-0 z-10 border-b border-[#dedede] bg-white/85 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-6 py-4">
          <div className="flex min-h-[92px] items-end justify-center gap-8">
            {enteredAgents.map((agent) => {
              const orbIndex = agents.indexOf(agent);
              return (
                <StageOrb
                  key={agent.id}
                  agent={{
                    ...agent,
                    status: agent.id === activeAgentId ? "speaking" : "done",
                  }}
                  orbIndex={orbIndex}
                  active={agent.id === activeAgentId}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* The report: sections accumulate top-to-bottom as agents speak. */}
      <main className="mx-auto w-full max-w-3xl px-6 pb-48 pt-8">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Goliath · Investor briefing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {report.title}
          </h1>
        </div>

        <div className="flex flex-col divide-y divide-[#dedede]">
          {visibleSegments.map((segment, i) => {
            const isActive = phase === "playing" && i === index;
            const agent = agents.find((a) => a.id === segment.agentId);
            return (
              <section
                key={segment.id}
                ref={isActive ? activeSectionRef : undefined}
                className={cn(
                  "flex flex-col gap-4 border-l-2 py-8 pl-5 transition-colors first:pt-0",
                  isActive ? "border-l-[#33c482]" : "border-l-transparent",
                )}
              >
                {agent && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {agent.name}
                    <span className="mx-1.5 text-[#dedede]">/</span>
                    <span className="font-medium normal-case tracking-normal">
                      {agent.role}
                    </span>
                  </p>
                )}

                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {segment.title}
                  </h2>
                  {segment.subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {segment.subtitle}
                    </p>
                  )}
                </div>

                <WordReveal
                  text={segment.script}
                  progress={isActive ? progress : 1}
                  active={isActive}
                  className="text-foreground/90"
                />

                <EvidencePanel
                  evidence={evidenceFor(segment)}
                  imageUrl={segment.imageUrl}
                  className="mt-1"
                />
              </section>
            );
          })}

          {phase === "finished" && (
            <div ref={finaleRef} className="border-l-2 border-l-transparent py-8 pl-5">
              <Finale opportunities={report.opportunities} onReplay={replay} />
            </div>
          )}
        </div>
      </main>

      {/* Floating playback dock: the single control surface. */}
      <PlaybackDock
        phase={phase}
        paused={paused}
        onToggle={() => setPaused((p) => !p)}
        onSkip={skip}
        onReplay={replay}
        index={index}
        total={segments.length}
        elapsedSec={elapsedSec}
        durationSec={durationSec}
        onSeek={seek}
      />
    </div>
  );
}

/**
 * Floating, centered playback dock, fixed at the bottom of the viewport.
 * White pill with a #dedede hairline. Composes the ElevenLabs scrub bar and
 * drives play/pause, skip, replay, and seek for both audio and timer segments.
 */
function PlaybackDock({
  phase,
  paused,
  onToggle,
  onSkip,
  onReplay,
  index,
  total,
  elapsedSec,
  durationSec,
  onSeek,
}: {
  phase: Phase;
  paused: boolean;
  onToggle: () => void;
  onSkip: () => void;
  onReplay: () => void;
  index: number;
  total: number;
  elapsedSec: number;
  durationSec: number;
  onSeek: (time: number) => void;
}) {
  const playing = phase === "playing";
  const isLast = index >= total - 1;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex w-[min(92vw,560px)] items-center gap-3 rounded-xl border border-[#dedede] bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            disabled={!playing}
            aria-label={paused ? "Resume" : "Pause"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#33c482] text-white transition-colors hover:bg-[#2dac72] disabled:pointer-events-none disabled:opacity-50"
          >
            {paused || !playing ? (
              <Play className="size-4" />
            ) : (
              <Pause className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={!playing}
            aria-label={isLast ? "Finish briefing" : "Skip to next segment"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#f2f2f2] hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <SkipForward className="size-4" />
          </button>
          <button
            type="button"
            onClick={onReplay}
            aria-label="Replay from the start"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#f2f2f2] hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>

        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          Segment {Math.min(index + 1, total)} / {total}
        </span>

        <ScrubBarContainer
          duration={durationSec}
          value={elapsedSec}
          onScrub={onSeek}
          className="flex-1 items-center gap-2"
        >
          <ScrubBarTimeLabel
            time={elapsedSec}
            className="shrink-0 text-[11px] text-muted-foreground"
          />
          <ScrubBarTrack className="bg-[#ededed]">
            <ScrubBarProgress className="inset-0 h-full w-full [&_[data-slot=progress-indicator]]:bg-[#33c482] [&_[data-slot=progress-track]]:h-full [&_[data-slot=progress-track]]:bg-transparent" />
            <ScrubBarThumb className="bg-[#33c482]" />
          </ScrubBarTrack>
          <ScrubBarTimeLabel
            time={durationSec}
            className="shrink-0 text-[11px] text-muted-foreground"
          />
        </ScrubBarContainer>
      </div>
    </div>
  );
}

/**
 * A single orb entering the stage. Mounts in its off-screen (translated left,
 * transparent) state, then transitions to resting position on the next frame.
 * Every orb enters from the left and takes the next slot in the row. Purely CSS
 * transitions, no animation libraries.
 */
function StageOrb({
  agent,
  orbIndex,
  active,
}: {
  agent: AgentPlan;
  orbIndex: number;
  active: boolean;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        transform: entered
          ? `translateX(0) scale(${active ? 1.05 : 0.92})`
          : "translateX(-2rem) scale(0.92)",
        opacity: entered ? (active ? 1 : 0.6) : 0,
      }}
    >
      <div
        className={cn(
          "rounded-full transition-shadow duration-500",
          active && "ring-2 ring-[#33c482]/40 ring-offset-2 ring-offset-white",
        )}
      >
        <AgentOrb agent={agent} index={orbIndex} size="sm" />
      </div>
    </div>
  );
}

function IdleView({
  title,
  summary,
  onStart,
  segmentCount,
}: {
  title: string;
  summary: string;
  onStart: () => void;
  segmentCount: number;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Goliath · Investor briefing
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
        {summary}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-[#33c482] px-6 text-sm font-medium text-white transition-colors hover:bg-[#2dac72]"
      >
        <Play className="size-4" />
        Start briefing
      </button>
      <p className="text-xs text-muted-foreground/70">
        {segmentCount} segments, narrated with subtitles
      </p>
    </div>
  );
}
