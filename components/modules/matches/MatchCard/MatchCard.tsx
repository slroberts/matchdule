'use client';

import { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { Match } from '@/types/match';
import { useMatchStatus } from '@/hooks/use-match-status';
import { isAwaitingResult } from '@/lib/matches/match-utils';
import { ShareButton } from '@/components/ui/buttons/ShareButton';
import { DirectionsButton } from '@/components/ui/buttons/DirectionsButton';
import { CalendarButton } from '@/components/ui/buttons/CalendarButton';
import { MatchHeader, MatchTeamRow } from '.';
import { formatTime } from './MatchHeader';

/**
 * MatchCard — Figma: Organisms › MatchCard (Status · Collapsible)
 * The light "detail" card. In the focus stack it's the MANUALLY expanded state
 * (the auto-focused game uses VersusCard). onCollapse shows the ⌃ control.
 */
export const MatchCard = ({
  match,
  showDate = true,
  id,
  onCollapse,
  focusToggle = false,
}: {
  match: Match;
  /** false when the list already groups by day */
  showDate?: boolean;
  /** DOM id — target of the compact row's aria-controls */
  id?: string;
  /** Focus stack: shows ⌃ to collapse back to the compact row */
  onCollapse?: () => void;
  /** Move keyboard focus to ⌃ after a user-initiated expand */
  focusToggle?: boolean;
}) => {
  const { status: currentStatus } = useMatchStatus(match);
  const isTBD = match.time === 'TBD';
  const isHomeGame = Boolean(
    match.homeTeam.utility && match.homeTeam.utility !== 'away',
  );

  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focusToggle) toggleRef.current?.focus();
  }, [focusToggle]);

  const collapse = onCollapse && (
    <button
      ref={toggleRef}
      type='button'
      onClick={onCollapse}
      aria-expanded='true'
      aria-controls={id}
      aria-label={`Collapse ${isTBD ? 'match' : `${formatTime(match.time)} match`}`}
      className='tap-area -my-2.5 -mr-2 min-w-(--size-tap) shrink-0 justify-center'
    >
      <span className='tap-visual grid size-8 place-items-center rounded-full bg-(--color-bg-subtle) text-(--color-icon-default) hover:text-(--color-text-primary)'>
        <ChevronUp
          size={16}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
        />
      </span>
    </button>
  );

  return (
    <article
      id={id}
      className='flex w-full flex-col gap-(--space-stack-md) rounded-(--radius-card) bg-(--color-bg-surface) p-(--space-card-pad) shadow-(--shadow-card)'
    >
      <MatchHeader
        isConflict={match.isConflict}
        isTightGap={match.isTightGap}
        isTBD={isTBD}
        date={match.date}
        time={match.time}
        status={currentStatus}
        isHomeGame={isHomeGame}
        showDate={showDate}
        awaitingResult={isAwaitingResult(match, currentStatus)}
        trailing={collapse}
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

      {/* Footer: gap stack-sm · Calendar only before kickoff */}
      <div className='flex items-stretch gap-(--space-stack-sm)'>
        <DirectionsButton location={match.location} />
        {currentStatus === 'upcoming' && <CalendarButton match={match} />}
        <ShareButton match={match} />
      </div>
    </article>
  );
};
