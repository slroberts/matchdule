'use client';

import { Match } from '@/types/match';
import { useMatchStatus } from '@/hooks/use-match-status';
import { isAwaitingResult } from '@/lib/matches/match-utils';
import { ShareButton } from '@/components/ui/buttons/ShareButton';
import { DirectionsButton } from '@/components/ui/buttons/DirectionsButton';
import { MatchHeader, MatchTeamRow } from '.';

/**
 * MatchCard — Figma: Organisms › MatchCard (Status=Upcoming|Final)
 * surface · radius/card · card-pad · gap stack-md · Elevation/Card (no border)
 * Status comes from the shared match clock (one timer for every card, hydration-safe).
 */
export const MatchCard = ({
  match,
  showDate = true,
}: {
  match: Match;
  /** false when the list already groups by day */
  showDate?: boolean;
}) => {
  const { status: currentStatus } = useMatchStatus(match);
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
        awaitingResult={isAwaitingResult(match, currentStatus)}
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
