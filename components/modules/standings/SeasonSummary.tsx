import type { SeasonStats } from '@/lib/matches/season-stats';
import { WdlBar, WdlLegend } from './WdlBar';

/**
 * SeasonSummary — Figma: SeasonSummary. All your teams combined, readable in ~2 seconds.
 * Dark Versus split = the same "headline" language as the schedule highlight.
 */
export const SeasonSummary = ({
  season,
  totals,
}: Pick<SeasonStats, 'season' | 'totals'>) => (
  <section
    data-theme='dark'
    aria-label={`${season} so far: ${totals.w} wins from ${totals.gp} games`}
    className='flex flex-col gap-3 rounded-(--radius-card) bg-(image:--gradient-versus) px-(--space-card-pad) pt-4.5 pb-(--space-card-pad) shadow-[0_16px_40px_-12px_rgb(11_15_36/0.45)]'
  >
    <span className='text-label text-(--color-text-accent)'>
      {season} so far
    </span>
    <p className='flex items-baseline gap-2'>
      <span className='text-display text-[2.5rem] leading-none font-extrabold text-(--color-text-primary)'>
        {totals.w} {totals.w === 1 ? 'win' : 'wins'}
      </span>
      <span className='text-control text-(--color-text-secondary)'>
        from {totals.gp} {totals.gp === 1 ? 'game' : 'games'}
      </span>
    </p>
    <WdlBar w={totals.w} d={totals.d} l={totals.l} />
    <WdlLegend w={totals.w} d={totals.d} l={totals.l} />
  </section>
);
