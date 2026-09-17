'use client';

import { useState, useEffect } from 'react';
import { Match, MatchStatus } from '@/types/match';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/ui/buttons/ShareButton';
import { DirectionsButton } from '@/components/ui/buttons/DirectionsButton';
import { MatchHeader, MatchTeamRow } from '.';

export const MatchCard = ({ match }: { match: Match }) => {
  const [currentStatus, setCurrentStatus] = useState<MatchStatus>(match.status);
  const isTBD = match.time === 'TBD';
  const isHomeGame = Boolean(
    match.homeTeam.utility && match.homeTeam.utility !== 'away',
  );

  // Active client-side clock to keep status perfectly synchronized in real-time
  useEffect(() => {
    if (match.status === 'final' || match.status === 'canceled') return;

    const gameEndMs = match.timestamp + 105 * 60000; // Kickoff + 105 minutes

    const calculateLiveStatus = () => {
      const now = Date.now();

      if (now > gameEndMs) {
        setCurrentStatus('final');
      } else if (now >= match.timestamp && now <= gameEndMs) {
        setCurrentStatus('live');
      } else {
        setCurrentStatus('upcoming');
      }
    };

    calculateLiveStatus();
    const interval = setInterval(calculateLiveStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [match]);

  return (
    <div
      className={cn(
        'p-grid-md rounded-xl bg-surface-card transition-all shadow-lg flex gap-grid-sm flex-col w-full max-w-md',
      )}
    >
      {/* Top Row: Meta Info */}
      <MatchHeader
        isConflict={match.isConflict}
        isTightGap={match.isTightGap}
        isTBD={isTBD}
        date={match.date}
        time={match.time}
        status={currentStatus}
        isHomeGame={isHomeGame}
      />

      {/* Center Row: The Matchup */}
      <div className='flex flex-col gap-4 items-start justify-between px-2 py-grid-xs'>
        <MatchTeamRow
          team={match.homeTeam}
          score={match.homeTeam.score}
          status={currentStatus}
        />

        <MatchTeamRow
          team={match.awayTeam}
          score={match.awayTeam.score}
          status={currentStatus}
        />
      </div>

      {/* Bottom Row: Actions */}
      <div className='flex items-center justify-between gap-3 mt-2'>
        <DirectionsButton location={match.location} />
        <ShareButton match={match} />
      </div>
    </div>
  );
};
