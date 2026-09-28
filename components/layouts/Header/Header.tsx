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
 * Header — Figma: Organisms › AppHeader + WeekNavigator
 * Requires global.css (tokens + text-*, tap-area/tap-visual, surface-chrome).
 * data-theme="dark" = Dark island: every token inside resolves to Dark mode.
 *
 * Context labels (FILTERS · FALL 2026 · THIS WEEK · BACK TO THIS WEEK) all use `text-label`
 * (11/12px, caps, tracked). Class strings are plain — no cn()/tailwind-merge in the way —
 * so the text styles can't be stripped. Keep source strings sentence case; caps are CSS.
 */

interface HeaderProps {
  dateRange: string; // en dash, e.g. "Sep 21 – 27"
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

  return (
    <header
      data-theme='dark'
      className='surface-chrome w-full pt-[env(safe-area-inset-top,0px)] pb-2'
    >
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

          {/* FILTERS — text-label (caps); count bubble matches */}
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
        </div>

        {/* ── WeekNavigator: h 72 · px gutter · py stack-sm ─────────────── */}
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
              {/* TODO: format with an en dash upstream; this guards the display meanwhile */}
              {dateRange.replace(' - ', ' – ')}
            </h2>

            {/* FALL 2026 + one xs pill slot: status (this week) or action (any other week).
    Same shape/height/position in both states, so the row never jumps. */}
            <div className='flex h-6 items-center gap-(--space-stack-sm)'>
              <span className='text-label whitespace-nowrap text-(--color-text-secondary)'>
                {seasonLabel}
              </span>

              {isCurrentWeek ? (
                /* Status — filled accent: "you are here" */
                <Badge variant='accent' size='xs'>
                  This week
                </Badge>
              ) : (
                /* Action — neutral pill + return arrow. 44px tap area; -my-2.5 keeps the row 24px tall.
       Visible "This week" is inside the accessible name "Back to this week" (WCAG 2.5.3). */
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
      </div>
    </header>
  );
};
