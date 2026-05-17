'use client';

import { useState, useEffect } from 'react';
import { Badge } from './ui/Badge';
import { Calendar, Clock, Flag, FoldHorizontal, MapPin } from 'lucide-react';
import { Match, MatchResult, MatchStatus, Team } from '@/types/match';
import { MetaItem } from './ui/MetaItem';
import SoccerBallIcon from './ui/icons/SoccerBall';
import { cn } from '@/lib/utils';
import { getTimeOfDayAssets } from '@/lib/date-utils';
import { getStatusConfig } from '@/lib/match-utils';
import { ShareButton } from './ShareButton';
import { DirectionsButton } from './DirectionsButton';

export const MatchCard = ({ match }: { match: Match }) => {
  const [currentStatus, setCurrentStatus] = useState<MatchStatus>(match.status);
  const isTBD = match.time === 'TBD';

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
        'p-grid-md rounded-xl bg-surface-card transition-all shadow-lg flex flex-col gap-grid-md w-full max-w-md',
      )}
    >
      {/* Top Row: Meta Info */}
      <MatchHeader
        isConflict={match.isConflict}
        isTightGap={match.isTightGap}
        isTBD={isTBD}
        date={match.date}
        time={match.time}
        location={match.location}
        status={currentStatus}
      />

      {/* Center Row: The Matchup */}
      <div className='flex flex-col items-start justify-between px-2 py-grid-xs'>
        <MatchTeamRow
          team={match.homeTeam}
          score={match.homeTeam.score}
          status={currentStatus}
        />

        <div className='flex items-center w-full my-grid-sm'>
          <Divider />
          <span className='text-surface-muted text-[10px] font-black italic px-4 uppercase tracking-widest'>
            VS
          </span>
          <Divider />
        </div>

        <MatchTeamRow
          team={match.awayTeam}
          score={match.awayTeam.score}
          status={currentStatus}
        />
      </div>

      {/* Bottom Row: Actions */}
      <div className='flex items-center justify-between gap-3 mt-2'>
        <ShareButton match={match} />
        <DirectionsButton location={match.location} />
      </div>
    </div>
  );
};

const Divider = () => <div className='flex-1 h-[1px] bg-divider' />;

const Separator = () => (
  <div className='h-3 w-[1px] bg-divider' aria-hidden='true' />
);

export const MatchHeader = ({
  isConflict,
  isTightGap,
  isTBD,
  date,
  time,
  location,
  status,
}: {
  isConflict?: boolean;
  isTightGap?: boolean;
  isTBD?: boolean;
  date: string;
  time: string;
  location: string;
  status: MatchStatus;
}) => {
  const { TimeIcon } = getTimeOfDayAssets(time);
  const statusConfig = getStatusConfig(status);

  // Cross-browser safe Date formatting fallback logic
  const getFormattedDate = () => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
      }).format(new Date(date));
    } catch (e) {
      return date; // Graceful fallback if original string pattern gets injected directly
    }
  };

  return (
    <div className='flex items-center justify-between w-full text-xs font-semibold tracking-tight'>
      {/* Match Meta Info */}
      <div className='flex items-center gap-grid-sm min-w-0 flex-1 text-brand-navy'>
        <MetaItem
          icon={Calendar}
          label={getFormattedDate()}
          className='shrink-0'
        />
        <Separator />

        {/* Dynamic Live Status Badge Swapping Layer */}
        {status === 'live' ? (
          <div className='flex items-center gap-1.5 text-status-conflict font-black shrink-0 animate-pulse'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-status-conflict opacity-75' />
              <span className='relative inline-flex rounded-full h-2 w-2 bg-status-conflict' />
            </span>
            <span className='uppercase tracking-widest text-[10px]'>Live</span>
          </div>
        ) : statusConfig ? (
          <div
            className={cn(
              'flex items-center gap-1 shrink-0',
              statusConfig.className,
            )}
          >
            <statusConfig.icon size={14} />
            <span className='uppercase tracking-widest text-[10px]'>
              {statusConfig.label}
            </span>
          </div>
        ) : (
          <MetaItem icon={TimeIcon} label={time} className={cn('shrink-0')} />
        )}

        <Separator />
        <MetaItem icon={MapPin} label={location} />

        {/* Status Badges */}
        <div className='flex gap-grid-xs ml-auto'>
          {isConflict && (
            <Badge variant='destructive' className='px-1.5'>
              <Flag size={12} fill='currentColor' />
            </Badge>
          )}
          {isTightGap && (
            <Badge variant='warning' className='px-1.5'>
              <FoldHorizontal size={12} fill='currentColor' />
            </Badge>
          )}
          {isTBD && (
            <Badge variant='warning' className='px-1.5'>
              <Clock size={12} strokeWidth={2.5} />
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const MatchTeamRow = ({
  team,
  score,
  status,
}: {
  team: Team;
  score?: number;
  status: MatchStatus;
}) => {
  const teamBranding = team.utility ?? 'away';

  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-grid-sm min-w-0 flex-1'>
        {/* The Icon Container */}
        <div
          className={cn(
            'flex items-center justify-center p-1 rounded-full shadow-md text-white shrink-0',
            teamBranding,
          )}
        >
          <SoccerBallIcon size={28} />
        </div>

        {/* Name and Badge Container */}
        <div className='flex items-center gap-2 min-w-0'>
          <span className='text-brand-navy font-black text-xl tracking-normal capitalize truncate'>
            {team.name}
          </span>
          {/* Hide outcome result badges during live play windows */}
          {status !== 'live' && <GameBadge result={team.result!} />}
        </div>
      </div>

      {/* Score Area */}
      <div className='text-brand-navy font-black text-2xl tabular-nums min-w-[2rem] flex justify-end ml-4'>
        {status === 'upcoming' ? (
          <div className='bg-divider w-4 h-1 self-center rounded-full opacity-50' />
        ) : score !== undefined ? (
          score
        ) : (
          <span className='text-surface-muted text-xl opacity-50'>-</span>
        )}
      </div>
    </div>
  );
};

export const GameBadge = ({ result }: { result: MatchResult }) => {
  if (!result) return null;

  const styles = {
    W: 'bg-status-success/20 text-status-success border-status-success/30',
    L: 'bg-status-conflict/10 text-status-conflict border-status-conflict/20',
    D: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  };

  const labels = {
    W: 'Win',
    L: 'Loss',
    D: 'Draw',
  };

  return (
    <div
      className={cn(
        'px-2 py-0.5 rounded-sm border text-[10px] font-black uppercase tracking-tighter',
        styles[result],
      )}
    >
      {labels[result]}
    </div>
  );
};
