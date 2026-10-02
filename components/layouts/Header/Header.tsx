import type { Dispatch, ReactNode, SetStateAction } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Undo2,
} from 'lucide-react';
import MatchduleLogo from '@/public/matchdule-logo.svg';
import { Badge } from '@/components/ui/Badge/Badge';

/**
 * Header — Figma: Organisms › AppHeader + WeekNavigator · Screens › Season / Snapshot
 * data-theme="dark" = Dark island: every token inside resolves to Dark mode.
 *
 * mode="week"   (Schedule) — week pager, context row (FALL 2026 · THIS WEEK pill), Filters
 * mode="season" (Season)   — season title + "Results through …"; no week pager, no Filters
 *                            (the Season tab doesn't use them). Same 72px row height in both
 *                            modes, so switching tabs never shifts the page.
 */

interface HeaderProps {
  mode?: 'week' | 'season';
  /** Season mode: { title: "Fall 2026", subtitle: "Results through Sun, Sep 27" } */
  seasonHeader?: { title: string; subtitle?: string };

  dateRange: string; // en dash from getWeekData, e.g. "Sep 21 – 27"
  seasonLabel: string; // sentence case, e.g. "Fall 2026"
  isCurrentWeek: boolean;
  prevWeekDate: string;
  nextWeekDate: string;
  hasPrev: boolean;
  hasNext: boolean;
  setIsFilterOpen: Dispatch<SetStateAction<boolean>>;
  activeFilterCount: number;
}

/* Figma icon spec: 1.5px stroke at any size */
const STROKE = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

/* 36px visual pager inside a 44px tap area */
const PAGER_HIT = 'tap-area min-w-(--size-tap) shrink-0 justify-center';
const PAGER_VISUAL =
  'tap-visual grid size-9 place-items-center rounded-(--radius-control) bg-(--color-bg-subtle) text-(--color-icon-default) shadow-(--shadow-control)';

const WeekNavButton = ({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) => {
  // Disabled: keep the 44px slot so the range stays centered, but no dead tab stop.
  if (disabled) {
    return (
      <span aria-hidden='true' className={PAGER_HIT}>
        <span className={`${PAGER_VISUAL} opacity-30`}>{children}</span>
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={PAGER_HIT}>
      <span className={`${PAGER_VISUAL} hover:text-(--color-text-primary)`}>
        {children}
      </span>
    </Link>
  );
};

export const Header = ({
  mode = 'week',
  seasonHeader,
  dateRange,
  seasonLabel,
  isCurrentWeek = false,
  prevWeekDate,
  nextWeekDate,
  hasPrev,
  hasNext,
  setIsFilterOpen,
  activeFilterCount,
}: HeaderProps) => {
  const hasActiveFilters = activeFilterCount > 0;
  const isSeason = mode === 'season';

  return (
    <header
      data-theme='dark'
      className='surface-chrome w-full pt-[env(safe-area-inset-top,0px)] pb-2'
    >
      {/* Page heading for screen readers: first in reading order (before the week-range
          H2) and inside the banner landmark, so the outline reads H1 → H2 → H3
          (WCAG 1.3.1 / 2.4.6). The logo is the visual equivalent. */}
      <h1 className='visually-hidden'>{isSeason ? 'Season' : 'Schedule'}</h1>
      <div className='mx-auto w-full max-w-lg'>
        {/* ── AppHeader: h 56 · pl gutter · pr stack-sm ─────────────────── */}
        <div className='flex h-(--size-app-header) flex-row flex-nowrap items-center justify-between pl-(--space-gutter) pr-(--space-stack-sm)'>
          <Image
            src={MatchduleLogo}
            width={140}
            height={17}
            alt='Matchdule'
            className='h-auto w-35 shrink-0'
            priority
          />

          {/* FILTERS — schedule only; the Season tab doesn't use filters */}
          {!isSeason && (
            <button
              type='button'
              onClick={() => setIsFilterOpen(true)}
              aria-label={
                hasActiveFilters
                  ? `Filters, ${activeFilterCount} active`
                  : 'Filters'
              }
              className={`pressable text-label inline-flex min-h-(--size-tap) shrink-0 items-center gap-(--space-stack-sm) whitespace-nowrap rounded-(--radius-control) px-(--space-stack-sm) py-(--space-stack-xs) ${
                hasActiveFilters
                  ? 'text-(--color-text-primary)'
                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
              }`}
            >
              <SlidersHorizontal
                size={16}
                {...STROKE}
                aria-hidden='true'
                className={
                  hasActiveFilters
                    ? 'text-(--color-icon-accent)'
                    : 'text-(--color-icon-default)'
                }
              />
              <span>Filters</span>
              {hasActiveFilters && (
                <span
                  aria-hidden='true'
                  className='text-label grid h-5 min-w-5 place-items-center rounded-full bg-(--color-bg-accent) px-1 tracking-normal tabular-nums text-(--color-text-on-accent)'
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>

        {isSeason ? (
          /* ── Season title: same 72px row as the week pager, so tabs don't shift ── */
          <div className='flex h-18 items-end justify-between gap-(--space-stack-md) px-(--space-gutter) pb-3'>
            <h2 className='text-display truncate text-(--color-text-primary)'>
              {seasonHeader?.title ?? seasonLabel}
            </h2>
            {seasonHeader?.subtitle && (
              <span className='text-meta shrink-0 pb-0.5 text-(--color-text-secondary)'>
                {seasonHeader.subtitle}
              </span>
            )}
          </div>
        ) : (
          /* ── WeekNavigator: h 72 · px gutter · py stack-sm ─────────────── */
          <nav
            aria-label='Week'
            className='flex h-18 items-center gap-(--space-stack-sm) px-(--space-gutter) py-(--space-stack-sm)'
          >
            <WeekNavButton
              href={`/?date=${prevWeekDate}`}
              disabled={!hasPrev}
              label='Previous week'
            >
              <ChevronLeft size={16} {...STROKE} aria-hidden='true' />
            </WeekNavButton>

            <div className='flex min-w-0 flex-1 flex-col items-center gap-(--space-stack-xs) overflow-hidden'>
              <h2 className='text-score whitespace-nowrap text-(--color-text-primary)'>
                {dateRange}
              </h2>

              {/* FALL 2026 + one xs pill slot: status (this week) or action (any other week) */}
              <div className='flex h-6 items-center gap-(--space-stack-sm)'>
                <span className='text-label whitespace-nowrap text-(--color-text-secondary)'>
                  {seasonLabel}
                </span>

                {isCurrentWeek ? (
                  <Badge variant='accent' size='xs'>
                    This week
                  </Badge>
                ) : (
                  /* Action pill: 44px tap area; -my-2.5 keeps the row 24px tall.
                     Visible "This week" is inside the accessible name (WCAG 2.5.3). */
                  <Link
                    href='/'
                    aria-label='Back to this week'
                    className='tap-area -my-2.5'
                  >
                    <Badge
                      size='xs'
                      className='tap-visual text-(--color-accent-on-surface) hover:bg-(--color-accent-surface)'
                    >
                      <Undo2
                        strokeWidth={2}
                        absoluteStrokeWidth
                        aria-hidden='true'
                      />
                      This week
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            <WeekNavButton
              href={`/?date=${nextWeekDate}`}
              disabled={!hasNext}
              label='Next week'
            >
              <ChevronRight size={16} {...STROKE} aria-hidden='true' />
            </WeekNavButton>
          </nav>
        )}
      </div>
    </header>
  );
};
