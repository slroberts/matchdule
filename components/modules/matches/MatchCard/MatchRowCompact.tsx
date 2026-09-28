'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown, Flag, TriangleAlert } from 'lucide-react';
import { Match } from '@/types/match';
import { cn } from '@/lib/utils';
import { cleanTeamName, hasScores } from '@/lib/matches/match-utils';
import {
  getAgeGroup,
  getClubLabel,
  getCrestBrand,
} from '@/lib/matches/team-meta';
import { useMatchStatus } from '@/hooks/use-match-status';
import { Badge } from '@/components/ui/Badge/Badge';
import { Crest } from '@/components/ui/Crest/Crest';
import { formatTime } from './MatchHeader';

/**
 * MatchRowCompact — collapsed state in the focus stack (Figma: MatchRowCompact)
 * Whole row = one disclosure button (≥64px).
 *   [rail: time | Live | score + result]  [YOUR crest]
 *   line 1  WHO      — your team label + age   ("Soricha  U13")
 *   line 2  AGAINST  — vs opponent             ("vs Manhattan SC Genoa")
 *   line 3  WHERE    — HOME/AWAY chip + field  ("HOME  Crotona Park Turf Field #2")
 *   [alert] [chevron]
 */

const LABELS = { W: 'Win', L: 'Loss', D: 'Draw' } as const;
const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

export const MatchRowCompact = ({
  match,
  onExpand,
  controlsId,
  focusToggle = false,
}: {
  match: Match;
  onExpand: () => void;
  controlsId: string;
  focusToggle?: boolean;
}) => {
  const { status } = useMatchStatus(match);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focusToggle) ref.current?.focus();
  }, [focusToggle]);

  const isHomeGame = Boolean(
    match.homeTeam.utility && match.homeTeam.utility !== 'away',
  );
  const club = isHomeGame ? match.homeTeam : match.awayTeam;
  const opponent = isHomeGame ? match.awayTeam : match.homeTeam;
  const clubLabel = getClubLabel(club, cleanTeamName(club.name));
  const oppName = cleanTeamName(opponent.name);
  const age = getAgeGroup(club.name);

  const isTBD = match.time === 'TBD';
  const [clock, meridiem] = (isTBD ? 'TBD' : formatTime(match.time)).split(' ');
  const isFinal = status === 'final';
  const isLive = status === 'live';
  const result = isFinal ? club.result : undefined;

  return (
    <button
      ref={ref}
      type='button'
      onClick={onExpand}
      aria-expanded='false'
      aria-controls={controlsId}
      className='pressable flex min-h-16 w-full items-center gap-(--space-stack-md) rounded-2xl bg-(--color-bg-surface) px-(--space-card-pad) py-3 text-left shadow-(--shadow-card)'
    >
      {/* Rail: time → live → score (or pending) */}
      <span className='flex w-14 shrink-0 flex-col items-start'>
        {isFinal && !hasScores(match) ? (
          <>
            <span className='text-score leading-none text-(--color-text-secondary)'>
              FT
            </span>
            <span className='text-label mt-1 font-bold text-(--color-warning-on-surface)'>
              Pending
            </span>
          </>
        ) : isFinal ? (
          <>
            <span className='text-score leading-none text-(--color-text-primary)'>
              {club.score}–{opponent.score}
            </span>
            <span
              className={cn(
                'text-label mt-1 font-bold',
                result === 'W'
                  ? 'text-(--color-text-win)'
                  : 'text-(--color-text-secondary)',
              )}
            >
              {result ? LABELS[result] : 'Final'}
            </span>
          </>
        ) : isLive ? (
          <span className='text-label inline-flex items-center gap-1.5 font-bold text-(--color-result-loss)'>
            <span className='relative flex size-2' aria-hidden='true'>
              <span className='absolute inline-flex size-full rounded-full bg-(--color-result-loss) opacity-75 motion-safe:animate-ping' />
              <span className='relative inline-flex size-2 rounded-full bg-(--color-result-loss)' />
            </span>
            Live
          </span>
        ) : (
          <>
            <span className='text-score leading-none text-(--color-text-primary)'>
              {clock}
            </span>
            {meridiem && (
              <span className='text-label mt-1 text-(--color-text-secondary)'>
                {meridiem}
              </span>
            )}
          </>
        )}
      </span>

      {/* Your club's crest — identity, not decoration */}
      <Crest brand={getCrestBrand(club)} />

      <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
        {/* WHO — which of your teams */}
        <span className='flex min-w-0 items-center gap-(--space-stack-sm)'>
          <span className='text-control truncate font-bold text-(--color-text-primary)'>
            {clubLabel}
          </span>
          {age && (
            <Badge variant='inverse' size='xs'>
              {age}
            </Badge>
          )}
        </span>
        {/* AGAINST */}
        <span className='text-meta truncate font-bold text-(--color-text-primary)'>
          <span className='font-medium text-(--color-text-secondary)'>vs</span>{' '}
          {oppName}
        </span>
        {/* WHERE — venue chip + field */}
        <span className='flex min-w-0 items-center gap-(--space-stack-sm)'>
          <Badge size='xs'>{isHomeGame ? 'Home' : 'Away'}</Badge>
          <span className='text-meta truncate text-(--color-text-secondary)'>
            {match.location}
          </span>
        </span>
      </span>

      {/* Urgency — icon + screen-reader text */}
      {match.isConflict ? (
        <span className='shrink-0 text-(--color-danger-on-surface)'>
          <Flag {...ICON} aria-hidden='true' />
          <span className='visually-hidden'>Conflict</span>
        </span>
      ) : match.isTightGap ? (
        <span className='shrink-0 text-(--color-warning-on-surface)'>
          <TriangleAlert {...ICON} aria-hidden='true' />
          <span className='visually-hidden'>Tight gap</span>
        </span>
      ) : null}

      <ChevronDown
        {...ICON}
        aria-hidden='true'
        className='shrink-0 text-(--color-icon-default)'
      />
      <span className='visually-hidden'>Show match details</span>
    </button>
  );
};
