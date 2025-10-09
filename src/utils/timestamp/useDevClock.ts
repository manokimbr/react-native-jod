// src/utils/timestamp/useDevClock.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { formatLocal, formatUTC, getUtcOffsetLabel, toEpochMs } from "./timestamp";

export type DevClock = {
  now: Date;
  localStr: string;
  utcStr: string;
  offsetStr: string;
  epochMs: number;
  sinceMountLabel: string;
};

/** Live clock that pauses in background to save battery */
export function useDevClock(tickMs = 1000): DevClock {
  const [now, setNow] = useState(() => new Date());
  const [mountedAt] = useState(() => Date.now());
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => setNow(new Date()), tickMs);
    };
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    start(); // start immediately

    const sub = AppState.addEventListener("change", (next) => {
      const wasBg = appState.current.match(/inactive|background/);
      const goBg = next.match(/inactive|background/);
      if (wasBg && next === "active") start();
      else if (!wasBg && goBg) stop();
      appState.current = next;
    });

    return () => {
      sub.remove();
      stop();
    };
  }, [tickMs]);

  const localStr = useMemo(() => formatLocal(now), [now]);
  const utcStr = useMemo(() => formatUTC(now), [now]);
  const offsetStr = useMemo(() => getUtcOffsetLabel(now), [now]);
  const epochMs = useMemo(() => toEpochMs(now), [now]);
  const sinceMountLabel = useMemo(() => {
    const diff = Math.max(0, epochMs - mountedAt);
    const s = Math.floor(diff / 1000);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}m ${String(ss).padStart(2, "0")}s`;
  }, [epochMs, mountedAt]);

  return { now, localStr, utcStr, offsetStr, epochMs, sinceMountLabel };
}
