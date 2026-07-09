"use client";

import { AgentOrb } from "@/components/agents/agent-orb";
import type { AgentPlan, Evidence, FinalReport } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { Pause, Play, SkipForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildEvidenceMap, deriveAgents } from "./agents";
import { EvidencePanel } from "./evidence-panel";
import { Finale } from "./finale";

const DEFAULT_SEGMENT_MS = 8000;

type Phase = "idle" | "playing" | "finished";

export function FinalPresentation({ report }: { report: FinalReport }) {
  const agents = useMemo(() => deriveAgents(report), [report]);
  const evidenceMap = useMemo(() => buildEvidenceMap(report), [report]);
  const segments = report.segments;

  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 within current segment

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  // Timer fallback bookkeeping (so pause/resume preserves remaining time).
  const timer = useRef<{ id: number; startedAt: number; remaining: number } | null>(
    null,
  );

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
      timer.current = { id, startedAt, remaining: ms };
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

    // Progress ticker for the per-segment bar.
    const tick = () => {
      const audio = audioRef.current;
      if (audio && audio.duration > 0) {
        setProgress(Math.min(1, audio.currentTime / audio.duration));
      } else if (timer.current) {
        const t = timer.current;
        const elapsed = t.startedAt ? Date.now() - t.startedAt : 0;
        const total = durationMs;
        setProgress(Math.min(1, (total - t.remaining + elapsed) / total));
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

  const stageAgents: AgentPlan[] = agents.map((a) => ({
    ...a,
    status:
      phase === "finished"
        ? "done"
        : a.id === activeAgentId
          ? "speaking"
          : "pending",
  }));

  const speakingAgent = agents.find((a) => a.id === activeAgentId);

  const segmentEvidence: Evidence[] =
    currentSegment?.evidenceIds
      .map((id) => evidenceMap.get(id))
      .filter((e): e is Evidence => Boolean(e)) ?? [];

  return (
    <div className="dark relative min-h-screen w-full overflow-hidden bg-neutral-950 text-white">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,64,120,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,40,60,0.2),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        {phase === "finished" ? (
          <Finale
            title={report.title}
            opportunities={report.opportunities}
            onReplay={replay}
          />
        ) : (
          <>
            {/* Stage: agent orbs */}
            <div className="flex flex-wrap items-end justify-center gap-6 pt-4 sm:gap-10">
              {stageAgents.map((agent, i) => {
                const isActive = agent.id === activeAgentId;
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      "transition-all duration-500 ease-out",
                      isActive
                        ? "scale-110 opacity-100 drop-shadow-[0_0_35px_rgba(129,140,248,0.45)]"
                        : "scale-90 opacity-40",
                    )}
                  >
                    <AgentOrb agent={agent} index={i} size="md" />
                  </div>
                );
              })}
            </div>

            {phase === "idle" ? (
              <IdleView
                title={report.title}
                summary={report.executiveSummary}
                onStart={start}
                segmentCount={segments.length}
              />
            ) : (
              <div className="mt-8 flex flex-1 flex-col gap-6 lg:flex-row">
                {/* Main narration column */}
                <div className="flex flex-1 flex-col">
                  {speakingAgent && (
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="font-semibold text-white">
                        {speakingAgent.name}
                      </span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/50">{speakingAgent.role}</span>
                    </div>
                  )}

                  <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {currentSegment?.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    {currentSegment?.subtitle}
                  </p>

                  {/* Subtitles */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
                    <p className="text-lg leading-relaxed text-white/90 sm:text-xl">
                      {currentSegment?.script}
                    </p>
                  </div>

                  <div className="flex-1" />

                  {/* Controls */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>
                        Segment {index + 1} / {segments.length}
                      </span>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-indigo-400 transition-[width] duration-150 ease-linear"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPaused((p) => !p)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
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
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
                      >
                        <SkipForward className="size-4" />
                        {index >= segments.length - 1 ? "Finish" : "Skip"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evidence column */}
                <EvidencePanel
                  evidence={segmentEvidence}
                  imageUrl={currentSegment?.imageUrl}
                  className="lg:w-80 lg:shrink-0"
                />
              </div>
            )}
          </>
        )}
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
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
        Goliath · Investor briefing
      </p>
      <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-white/60">
        {summary}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
      >
        <Play className="size-4" />
        Start briefing
      </button>
      <p className="text-xs text-white/30">
        {segmentCount} segments · narrated with subtitles
      </p>
    </div>
  );
}
