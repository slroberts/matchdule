import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Match } from '@/types/match';
import { cn } from '@/lib/utils';
import { cleanTeamName } from '@/lib/matches/match-utils';
import { formatTime } from './MatchCard/MatchHeader';

/**
 * NextUpLink — Figma: Molecules › NextUpLink
 * Dark Versus split that previews the highlight it leads to.
 * Used twice: after a finished current week, and as the Rest week action.
 */

/** Local YYYY-MM-DD for ?date= links (any day inside the target week) */
export const toDateParam = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const shortDay = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));

/** "9:45 AM vs Pelham Bay…" / "12:00 PM at Triboro…" — club perspective */
export const describeMatch = (m: Match) => {
  const isHome = Boolean(m.homeTeam.utility && m.homeTeam.utility !== 'away');
  const opp = cleanTeamName((isHome ? m.awayTeam : m.homeTeam).name);
  const when = m.time === 'TBD' ? 'time TBD' : formatTime(m.time);
  return `${when} ${isHome ? 'vs' : 'at'} ${opp}`;
};

export const NextUpLink = ({
  match,
  className,
}: {
  match: Match;
  className?: string;
}) => (
  <Link
    href={`/?date=${toDateParam(match.timestamp)}`}
    data-theme='dark'
    className={cn(
      'pressable flex min-h-16 w-full items-center gap-(--space-stack-md) rounded-2xl bg-(image:--gradient-versus) px-(--space-card-pad) py-3 text-left shadow-[0_10px_24px_-10px_rgb(11_15_36/0.35)]',
      className,
    )}
  >
    <span className='flex min-w-0 flex-1 flex-col gap-1'>
      <span className='text-label text-(--color-text-accent)'>Next up</span>
      <span className='text-control truncate text-(--color-text-primary)'>
        {shortDay(match.timestamp)} · {describeMatch(match)}
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
);
