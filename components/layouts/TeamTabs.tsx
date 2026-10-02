'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TabOption, TABS } from '@/types/match';

/**
 * TeamTabs — Figma: Atoms › TeamTab (State=Default|Selected) in a horizontal scroller
 * Default:  surface fill · Elevation/Card · text-secondary
 * Selected: accent fill  · Elevation/Accent · text-on-accent (pill slides via shared layout)
 * Requires global.css (tokens + .scroll-x, .text-control).
 *
 * Size hierarchy: 36px visual pill inside a 44px tap target — one step above the 32px
 * active-filter chips (navigation > state summary). Press + focus render on the pill.
 *
 * The Schedule/Standings toggle moved to <TabBar /> (bottom navigation) per the audit.
 */

/* .tap-area (44px, unpainted) + .tap-visual (press + focus) come from global.css */
const HIT = 'tap-area shrink-0';
const PILL =
  'tap-visual text-control relative isolate inline-flex h-9 items-center whitespace-nowrap rounded-(--radius-full) px-(--space-stack-md)';

interface TeamTabsProps {
  activeTeam: TabOption;
  onTeamChange: (team: TabOption) => void;
}

/* Motion spec: stiffness 400 · damping 35 (matches --ease-spring) */
const PILL_SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;

export const TeamTabs = ({ activeTeam, onTeamChange }: TeamTabsProps) => {
  const tabRefs = useRef<Map<TabOption, HTMLButtonElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the selected tab visible when the row overflows (many teams / long names).
  // Scroll the ROW, not the tab: element.scrollIntoView() also moves the browser's
  // sequential-focus starting point, so the next Tab skipped Filters and the week
  // navigation and landed in the schedule (WCAG 2.4.3 Focus Order).
  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current.get(activeTeam);
    if (!list || !tab) return;
    const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
    const start =
      tab.getBoundingClientRect().left -
      list.getBoundingClientRect().left +
      list.scrollLeft;
    const left = start - pad;
    const right = start + tab.offsetWidth + pad - list.clientWidth;
    const target =
      list.scrollLeft > left ? left : list.scrollLeft < right ? right : null;
    if (target === null) return; // already fully visible
    list.scrollTo({
      left: target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [activeTeam]);

  // WAI-ARIA tabs: arrows move + select, Home/End jump to ends (roving tabindex)
  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const last = TABS.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : e.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    const team = TABS[next];
    onTeamChange(team);
    tabRefs.current.get(team)?.focus();
  };

  return (
    <MotionConfig reducedMotion='user'>
      <div
        ref={listRef}
        role='tablist'
        aria-label='Teams'
        className='scroll-x mx-auto w-full max-w-lg px-(--space-gutter)'
      >
        {TABS.map((tab, index) => {
          const isActive = activeTeam === tab;

          return (
            <button
              key={tab}
              ref={(el) => {
                if (el) tabRefs.current.set(tab, el);
                else tabRefs.current.delete(tab);
              }}
              type='button'
              role='tab'
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTeamChange(tab)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={HIT}
            >
              <span
                className={cn(
                  PILL,
                  isActive
                    ? 'text-(--color-text-on-accent)'
                    : 'bg-(--color-bg-surface) text-(--color-text-secondary) shadow-(--shadow-card) hover:text-(--color-text-primary)',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId='active-team-pill'
                    aria-hidden='true'
                    className='absolute inset-0 -z-10 rounded-(--radius-full) bg-(--color-bg-accent) shadow-(--shadow-accent)'
                    transition={PILL_SPRING}
                  />
                )}
                {tab}
              </span>
            </button>
          );
        })}
      </div>
    </MotionConfig>
  );
};
