'use client';

import {
  useId,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
  Check,
  Clock,
  Flag,
  Moon,
  Sun,
  Sunset,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BottomSheet,
  SHEET_CLOSE_CLASSES,
} from '@/components/ui/BottomSheet/BottomSheet';
import { FilterState, TimeOfDayOption } from '@/types/match';

/**
 * FilterDrawer — Figma: Screens › Filters / Sheet (Default · Results unlocked · Zero-result prevention)
 * Dark island (data-theme="dark") bottom sheet · SegmentedControl for exclusive choices ·
 * FilterChip for everything else · live-count CTA · Result locked until Final.
 */

/* ── Shared filter helpers (also used by ClientView) ───────────────── */

export const DEFAULT_FILTERS: FilterState = {
  homeAway: 'all',
  urgency: [],
  timeOfDay: [],
  matchState: 'all',
  ageGroup: 'all',
  resultsState: null,
};

type ResultValue = NonNullable<FilterState['resultsState']>;
const RESULT_CODES = ['W', 'L', 'D'] as const satisfies readonly ResultValue[];

/**
 * Coerces any stored result to the MatchResult letter code.
 * Older cookies hold words ('win' | 'loss' | 'draw') or the buggy 'all' — map or drop them.
 */
const toResultCode = (value: unknown): ResultValue | null => {
  const letter =
    typeof value === 'string' ? value.trim().charAt(0).toUpperCase() : '';
  return (RESULT_CODES as readonly string[]).includes(letter)
    ? (letter as ResultValue)
    : null;
};

/**
 * Enforces valid combinations:
 * - Result only exists alongside Final (no "Upcoming + Win")
 * - Repairs legacy cookie values ('win' → 'W', 'all' → null)
 */
export const normalizeFilters = (f: FilterState): FilterState => ({
  ...f,
  resultsState: f.matchState === 'final' ? toResultCode(f.resultsState) : null,
});

export const getActiveFilterCount = (f: FilterState) =>
  (f.ageGroup !== 'all' ? 1 : 0) +
  (f.homeAway !== 'all' ? 1 : 0) +
  f.urgency.length +
  f.timeOfDay.length +
  (f.matchState !== 'all' ? 1 : 0) +
  (f.resultsState ? 1 : 0);

/* ── Options ────────────────────────────────────────────────────────── */

type Option<V> = { value: V; label: string; icon?: LucideIcon };

const TEAM_SIDE: Option<FilterState['homeAway']>[] = [
  { value: 'all', label: 'Both' },
  { value: 'home', label: 'Home' },
  { value: 'away', label: 'Away' },
];
const AGE_GROUPS: Option<FilterState['ageGroup']>[] = [
  { value: 'u9', label: 'U9' },
  { value: 'u13', label: 'U13' },
];
const TIMES: Option<TimeOfDayOption>[] = [
  { value: 'morning' as TimeOfDayOption, label: 'Morning', icon: Sun },
  { value: 'afternoon' as TimeOfDayOption, label: 'Afternoon', icon: Sunset },
  { value: 'evening' as TimeOfDayOption, label: 'Evening', icon: Moon },
];
const STATUSES: Option<FilterState['matchState']>[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'final', label: 'Final' },
];
/* Values are MatchResult letter codes — labels stay human-readable */
const RESULTS: Option<ResultValue>[] = [
  { value: 'W', label: 'Win' },
  { value: 'L', label: 'Loss' },
  { value: 'D', label: 'Draw' },
];
/* Vocabulary (audit): Conflict = overlapping times · Tight gap = < 60 min between games */
const ALERTS: Option<FilterState['urgency'][number]>[] = [
  { value: 'conflict', label: 'Conflicts', icon: Flag },
  { value: 'tight-gap', label: 'Tight gaps', icon: TriangleAlert },
  { value: 'tbd', label: 'Time TBD', icon: Clock },
];

const labelsFor = <V,>(options: Option<V>[], selected: V[]) =>
  options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)
    .join(', ') || undefined;

/* ── Active filter chips (schedule "Applied filters" row) ───────────── */

export type ActiveFilterChip = {
  key: string;
  label: string;
  /** Pure removal — callers run the result through normalizeFilters */
  remove: (f: FilterState) => FilterState;
};

const labelOf = <V,>(options: Option<V>[], value: V) =>
  options.find((o) => o.value === value)?.label ?? String(value);

/** One chip per applied value, in the same order as the sheet's groups */
export const getActiveFilterChips = (f: FilterState): ActiveFilterChip[] => {
  const chips: ActiveFilterChip[] = [];

  if (f.homeAway !== 'all')
    chips.push({
      key: 'side',
      label: labelOf(TEAM_SIDE, f.homeAway),
      remove: (p) => ({ ...p, homeAway: 'all' }),
    });

  if (f.ageGroup !== 'all')
    chips.push({
      key: 'age',
      label: labelOf(AGE_GROUPS, f.ageGroup),
      remove: (p) => ({ ...p, ageGroup: 'all' }),
    });

  for (const v of f.timeOfDay)
    chips.push({
      key: `time-${v}`,
      label: labelOf(TIMES, v),
      remove: (p) => ({ ...p, timeOfDay: p.timeOfDay.filter((x) => x !== v) }),
    });

  if (f.matchState !== 'all')
    chips.push({
      key: 'status',
      label: labelOf(STATUSES, f.matchState),
      remove: (p) => ({ ...p, matchState: 'all' }),
    });

  if (f.resultsState)
    chips.push({
      key: 'result',
      label: labelOf(RESULTS, f.resultsState),
      remove: (p) => ({ ...p, resultsState: null }),
    });

  for (const v of f.urgency)
    chips.push({
      key: `alert-${v}`,
      label: labelOf(ALERTS, v),
      remove: (p) => ({ ...p, urgency: p.urgency.filter((x) => x !== v) }),
    });

  return chips;
};

/* ── Motion (spec: spring 400 / 35) ─────────────────────────────────── */
const SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;
const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;
const CHIP_ICON = {
  size: 14,
  strokeWidth: 1.5,
  absoluteStrokeWidth: true,
} as const;

/* ── Building blocks ────────────────────────────────────────────────── */

/** Figma: Atoms › FilterChip (State=Default|Selected|Disabled) */
const FilterChip = ({
  label,
  icon: Icon,
  selected,
  disabled = false,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type='button'
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
    className='tap-area'
  >
    {/* 36px visual chip inside the 44px tap area */}
    <span
      className={cn(
        'tap-visual text-control inline-flex h-9 items-center gap-1.5 rounded-(--radius-full) px-(--space-stack-md)',
        disabled
          ? 'bg-(--color-bg-subtle) text-(--color-text-disabled)'
          : selected
            ? 'bg-(--color-bg-inverse) text-(--color-text-on-inverse) shadow-(--shadow-control-selected)'
            : 'bg-(--color-bg-surface) text-(--color-text-primary) shadow-(--shadow-control)',
      )}
    >
      {Icon && (
        <Icon
          {...CHIP_ICON}
          aria-hidden='true'
          className={cn(
            !disabled && !selected && 'text-(--color-icon-default)',
          )}
        />
      )}
      {label}
      {selected && <Check {...CHIP_ICON} aria-hidden='true' />}
    </span>
  </button>
);

/** Label row shows the group's current value ("Any" when unset) — state readable at a glance */
const FilterGroup = ({
  label,
  status,
  helper,
  children,
}: {
  label: string;
  status?: string;
  helper?: string;
  children: ReactNode;
}) => {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className='flex flex-col gap-(--space-stack-xs)'
    >
      <div className='flex items-center justify-between gap-(--space-stack-sm)'>
        <h3 id={id} className='text-label text-(--color-text-secondary)'>
          {label}
        </h3>
        <span
          className={cn(
            'text-meta truncate',
            status
              ? 'text-(--color-text-primary)'
              : 'text-(--color-text-disabled)',
          )}
        >
          {status ?? 'Any'}
        </span>
      </div>
      <div
        role='group'
        aria-labelledby={id}
        className='flex flex-wrap gap-x-(--space-stack-sm) gap-y-0'
      >
        {children}
      </div>
      {helper && (
        <p className='text-meta text-(--color-text-secondary)'>{helper}</p>
      )}
    </section>
  );
};

/* ── Drawer ─────────────────────────────────────────────────────────── */

interface FilterDrawerProps {
  onClose: () => void;
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  /** Matches this week that pass the current filters (drives the live-count CTA) */
  matchCount: number;
}

export const FilterDrawer = ({
  onClose,
  filters,
  setFilters,
  matchCount,
}: FilterDrawerProps) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Dialog behavior (scroll lock, focus Close, Escape/scrim, focus restore) lives in BottomSheet

  const activeCount = getActiveFilterCount(filters);
  const resultsUnlocked = filters.matchState === 'final';
  const hasMatches = matchCount > 0;

  /* Every update runs through normalizeFilters, so invalid states can't exist */
  const update = (patch: (prev: FilterState) => Partial<FilterState>) =>
    setFilters((prev) => normalizeFilters({ ...prev, ...patch(prev) }));

  const toggleOne = <K extends 'ageGroup' | 'matchState'>(
    key: K,
    value: FilterState[K],
  ) =>
    update(
      (prev) =>
        ({
          [key]: prev[key] === value ? 'all' : value,
        }) as Partial<FilterState>,
    );

  const toggleMany = (key: 'urgency' | 'timeOfDay', value: string) =>
    update((prev) => {
      const current = prev[key] as string[];
      return {
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      } as Partial<FilterState>;
    });

  return (
    <MotionConfig reducedMotion='user'>
      <BottomSheet
        labelledBy={titleId}
        onClose={onClose}
        initialFocusRef={closeRef}
        className='h-[calc(100dvh-54px)]'
      >
        {/* Header */}
        <div className='flex shrink-0 items-center gap-(--space-stack-sm) px-(--space-gutter) pt-3 pb-3'>
          <div className='min-w-0 flex-1'>
            <h2
              id={titleId}
              className='text-display text-(--color-text-primary)'
            >
              Filters
            </h2>
            <p className='text-meta text-(--color-text-secondary)'>
              {activeCount > 0
                ? `${activeCount} filter${activeCount === 1 ? '' : 's'} active`
                : `Showing all ${matchCount} match${matchCount === 1 ? '' : 'es'}`}
            </p>
          </div>

          <button
            type='button'
            onClick={() => setFilters(DEFAULT_FILTERS)}
            disabled={activeCount === 0}
            className='pressable text-control min-h-(--size-tap) px-(--space-stack-sm) text-(--color-text-primary) disabled:pointer-events-none disabled:text-(--color-text-disabled)'
          >
            Reset
          </button>

          <button
            ref={closeRef}
            type='button'
            onClick={onClose}
            aria-label='Close filters'
            className={SHEET_CLOSE_CLASSES.button}
          >
            <span className={SHEET_CLOSE_CLASSES.visual}>
              <X {...ICON} aria-hidden='true' />
            </span>
          </button>
        </div>

        {/* Body (scroll) */}
        <div className='flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-(--space-gutter) pt-2 pb-6'>
          {/* Team side — Figma: SegmentedControl (always exactly one) */}
          <FilterGroup
            label='Team side'
            status={
              filters.homeAway === 'all'
                ? undefined
                : labelsFor(TEAM_SIDE, [filters.homeAway])
            }
          >
            <div
              role='radiogroup'
              aria-label='Team side'
              className='flex w-full rounded-(--radius-control) bg-(--color-bg-subtle) px-(--space-stack-xs) shadow-(--shadow-recessed)'
            >
              {TEAM_SIDE.map((option) => {
                const isSelected = filters.homeAway === option.value;
                return (
                  <button
                    key={option.value}
                    type='button'
                    role='radio'
                    aria-checked={isSelected}
                    onClick={() => update(() => ({ homeAway: option.value }))}
                    className={cn(
                      'tap-area flex-1',
                      isSelected
                        ? 'text-(--color-text-on-inverse)'
                        : 'text-(--color-text-secondary) hover:text-(--color-text-primary)',
                    )}
                  >
                    {/* Track is 44px (the tap target); the segment reads as a 36px inset pill */}
                    <span className='tap-visual text-control relative isolate flex h-9 w-full items-center justify-center rounded-[calc(var(--radius-control)-4px)]'>
                      {isSelected && (
                        <motion.span
                          layoutId='team-side-pill'
                          aria-hidden='true'
                          transition={SPRING}
                          className='absolute inset-0 -z-10 rounded-[calc(var(--radius-control)-4px)] bg-(--color-bg-inverse) shadow-(--shadow-control-selected)'
                        />
                      )}
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          {/* Age group — none selected = all ages */}
          <FilterGroup
            label='Age group'
            status={
              filters.ageGroup === 'all'
                ? undefined
                : labelsFor(AGE_GROUPS, [filters.ageGroup])
            }
          >
            {AGE_GROUPS.map((o) => (
              <FilterChip
                key={o.value}
                label={o.label}
                selected={filters.ageGroup === o.value}
                onClick={() => toggleOne('ageGroup', o.value)}
              />
            ))}
          </FilterGroup>

          <FilterGroup
            label='Time of day'
            status={labelsFor(TIMES, filters.timeOfDay)}
          >
            {TIMES.map((o) => (
              <FilterChip
                key={o.value}
                label={o.label}
                icon={o.icon}
                selected={filters.timeOfDay.includes(o.value)}
                onClick={() => toggleMany('timeOfDay', o.value)}
              />
            ))}
          </FilterGroup>

          <FilterGroup
            label='Match status'
            status={
              filters.matchState === 'all'
                ? undefined
                : labelsFor(STATUSES, [filters.matchState])
            }
          >
            {STATUSES.map((o) => (
              <FilterChip
                key={o.value}
                label={o.label}
                selected={filters.matchState === o.value}
                onClick={() => toggleOne('matchState', o.value)}
              />
            ))}
          </FilterGroup>

          {/* Result — locked until Final (prevents impossible "Upcoming + Win") */}
          <FilterGroup
            label='Result'
            status={
              filters.resultsState
                ? labelsFor(RESULTS, [filters.resultsState])
                : undefined
            }
            helper={
              resultsUnlocked ? undefined : 'Select Final to filter by result.'
            }
          >
            {RESULTS.map((o) => (
              <FilterChip
                key={o.value}
                label={o.label}
                disabled={!resultsUnlocked}
                selected={filters.resultsState === o.value}
                onClick={() =>
                  update((prev) => ({
                    resultsState:
                      prev.resultsState === o.value ? null : o.value,
                  }))
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup
            label='Alerts'
            status={labelsFor(ALERTS, filters.urgency)}
          >
            {ALERTS.map((o) => (
              <FilterChip
                key={o.value}
                label={o.label}
                icon={o.icon}
                selected={filters.urgency.includes(o.value)}
                onClick={() => toggleMany('urgency', o.value)}
              />
            ))}
          </FilterGroup>
        </div>

        {/* Footer (sticky) — live count, zero-result prevention */}
        <div className='flex shrink-0 flex-col gap-(--space-stack-sm) bg-(--color-bg-canvas) px-(--space-gutter) pt-3 pb-[max(env(safe-area-inset-bottom,0px),16px)] shadow-(--shadow-footer-lift)'>
          <p role='status' className='empty:hidden'>
            {!hasMatches && (
              <span className='text-meta flex items-start gap-(--space-stack-sm) text-(--color-text-primary)'>
                <TriangleAlert
                  {...ICON}
                  aria-hidden='true'
                  className='mt-0.5 shrink-0 text-(--color-warning-icon)'
                />
                No matches this week fit these filters. Remove a filter to see
                results.
              </span>
            )}
          </p>

          <button
            type='button'
            aria-disabled={!hasMatches}
            onClick={() => hasMatches && onClose()}
            className={cn(
              'text-control flex min-h-(--size-tap) w-full items-center justify-center rounded-(--radius-control) py-(--space-stack-md)',
              hasMatches
                ? 'pressable bg-(--color-bg-inverse) text-(--color-text-on-inverse) shadow-(--shadow-control-selected)'
                : 'cursor-not-allowed bg-(--color-bg-subtle) text-(--color-text-disabled)',
            )}
          >
            {hasMatches
              ? `Show ${matchCount} match${matchCount === 1 ? '' : 'es'}`
              : 'No matches'}
          </button>
        </div>
      </BottomSheet>
    </MotionConfig>
  );
};
