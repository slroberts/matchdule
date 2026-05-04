import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { cn } from '@/lib/utils';
import { CalendarOff } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  className?: string;
}

export const MatchList = ({ matches, className }: MatchListProps) => {
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
        <EmptyState />
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center py-20 px-6 text-center opacity-0 animate-stagger-fade'>
    <div className='relative mb-6'>
      <div className='absolute inset-0 bg-brand-navy/5 blur-xl rounded-full scale-150' />

      <div className='relative bg-surface-card border-2 border-divider shadow-sm rounded-full p-6 text-brand-navy/40'>
        <CalendarOff size={42} strokeWidth={1.5} />
      </div>
    </div>

    <h3 className='text-xl font-black text-brand-navy uppercase tracking-tight mb-2'>
      Rest Week
    </h3>

    <p className='text-sm font-medium text-surface-muted max-w-[260px] leading-relaxed'>
      There are no matches scheduled for this timeframe. Time to recover and hit
      the training pitch.
    </p>
  </div>
);
