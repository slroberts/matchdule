'use client';

import type { MouseEvent } from 'react';
import { Calendar, Trophy, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/hooks/use-view-mode';

/**
 * TabBar — Figma: Organisms › TabBar + TabItem (Selected=true|false)
 * Tabs are real links (/?view=season) so they can be long-pressed, copied and shared,
 * but clicks switch via history.pushState — instant, no data refetch, back button works.
 * Frosted: .glass (surface @ 94% + backdrop blur 24). Content scrolls beneath it —
 * give the scroll container padding-bottom: calc(var(--size-tab-bar) + var(--safe-bottom)).
 */

interface TabBarProps {
  view: ViewMode;
  hrefFor: (view: ViewMode) => string;
  onSelect: (view: ViewMode) => void;
}

const ITEMS: { value: ViewMode; label: string; Icon: LucideIcon }[] = [
  { value: 'schedule', label: 'Schedule', Icon: Calendar },
  { value: 'season', label: 'Season', Icon: Trophy },
];

export const TabBar = ({ view, hrefFor, onSelect }: TabBarProps) => (
  <nav
    aria-label='Primary'
    className='glass fixed inset-x-0 bottom-0 z-(--z-tab-bar) border-t border-(--color-border-default) pt-1 pb-[max(env(safe-area-inset-bottom,0px),8px)]'
  >
    <div className='mx-auto flex w-full max-w-lg px-4'>
      {ITEMS.map(({ value, label, Icon }) => {
        const isActive = view === value;
        const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
          // Let modified clicks (new tab / window) behave like normal links
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onSelect(value);
        };

        return (
          <a
            key={value}
            href={hrefFor(value)}
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'pressable flex min-h-(--size-tap) flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1',
              'text-meta font-semibold transition-colors duration-(--duration-fade)',
              isActive
                ? 'text-(--color-text-accent)'
                : 'text-(--color-text-secondary) hover:text-(--color-text-primary)',
            )}
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              absoluteStrokeWidth
              aria-hidden='true'
              className={
                isActive
                  ? 'text-(--color-icon-accent)'
                  : 'text-(--color-icon-default)'
              }
            />
            {label}
          </a>
        );
      })}
    </div>
  </nav>
);
