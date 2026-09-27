'use client';

import { useSyncExternalStore } from 'react';
import { Match, MatchStatus } from '@/types/match';
import { ShareButton } from '@/components/ui/buttons/ShareButton';
import { DirectionsButton } from '@/components/ui/buttons/DirectionsButton';
import { MatchHeader, MatchTeamRow } from '.';

/**
 * MatchCard — Figma: Organisms › MatchCard (Status=Upcoming|Final)
 * surface · radius/card · card-pad · gap stack-md · Elevation/Card (no border)
 */

const MATCH_LENGTH_MS = 105 * 60_000; // kickoff + 105 min
const TICK_MS = 30_000;

/* ── Shared match clock ─────────────────────────────────────────────
   One interval for every card on the page (not one per card).
   Snapshot is bucketed to 30s so it's stable between ticks — required by
   useSyncExternalStore, and it re-renders cards at most twice a minute. */
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
const getServerSnapshot = () => null; // server + hydration: trust match.status

const useMatchClock = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/** Status is derived, never stored — no effect, no stale state. */
const deriveStatus = (match: Match, now: number | null): MatchStatus => {
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

export const MatchCard = ({
  match,
  showDate = true,
}: {
  match: Match;
  /** false when the list already groups by day */
  showDate?: boolean;
}) => {
  const now = useMatchClock();
  const currentStatus = deriveStatus(match, now);
  const isTBD = match.time === 'TBD';
  const isHomeGame = Boolean(
    match.homeTeam.utility && match.homeTeam.utility !== 'away',
  );

  return (
    <article className='flex w-full flex-col gap-(--space-stack-md) rounded-(--radius-card) bg-(--color-bg-surface) p-(--space-card-pad) shadow-(--shadow-card)'>
      <MatchHeader
        isConflict={match.isConflict}
        isTightGap={match.isTightGap}
        isTBD={isTBD}
        date={match.date}
        time={match.time}
        status={currentStatus}
        isHomeGame={isHomeGame}
        showDate={showDate}
      />

      {/* Teams: gap stack-sm */}
      <div className='flex flex-col gap-(--space-stack-sm)'>
        <MatchTeamRow
          team={match.homeTeam}
          score={match.homeTeam.score}
          status={currentStatus}
          isClub={isHomeGame}
        />
        <MatchTeamRow
          team={match.awayTeam}
          score={match.awayTeam.score}
          status={currentStatus}
          isClub={!isHomeGame}
        />
      </div>

      {/* Footer: gap stack-sm */}
      <div className='flex items-stretch gap-(--space-stack-sm)'>
        <DirectionsButton location={match.location} />
        <ShareButton match={match} />
      </div>
    </article>
  );
};
