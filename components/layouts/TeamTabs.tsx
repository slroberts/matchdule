'use client';

import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TabOption, TABS } from '@/types/match';
import { Calendar, Trophy } from 'lucide-react';

interface TeamTabsProps {
  activeTeam: TabOption;
  onTeamChange: (team: TabOption) => void;
  viewMode: string;
  setViewMode: Dispatch<SetStateAction<'schedule' | 'standings'>>;
}

export const TeamTabs = ({
  activeTeam,
  onTeamChange,
  viewMode,
  setViewMode,
}: TeamTabsProps) => {
  return (
    <div
      className='flex w-md mx-auto justify-between items-center gap-grid-md px-4 py-4 '
      role='tablist'
      aria-label='Filter teams'
    >
      <div className='flex w-full max-w-sm bg-white border border-slate-200 p-1 rounded-xl relative'>
        {TABS.map((tab) => {
          const isActive = activeTeam === tab;

          return (
            <button
              key={tab}
              onClick={() => onTeamChange(tab)}
              role='tab'
              aria-selected={isActive}
              className={cn(
                'relative flex h-full flex-1 items-center justify-center rounded-lg py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 z-10',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <span className='relative z-10'>{tab}</span>

              {isActive && (
                <motion.div
                  layoutId='active-team-pill'
                  className='absolute inset-0 bg-brand-primary rounded-lg shadow-md z-0'
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
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          setViewMode(viewMode === 'schedule' ? 'standings' : 'schedule')
        }
        aria-label='Toggle View'
        className='flex justify-center items-center rounded-full h-12 w-12 bg-[#1B2033] text-white shadow-sm hover:bg-slate-800 transition-colors shrink-0'
      >
        {viewMode === 'schedule' ? (
          <Trophy size={20} strokeWidth={2} />
        ) : (
          <Calendar size={20} strokeWidth={2} />
        )}
      </motion.button>
    </div>
  );
};
