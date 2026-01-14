'use client';

import { useCallback, useMemo } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Filters } from '@/types/schedule';
import { FilterSheet } from '.';
import MatchduleLogo from '@/public/matchdule-logo.svg';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  FoldHorizontal,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import type { ConflictPair, TightGapInfo } from '@/hooks/useGameTiming';

interface HeaderProps {
  conflicts?: ConflictPair[];
  tightGaps?: TightGapInfo[];
  rangeLabel?: string;
  defaultWeek?: string | null;

  week: string | null;
  setWeek: Dispatch<SetStateAction<string | null>>;
  weekOptions: string[];

  filtersOpen: boolean;
  setFiltersOpen: Dispatch<SetStateAction<boolean>>;

  onApplyFilters?: (f: Filters) => void;
  onClearFilters?: () => void;

  refreshing: boolean;
}

type PillVariant = 'neutral' | 'current' | 'conflict' | 'tight';

const pillVariants: Record<PillVariant, string> = {
  neutral: 'bg-white/10 text-white',
  current: 'bg-[#00D9C0]/20 text-[#00D9C0]',
  conflict: 'bg-gradient-to-b from-[#FB2C36] to-[#E7000B] text-white',
  tight: 'bg-gradient-to-b from-[#FBB000] to-[#F0A30A] text-white',
};

function Pill({
  variant = 'neutral',
  className,
  icon,
  children,
}: {
  variant?: PillVariant;
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 px-2 py-0.5 rounded-full',
        pillVariants[variant],
        className
      )}
    >
      {icon}
      {children ? (
        <span className='text-[10px] uppercase font-bold leading-none'>
          {children}
        </span>
      ) : null}
    </div>
  );
}

function Dot() {
  return <span className='text-white/40'>•</span>;
}

function HeaderStatus({
  currentWeek,
  defaultWeek,
  refreshing,
  hasConflicts,
  hasTightGaps,
  onJumpToCurrent,
}: {
  currentWeek: string;
  defaultWeek?: string | null;
  refreshing: boolean;
  hasConflicts: boolean;
  hasTightGaps: boolean;
  onJumpToCurrent: () => void;
}) {
  const isCurrentWeek = !!defaultWeek && currentWeek === defaultWeek;

  return (
    <div className='flex justify-center items-center gap-2'>
      <p className='font-semibold text-xs text-white/70 uppercase'>
        {currentWeek}
      </p>

      <Dot />

      {isCurrentWeek ? (
        <Pill
          variant='current'
          icon={
            <Radio
              className='aspect-square w-3.5 h-3.5 animate-pulse'
              aria-hidden
            />
          }
        >
          This Week
        </Pill>
      ) : (
        <button
          type='button'
          className={cn(
            'flex items-center gap-1 uppercase font-bold text-xs',
            'text-[#00C27A] hover:text-[#00C27A]/80 cursor-pointer disabled:opacity-60'
          )}
          onClick={onJumpToCurrent}
          disabled={!defaultWeek || refreshing}
          aria-label='Jump to current week'
        >
          Jump to Current
        </button>
      )}

      {hasConflicts && (
        <>
          <Dot />
          <Pill
            variant='conflict'
            icon={<Flag className='aspect-square w-3.5 h-3.5' aria-hidden />}
          />
        </>
      )}

      {hasTightGaps && (
        <>
          <Dot />
          <Pill
            variant='tight'
            icon={
              <FoldHorizontal
                className='aspect-square w-3.5 h-3.5'
                aria-hidden
              />
            }
          />
        </>
      )}
    </div>
  );
}

const styles = {
  header: cn(
    'sticky top-0 -mt-8 z-40 -mx-4',
    'bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A]',
    'shadow-md'
  ),
  topBar: cn(
    'flex justify-between items-center h-[73px] px-4',
    'border-b border-b-white/10'
  ),
  weekBar: cn(
    'bg-gradient-to-b from-white/5 to-black/0 h-20',
    'flex justify-between items-center px-4'
  ),
  navBtn: cn(
    'flex justify-center items-center w-9 h-9 rounded-lg',
    'border border-white/20 bg-white/10 text-white',
    'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
  ),
  filtersBtn:
    'flex items-center gap-2 text-white cursor-pointer disabled:opacity-60',
};

export default function Header({
  conflicts,
  tightGaps,
  rangeLabel,
  defaultWeek,
  week,
  setWeek,
  weekOptions,
  filtersOpen,
  setFiltersOpen,
  onApplyFilters,
  onClearFilters,
  refreshing,
}: HeaderProps) {
  const hasWeeks = weekOptions.length > 0;

  const currentWeek = useMemo(() => {
    if (week) return week;
    if (defaultWeek) return defaultWeek;
    return hasWeeks ? weekOptions[0] : '';
  }, [week, defaultWeek, hasWeeks, weekOptions]);

  const currentIndex = useMemo(() => {
    if (!hasWeeks || !currentWeek) return -1;
    return weekOptions.findIndex((w) => w === currentWeek);
  }, [hasWeeks, currentWeek, weekOptions]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < weekOptions.length - 1;

  const prevDisabled = refreshing || !hasPrev;
  const nextDisabled = refreshing || !hasNext;

  const hasConflicts = (conflicts?.length ?? 0) > 0;
  const hasTightGaps = (tightGaps?.length ?? 0) > 0;

  const goPrev = useCallback(() => {
    if (prevDisabled) return;
    setWeek(weekOptions[currentIndex - 1] ?? null);
  }, [prevDisabled, setWeek, weekOptions, currentIndex]);

  const goNext = useCallback(() => {
    if (nextDisabled) return;
    setWeek(weekOptions[currentIndex + 1] ?? null);
  }, [nextDisabled, setWeek, weekOptions, currentIndex]);

  const jumpToCurrent = useCallback(() => {
    if (!defaultWeek) return;
    setWeek(defaultWeek);
  }, [defaultWeek, setWeek]);

  return (
    <header role='banner' className={styles.header}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <Image
          src={MatchduleLogo}
          height={20}
          width={166}
          priority
          alt='Matchdule Logo'
        />

        <button
          type='button'
          className={styles.filtersBtn}
          onClick={() => setFiltersOpen(true)}
          aria-label='Open filters'
          disabled={refreshing}
        >
          <SlidersHorizontal className='h-4.5 w-4.5' aria-hidden />
          <span className='font-semibold text-base tracking-normal'>
            Filters
          </span>
        </button>
      </div>

      {/* Week controls */}
      <div className={styles.weekBar}>
        {/* Prev */}
        <button
          type='button'
          className={styles.navBtn}
          onClick={goPrev}
          aria-label='Previous week'
          disabled={prevDisabled}
        >
          <ChevronLeft className='h-4.5 w-4.5' aria-hidden />
        </button>

        {/* Center info */}
        <div className='text-center'>
          <p className='font-bold text-white pb-1'>{rangeLabel ?? ''}</p>

          <HeaderStatus
            currentWeek={currentWeek}
            defaultWeek={defaultWeek}
            refreshing={refreshing}
            hasConflicts={hasConflicts}
            hasTightGaps={hasTightGaps}
            onJumpToCurrent={jumpToCurrent}
          />
        </div>

        {/* Next */}
        <button
          type='button'
          className={styles.navBtn}
          onClick={goNext}
          aria-label='Next week'
          disabled={nextDisabled}
        >
          <ChevronRight className='h-4.5 w-4.5' aria-hidden />
        </button>
      </div>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        onApply={onApplyFilters}
        onClear={onClearFilters}
      />
    </header>
  );
}
