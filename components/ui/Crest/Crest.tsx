import SoccerBallIcon from '@/components/ui/icons/SoccerBall';
import { cn } from '@/lib/utils';
import type { CrestBrand } from '@/lib/matches/team-meta';

/**
 * Crest — Figma: Atoms › Crest (Tone=Soricha|Opponent · Size=Sm|Lg)
 * Conic "split ball" background + the SoccerBall glyph.
 *   soricha  → yellow / blue      (--gradient-crest-soricha)
 *   opponent → graphite           (--gradient-crest-opponent) — every other team, incl. B&G
 * Sizes: sm = team rows (--size-avatar 32/36px) · lg = Versus hero (84px)
 * Decorative: the team name is always rendered beside it.
 */

type Size = 'sm' | 'lg';

const SIZES: Record<Size, { box: string; icon: number; shadow: string }> = {
  sm: {
    box: 'size-(--size-avatar)',
    icon: 24,
    shadow: 'shadow-[0_2px_6px_rgb(11_15_36/0.18)]',
  },
  lg: {
    box: 'size-21',
    icon: 62,
    shadow: 'shadow-[0_8px_24px_-6px_rgb(0_0_0/0.45)]',
  },
};

const BRANDS: Record<CrestBrand, string> = {
  soricha: 'bg-(image:--gradient-crest-soricha)',
  opponent: 'bg-(image:--gradient-crest-opponent)',
};

export const Crest = ({
  brand,
  size = 'sm',
  className,
}: {
  brand: CrestBrand;
  size?: Size;
  className?: string;
}) => {
  const s = SIZES[size];
  return (
    <span
      aria-hidden='true'
      className={cn(
        'grid shrink-0 place-items-center rounded-full text-white',
        s.box,
        s.shadow,
        BRANDS[brand],
        className,
      )}
    >
      <span className='grid place-items-center opacity-92'>
        <SoccerBallIcon size={s.icon} />
      </span>
    </span>
  );
};
