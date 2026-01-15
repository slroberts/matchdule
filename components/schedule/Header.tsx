'use client';

import type { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { FilterState } from '@/types/schedule';
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

type PillVariant = 'neutral' | 'current' | 'conflict' | 'tight';

const pillVariants: Record<PillVariant, string> = {
  neutral: 'bg-white/10 text-white',
  current: 'bg-[#00D9C0]/20 text-[#00D9C0]',
  conflict: 'bg-gradient-to-b from-[#FB2C36] to-[#E7000B] text-white',
  tight: 'bg-gradient-to-b from-[#FBB000] to-[#F0A30A] text-white',
};

function Pill({
  variant = 'neutral',
  icon,
  children,
}: {
  variant?: PillVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 px-2 py-0.5 rounded-full',
        pillVariants[variant]
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

type HeaderProps = {
  rangeLabel?: string;

  currentWeek: string;
  isCurrentWeek: boolean;
  onJumpToCurrent: () => void;

  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;

  hasConflicts: boolean;
  hasTightGaps: boolean;

  filtersOpen: boolean;
  setFiltersOpen: Dispatch<SetStateAction<boolean>>;

  filterState: FilterState;
  teamOptions: string[];
  onApplyFilters: (next: FilterState) => void;
  onClearFilters: () => void;

  refreshing: boolean;
};

const cx = {
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
  rangeLabel,
  currentWeek,
  isCurrentWeek,
  onJumpToCurrent,
  canPrev,
  canNext,
  onPrev,
  onNext,
  hasConflicts,
  hasTightGaps,
  filtersOpen,
  setFiltersOpen,
  filterState,
  teamOptions,
  onApplyFilters,
  onClearFilters,
  refreshing,
}: HeaderProps) {
  const statusBadges = [
    hasConflicts && (
      <Pill
        key='conflict'
        variant='conflict'
        icon={<Flag className='aspect-square w-3.5 h-3.5' aria-hidden />}
      />
    ),
    hasTightGaps && (
      <Pill
        key='tight'
        variant='tight'
        icon={
          <FoldHorizontal className='aspect-square w-3.5 h-3.5' aria-hidden />
        }
      />
    ),
  ].filter(Boolean);

  return (
    <header role='banner' className={cx.header}>
      <div className={cx.topBar}>
        <Image
          src={MatchduleLogo}
          height={20}
          width={166}
          priority
          alt='Matchdule Logo'
        />

        <button
          type='button'
          className={cx.filtersBtn}
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

      <div className={cx.weekBar}>
        <button
          type='button'
          className={cx.navBtn}
          onClick={onPrev}
          aria-label='Previous week'
          disabled={!canPrev}
        >
          <ChevronLeft className='h-4.5 w-4.5' aria-hidden />
        </button>

        <div className='text-center'>
          <p className='font-bold text-white pb-1'>{rangeLabel ?? ''}</p>

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
                disabled={refreshing}
                aria-label='Jump to current week'
              >
                Jump to Current
              </button>
            )}

            {statusBadges.length ? (
              <>
                <Dot />
                <div className='flex items-center gap-2'>{statusBadges}</div>
              </>
            ) : null}
          </div>
        </div>

        <button
          type='button'
          className={cx.navBtn}
          onClick={onNext}
          aria-label='Next week'
          disabled={!canNext}
        >
          <ChevronRight className='h-4.5 w-4.5' aria-hidden />
        </button>
      </div>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={filterState}
        teamOptions={teamOptions}
        onApply={onApplyFilters}
        onClear={onClearFilters}
      />
    </header>
  );
}
