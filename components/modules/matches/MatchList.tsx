import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { cn } from '@/lib/utils';
import { CalendarOff, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';

interface MatchListProps {
  matches: Match[];
  className?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export const MatchList = ({
  matches,
  className,
  hasActiveFilters = false,
  onClearFilters,
}: MatchListProps) => {
  return (
    <div>
      {matches.length > 0 ? (
        <ul
          className={cn(
            'flex flex-col gap-grid-md w-full max-w-md mx-auto',
            className,
          )}
        >
          {matches.map((match: Match, index: number) => (
            <li
              key={match.id}
              className='list-none opacity-0 animate-stagger-fade'
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <MatchCard match={match} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      )}
    </div>
  );
};

const EmptyState = ({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
}) => (
  <div className='flex flex-col items-center justify-center py-20 -mx-6 px-6 text-center opacity-0 animate-stagger-fade bg-surface-canvas z-10'>
    <div className='relative mb-6'>
      <div className='absolute inset-0 bg-brand-navy/5 blur-xl rounded-full scale-150' />

      <div className='relative bg-surface-card border-2 border-divider shadow-sm rounded-full p-6 text-brand-navy/40'>
        {hasActiveFilters ? (
          <FilterX size={42} strokeWidth={1.5} />
        ) : (
          <CalendarOff size={42} strokeWidth={1.5} />
        )}
      </div>
    </div>

    <h3 className='text-xl font-black text-brand-navy uppercase tracking-tight mb-2'>
      {hasActiveFilters ? 'No Results' : 'Rest Week'}
    </h3>

    <p className='text-sm font-medium text-surface-muted max-w-[260px] leading-relaxed'>
      {hasActiveFilters
        ? "We couldn't find any matches that fit your current filters. Try broadening your search."
        : 'There are no matches scheduled for this timeframe. Time to recover and hit the training pitch.'}
    </p>

    {hasActiveFilters && onClearFilters && (
      <Button
        onClick={onClearFilters}
        className='mt-4 bg-brand-navy text-white hover:bg-brand-navy/90 active:scale-95 transition-all px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md'
      >
        Clear Filters
      </Button>
    )}
  </div>
);
