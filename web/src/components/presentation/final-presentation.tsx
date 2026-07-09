"use client";

import type { AgentPlan, Evidence, FinalReport } from "@/lib/contract";
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
const WAIT_SIZE = 72; // greyed, bottom row
const DOCK_SIZE = 36; // docked, section gutter

type Phase = "playing" | "finished";
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

  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within current segment

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
  // Timer fallback bookkeeping for segments without playable audio.
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
      const id = window.setTimeout(advance, ms);
      timer.current = { id, startedAt, remaining: ms, total: ms };
    };

    if (currentSegment.audioUrl) {
      const audio = new Audio(currentSegment.audioUrl);
      audioRef.current = audio;
      audio.onended = advance;
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
  // arms the choreography so the active agent can fly out smoothly.
  useEffect(() => {
    if (armed) return;
    const r = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(r);
  }, [armed]);

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
    const el = phase === "finished" ? finaleRef.current : activeSectionRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [phase, index]);

  const replay = () => {
    teardown();
    setIndex(0);
    setProgress(0);
    setArmed(false);
    setDockedSections(new Set());
    setPhase("playing");
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
  const waitingAgents = agents.filter(
    (agent) => orbModeFor(agent).mode === "waiting",
  );

  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      {/* Waiting row: compact pending agents only. The visible orbs are the
          fixed traveling elements below; names live here in the slots. */}
      {isLarge && (
        <div className="fixed bottom-8 left-10 z-20 flex items-start gap-4">
          {waitingAgents.map((agent) => {
            return (
              <div
                key={agent.id}
                className="flex w-28 flex-col items-center gap-2"
              >
                <div
                  ref={(el) => {
                    if (el) waitingSlotRefs.current.set(agent.id, el);
                    else waitingSlotRefs.current.delete(agent.id);
                  }}
                  style={{ width: WAIT_SIZE, height: WAIT_SIZE }}
                />
                <span
                  className="w-full truncate text-center text-[11px] font-medium text-muted-foreground"
                >
                  {agent.name}
                </span>
              </div>
            );
          })}
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
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

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
  const boxRef = useRef(box);
  boxRef.current = box;
  const targetRef = useRef(box);

  const moveTo = useCallback((next: { x: number; y: number; size: number }) => {
    boxRef.current = next;
    setBox(next);
  }, []);

  const setTarget = useCallback(
    (next: { x: number; y: number; size: number }) => {
      targetRef.current = next;
      if (!animate) moveTo(next);
    },
    [animate, moveTo],
  );

  // Waiting and talking targets are viewport-fixed, so measure once per signal
  // change and let the shared frame loop carry the orb there.
  useLayoutEffect(() => {
    if (mode === "docking" || mode === "hidden") return;
    if (mode === "talking") {
      const size = STAGE_SIZE;
      setTarget({ x: STAGE_X, y: window.innerHeight / 2 - size / 2, size });
      return;
    }
    const r = waitingSlots.current?.get(agent.id)?.getBoundingClientRect();
    if (r && r.width > 0) setTarget({ x: r.left, y: r.top, size: r.width });
    // Recompute whenever the resolved target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  useEffect(() => {
    if (!animate || mode === "docking" || mode === "hidden") return;
    let raf = 0;
    const step = () => {
      const cur = boxRef.current;
      const target = targetRef.current;
      const next = {
        x: lerp(cur.x, target.x, 0.18),
        y: lerp(cur.y, target.y, 0.18),
        size: lerp(cur.size, target.size, 0.18),
      };
      const settled =
        Math.abs(next.x - target.x) < 0.5 &&
        Math.abs(next.y - target.y) < 0.5 &&
        Math.abs(next.size - target.size) < 0.5;
      if (settled) {
        moveTo(target);
        return;
      }
      moveTo(next);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate, mode, signal, moveTo]);

  // Docking chases the LIVE gutter rect frame by frame. The page is usually
  // still auto-scrolling (and images can shift layout) while the orb is in
  // transit, so a one-shot measurement lands in the wrong place. Once the orb
  // settles on the (now stationary) slot, hand off to the static in-flow copy.
  useEffect(() => {
    if (mode !== "docking") return;
    let raf = 0;
    const step = () => {
      const r = gutters.current?.get(dockIndex)?.getBoundingClientRect();
      if (r && r.width > 0) {
        const cur = boxRef.current;
        const next = {
          x: lerp(cur.x, r.left, 0.14),
          y: lerp(cur.y, r.top, 0.14),
          size: lerp(cur.size, r.width, 0.14),
        };
        const settled =
          Math.abs(next.x - r.left) < 0.5 &&
          Math.abs(next.y - r.top) < 0.5 &&
          Math.abs(next.size - r.width) < 0.5;
        if (settled) {
          moveTo({ x: r.left, y: r.top, size: r.width });
          onDocked(dockIndex);
          return;
        }
        moveTo(next);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dockIndex]);

  // The orb canvas is rendered at STAGE_SIZE and scaled, never resized, so the
  // flight is a pure composited transform (no WebGL canvas re-layout jank).
  const scale = box.size / STAGE_SIZE;
  const agentState = mode === "talking" ? "talking" : null;
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const transition = "opacity 400ms ease, filter 500ms ease";

  return (
    <>
      <div
        className="pointer-events-none fixed left-0 top-0 z-30"
        style={{
          width: STAGE_SIZE,
          height: STAGE_SIZE,
          transformOrigin: "0 0",
          transform: `translate(${box.x}px, ${box.y}px) scale(${scale})`,
          opacity: mode === "hidden" ? 0 : 1,
          filter: mode === "waiting" ? "grayscale(1) opacity(0.45)" : "none",
          transition,
          willChange: "transform",
        }}
      >
        <PresentationOrb
          colors={colors}
          seed={seed}
          agentState={agentState}
          className="h-full w-full"
        />
      </div>
      {/* Name label rides the same eased path but never scales. */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-30"
        style={{
          transform: `translate(${box.x + box.size / 2}px, ${box.y + box.size + 10}px)`,
          opacity: mode === "talking" ? 1 : 0,
          transition: `opacity 300ms ease, transform 80ms ${ease}`,
        }}
      >
        <div className="w-max -translate-x-1/2 text-center">
          <p className="text-sm font-medium text-foreground">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
        </div>
      </div>
    </>
  );
}
