'use client';

import { Clock, TriangleAlert } from 'lucide-react';
import { useMatchClock } from '@/hooks/use-match-status';
import { formatNY } from '@/lib/dates/ny-time';
import { relativeTime, STALE_AFTER_MS } from '@/lib/dates/relative-time';
import { cn } from '@/lib/utils';

/**
 * DataFreshness — Figma: DataFreshness (State=Fresh | Stale)
 * How fresh the DATA is (last scraper write), not the page render.
 *   Fresh:  grey clock · "Updated 12 min ago"
 *   Stale (> 24 h): amber alert · "Schedule may be out of date · updated 2 days ago"
 * Hydration-safe: server + first client render show the absolute time ("Sun 11:02 AM"),
 * then the shared 30s clock switches it to relative.
 */

export const DataFreshness = ({
  updatedAt,
  className,
}: {
  updatedAt?: number | null;
  className?: string;
}) => {
  const now = useMatchClock();
  if (!updatedAt) return null;

  const absolute = formatNY(updatedAt, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  const stale = now !== null && now - updatedAt > STALE_AFTER_MS;
  const when = now === null ? absolute : relativeTime(updatedAt, now);

  return (
    <p
      className={cn(
        'text-meta flex items-center gap-1.5 py-2',
        stale ? 'text-(--color-text-primary)' : 'text-(--color-text-secondary)',
        className,
      )}
    >
      {stale ? (
        <TriangleAlert
          size={14}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
          className='shrink-0 text-(--color-warning-icon)'
        />
      ) : (
        <Clock
          size={14}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
          className='shrink-0 text-(--color-icon-default)'
        />
      )}
      <span>
        {stale ? 'Schedule may be out of date · updated ' : 'Updated '}
        <time dateTime={new Date(updatedAt).toISOString()} title={absolute}>
          {when}
        </time>
      </span>
    </p>
  );
};
