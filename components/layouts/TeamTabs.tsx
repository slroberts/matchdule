'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TabOption, TABS } from '@/types/match';

interface TeamTabsProps {
  activeTeam: TabOption;
  onTeamChange: (team: TabOption) => void;
}

export const TeamTabs = ({ activeTeam, onTeamChange }: TeamTabsProps) => {
  return (
    <div
      className='flex w-full justify-center px-4 py-4 '
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
    </div>
  );
};
