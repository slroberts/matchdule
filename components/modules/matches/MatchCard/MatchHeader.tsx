import type { ReactNode } from 'react';
import { Flag, TriangleAlert, type LucideIcon } from 'lucide-react';
import { getTimeOfDayAssets } from '@/lib/dates/date-utils';
import { getStatusConfig } from '@/lib/matches/match-utils';
import { cn } from '@/lib/utils';
import { MatchStatus } from '@/types/match';

/**
 * MatchHeader — Figma: MatchCard › Meta
 * [time-of-day icon] [time · FILL] [status] ……… [warning badges] [Home|Away]
 * Icon = same set as the filter chips: Sun < 12 PM · Sunset 12–5 PM · Moon ≥ 5 PM · Clock TBD
 * Alert vocabulary (audit): "Conflict" = overlapping times · "Tight gap" = < 60 min between games
 */

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;
const BADGE_ICON = {
  size: 12,
  strokeWidth: 1.5,
  absoluteStrokeWidth: true,
} as const;

/* Figma: Atoms › Badge */
const BADGE =
  'text-label inline-flex shrink-0 items-center gap-(--space-stack-xs) whitespace-nowrap rounded-(--radius-full) px-(--space-stack-sm) py-(--space-stack-xs)';
const BADGE_NEUTRAL = 'bg-(--color-bg-subtle) text-(--color-text-secondary)';
/* Status = neutral pill + navy text; the icon carries the meaning (warning orange / danger red) */
const BADGE_WARNING =
  'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-warning-icon)';
const BADGE_DANGER =
  'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-danger-icon)';

const formatDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
};

/** "1:00PM" | "5:15 pm" → "1:00 PM" (audit: one time format everywhere) */
export const formatTime = (time: string) => {
  const m = time.trim().match(/^(\d{1,2}:\d{2})\s*([ap])\.?m\.?$/i);
  return m ? `${m[1]} ${m[2].toUpperCase()}M` : time;
};

const StatusBadge = ({
  icon: Icon,
  label,
  tone = 'warning',
}: {
  icon: LucideIcon;
  label: string;
  tone?: 'warning' | 'danger';
}) => (
  <span className={cn(BADGE, tone === 'danger' ? BADGE_DANGER : BADGE_WARNING)}>
    <Icon {...BADGE_ICON} aria-hidden='true' />
    {label}
  </span>
);

const MatchHeader = ({
  isConflict,
  isTightGap,
  isTBD,
  date,
  time,
  status,
  isHomeGame,
  showDate = true,
  awaitingResult = false,
  trailing,
}: {
  isConflict?: boolean;
  isTightGap?: boolean;
  isTBD?: boolean;
  date: string;
  time: string;
  status: MatchStatus;
  isHomeGame: boolean;
  showDate?: boolean;
  /** Game over, score not posted yet → "Pending" instead of "Final" */
  awaitingResult?: boolean;
  /** Extra control after the venue badge (e.g. the focus-stack collapse ⌃) */
  trailing?: ReactNode;
}) => {
  const statusConfig =
    status === 'live' ? null : getStatusConfig(status, { awaitingResult });
  const when = isTBD ? 'Time TBD' : formatTime(time);
  const label = showDate ? `${formatDate(date)} · ${when}` : when;
  // Same icon + buckets as the filter drawer's Morning/Afternoon/Evening chips
  const { TimeIcon: LeadIcon } = getTimeOfDayAssets(isTBD ? 'TBD' : time);

  return (
    <div className='flex w-full flex-wrap items-center gap-(--space-stack-sm)'>
      <div className='flex min-w-0 flex-1 items-center gap-(--space-stack-sm)'>
        <LeadIcon
          {...ICON}
          aria-hidden='true'
          className={cn(
            'shrink-0',
            isTBD
              ? 'text-(--color-warning-icon)'
              : 'text-(--color-icon-default)',
          )}
        />
        <span className='text-control truncate tabular-nums text-(--color-text-primary)'>
          {label}
        </span>

        {status === 'live' && (
          <span className='text-label inline-flex shrink-0 items-center gap-1.5 text-(--color-result-loss)'>
            <span className='relative flex size-2' aria-hidden='true'>
              <span className='absolute inline-flex size-full rounded-full bg-(--color-result-loss) opacity-75 motion-safe:animate-ping' />
              <span className='relative inline-flex size-2 rounded-full bg-(--color-result-loss)' />
            </span>
            Live
          </span>
        )}

        {statusConfig && (
          <span className={cn(BADGE, BADGE_NEUTRAL, statusConfig.className)}>
            <statusConfig.icon {...BADGE_ICON} aria-hidden='true' />
            {statusConfig.label}
          </span>
        )}
      </div>

      <div className='ml-auto flex shrink-0 items-center gap-(--space-stack-xs)'>
        {isConflict && (
          <StatusBadge icon={Flag} label='Conflict' tone='danger' />
        )}
        {isTightGap && <StatusBadge icon={TriangleAlert} label='Tight gap' />}
        <span className={cn(BADGE, BADGE_NEUTRAL)}>
          {isHomeGame ? 'Home' : 'Away'}
        </span>
        {trailing}
      </div>
    </div>
  );
};

export default MatchHeader;
