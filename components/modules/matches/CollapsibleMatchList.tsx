'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Match } from '@/types/match';
import { cn } from '@/lib/utils';
import { deriveStatus, useMatchClock } from '@/hooks/use-match-status';
import { cleanTeamName } from '@/lib/matches/match-utils';
import { MatchList } from './MatchList';
import { MatchCard } from './MatchCard/MatchCard';
import { VersusCard } from './MatchCard/VersusCard';
import { MatchRowCompact } from './MatchCard/MatchRowCompact';
import { formatTime } from './MatchCard/MatchHeader';

/**
 * CollapsibleMatchList — the "focus stack"
 *
 * WHICH game is highlighted (VersusCard, dark):
 *   • every LIVE game (conflicts → both), otherwise the NEXT unplayed game OVERALL
 *     (from focusPool = all weeks, same team tab + filters) — it's highlighted on
 *     whichever week contains it; every other week is all collapsed
 *   • current week finished → a "Next up" link at the bottom jumps to that week
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
  /** Shows the "Next up" link when this (real) week has nothing left to play */
  isCurrentWeek?: boolean;
  className?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  nextMatch?: { href: string; label: string };
}

const SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;

const formatDay = (date: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const groupByDay = (matches: Match[]) => {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const day = groups.get(match.date) ?? [];
    day.push(match);
    groups.set(match.date, day);
  }
  return [...groups.entries()];
};

/** Local YYYY-MM-DD for ?date= links (any day inside the target week) */
const toDateParam = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const shortDay = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));

const describe = (m: Match) => {
  const isHome = Boolean(m.homeTeam.utility && m.homeTeam.utility !== 'away');
  const opp = cleanTeamName((isHome ? m.awayTeam : m.homeTeam).name);
  const when = m.time === 'TBD' ? 'time TBD' : formatTime(m.time);
  return `${when} ${isHome ? 'vs' : 'at'} ${opp}`;
};

export const CollapsibleMatchList = ({
  matches,
  focusPool,
  isCurrentWeek = false,
  className,
  ...emptyStateProps
}: Props) => {
  const now = useMatchClock();

  /** Explicit user choices: id → expanded. Absent = follow the focus rule. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  /** Last card the user toggled — its new control receives keyboard focus */
  const [lastToggled, setLastToggled] = useState<string | null>(null);

  // ── Computed focus (pure) ────────────────────────────────────────────
  const byTime = (a: Match, b: Match) => a.timestamp - b.timestamp;
  const sorted = [...matches].sort(byTime);
  const pool = [...(focusPool ?? matches)].sort(byTime);
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

  if (matches.length === 0)
    return <MatchList matches={[]} {...emptyStateProps} />;

  const isFocus = (id: string) => focusIds.has(id);
  const isExpanded = (id: string) => overrides[id] ?? isFocus(id);
  const toggle = (id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? isFocus(id)) }));
    setLastToggled(id);
  };

  const focusMatch = sorted.find((m) => focusIds.has(m.id));
  const announcement = focusMatch
    ? `${statusOf(focusMatch) === 'live' ? 'Live now' : 'Next up'}: ${describe(focusMatch)}`
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
                {formatDay(day)}
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

        {/* This week is done → point to the next game (it's highlighted on its own week) */}
        {isCurrentWeek && !focusMatch && next && !visible.has(next.id) && (
          /* Dark Versus split — previews the highlight it leads to (Figma: NextUpLink) */
          <Link
            href={`/?date=${toDateParam(next.timestamp)}`}
            data-theme='dark'
            className='pressable flex min-h-16 items-center gap-(--space-stack-md) rounded-[16px] bg-(image:--gradient-versus) px-(--space-card-pad) py-3 shadow-[0_10px_24px_-10px_rgb(11_15_36/0.35)]'
          >
            <span className='flex min-w-0 flex-1 flex-col gap-1'>
              <span className='text-label text-(--color-text-accent)'>
                Next up
              </span>
              <span className='text-control truncate text-(--color-text-primary)'>
                {shortDay(next.timestamp)} · {describe(next)}
              </span>
            </span>
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              absoluteStrokeWidth
              aria-hidden='true'
              className='shrink-0 text-(--color-icon-default)'
            />
          </Link>
        )}
      </div>
    </MotionConfig>
  );
};
