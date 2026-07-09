"use client";

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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

// Orb choreography sizes (px). Base canvas is rendered at STAGE_SIZE and scaled
// down for the waiting row and the docked gutter marker.
const STAGE_SIZE = 160; // talking, mid-left
const STAGE_X = 48; // talking, distance from the left edge
const WAIT_SIZE = 48; // greyed, bottom row
const DOCK_SIZE = 36; // docked, section gutter

type Phase = "idle" | "playing" | "finished";
type OrbMode = "waiting" | "talking" | "docking" | "hidden";

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

  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 within current segment
  const [durationSec, setDurationSec] = useState(DEFAULT_SEGMENT_MS / 1000);

  // Choreography state.
  const [isLarge, setIsLarge] = useState(false); // orbs fly only on lg+ screens
  const [armed, setArmed] = useState(false); // one frame of "all in the row"
  const [viewport, setViewport] = useState(0); // bumped on resize to re-center
  const [dockedSections, setDockedSections] = useState<Set<number>>(new Set());

  // Anchors the fixed traveling orbs read their target rects from.
  const waitingSlotRefs = useRef<Map<string, HTMLElement>>(new Map());
  const gutterRefs = useRef<Map<number, HTMLElement>>(new Map());

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

  // Track lg+ so the fly choreography only runs where there is room for it.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsLarge(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Re-center the stage / recompute anchors on resize.
  useEffect(() => {
    const on = () => setViewport((v) => v + 1);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  // First paint of a run keeps every orb in the waiting row; the next frame
  // "arms" the choreography so the active agent flies out with a transition.
  useEffect(() => {
    if (phase === "idle" || armed) return;
    const r = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(r);
  }, [phase, armed]);

  const markDocked = useCallback((i: number) => {
    setDockedSections((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  // Auto-scroll: keep the section being written (or the finale) in view.
  useEffect(() => {
    if (phase === "idle") return;
    const el = phase === "finished" ? finaleRef.current : activeSectionRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [phase, index]);

  // Seek to an absolute time (seconds) within the current segment.
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
    setArmed(false);
    setDockedSections(new Set());
    setPhase("playing");
  };

  const replay = () => {
    teardown();
    setIndex(0);
    setPaused(false);
    setProgress(0);
    setArmed(false);
    setDockedSections(new Set());
    setPhase("playing");
  };

  const skip = () => {
    teardown();
    setPaused(false);
    advance();
  };

  const activeAgentId = phase === "playing" ? currentSegment?.agentId : undefined;

  const evidenceFor = (segment: (typeof segments)[number]): Evidence[] =>
    segment.evidenceIds
      .map((id) => evidenceMap.get(id))
      .filter((e): e is Evidence => Boolean(e));

  // Latest section this agent has finished narrating (its dock target).
  const doneMax = useCallback(
    (agentId: string) => {
      let m = -1;
      segments.forEach((s, i) => {
        const done = phase === "finished" || i < index;
        if (s.agentId === agentId && done && i > m) m = i;
      });
      return m;
    },
    [segments, phase, index],
  );

  // Resolve each agent's orb mode + dock target for the current moment.
  const orbModeFor = useCallback(
    (agent: AgentPlan): { mode: OrbMode; dockIndex: number } => {
      if (!armed) return { mode: "waiting", dockIndex: -1 };
      if (phase === "playing" && agent.id === activeAgentId) {
        return { mode: "talking", dockIndex: -1 };
      }
      const first = firstSpeakAt.get(agent.id) ?? Infinity;
      if (phase !== "finished" && first > index) {
        return { mode: "waiting", dockIndex: -1 };
      }
      const di = doneMax(agent.id);
      if (di < 0) return { mode: "waiting", dockIndex: -1 };
      return {
        mode: dockedSections.has(di) ? "hidden" : "docking",
        dockIndex: di,
      };
    },
    [armed, phase, activeAgentId, firstSpeakAt, index, doneMax, dockedSections],
  );

  // A section shows its static (in-flow, scroll-glued) gutter marker once the
  // traveling orb has docked. Off lg there is no travel, so mark as soon as the
  // section is complete.
  const completed = (i: number) => phase === "finished" || i < index;
  const showGutterOrb = (i: number) =>
    completed(i) && (!isLarge || dockedSections.has(i));

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
      {/* Waiting row: greyed anchors at the bottom-left, clear of the centered
          dock. The visible orbs are the fixed traveling elements below. */}
      {isLarge && (
        <div className="fixed bottom-16 left-6 z-20 flex items-end gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              ref={(el) => {
                if (el) waitingSlotRefs.current.set(agent.id, el);
                else waitingSlotRefs.current.delete(agent.id);
              }}
              style={{ width: WAIT_SIZE, height: WAIT_SIZE }}
            />
          ))}
        </div>
      )}

      {/* One traveling orb per agent. Flies waiting -> stage -> gutter dock. */}
      {isLarge &&
        agents.map((agent) => {
          const { mode, dockIndex } = orbModeFor(agent);
          const style = agentStyle.get(agent.id)!;
          return (
            <TravelingOrb
              key={agent.id}
              agent={agent}
              colors={style.colors}
              seed={style.seed}
              mode={mode}
              dockIndex={dockIndex}
              animate={armed}
              waitingSlots={waitingSlotRefs}
              gutters={gutterRefs}
              onDocked={markDocked}
              signal={`${mode}:${dockIndex}:${index}:${phase}:${armed}:${viewport}`}
            />
          );
        })}

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
            const isActive = phase === "playing" && i === index;
            const agent = agents.find((a) => a.id === segment.agentId);
            const style = agent ? agentStyle.get(agent.id) : undefined;
            return (
              <section
                key={segment.id}
                ref={isActive ? activeSectionRef : undefined}
                className="flex gap-4 py-8 first:pt-0"
              >
                {/* Left gutter: docks the author's small orb next to the text. */}
                <div className="w-11 shrink-0">
                  <div
                    ref={(el) => {
                      if (el) gutterRefs.current.set(i, el);
                      else gutterRefs.current.delete(i);
                    }}
                    style={{ width: DOCK_SIZE, height: DOCK_SIZE }}
                  >
                    {showGutterOrb(i) && style && (
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
                    progress={isActive ? progress : 1}
                    active={isActive}
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
 * A fixed-position orb that travels between three states with pure CSS
 * transitions (FLIP style):
 *   waiting  -> greyed, small, resting in the bottom row
 *   talking  -> full color, large, mid-left of the viewport
 *   docking  -> shrinking toward its paragraph's gutter slot
 * On the dock transition's end the parent mounts a static in-flow copy in the
 * gutter (which scrolls with the paragraph) and this orb fades to `hidden`.
 */
function TravelingOrb({
  agent,
  colors,
  seed,
  mode,
  dockIndex,
  animate,
  waitingSlots,
  gutters,
  onDocked,
  signal,
}: {
  agent: AgentPlan;
  colors: [string, string];
  seed: number;
  mode: OrbMode;
  dockIndex: number;
  animate: boolean;
  waitingSlots: React.RefObject<Map<string, HTMLElement>>;
  gutters: React.RefObject<Map<number, HTMLElement>>;
  onDocked: (i: number) => void;
  signal: string;
}) {
  const [box, setBox] = useState({ x: 0, y: 0, size: WAIT_SIZE });

  useLayoutEffect(() => {
    let x = 0;
    let y = 0;
    let size = WAIT_SIZE;
    if (mode === "talking") {
      size = STAGE_SIZE;
      x = STAGE_X;
      y = window.innerHeight / 2 - size / 2;
    } else if (mode === "waiting") {
      const r = waitingSlots.current?.get(agent.id)?.getBoundingClientRect();
      if (r) {
        x = r.left;
        y = r.top;
        size = r.width;
      }
    } else {
      const r = gutters.current?.get(dockIndex)?.getBoundingClientRect();
      if (r) {
        x = r.left;
        y = r.top;
        size = r.width;
      }
    }
    setBox({ x, y, size });
    // Recompute whenever the resolved target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  const agentState = mode === "talking" ? "talking" : null;
  const filter = mode === "waiting" ? "grayscale(1) opacity(0.45)" : "none";
  const opacity = mode === "hidden" ? 0 : 1;
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const transition = animate
    ? `transform 700ms ${ease}, width 700ms ${ease}, height 700ms ${ease}, opacity 400ms ease, filter 500ms ease`
    : "none";

  return (
    <div
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && mode === "docking") {
          onDocked(dockIndex);
        }
      }}
      className="pointer-events-none fixed left-0 top-0 z-30"
      style={{
        width: box.size,
        height: box.size,
        transform: `translate(${box.x}px, ${box.y}px)`,
        opacity,
        filter,
        transition,
        willChange: "transform, width, height",
      }}
    >
      <PresentationOrb
        colors={colors}
        seed={seed}
        agentState={agentState}
        className="h-full w-full"
      />
      {(mode === "waiting" || mode === "talking") && (
        <div className="absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 text-center">
          <p
            className={
              mode === "talking"
                ? "text-sm font-medium text-foreground"
                : "text-[10px] font-medium text-muted-foreground"
            }
          >
            {agent.name}
          </p>
          {mode === "talking" && (
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          )}
        </div>
      )}
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#1d1d1d] text-white transition-colors hover:bg-[#333333] disabled:pointer-events-none disabled:opacity-50"
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
            <ScrubBarProgress className="inset-0 h-full w-full [&_[data-slot=progress-indicator]]:bg-[#1d1d1d] [&_[data-slot=progress-track]]:h-full [&_[data-slot=progress-track]]:bg-transparent" />
            <ScrubBarThumb className="bg-[#1d1d1d]" />
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
        className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1d1d1d] px-6 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
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
