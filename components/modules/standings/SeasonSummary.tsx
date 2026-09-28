'use client';

import type { MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SeasonStats } from '@/lib/matches/season-stats';
import { WdlBar, WdlLegend } from './WdlBar';

/**
 * SeasonSummary — Figma: SeasonSummary. All your teams combined, readable in ~2 seconds.
 * Dark Versus split = the same "headline" language as the schedule highlight.
 * Season pager (‹ ›) = same pattern as the week pager. Links are real (/?view=season&season=…)
 * but plain clicks switch in place via onSelect (pushState, no refetch).
 */

type PagerTarget = { season: string; href: string };

interface Props extends Pick<SeasonStats, 'season' | 'totals'> {
  /** true = the newest season (still "so far"); false = a finished season */
  isLatest: boolean;
  older?: PagerTarget;
  newer?: PagerTarget;
  onSelect?: (season: string) => void;
}

const PAGER_HIT = 'tap-area min-w-(--size-tap) shrink-0 justify-center';
const PAGER_VISUAL =
  'tap-visual grid size-8 place-items-center rounded-full bg-white/8 text-(--color-icon-default)';

const PagerLink = ({
  target,
  label,
  children,
  onSelect,
}: {
  target?: PagerTarget;
  label: string;
  children: React.ReactNode;
  onSelect?: (season: string) => void;
}) => {
  if (!target) {
    // Keep the slot (layout stays put), no dead tab stop
    return (
      <span aria-hidden='true' className={PAGER_HIT}>
        <span className={`${PAGER_VISUAL} opacity-35`}>{children}</span>
      </span>
    );
  }
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
      return;
    e.preventDefault();
    onSelect(target.season);
  };
  return (
    <a
      href={target.href}
      onClick={handleClick}
      aria-label={`${label}: ${target.season}`}
      className={PAGER_HIT}
    >
      <span className={`${PAGER_VISUAL} hover:text-(--color-text-primary)`}>
        {children}
      </span>
    </a>
  );
};

export const SeasonSummary = ({
  season,
  totals,
  isLatest,
  older,
  newer,
  onSelect,
}: Props) => {
  const eyebrow = isLatest ? `${season} so far` : `${season} · Final`;
  return (
    <section
      data-theme='dark'
      aria-label={`${eyebrow}: ${totals.w} wins from ${totals.gp} games`}
      className='flex flex-col gap-3 rounded-(--radius-card) bg-(image:--gradient-versus) px-(--space-card-pad) pt-2.5 pb-(--space-card-pad) shadow-[0_16px_40px_-12px_rgb(11_15_36/0.45)]'
    >
      {/* Eyebrow + season pager (44px tap areas; -mr-2 aligns the visual to the card edge) */}
      <div className='-mb-1 flex items-center'>
        <span className='text-label min-w-0 flex-1 truncate text-(--color-text-accent)'>
          {eyebrow}
        </span>
        {(older || newer) && (
          <nav aria-label='Season' className='-mr-2 flex'>
            <PagerLink
              target={older}
              label='Previous season'
              onSelect={onSelect}
            >
              <ChevronLeft
                size={14}
                strokeWidth={1.5}
                absoluteStrokeWidth
                aria-hidden='true'
              />
            </PagerLink>
            <PagerLink target={newer} label='Next season' onSelect={onSelect}>
              <ChevronRight
                size={14}
                strokeWidth={1.5}
                absoluteStrokeWidth
                aria-hidden='true'
              />
            </PagerLink>
          </nav>
        )}
      </div>
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
};
