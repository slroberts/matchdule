import { Badge } from '@/components/ui/Badge/Badge';
import { MetaItem } from '@/components/ui/MetaItem/MetaItem';
import { getTimeOfDayAssets } from '@/lib/dates/date-utils';
import { getStatusConfig } from '@/lib/matches/match-utils';
import { cn } from '@/lib/utils';
import { MatchStatus } from '@/types/match';
import { Calendar, Clock, Flag, FoldHorizontal } from 'lucide-react';

const MatchHeader = ({
  isConflict,
  isTightGap,
  isTBD,
  date,
  time,
  status,
  isHomeGame,
}: {
  isConflict?: boolean;
  isTightGap?: boolean;
  isTBD?: boolean;
  date: string;
  time: string;
  status: MatchStatus;
  isHomeGame: boolean;
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
      <div className='flex items-center gap-grid-sm min-w-0 flex-1 '>
        <MetaItem
          icon={Calendar}
          label={getFormattedDate()}
          className='shrink-0'
        />
        <div className='text-lg text-surface-muted'>·</div>
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
        {/* Status Badges */}
        <div className='flex gap-grid-xs ml-auto'>
          {isHomeGame ? (
            <Badge
              variant='default'
              className='px-1.5 text-surface-muted bg-surface-canvas'
            >
              Home
            </Badge>
          ) : (
            <Badge
              variant='default'
              className='px-1.5 text-surface-muted bg-surface-canvas'
            >
              Away
            </Badge>
          )}
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

export default MatchHeader;
