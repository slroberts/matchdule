'use client';

import {
  useState,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { X } from 'lucide-react';
import { FilterState } from '@/types/match';
import {
  DEFAULT_FILTERS,
  getActiveFilterChips,
  normalizeFilters,
  type ActiveFilterChip,
} from './FilterDrawer/FilterDrawer';

/**
 * ActiveFilters — Figma: Screens › Schedule / Filters active · Atoms › RemovableChip
 * Visual pill is 32px (secondary info shouldn't compete with cards), but every chip keeps a
 * 44px tap target: a transparent 44px <button> wraps the 32px pill <span>.
 * Focus ring + press feedback render on the pill, not the invisible hit area.
 * Chips animate out and the row reflows (layout); reduced motion → instant.
 */

/* .tap-area (44px, unpainted) + .tap-visual (press + focus) come from global.css */
const HIT = 'tap-area';
const PILL =
  'tap-visual text-control inline-flex h-8 items-center rounded-(--radius-full)';

interface ActiveFiltersProps {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
}

const SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;

export const ActiveFilters = ({ filters, setFilters }: ActiveFiltersProps) => {
  const chips = getActiveFilterChips(filters);
  const [announcement, setAnnouncement] = useState('');

  // Keep keyboard focus in the row after a chip disappears (next chip → previous → Clear all)
  const moveFocusFrom = (e: MouseEvent<HTMLButtonElement>) => {
    const item = e.currentTarget.closest('li');
    const target =
      item?.nextElementSibling?.querySelector('button') ??
      item?.previousElementSibling?.querySelector('button');
    requestAnimationFrame(() => (target as HTMLButtonElement | null)?.focus());
  };

  const handleRemove = (
    chip: ActiveFilterChip,
    e: MouseEvent<HTMLButtonElement>,
  ) => {
    moveFocusFrom(e);
    setFilters((prev) => normalizeFilters(chip.remove(prev)));
    setAnnouncement(`${chip.label} filter removed`);
  };

  const handleClearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setAnnouncement('All filters cleared');
  };

  return (
    <MotionConfig reducedMotion='user'>
      {/* Live region lives outside the conditional so the final "cleared" message is still announced */}
      <p role='status' className='visually-hidden'>
        {announcement}
      </p>

      {chips.length > 0 && (
        <ul
          aria-label='Applied filters'
          /* gap-y-0: the 44px hit areas already space wrapped rows (12px between pills) */
          className='mx-auto mb-(--space-stack-sm) flex w-full max-w-lg flex-wrap items-center gap-x-(--space-stack-sm) gap-y-0 px-(--space-gutter)'
        >
          <AnimatePresence initial={false} mode='popLayout'>
            {chips.map((chip) => (
              <motion.li
                key={chip.key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={SPRING}
                className='list-none'
              >
                <button
                  type='button'
                  onClick={(e) => handleRemove(chip, e)}
                  aria-label={`Remove filter: ${chip.label}`}
                  className={HIT}
                >
                  <span
                    className={`${PILL} gap-1 bg-(--color-bg-inverse) pr-2 pl-3 text-(--color-text-on-inverse)`}
                  >
                    {chip.label}
                    <X
                      size={14}
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                      aria-hidden='true'
                      className='opacity-70'
                    />
                  </span>
                </button>
              </motion.li>
            ))}

            <motion.li
              key='clear-all'
              layout
              transition={SPRING}
              className='list-none'
            >
              <button type='button' onClick={handleClearAll} className={HIT}>
                <span
                  className={`${PILL} px-2.5 text-(--color-text-primary) hover:bg-(--color-bg-subtle)`}
                >
                  Clear all
                </span>
              </button>
            </motion.li>
          </AnimatePresence>
        </ul>
      )}
    </MotionConfig>
  );
};
