import Link from 'next/link';
import { CalendarOff, FilterX } from 'lucide-react';
import { Match } from '@/types/match';
import { MatchCard } from './MatchCard/MatchCard';
import { cn } from '@/lib/utils';
import { Button, buttonClasses } from '@/components/ui/buttons/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

/**
 * MatchList — Figma: Screens › Schedule
 * Matches are grouped under day headers ("Sunday, Sep 27"), so each card shows time only.
 * Stagger animation is motion-safe: with reduced motion, cards render visible immediately
 * (a bare `opacity-0` would leave them invisible when the animation is disabled).
 */

interface MatchListProps {
  matches: Match[];
  className?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  /** Rest-week escape hatch, e.g. { href: '/?date=2026-10-12', label: 'Oct 12 – 18' } */
  nextMatch?: { href: string; label: string };
}

const formatDay = (date: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const groupByDay = (matches: Match[]) => {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const day = groups.get(match.date) ?? [];
    day.push(match);
    groups.set(match.date, day);
  }
  return [...groups.entries()];
};

export const MatchList = ({
  matches,
  className,
  hasActiveFilters = false,
  onClearFilters,
  nextMatch,
}: MatchListProps) => {
  if (matches.length === 0) {
    return (
      <ScheduleEmpty
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        nextMatch={nextMatch}
      />
    );
  }

  // Global order for the stagger delay across day groups
  const order = new Map(matches.map((m, i) => [m.id, i]));

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-lg flex-col gap-(--space-stack-md) px-(--space-gutter)',
        className,
      )}
    >
      {groupByDay(matches).map(([day, dayMatches]) => {
        const headingId = `day-${day.replace(/\W+/g, '-')}`;

        return (
          <section
            key={day}
            aria-labelledby={headingId}
            className='flex flex-col gap-(--space-stack-md)'
          >
            <h3
              id={headingId}
              className='text-label text-(--color-text-secondary)'
            >
              {formatDay(day)}
            </h3>

            <ul className='flex flex-col gap-(--space-stack-md)'>
              {dayMatches.map((match) => (
                <li
                  key={match.id}
                  className='stagger-fade list-none'
                  style={{
                    animationDelay: `${(order.get(match.id) ?? 0) * 75}ms`,
                  }}
                >
                  <MatchCard match={match} showDate={false} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

/** Figma: Molecules › EmptyState — what happened, why, and what to do next */
const ScheduleEmpty = ({
  hasActiveFilters,
  onClearFilters,
  nextMatch,
}: {
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
  nextMatch?: { href: string; label: string };
}) => (
  <EmptyState
    icon={hasActiveFilters ? FilterX : CalendarOff}
    title={hasActiveFilters ? 'No matches fit these filters' : 'Rest week'}
    body={
      hasActiveFilters
        ? "None of this week's matches fit your filters. Remove one or clear them to see more."
        : 'No matches scheduled this week.'
    }
    action={
      hasActiveFilters && onClearFilters ? (
        <Button onClick={onClearFilters}>Clear filters</Button>
      ) : !hasActiveFilters && nextMatch ? (
        <Link href={nextMatch.href} className={buttonClasses()}>
          Go to {nextMatch.label}
        </Link>
      ) : undefined
    }
  />
);
