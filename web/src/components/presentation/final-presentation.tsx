"use client";

import { AgentOrb } from "@/components/agents/agent-orb";
import type { AgentPlan, Evidence, FinalReport } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { Pause, Play, SkipForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildEvidenceMap, deriveAgents } from "./agents";
import { EvidencePanel } from "./evidence-panel";
import { Finale } from "./finale";
import { WordReveal } from "./word-reveal";

const DEFAULT_SEGMENT_MS = 8000;

type Phase = "idle" | "playing" | "finished";

export function FinalPresentation({ report }: { report: FinalReport }) {
  const agents = useMemo(() => deriveAgents(report), [report]);
  const evidenceMap = useMemo(() => buildEvidenceMap(report), [report]);
  const segments = report.segments;

  /** First segment index at which each agent speaks — drives orb entrance. */
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
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
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, [clearTimer]);

  // Set up playback whenever we enter a new segment while playing.
  useEffect(() => {
    if (phase !== "playing" || !currentSegment) return;

    setProgress(0);
    const durationMs = currentSegment.durationMs ?? DEFAULT_SEGMENT_MS;

    const startTimerFallback = (ms: number) => {
      const startedAt = Date.now();
      const id = window.setTimeout(advance, ms);
      timer.current = { id, startedAt, remaining: ms, total: ms };
    };

    if (currentSegment.audioUrl) {
      const audio = new Audio(currentSegment.audioUrl);
      audioRef.current = audio;
      audio.onended = advance;
      audio.onerror = () => {
        // Audio failed to load/play → silent fallback on the timer.
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

    // Progress ticker. Drives both the header bar and the word-by-word reveal.
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
  const enteredAgents: AgentPlan[] =
    phase === "idle"
      ? []
      : agents.filter((a) => (firstSpeakAt.get(a.id) ?? Infinity) <= index);

  const evidenceFor = (segment: (typeof segments)[number]): Evidence[] =>
    segment.evidenceIds
      .map((id) => evidenceMap.get(id))
      .filter((e): e is Evidence => Boolean(e));

  // Sections written so far (append-only), oldest first.
  const visibleSegments = segments.slice(0, index + 1);

  if (phase === "idle") {
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        <IdleView
          title={report.title}
          summary={report.executiveSummary}
          onStart={start}
          segmentCount={segments.length}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Sticky header band: orb stage + transport controls */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
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
                  direction={orbIndex % 2 === 0 ? "left" : "right"}
                  active={agent.id === activeAgentId}
                />
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4">
            {phase === "playing" ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {paused ? (
                      <>
                        <Play className="size-4" /> Resume
                      </>
                    ) : (
                      <>
                        <Pause className="size-4" /> Pause
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={skip}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    <SkipForward className="size-4" />
                    {index >= segments.length - 1 ? "Finish" : "Skip"}
                  </button>
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-150 ease-linear"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    Segment {index + 1} / {segments.length}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Briefing complete
              </span>
            )}
          </div>
        </div>
      </header>

      {/* The report: sections accumulate top-to-bottom as agents speak. */}
      <main className="mx-auto w-full max-w-3xl px-6 pb-40 pt-8">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Goliath · Investor briefing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {report.title}
          </h1>
        </div>

        <div className="flex flex-col divide-y">
          {visibleSegments.map((segment, i) => {
            const isActive = phase === "playing" && i === index;
            const agent = agents.find((a) => a.id === segment.agentId);
            return (
              <section
                key={segment.id}
                ref={isActive ? activeSectionRef : undefined}
                className="flex flex-col gap-4 py-8 first:pt-0"
              >
                {agent && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {agent.name}
                    <span className="mx-1.5 text-border">/</span>
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
            <div ref={finaleRef} className="py-8">
              <Finale opportunities={report.opportunities} onReplay={replay} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * A single orb entering the stage. Mounts in its off-screen (translated,
 * transparent) state, then transitions to resting position on the next frame —
 * first orb from the left, second from the right, alternating. Purely CSS
 * transitions; no animation libraries.
 */
function StageOrb({
  agent,
  orbIndex,
  direction,
  active,
}: {
  agent: AgentPlan;
  orbIndex: number;
  direction: "left" | "right";
  active: boolean;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const offset = direction === "left" ? "-2rem" : "2rem";

  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        transform: entered
          ? `translateX(0) scale(${active ? 1.05 : 0.92})`
          : `translateX(${offset}) scale(0.92)`,
        opacity: entered ? (active ? 1 : 0.6) : 0,
      }}
    >
      <div
        className={cn(
          "rounded-full transition-shadow duration-500",
          active && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
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
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Play className="size-4" />
        Start briefing
      </button>
      <p className="text-xs text-muted-foreground/70">
        {segmentCount} segments · narrated with subtitles
      </p>
    </div>
  );
}
