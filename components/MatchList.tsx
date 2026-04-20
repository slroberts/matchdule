import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { cn } from '@/lib/utils';

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
          {matches.map((match) => (
            <li key={match.id} className='list-none'>
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
  <div className='text-center py-10 text-surface-muted'>
    <p className='font-bold uppercase tracking-widest text-xs'>
      No matches scheduled
    </p>
  </div>
);
