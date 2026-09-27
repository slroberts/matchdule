'use client';

import { useSyncExternalStore } from 'react';
import { Match, MatchStatus } from '@/types/match';
import { MATCH_LENGTH_MS } from '@/lib/matches/match-constants';

export { MATCH_LENGTH_MS };

/**
 * Shared match clock — ONE interval for every card on the page.
 * Snapshot is bucketed to 30s so it's stable between ticks (required by
 * useSyncExternalStore). Server + hydration snapshot is null → trust match.status,
 * so the first client render matches the server exactly.
 */

const TICK_MS = 30_000;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

const subscribe = (onTick: () => void) => {
  listeners.add(onTick);
  timer ??= setInterval(() => listeners.forEach((l) => l()), TICK_MS);
  return () => {
    listeners.delete(onTick);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};
const getSnapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;
const getServerSnapshot = () => null;

export const useMatchClock = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/** Status is derived, never stored — no effect, no stale state. */
export const deriveStatus = (match: Match, now: number | null): MatchStatus => {
  if (
    now === null ||
    match.status === 'final' ||
    match.status === 'canceled' ||
    match.time === 'TBD'
  ) {
    return match.status;
  }
  if (now > match.timestamp + MATCH_LENGTH_MS) return 'final';
  if (now >= match.timestamp) return 'live';
  return 'upcoming';
};

/** `now` is null during SSR/hydration — render time-sensitive UI (countdowns) only when it's set. */
export const useMatchStatus = (match: Match) => {
  const now = useMatchClock();
  return { status: deriveStatus(match, now), now };
};
