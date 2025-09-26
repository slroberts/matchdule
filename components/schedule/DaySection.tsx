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
      <div className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {dateLabel}
      </div>
      <div className='space-y-4'>
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}
