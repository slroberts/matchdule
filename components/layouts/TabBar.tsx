'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Calendar, Trophy, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * TabBar — Figma: Organisms › TabBar + TabItem (Selected=true|false)
 * Replaces the icon-only trophy/calendar toggle: labeled, always visible, scales to 3–5 tabs.
 * Frosted: .glass (surface @ 82% + backdrop blur 24). Content scrolls beneath it —
 * give the scroll container padding-bottom: calc(var(--size-tab-bar) + var(--safe-bottom)).
 */

type ViewMode = 'schedule' | 'standings';

interface TabBarProps {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}

const ITEMS: { value: ViewMode; label: string; Icon: LucideIcon }[] = [
  { value: 'schedule', label: 'Schedule', Icon: Calendar },
  { value: 'standings', label: 'Standings', Icon: Trophy },
];

export const TabBar = ({ viewMode, setViewMode }: TabBarProps) => (
  <nav
    aria-label='Primary'
    className='glass fixed inset-x-0 bottom-0 z-(--z-tab-bar) border-t border-(--color-border-default) pt-1 pb-[max(env(safe-area-inset-bottom,0px),8px)]'
  >
    <div className='mx-auto flex w-full max-w-lg px-4'>
      {ITEMS.map(({ value, label, Icon }) => {
        const isActive = viewMode === value;

        return (
          <button
            key={value}
            type='button'
            onClick={() => setViewMode(value)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'pressable flex min-h-(--size-tap) flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1',
              'text-meta font-semibold transition-colors duration-(--duration-fade)',
              isActive
                ? 'text-(--color-text-primary)'
                : 'text-(--color-text-disabled) hover:text-(--color-text-primary)',
            )}
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              absoluteStrokeWidth
              aria-hidden='true'
            />
            {label}
          </button>
        );
      })}
    </div>
  </nav>
);
