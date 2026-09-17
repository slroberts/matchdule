import { cn } from '@/lib/utils';
import { MatchResult } from '@/types/match';

const GameBadge = ({ result }: { result: MatchResult }) => {
  if (!result) return null;

  const styles = {
    W: 'text-status-success',
    L: 'text-status-draw',
    D: 'text-status-draw',
  };

  const labels = {
    W: 'Win',
    L: 'Loss',
    D: 'Draw',
  };

  return (
    <div
      className={cn(
        'text-[10px] font-black uppercase tracking-widest',
        styles[result],
      )}
    >
      {labels[result]}
    </div>
  );
};

export default GameBadge;
