'use client';

import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Filters } from '@/types/schedule';
import { FilterSheet } from '.';
import MatchduleLogo from '@/public/matchdule-logo.svg';
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Radio,
  SlidersHorizontal,
  TriangleAlert,
} from 'lucide-react';
import type { ConflictPair, TightGapInfo } from '@/hooks/useGameTiming';

interface HeaderProps {
  conflicts?: ConflictPair[];
  tightGaps?: TightGapInfo[];
  rangeLabel?: string;
  defaultWeek?: string | null;
  week: string | null;
  setWeek: React.Dispatch<React.SetStateAction<string | null>>;
  weekOptions: string[];
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onApplyFilters?: (f: Filters) => void;
  onClearFilters?: () => void;
  refreshing: boolean;
}

function Pill({
  className,
  icon,
  children,
}: {
  className?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full uppercase font-bold',
        className
      )}
    >
      {icon}
      <span className='text-[10px] leading-none'>{children}</span>
    </div>
  );
}

function Dot() {
  return <span className='text-white/40'>•</span>;
}

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
  const conflictCount = conflicts?.length ?? 0;
  const tightCount = tightGaps?.length ?? 0;
  const hasConflicts = conflictCount > 0;
  const hasTight = tightCount > 0;

  const hasWeeks = weekOptions.length > 0;

  const currentWeek = useMemo(() => {
    if (week) return week;
    if (defaultWeek) return defaultWeek;
    return hasWeeks ? weekOptions[0] : '';
  }, [week, defaultWeek, weekOptions, hasWeeks]);

  const currentIndex = useMemo(
    () => weekOptions.findIndex((w) => w === (week ?? '')),
    [week, weekOptions]
  );

  const prevDisabled = refreshing || !weekOptions.length || currentIndex <= 0; // disable if at first week

  const nextDisabled =
    refreshing ||
    !weekOptions.length ||
    currentIndex === weekOptions.length - 1; // disable if at last week

  const goPrev = useCallback(() => {
    if (prevDisabled) return;
    setWeek(weekOptions[currentIndex - 1] ?? null);
  }, [prevDisabled, currentIndex, weekOptions, setWeek]);

  const goNext = useCallback(() => {
    if (nextDisabled) return;
    setWeek(weekOptions[currentIndex + 1] ?? null);
  }, [nextDisabled, currentIndex, weekOptions, setWeek]);

  const jumpToCurrent = useCallback(() => {
    setWeek(defaultWeek || null);
  }, [defaultWeek, setWeek]);

  return (
    <header
      role='banner'
      className={cn(
        'sticky top-0 -mt-8 z-40 -mx-4',
        'bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A]',
        'shadow-md'
      )}
    >
      {/* Top bar */}
      <div
        className={cn(
          'flex justify-between items-center h-[73px] px-4',
          'border-b border-b-white/10'
        )}
      >
        <Image
          src={MatchduleLogo}
          height={20}
          width={166}
          priority
          alt='Matchdule Logo'
        />

        <button
          type='button'
          className='flex items-center gap-2 text-white cursor-pointer disabled:opacity-60'
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
      <div
        className={cn(
          'bg-gradient-to-b from-white/5 to-black/0 h-20',
          'flex justify-between items-center px-4'
        )}
      >
        {/* Prev */}
        <button
          type='button'
          className={cn(
            'flex justify-center items-center w-9 h-9 rounded-lg',
            'border-1 border-white/20 bg-white/10 text-white',
            'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
          )}
          onClick={goPrev}
          aria-label='Previous week'
          disabled={prevDisabled}
        >
          <ChevronLeft className='h-4.5 w-4.5' aria-hidden />
        </button>

        {/* Center info */}
        <div className='text-center'>
          <p className='font-bold text-white pb-1'>{rangeLabel ?? ''}</p>

          <div className='flex justify-center items-center gap-2'>
            <p className='font-semibold text-xs text-white/70 uppercase'>
              {week ?? ''}
            </p>

            <Dot />

            {currentWeek === defaultWeek ? (
              <Pill
                className='bg-[#00D9C0]/20 text-[#00D9C0]'
                icon={
                  <Radio className='w-3.5 h-3.5 animate-pulse' aria-hidden />
                }
              >
                Current week
              </Pill>
            ) : (
              <button
                type='button'
                className={cn(
                  'flex items-center gap-1 uppercase font-bold text-xs',
                  'text-[#00C27A] hover:text-[#00C27A]/80 cursor-pointer disabled:opacity-60'
                )}
                onClick={jumpToCurrent}
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
                  className='bg-[#EF4444] text-white'
                  icon={<TriangleAlert className='w-3.5 h-3.5' aria-hidden />}
                >
                  {conflictCount} Conflict{conflictCount > 1 ? 's' : ''}
                </Pill>
              </>
            )}

            {hasTight && (
              <>
                <Dot />
                <Pill
                  className='bg-[#FE9A00] text-white'
                  icon={<CircleAlert className='w-3.5 h-3.5' aria-hidden />}
                >
                  {tightCount} Tight
                </Pill>
              </>
            )}
          </div>
        </div>

        {/* Next */}
        <button
          type='button'
          className={cn(
            'flex justify-center items-center w-9 h-9 rounded-lg',
            'border-1 border-white/20 bg-white/10 text-white',
            'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
          )}
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
