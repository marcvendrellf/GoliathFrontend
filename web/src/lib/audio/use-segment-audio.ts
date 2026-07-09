"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SegmentAudioCallbacks = {
  onEnded?: () => void;
  onError?: (progress: number) => void;
};

export type SegmentAudio = {
  currentTime: number;
  duration: number;
  progress: number;
  isPlaying: boolean;
  muted: boolean;
  load: (url: string) => void;
  play: () => Promise<boolean>;
  pause: () => void;
  stop: () => void;
  preload: (url?: string) => void;
  toggleMuted: () => void;
};

const MUTE_STORAGE_KEY = "goliath-presentation-muted";

/**
 * Owns the single media element used by the narrated presentation. Keeping it
 * outside the presentation component makes speaker transitions, failures, and
 * mute preferences predictable without exposing backend audio concerns to UI.
 */
export function useSegmentAudio({
  onEnded,
  onError,
}: SegmentAudioCallbacks = {}): SegmentAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callbacksRef = useRef({ onEnded, onError });
  const preloadCache = useRef(new Map<string, HTMLAudioElement>());
  const frameRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    callbacksRef.current = { onEnded, onError };
  }, [onEnded, onError]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    const cache = preloadCache.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      frameRef.current = requestAnimationFrame(updateTime);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(updateTime);
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handleEnded = () => {
      setCurrentTime(audio.duration || audio.currentTime);
      setIsPlaying(false);
      callbacksRef.current.onEnded?.();
    };
    const handleError = () => {
      setIsPlaying(false);
      callbacksRef.current.onError?.(
        audio.duration > 0 ? Math.min(1, audio.currentTime / audio.duration) : 0,
      );
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      cache.clear();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const load = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio?.src) return false;

    try {
      await audio.play();
      return true;
    } catch {
      callbacksRef.current.onError?.(
        audio.duration > 0 ? Math.min(1, audio.currentTime / audio.duration) : 0,
      );
      return false;
    }
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  const preload = useCallback((url?: string) => {
    if (!url || preloadCache.current.has(url)) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    audio.load();
    preloadCache.current.set(url, audio);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((value) => {
      const nextValue = !value;
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, String(nextValue));
      } catch {
        // Muting still works for this session when persistence is unavailable.
      }
      return nextValue;
    });
  }, []);

  return useMemo(
    () => ({
      currentTime,
      duration,
      progress: duration > 0 ? Math.min(1, currentTime / duration) : 0,
      isPlaying,
      muted,
      load,
      play,
      pause,
      stop,
      preload,
      toggleMuted,
    }),
    [
      currentTime,
      duration,
      isPlaying,
      muted,
      load,
      play,
      pause,
      stop,
      preload,
      toggleMuted,
    ],
  );
}
