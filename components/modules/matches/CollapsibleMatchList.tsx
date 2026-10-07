'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Match } from '@/types/match';
import { cn } from '@/lib/utils';
import { deriveStatus, useMatchClock } from '@/hooks/use-match-status';
import { MatchList } from './MatchList';
import { MatchCard } from './MatchCard/MatchCard';
import { VersusCard } from './MatchCard/VersusCard';
import { MatchRowCompact } from './MatchCard/MatchRowCompact';
import { formatTime } from './MatchCard/MatchHeader';
import { SeasonWrapCard } from './MatchCard/SeasonWrapCard';
import { NextUpLink, describeMatch, shortDay, toDateParam } from './NextUpLink';
import {
  getSeasonStats,
  nextSeasonName,
  seasonOf,
} from '@/lib/matches/season-stats';

/**
 * CollapsibleMatchList — the "focus stack"
 *
 * WHICH game is highlighted (VersusCard, dark):
 *   • every LIVE game (conflicts → both), otherwise the NEXT unplayed game OVERALL
 *     (from focusPool = all weeks, same team tab + filters) — it's highlighted on
 *     whichever week contains it; every other week is all collapsed
 *   • current week finished → a "Next up" link at the bottom jumps to that week
 *   • …unless that next game is in a NEW season (or none is scheduled) → SeasonWrapCard
 *     (also replaces the rest-week empty state in weeks BETWEEN seasons — relative to the
 *     viewed week, so browsing back to a past season's end shows its wrap too)
 *   • the season's final week shows a "Final week of …" marker until its games are done
 *
 * WHEN it moves (full time = kickoff + 105 min):
 *   • never under the user's eyes — if the highlight is on screen, the old one is
 *     held in place until it scrolls away or the tab regains focus
 *
 * EVERYTHING ELSE:
 *   • compact rows; tapping one expands the LIGHT MatchCard (never another Versus)
 *   • user choices stick; opening one card never closes another (not an accordion)
 *   • keyboard focus only moves after a user toggle; auto changes are announced politely
 */

interface Props {
  /** This week's matches (filtered) */
  matches: Match[];
  /** Same filters, ALL weeks — used to find the next game even if it's in a later week */
  focusPool?: Match[];
  /** Shows the "Next up" link / season wrap when this (real) week has nothing left to play */
  isCurrentWeek?: boolean;
  /** The viewed week's bounds (ms) — the season wrap is relative to THIS week, not today */
  weekStart?: number;
  weekEnd?: number;
  /** "View season recap" → that season in the Season tab (real link + in-place switch) */
  seasonHrefFor?: (season: string) => string;
  onViewSeason?: (season: string) => void;
  className?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  /** Rest-week action: this team's next game after the viewed week */
  nextMatch?: Match;
}

const SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;

const byTime = (a: Match, b: Match) => a.timestamp - b.timestamp;

/**
 * Day grouping is keyed by the game's TIMESTAMP (local calendar day), never the raw
 * date text — source strings can carry junk ("Nov 14 2026 Scheduled"), which used to
 * split one day into two groups and print the raw text as the header.
 */
const dayKey = (m: Match) => (m.timestamp ? toDateParam(m.timestamp) : m.date);

const formatDay = (m: Match) => {
  const d = m.timestamp ? new Date(m.timestamp) : new Date(m.date);
  return Number.isNaN(d.getTime())
    ? m.date
    : new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(d);
};

const groupByDay = (matches: Match[]) => {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const key = dayKey(match);
    const day = groups.get(key) ?? [];
    day.push(match);
    groups.set(key, day);
  }
  return [...groups.entries()];
};

export const CollapsibleMatchList = ({
  matches,
  focusPool,
  isCurrentWeek = false,
  weekStart,
  weekEnd,
  seasonHrefFor,
  onViewSeason,
  className,
  ...emptyStateProps
}: Props) => {
  const now = useMatchClock();

  /** Explicit user choices: id → expanded. Absent = follow the focus rule. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  /** Last card the user toggled — its new control receives keyboard focus */
  const [lastToggled, setLastToggled] = useState<string | null>(null);

  // ── Data that does NOT depend on the clock — memoized so the 30s tick stays cheap.
  //    (ClientView only re-renders on its own state changes, so these references are
  //    stable across ticks.)
  const sorted = useMemo(() => [...matches].sort(byTime), [matches]);
  const pool = useMemo(
    () => [...(focusPool ?? matches)].sort(byTime),
    [focusPool, matches],
  );
  /** Season → stats (only seasons with results) */
  const statsBySeason = useMemo(
    () =>
      new Map(getSeasonStats(pool, 'All Teams').map((st) => [st.season, st])),
    [pool],
  );
  /** Season → timestamp of its final game (scored or not) */
  const seasonLastGame = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of pool) {
      const season = seasonOf(m.timestamp);
      map.set(season, Math.max(map.get(season) ?? 0, m.timestamp));
    }
    return map;
  }, [pool]);

  // ── Computed focus (depends on the clock) ────────────────────────────
  const statusOf = (m: Match) => deriveStatus(m, now);
  const live = pool.filter((m) => statusOf(m) === 'live');
  const next = pool.find((m) => statusOf(m) === 'upcoming');
  const visible = new Set(sorted.map((m) => m.id));
  // Global focus, rendered only on the week that contains it
  const computedIds = (
    live.length ? live.map((m) => m.id) : next ? [next.id] : []
  ).filter((id) => visible.has(id));
  const computedKey = computedIds.join('|');

  // ── Deferred advance: don't swap the highlight while it's being looked at ──
  const [heroOnScreen, setHeroOnScreen] = useState(false);
  const [heldKey, setHeldKey] = useState<string | null>(null);
  const [prevKey, setPrevKey] = useState(computedKey);
  if (prevKey !== computedKey) {
    // Adjusting state during render (React-sanctioned pattern — no effect, no extra paint)
    setPrevKey(computedKey);
    if (heroOnScreen && prevKey) setHeldKey(prevKey);
  }
  const shownKey = heldKey ?? computedKey;
  const focusIds = new Set(shownKey ? shownKey.split('|') : []);

  const heroRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setHeroOnScreen(entry.isIntersecting);
        if (!entry.isIntersecting) setHeldKey(null); // scrolled away → safe to advance
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shownKey]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setHeldKey(null); // back in the app → advance
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // ── Season wrap — relative to the VIEWED week (works for history, not just today):
  //    • the week holds a season's FINAL game → wrap for that season (once played)
  //    • the week is EMPTY and sits between two seasons → wrap for the season before it
  //    • an empty mid-season (bye) week stays "Rest week"
  //    Look-ahead = the first game after this week, when it's in a new season.
  const weekDone = !sorted.some((m) => {
    const st = statusOf(m);
    return st === 'upcoming' || st === 'live';
  });
  const lastInWeek = sorted[sorted.length - 1];
  const isFinalWeek =
    !!lastInWeek &&
    seasonLastGame.get(seasonOf(lastInWeek.timestamp)) === lastInWeek.timestamp;
  const prevGame =
    sorted.length === 0 && weekStart !== undefined
      ? [...pool].reverse().find((m) => m.timestamp < weekStart)
      : undefined;
  const endingSeason = isFinalWeek
    ? seasonOf(lastInWeek.timestamp)
    : prevGame
      ? seasonOf(prevGame.timestamp)
      : null;
  const firstAfter =
    weekEnd !== undefined ? pool.find((m) => m.timestamp > weekEnd) : undefined;
  const betweenSeasons =
    !!endingSeason &&
    (!firstAfter || seasonOf(firstAfter.timestamp) !== endingSeason);
  const endingStats = endingSeason
    ? statsBySeason.get(endingSeason)
    : undefined;
  const offSeason = now !== null && weekDone && betweenSeasons && !!endingStats;

  const wrap = offSeason && endingStats && (
    <SeasonWrapCard
      season={endingStats.season}
      totals={endingStats.totals}
      upcomingSeason={nextSeasonName(endingStats.season)}
      next={
        firstAfter
          ? {
              label: `${seasonOf(firstAfter.timestamp)} starts`,
              when: `${shortDay(firstAfter.timestamp)} · ${firstAfter.time === 'TBD' ? 'Time TBD' : formatTime(firstAfter.time)}`,
              href: `/?date=${toDateParam(firstAfter.timestamp)}`,
            }
          : undefined
      }
      seasonHref={seasonHrefFor?.(endingStats.season)}
      onViewSeason={
        onViewSeason ? () => onViewSeason(endingStats.season) : undefined
      }
    />
  );

  if (matches.length === 0) {
    // Off-season week → season wrap instead of "Rest week"
    return wrap ? (
      <div
        className={cn(
          'mx-auto flex w-full max-w-lg flex-col px-(--space-gutter)',
          className,
        )}
      >
        {wrap}
      </div>
    ) : (
      <MatchList matches={[]} {...emptyStateProps} />
    );
  }

  const isFocus = (id: string) => focusIds.has(id);
  const isExpanded = (id: string) => overrides[id] ?? isFocus(id);
  const toggle = (id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? isFocus(id)) }));
    setLastToggled(id);
  };

  const focusMatch = sorted.find((m) => focusIds.has(m.id));
  const announcement = focusMatch
    ? `${statusOf(focusMatch) === 'live' ? 'Live now' : 'Next up'}: ${describeMatch(focusMatch)}`
    : '';
  /** The IntersectionObserver watches the first highlighted card (derived, not mutated) */
  const heroId = focusMatch?.id;

  return (
    <MotionConfig reducedMotion='user'>
      {/* Polite announcement when the highlight changes — never steals focus */}
      <p role='status' className='visually-hidden'>
        {announcement}
      </p>

      <div
        className={cn(
          'mx-auto flex w-full max-w-lg flex-col gap-(--space-stack-md) px-(--space-gutter)',
          className,
        )}
      >
        {/* Final week of the season, before its games are done — the wrap card takes over after.
            A centered marker (not another left-aligned label) so it doesn't compete with day headers. */}
        {isFinalWeek && !offSeason && (
          <p className='text-label flex items-center gap-3 text-(--color-text-secondary)'>
            <span
              aria-hidden='true'
              className='h-px flex-1 bg-(--color-border-default)'
            />
            Final week of {seasonOf(lastInWeek.timestamp)}
            <span
              aria-hidden='true'
              className='h-px flex-1 bg-(--color-border-default)'
            />
          </p>
        )}

        {groupByDay(sorted).map(([day, dayMatches]) => {
          const headingId = `day-${day.replace(/\W+/g, '-')}`;
          return (
            <section
              key={day}
              aria-labelledby={headingId}
              className='flex flex-col gap-(--space-stack-sm)'
            >
              <h3
                id={headingId}
                className='text-label text-(--color-text-secondary)'
              >
                {formatDay(dayMatches[0])}
              </h3>

              <ul className='flex flex-col gap-(--space-stack-sm)'>
                {dayMatches.map((match) => {
                  const focused = isFocus(match.id);
                  const open = isExpanded(match.id);
                  const panelId = `match-${match.id}`;
                  const focusToggle = lastToggled === match.id;

                  return (
                    <motion.li
                      key={match.id}
                      ref={match.id === heroId ? heroRef : undefined}
                      layout='position'
                      transition={SPRING}
                      className='list-none'
                    >
                      <AnimatePresence mode='popLayout' initial={false}>
                        {open ? (
                          <motion.div
                            key={focused ? 'versus' : 'detail'}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            {focused ? (
                              /* The highlight — dark = "next up" */
                              <VersusCard
                                match={match}
                                id={panelId}
                                onCollapse={() => toggle(match.id)}
                                focusToggle={focusToggle}
                              />
                            ) : (
                              /* Manually opened — light detail card, never another Versus */
                              <MatchCard
                                match={match}
                                showDate={false}
                                id={panelId}
                                onCollapse={() => toggle(match.id)}
                                focusToggle={focusToggle}
                              />
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key='closed'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            <MatchRowCompact
                              match={match}
                              controlsId={panelId}
                              onExpand={() => toggle(match.id)}
                              focusToggle={focusToggle}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {/* Season over → wrap card (celebrate + look ahead) instead of a far-future "Next up" */}
        {wrap}

        {/* This week is done → point to the next game (it's highlighted on its own week) */}
        {isCurrentWeek &&
          !offSeason &&
          !focusMatch &&
          next &&
          !visible.has(next.id) && <NextUpLink match={next} />}
      </div>
    </MotionConfig>
  );
};
