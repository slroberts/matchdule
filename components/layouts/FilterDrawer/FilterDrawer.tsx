'use client';

import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sun,
  Sunset,
  Moon,
  Clock,
  Flag,
  FoldHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';
import { cn } from '@/lib/utils';
import { FilterState, HomeAwayFilter, MatchStateFilter } from '@/types/match';

interface FilterDrawerProps {
  onClose: () => void;
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
}

const TEAM_SIDE_OPTIONS = ['all', 'home', 'away'] as const;
const MATCH_STATUS_OPTIONS = ['upcoming', 'live', 'final'] as const;

const URGENCY_OPTIONS = [
  {
    id: 'conflict',
    label: 'Conflicts',
    icon: Flag,
    inactiveColor: 'text-status-conflict',
  },
  {
    id: 'tight-gap',
    label: 'Tight Gaps',
    icon: FoldHorizontal,
    inactiveColor: 'text-status-warning',
  },
  {
    id: 'tbd',
    label: 'TBD',
    icon: Clock,
    inactiveColor: 'text-status-success',
  },
] as const;

const TIME_OPTIONS = [
  { id: 'morning', label: 'Morning', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', icon: Sunset },
  { id: 'evening', label: 'Evening', icon: Moon },
] as const;

export const FilterDrawer = ({
  onClose,
  filters,
  setFilters,
}: FilterDrawerProps) => {
  const handleReset = () => {
    setFilters({
      homeAway: 'all',
      urgency: [],
      timeOfDay: [],
      matchState: 'all',
    });
  };

  const toggleSingleFilter = (
    field: 'homeAway' | 'matchState',
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? 'all' : value,
    }));
  };

  const toggleArrayFilter = <T extends string>(
    field: 'urgency' | 'timeOfDay',
    value: T,
  ) => {
    setFilters((prev) => {
      const currentValues = prev[field] as string[];
      const isAlreadySelected = currentValues.includes(value);

      const newValues = isAlreadySelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [field]: newValues,
      };
    });
  };

  return (
    <>
      {/* ANIMATED BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className='fixed inset-0 z-50 bg-black/60 pointer-events-auto'
        onClick={onClose}
      />

      {/* ANIMATED FULLSCREEN PANEL */}
      <motion.div
        initial={{ translateY: '100%' }}
        animate={{ translateY: 0 }}
        exit={{ translateY: '100%' }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
        className='fixed inset-x-0 bottom-0 z-50 flex flex-col gap-grid-md bg-brand-navy bg-brand-gradient-navy p-grid-md text-white border-t border-white/10 w-full max-w-lg shadow-2xl h-full min-h-screen mx-auto font-sans'
      >
        {/* HEADER ROW */}
        <div className='flex justify-between items-center border-b border-white/5 pb-4 mt-grid-sm'>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-widest text-white/90'>
              Filter Matches
            </h3>
            <p className='text-[11px] text-surface-muted mt-0.5'>
              Refine your schedule view
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-lg border border-white/5 shrink-0'
          >
            <X size={18} />
          </button>
        </div>

        {/* FILTER CONTROL SECTIONS */}
        <div className='flex flex-col gap-grid-md overflow-y-auto flex-1 pr-1 pb-4'>
          {/* FILTER A: TEAM SIDE */}
          <div className='flex flex-col gap-2'>
            <label className='text-[10px] font-bold uppercase tracking-widest text-white/40'>
              Team Side
            </label>
            <div className='flex flex-wrap bg-white/5 p-1 rounded-lg border border-white/5 relative gap-1 sm:gap-0'>
              {TEAM_SIDE_OPTIONS.map((option) => {
                const isSelected =
                  filters.homeAway === (option as HomeAwayFilter);

                return (
                  <button
                    key={option}
                    onClick={() => toggleSingleFilter('homeAway', option)}
                    className={cn(
                      'relative flex-1 min-w-[75px] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 z-10',
                      isSelected
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/70',
                    )}
                  >
                    <span className='relative z-10'>
                      {option === 'all' ? 'Both' : option}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId='active-side-pill'
                        className='absolute inset-0 bg-white/10 rounded-lg border border-white/10 z-0'
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILTER B: URGENCY ALERTS */}
          <div className='flex flex-col gap-2'>
            <label className='text-[10px] font-bold uppercase tracking-widest text-white/40'>
              Urgency Alerts
            </label>
            <div className='flex flex-wrap gap-2'>
              {URGENCY_OPTIONS.map((item) => {
                const isSelected = filters.urgency.includes(item.id);
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleArrayFilter('urgency', item.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all outline-none',
                      isSelected
                        ? 'bg-white/10 text-white border-white/10 shadow-inner shadow-black/20'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/8 hover:text-white/80',
                    )}
                  >
                    <IconComponent
                      size={14}
                      className={
                        isSelected
                          ? item.inactiveColor
                          : 'text-white/30 transition-colors'
                      }
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILTER C: TIME OF DAY */}
          <div className='flex flex-col gap-2'>
            <label className='text-[10px] font-bold uppercase tracking-widest text-white/40'>
              Time of Day
            </label>
            <div className='flex flex-wrap gap-2'>
              {TIME_OPTIONS.map((item) => {
                const isSelected = filters.timeOfDay.includes(item.id);
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleArrayFilter('timeOfDay', item.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 h-20 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all outline-none',
                      isSelected
                        ? 'bg-white/10 text-white border-white/10 shadow-inner shadow-black/20'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/8 hover:text-white/80',
                    )}
                  >
                    <span
                      className={
                        isSelected ? 'text-brand-primary' : 'text-white/30'
                      }
                    >
                      <IconComponent size={14} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILTER D: MATCH STATE */}
          <div className='flex flex-col gap-2'>
            <label className='text-[10px] font-bold uppercase tracking-widest text-white/40'>
              Match Status
            </label>
            <div className='flex flex-wrap bg-white/5 p-1 rounded-lg border border-white/5 relative gap-1 sm:gap-0'>
              {MATCH_STATUS_OPTIONS.map((option) => {
                const isSelected =
                  filters.matchState === (option as MatchStateFilter);

                return (
                  <button
                    key={option}
                    onClick={() => toggleSingleFilter('matchState', option)}
                    className={cn(
                      'relative flex-1 min-w-[70px] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 z-10',
                      isSelected
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/70',
                    )}
                  >
                    <span className='relative z-10'>{option}</span>
                    {isSelected && (
                      <motion.div
                        layoutId='active-status-pill'
                        className='absolute inset-0 bg-white/10 rounded-lg border border-white/10 z-0'
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTION CONTROLS FOOTER */}
        <div className='flex flex-col sm:flex-row gap-3 border-t border-white/5 pt-4 pb-4 mt-auto shrink-0'>
          <Button
            className='flex-1 w-full bg-white text-brand-navy hover:bg-white/90 font-bold py-3.5 rounded-lg uppercase tracking-wider text-xs'
            onClick={onClose}
          >
            Apply Filters
          </Button>
          <Button
            className='flex-1 w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs'
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </motion.div>
    </>
  );
};
