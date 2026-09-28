import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SeasonStats } from '@/lib/matches/season-stats';
import { WdlBar, WdlLegend } from '@/components/modules/standings/WdlBar';

/**
 * SeasonWrapCard — Figma: SeasonWrapCard (Next season=Scheduled | Not scheduled)
 * Off-season state: replaces "Next up" when the week is done and the next game is in a NEW
 * season (or none is scheduled), and replaces the rest-week empty state in off-season weeks.
 * Dark = headline. Celebrate first (recap + W/D/L), then look ahead.
 */

interface Props {
  /** Most recent season with results, e.g. "Fall 2026" */
  season: string;
  totals: SeasonStats['totals'];
  /** First game of the next season, if the schedule is out */
  next?: { label: string; when: string; href: string };
  /** Shown when there's no next game: e.g. "Spring 2027" */
  upcomingSeason: string;
  /** Season tab URL (/?view=season…) — real link for long-press / share */
  seasonHref?: string;
  /** Switch to the Season tab in place (pushState, no refetch) */
  onViewSeason?: () => void;
}

export const SeasonWrapCard = ({
  season,
  totals,
  next,
  upcomingSeason,
  seasonHref,
  onViewSeason,
}: Props) => (
  <section
    data-theme='dark'
    aria-label={`${season} complete: ${totals.w} wins from ${totals.gp} games`}
    className='flex flex-col gap-3 rounded-(--radius-card) bg-(image:--gradient-versus) px-(--space-card-pad) pt-4.5 pb-(--space-card-pad) shadow-[0_16px_40px_-12px_rgb(11_15_36/0.45)]'
  >
    <span className='text-label text-(--color-text-accent)'>
      {season} · Season complete
    </span>
    <h3 className='text-display font-bold text-(--color-text-primary)'>
      That&rsquo;s a wrap
    </h3>
    <p className='text-meta text-(--color-text-secondary)'>
      {totals.w} {totals.w === 1 ? 'win' : 'wins'} from {totals.gp}{' '}
      {totals.gp === 1 ? 'game' : 'games'}
    </p>
    <WdlBar w={totals.w} d={totals.d} l={totals.l} />
    <WdlLegend w={totals.w} d={totals.d} l={totals.l} />

    {/* Look ahead: next season's first game, or an honest "not out yet" */}
    {next ? (
      <Link
        href={next.href}
        className='pressable flex min-h-(--size-tap) items-center gap-3 rounded-(--radius-control) bg-white/8 px-3.5 py-3'
      >
        <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <span className='text-label text-(--color-text-secondary)'>
            {next.label}
          </span>
          <span className='text-control truncate text-(--color-text-primary)'>
            {next.when}
          </span>
        </span>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
          className='shrink-0 text-(--color-icon-default)'
        />
      </Link>
    ) : (
      <p className='text-meta text-(--color-text-secondary)'>
        {upcomingSeason} schedule isn&rsquo;t out yet — it&rsquo;ll show up here
        as soon as it&rsquo;s posted.
      </p>
    )}

    {seasonHref && (
      <a
        href={seasonHref}
        onClick={(e) => {
          if (
            !onViewSeason ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.button !== 0
          )
            return;
          e.preventDefault();
          onViewSeason();
        }}
        className='text-control -my-1 inline-flex min-h-(--size-tap) items-center gap-1 self-start text-(--color-text-accent)'
      >
        View season recap
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
        />
      </a>
    )}
  </section>
);
