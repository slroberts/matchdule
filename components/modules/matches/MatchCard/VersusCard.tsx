'use client';

import { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { Match, Team } from '@/types/match';
import { cn } from '@/lib/utils';
import { cleanTeamName, hasScores } from '@/lib/matches/match-utils';
import { getAgeGroup, getCrestBrand } from '@/lib/matches/team-meta';
import { useMatchStatus } from '@/hooks/use-match-status';
import { Badge } from '@/components/ui/Badge/Badge';
import { Crest } from '@/components/ui/Crest/Crest';
import { DirectionsButton } from '@/components/ui/buttons/DirectionsButton';
import { ShareButton } from '@/components/ui/buttons/ShareButton';
import { formatTime } from './MatchHeader';

/**
 * VersusCard — Concept 3 "Versus Poster" (canvas: 3 · Versus, 3a pre-game, 3b live & results)
 * Hero for the NEXT match of the week; the regular MatchList shows the rest.
 *
 * Perspective: the club is ALWAYS on the left (blue half); venue badge says Home/Away.
 * States: upcoming (one-line countdown) · today (<24h: amber tile countdown) · live (score + pulse)
 *         · final (score + Win in teal / Loss·Draw in neutral grey, losing side recedes)
 * Dark island: data-theme="dark" resolves every token for the navy surface.
 */

const DAY_MS = 86_400_000;
const LABELS = { W: 'Win', L: 'Loss', D: 'Draw' } as const;

/** Calendar-day distance (local time): 0 = today, 1 = tomorrow — not "within 24h" */
const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const dayDiff = (target: number, now: number) =>
  Math.round((startOfDay(target) - startOfDay(now)) / DAY_MS);

const splitCountdown = (ms: number) => {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  return {
    days: Math.floor(totalMin / 1440),
    hrs: Math.floor((totalMin % 1440) / 60),
    min: totalMin % 60,
  };
};
const pad = (n: number) => String(n).padStart(2, '0');

/* ── Pieces ─────────────────────────────────────────────────────────── */

const TeamColumn = ({
  team,
  recede,
  age,
}: {
  team: Team;
  recede: boolean;
  age?: string;
}) => {
  const name = cleanTeamName(team.name);
  return (
    <div className='flex min-w-0 flex-col items-center gap-2 text-center'>
      <Crest
        brand={getCrestBrand(team)}
        size='lg'
        className={cn(recede && 'opacity-60')}
      />
      <span
        className={cn(
          'text-title clamp-2',
          recede
            ? 'text-(--color-text-secondary)'
            : 'text-(--color-text-primary)',
        )}
      >
        {name}
      </span>
      {/* Age = identity: white pill under YOUR team's name (not buried in the meta line) */}
      {age && <Badge variant='inverse'>{age}</Badge>}
    </div>
  );
};

const Tile = ({ value, unit }: { value: string; unit: string }) => (
  <div className='flex flex-col items-center rounded-[14px] bg-white/8 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]'>
    <span className='font-mono text-[1.75rem] leading-tight font-bold tabular-nums text-(--color-text-primary)'>
      {value}
    </span>
    <span className='text-label text-(--color-text-secondary)'>{unit}</span>
  </div>
);

/* ── Card ───────────────────────────────────────────────────────────── */

export const VersusCard = ({
  match,
  id,
  onCollapse,
  focusToggle = false,
}: {
  match: Match;
  /** DOM id — target of the collapsed row's aria-controls */
  id?: string;
  /** When provided (focus stack), shows a collapse control */
  onCollapse?: () => void;
  /** Move keyboard focus to the collapse control (after a user-initiated expand) */
  focusToggle?: boolean;
}) => {
  const { status, now } = useMatchStatus(match);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focusToggle) toggleRef.current?.focus();
  }, [focusToggle]);

  const isHomeGame = Boolean(
    match.homeTeam.utility && match.homeTeam.utility !== 'away',
  );
  const club = isHomeGame ? match.homeTeam : match.awayTeam;
  const opponent = isHomeGame ? match.awayTeam : match.homeTeam;

  const age = getAgeGroup(club.name);
  const isTBD = match.time === 'TBD';
  const when = isTBD ? 'Time TBD' : formatTime(match.time);

  const isFinal = status === 'final';
  const isLive = status === 'live';
  const isUpcoming = status === 'upcoming';
  const scored = hasScores(match);
  /* Live before the first score update, or finished before the league posts it */
  const showVs = isUpcoming || !scored;

  const result = isFinal ? club.result : undefined;
  const clubRecedes = result === 'L';
  const oppRecedes = result === 'W';

  const msToKickoff = now === null ? null : match.timestamp - now;
  const isToday = msToKickoff !== null && msToKickoff < DAY_MS;
  const countdown = msToKickoff === null ? null : splitCountdown(msToKickoff);

  // The list's day header already says the date — the meta line only adds what it can't:
  // relative day (Today / Tomorrow), the time, and FT.
  const days = now === null ? null : dayDiff(match.timestamp, now);
  const relative = isFinal
    ? null
    : days === 0
      ? 'Today'
      : days === 1
        ? 'Tomorrow'
        : null;
  const meta = [relative, when, isFinal && 'FT'].filter(Boolean).join(' · ');

  const clubName = cleanTeamName(club.name);
  const oppName = cleanTeamName(opponent.name);

  return (
    <article
      id={id}
      data-theme='dark'
      aria-label={`${isUpcoming ? 'Next match' : isLive ? 'Live match' : 'Result'}: ${clubName} vs ${oppName}`}
      className={cn(
        'flex flex-col gap-4.5 overflow-hidden rounded-(--radius-card) bg-(image:--gradient-versus) px-(--space-card-pad) pt-5.5 pb-(--space-card-pad)',
        'shadow-[0_16px_40px_-12px_rgb(11_15_36/0.45)]',
        isLive && 'ring-1 ring-(--color-result-loss)/40',
      )}
    >
      {/* Meta + venue */}
      <div className='-my-2 flex items-center gap-(--space-stack-sm)'>
        <span className='text-label min-w-0 flex-1 truncate text-(--color-text-secondary)'>
          {meta}
        </span>
        <Badge variant='inverse'>{isHomeGame ? 'Home' : 'Away'}</Badge>
        {onCollapse && (
          <button
            ref={toggleRef}
            type='button'
            onClick={onCollapse}
            aria-expanded='true'
            aria-controls={id}
            aria-label={`Collapse ${clubName} vs ${oppName}`}
            className='tap-area -mr-2 min-w-(--size-tap) shrink-0 justify-center'
          >
            <span className='tap-visual grid size-8 place-items-center rounded-full bg-white/10 text-(--color-icon-default) hover:text-(--color-text-primary)'>
              <ChevronUp
                size={16}
                strokeWidth={1.5}
                absoluteStrokeWidth
                aria-hidden='true'
              />
            </span>
          </button>
        )}
      </div>

      {/* Matchup: club | VS or score | opponent */}
      {/* items-start: crests line up even when one name wraps to 2 lines */}
      <div className='grid grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] items-start gap-1'>
        <TeamColumn team={club} recede={clubRecedes} age={age} />

        {showVs ? (
          <div className='flex h-21 flex-col items-center justify-center gap-1'>
            {!isUpcoming && (
              <span
                className={cn(
                  'text-label font-bold',
                  isLive
                    ? 'text-(--color-danger-on-surface)'
                    : 'text-(--color-warning-on-surface)',
                )}
              >
                {isLive ? 'Live' : 'Awaiting score'}
              </span>
            )}
            <span
              aria-hidden='true'
              className='text-display text-center font-extrabold text-(--brand-crest-ring)'
            >
              VS
            </span>
          </div>
        ) : (
          <div className='flex h-21 flex-col items-center justify-center gap-1'>
            <span
              className={cn(
                'text-label font-bold',
                isLive && 'text-(--color-danger-on-surface)',
                result === 'W' && 'text-(--color-text-accent)',
                (result === 'L' || result === 'D') &&
                  'text-(--color-text-secondary)',
              )}
            >
              {isLive ? 'Live' : result ? LABELS[result] : 'Final'}
            </span>
            <span className='text-display text-[2.5rem] leading-none font-extrabold'>
              <span className='visually-hidden'>
                {clubName} {club.score ?? 0}, {oppName} {opponent.score ?? 0}
              </span>
              <span aria-hidden='true'>
                <span
                  className={
                    clubRecedes
                      ? 'text-(--color-text-secondary)'
                      : 'text-(--color-text-primary)'
                  }
                >
                  {club.score ?? '–'}
                </span>
                <span className='font-semibold text-(--color-text-disabled)'>
                  {' '}
                  –{' '}
                </span>
                <span
                  className={
                    oppRecedes
                      ? 'text-(--color-text-secondary)'
                      : 'text-(--color-text-primary)'
                  }
                >
                  {opponent.score ?? '–'}
                </span>
              </span>
            </span>
          </div>
        )}

        <TeamColumn team={opponent} recede={oppRecedes} />
      </div>

      {/* Countdown, two sizes (client-only: now === null during SSR/hydration):
          >24h → one compact line; game day (<24h) → the big amber tiles below. */}
      {isUpcoming && !isToday && !isTBD && countdown && (
        <div className='flex items-center justify-center gap-(--space-stack-sm)'>
          <span className='text-label text-(--color-text-secondary)'>
            Kickoff in
          </span>
          <span className='visually-hidden'>
            {countdown.days} days, {countdown.hrs} hours
          </span>
          <span
            aria-hidden='true'
            className='font-mono text-[0.9375rem] leading-none font-bold tabular-nums text-(--color-text-primary)'
          >
            {countdown.days}d {countdown.hrs}h
          </span>
        </div>
      )}

      {isUpcoming && isToday && !isTBD && countdown && (
        <div className='flex flex-col items-center gap-(--space-stack-sm)'>
          <span
            className={cn(
              'text-label',
              isToday
                ? 'text-(--color-warning-on-surface)'
                : 'text-(--color-text-secondary)',
            )}
          >
            {relative === 'Today' ? 'Today · kickoff in' : 'Kickoff in'}
          </span>
          <span className='visually-hidden'>
            {countdown.days > 0 && `${countdown.days} days, `}
            {countdown.hrs} hours, {countdown.min} minutes
          </span>
          <div
            aria-hidden='true'
            className={cn(
              'grid w-full gap-(--space-stack-sm)',
              isToday ? 'grid-cols-2' : 'grid-cols-3',
            )}
          >
            {!isToday && <Tile value={pad(countdown.days)} unit='Days' />}
            <Tile value={pad(countdown.hrs)} unit='Hrs' />
            <Tile value={pad(countdown.min)} unit='Min' />
          </div>
        </div>
      )}

      {/* Live status */}
      {isLive && (
        <div className='flex items-center justify-center gap-(--space-stack-sm)'>
          <span className='relative flex size-2' aria-hidden='true'>
            <span className='absolute inline-flex size-full rounded-full bg-(--color-result-loss) opacity-75 motion-safe:animate-ping' />
            <span className='relative inline-flex size-2 rounded-full bg-(--color-result-loss)' />
          </span>
          <span className='text-control text-(--color-text-primary)'>Live</span>
          <span className='text-meta text-(--color-text-secondary)'>
            · started {when}
          </span>
        </div>
      )}

      {/* Footer: Directions until the final whistle · Share always (share the result) */}
      <div
        className={cn('flex gap-(--space-stack-sm)', isFinal && 'justify-end')}
      >
        {!isFinal && <DirectionsButton location={match.location} />}
        <ShareButton match={match} />
      </div>
    </article>
  );
};
