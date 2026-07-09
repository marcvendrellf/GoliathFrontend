"use client";

import { resolveApiUrl } from "@/lib/api";
import type { Evidence, FinalReport } from "@/lib/contract";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildEvidenceMap, deriveAgents } from "./agents";
import { EvidencePanel } from "./evidence-panel";
import { Finale } from "./finale";
import {
  PresentationOrb,
  colorsForIndex,
  seedFromId,
} from "./presentation-orb";
import { WordReveal } from "./word-reveal";

const DEFAULT_SEGMENT_MS = 8000;
const SPEAKER_PAUSE_MS = 900;

// Each canvas is rendered at its final dimensions. Never CSS-scale a Three.js
// canvas: a transform can race its ResizeObserver and warp the shader frame.
const WAIT_SIZE = 44;
const DOCK_SIZE = 36;

type Phase = "playing" | "pausing" | "finished";
export function FinalPresentation({ report }: { report: FinalReport }) {
  const agents = useMemo(() => deriveAgents(report), [report]);
  const evidenceMap = useMemo(() => buildEvidenceMap(report), [report]);
  const segments = report.segments;

  /** Stable gradient + seed per agent, by order of first appearance. */
  const agentStyle = useMemo(() => {
    const m = new Map<string, { colors: [string, string]; seed: number }>();
    agents.forEach((a, i) =>
      m.set(a.id, { colors: colorsForIndex(i), seed: seedFromId(a.id) }),
    );
    return m;
  }, [agents]);

  /** First segment index at which each agent speaks. Drives orb entrance. */
  const firstSpeakAt = useMemo(() => {
    const m = new Map<string, number>();
    segments.forEach((s, i) => {
      if (!m.has(s.agentId)) m.set(s.agentId, i);
    });
    return m;
  }, [segments]);

  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within current segment

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const handoffTimerRef = useRef<number | null>(null);
  // Timer fallback bookkeeping for segments without playable audio.
  const timer = useRef<{
    id: number;
    startedAt: number;
    remaining: number;
    total: number;
  } | null>(null);

  const finaleRef = useRef<HTMLDivElement | null>(null);

  const currentSegment = segments[index];

  const clearHandoffTimer = useCallback(() => {
    if (handoffTimerRef.current !== null) {
      window.clearTimeout(handoffTimerRef.current);
      handoffTimerRef.current = null;
    }
  }, []);

  const pauseBetweenSpeakers = useCallback(() => {
    setProgress(1);
    setPhase("pausing");
    clearHandoffTimer();
    handoffTimerRef.current = window.setTimeout(() => {
      if (index >= segments.length - 1) {
        setPhase("finished");
        return;
      }
      setIndex((current) => current + 1);
      setPhase("playing");
    }, SPEAKER_PAUSE_MS);
  }, [clearHandoffTimer, index, segments.length]);

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

    const startTimerFallback = (ms: number) => {
      const startedAt = Date.now();
      const id = window.setTimeout(pauseBetweenSpeakers, ms);
      timer.current = { id, startedAt, remaining: ms, total: ms };
    };

    if (currentSegment.audioUrl) {
      const audio = new Audio(resolveApiUrl(currentSegment.audioUrl));
      audioRef.current = audio;
      audio.onended = pauseBetweenSpeakers;
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

    // Progress ticker. Drives the word-by-word reveal.
    const tick = () => {
      const audio = audioRef.current;
      if (audio && audio.duration > 0) {
        setProgress(Math.min(1, audio.currentTime / audio.duration));
      } else if (timer.current) {
        const t = timer.current;
        const remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
        setProgress(Math.min(1, (t.total - remaining) / t.total));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return teardown;
    // Re-run when the active segment changes or playback (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  useEffect(() => teardown, [teardown]);
  useEffect(() => clearHandoffTimer, [clearHandoffTimer]);

  // Only the finale needs scrolling; the live transcript remains centered.
  useEffect(() => {
    if (phase === "finished") {
      finaleRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [phase]);

  const replay = () => {
    teardown();
    clearHandoffTimer();
    setIndex(0);
    setProgress(0);
    setPhase("playing");
  };

  const activeAgentId = phase === "playing" ? currentSegment?.agentId : undefined;

  const evidenceFor = (segment: (typeof segments)[number]): Evidence[] =>
    segment.evidenceIds
      .map((id) => evidenceMap.get(id))
      .filter((e): e is Evidence => Boolean(e));

  const completed = (i: number) => phase === "finished" || i < index;
  const visibleSegments = segments.slice(
    0,
    phase === "finished" ? segments.length : index,
  );
  const activeAgent = agents.find((agent) => agent.id === activeAgentId);
  const waitingAgents = agents.filter(
    (agent) => (firstSpeakAt.get(agent.id) ?? Infinity) > index,
  );

  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      {/* Stable presentation stage. All canvases have the exact same 220px
          box; only opacity changes when the speaker changes. */}
      <aside className="pointer-events-none fixed left-12 top-1/2 z-30 hidden w-[220px] -translate-y-1/2 lg:block">
        <div className="relative h-[220px] w-[220px]">
          {agents.map((agent) => {
            const style = agentStyle.get(agent.id)!;
            const isSpeaker = phase === "playing" && agent.id === activeAgentId;
            return (
              <div
                key={agent.id}
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{ opacity: isSpeaker ? 1 : 0 }}
                aria-hidden={!isSpeaker}
              >
                <PresentationOrb
                  colors={style.colors}
                  seed={style.seed}
                  agentState={isSpeaker ? "talking" : null}
                  className="h-full w-full"
                />
              </div>
            );
          })}
        </div>
        {activeAgent && (
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-foreground">{activeAgent.name}</p>
            <p className="text-xs text-muted-foreground">{activeAgent.role}</p>
          </div>
        )}
      </aside>

      {/* Waiting agents stay in a narrow left column, away from the centered
          transcript. Each uses its own small canvas, never a scaled speaker. */}
      <div className="fixed bottom-8 left-8 z-20 hidden w-24 flex-col items-center gap-3 lg:flex">
        {waitingAgents.map((agent) => {
          const style = agentStyle.get(agent.id)!;
          return (
            <div key={agent.id} className="flex w-full flex-col items-center gap-1">
              <div
                className="opacity-55 transition-opacity duration-300"
                style={{ width: WAIT_SIZE, height: WAIT_SIZE }}
              >
                <PresentationOrb
                  colors={style.colors}
                  seed={style.seed}
                  agentState={null}
                  className="h-full w-full"
                />
              </div>
              <span className="w-full text-center text-[9px] leading-tight text-muted-foreground">
                {agent.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* The live transcript is a dedicated, viewport-centered stage. It does
          not inherit the document flow of completed report sections. */}
      {currentSegment && phase !== "finished" && (
        <section
          className="pointer-events-none fixed left-1/2 top-1/2 z-20 w-[min(43rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 bg-white/95 px-6 py-5 transition-opacity duration-300 ease-out"
          style={{ opacity: phase === "playing" ? 1 : 0 }}
          aria-live="polite"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {activeAgent?.name ?? "Goliath"}
            {activeAgent && (
              <>
                <span className="mx-1.5 text-[#dedede]">/</span>
                <span className="font-medium normal-case tracking-normal">
                  {activeAgent.role}
                </span>
              </>
            )}
          </p>
          <div className="mt-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {currentSegment.title}
            </h2>
            {currentSegment.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">
                {currentSegment.subtitle}
              </p>
            )}
          </div>
          <WordReveal
            text={currentSegment.script}
            progress={progress}
            active={phase === "playing"}
            wordTimings={currentSegment.wordTimings}
            durationMs={currentSegment.durationMs}
            className="mt-4 text-foreground/90"
          />
        </section>
      )}

      {/* The report: sections accumulate top-to-bottom as agents speak. */}
      <main className="mx-auto w-full max-w-3xl px-6 pb-48 pt-8">
        <div className="mb-8 pl-[3.75rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Goliath · Investor briefing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {report.title}
          </h1>
        </div>

        <div className="flex flex-col divide-y divide-[#dedede]">
          {visibleSegments.map((segment, i) => {
            const agent = agents.find((a) => a.id === segment.agentId);
            const style = agent ? agentStyle.get(agent.id) : undefined;
            return (
              <section
                key={segment.id}
                className="flex gap-4 py-8 first:pt-0"
              >
                <div className="w-11 shrink-0">
                  <div style={{ width: DOCK_SIZE, height: DOCK_SIZE }}>
                    {completed(i) && style && (
                      <PresentationOrb
                        colors={style.colors}
                        seed={style.seed}
                        agentState={null}
                        className="h-full w-full"
                      />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  {agent && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {agent.name}
                      <span className="mx-1.5 text-[#dedede]">/</span>
                      <span className="font-medium normal-case tracking-normal">
                        {agent.role}
                      </span>
                    </p>
                  )}

                  <div className="mt-3">
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
                    progress={1}
                    active={false}
                    wordTimings={segment.wordTimings}
                    durationMs={segment.durationMs}
                    className="mt-4 text-foreground/90"
                  />

                  <EvidencePanel
                    evidence={evidenceFor(segment)}
                    imageUrl={segment.imageUrl}
                    className="mt-5"
                  />
                </div>
              </section>
            );
          })}

          {phase === "finished" && (
            <div ref={finaleRef} className="py-8 pl-[3.75rem]">
              <Finale opportunities={report.opportunities} onReplay={replay} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
