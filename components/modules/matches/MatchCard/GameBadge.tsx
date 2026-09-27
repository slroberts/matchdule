import { cn } from '@/lib/utils';
import { MatchResult } from '@/types/match';

/**
 * GameBadge — match result
 *   variant="dot"   (default) Figma: Atoms › FormDot — 20px W/D/L circle (Standings form)
 *   variant="label"           Result word above a score (Match card) — text-label caps
 * Letter/word + color, never color alone (WCAG 1.4.1). All pairs ≥ 4.5:1.
 */

type Variant = 'dot' | 'label';

const LABELS = { W: 'Win', L: 'Loss', D: 'Draw' } as const;

const DOT_STYLES = {
  W: 'bg-(--color-result-win)',
  L: 'bg-(--color-result-loss)',
  D: 'bg-(--color-result-draw)',
} as const;

/* Win celebrates; loss/draw stay neutral — it's youth sport, not a scoreboard */
const LABEL_STYLES = {
  W: 'text-(--color-text-win)',
  L: 'text-(--color-text-secondary)',
  D: 'text-(--color-text-secondary)',
} as const;

const GameBadge = ({
  result,
  variant = 'dot',
  className,
}: {
  result: MatchResult;
  variant?: Variant;
  className?: string;
}) => {
  if (!result) return null;

  if (variant === 'label') {
    return (
      <span
        className={cn(
          'text-label block font-black leading-none',
          LABEL_STYLES[result],
          className,
        )}
      >
        {LABELS[result]}
      </span>
    );
  }

  return (
    <span
      role='img'
      aria-label={LABELS[result]}
      className={cn(
        'text-label inline-grid size-5 shrink-0 place-items-center rounded-full tracking-normal text-(--color-text-on-result)',
        DOT_STYLES[result],
        className,
      )}
    >
      <span aria-hidden='true'>{result}</span>
    </span>
  );
};

export default GameBadge;
