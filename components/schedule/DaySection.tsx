import { Game } from '@/types/schedule';
import { GameCard } from '.';

export default function DaySection({
  dateLabel,
  games,
}: {
  dateLabel: string;
  games: Game[];
}) {
  if (!games.length) return null;
  return (
    <section className='space-y-2 mb-6'>
      <div className='flex items-center gap-3'>
        <span className='h-px flex-1 bg-border' />
        <span
          className='text-base font-bold uppercase tracking-wider
                   text-foreground/80'
        >
          {dateLabel}
        </span>
        <span className='h-px flex-1 bg-border' />
      </div>

      <div className='space-y-4'>
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}
