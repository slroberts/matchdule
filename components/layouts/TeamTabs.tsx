'use client';

import { cn } from '@/lib/utils';
import { TabOption, TABS } from '@/types/match';

interface TeamTabsProps {
  activeTeam: TabOption;
  onTeamChange: (team: TabOption) => void;
}

export const TeamTabs = ({ activeTeam, onTeamChange }: TeamTabsProps) => {
  return (
    <div
      className='flex w-full justify-center bg-brand-navy'
      role='tablist'
      aria-label='Filter teams'
    >
      <div className='flex w-full max-w-sm'>
        {TABS.map((tab) => {
          const isActive = activeTeam === tab;

          return (
            <button
              key={tab}
              onClick={() => onTeamChange(tab)}
              role='tab'
              aria-selected={isActive}
              className={cn(
                'relative flex h-full flex-1 items-center justify-center py-4 text-xs font-bold uppercase tracking-widest transition-colors duration-300',
                isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
              )}
            >
              <span className='relative z-10'>{tab}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
