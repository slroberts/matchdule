import { Badge } from './ui/Badge';
import {
  Calendar,
  Clock,
  Flag,
  FoldHorizontal,
  MapPin,
  MapPinned,
  Share2,
} from 'lucide-react';
import { Match, MatchResult, MatchStatus, Team } from '@/types/match';
import { MetaItem } from './ui/MetaItem';
import SoccerBallIcon from './ui/icons/SoccerBall';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { getTimeOfDayAssets } from '@/lib/date-utils';
import { getStatusConfig } from '@/lib/match-utils';
import { ShareButton } from './ShareButton';
import { DirectionsButton } from './DirectionsButton';

export const MatchCard = ({ match }: { match: Match }) => {
  const isTBD = match.time === 'TBD';

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
        status={match.status}
      />

      {/* Center Row: The Matchup */}
      <div className='flex flex-col items-start justify-between px-2 py-grid-xs'>
        {/* Pass actual scores from the team objects */}
        <MatchTeamRow
          team={match.homeTeam}
          score={match.homeTeam.score}
          status={match.status}
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
          status={match.status}
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
  const statusConfig = getStatusConfig(status as MatchStatus);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(date));

  return (
    <div className='flex items-center justify-between w-full text-xs font-semibold tracking-tight'>
      {/* Match Meta Info */}
      <div className='flex items-center gap-grid-sm min-w-0 flex-1 text-brand-navy'>
        <MetaItem icon={Calendar} label={formattedDate} className='shrink-0' />
        <Separator />
        {!statusConfig ? (
          <MetaItem icon={TimeIcon} label={time} className={cn('shrink-0')} />
        ) : (
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
          <GameBadge result={team.result!} />
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
