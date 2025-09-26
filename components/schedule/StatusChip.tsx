import { Game } from '@/types/schedule';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export default function StatusChip({ game }: { game: Game }) {
  const now = Date.now();
  const start = game.startISO ? new Date(game.startISO).getTime() : null;
  const end = game.endISO ? new Date(game.endISO).getTime() : null;

  let label: 'LIVE' | 'FINAL' | 'SCHEDULED' = 'SCHEDULED';
  if (game.result) label = 'FINAL';
  else if (start && end && now >= start && now <= end) label = 'LIVE';

  const className =
    label === 'LIVE'
      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300'
      : label === 'FINAL'
      ? 'bg-muted text-foreground/80'
      : null;

  return (
    <Badge
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-semibold',
        className
      )}
      variant='outline'
    >
      {label}
    </Badge>
  );
}
