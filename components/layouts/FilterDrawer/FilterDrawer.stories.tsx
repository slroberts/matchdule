import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  DEFAULT_FILTERS,
  FilterDrawer,
  getActiveFilterCount,
  normalizeFilters,
} from './FilterDrawer';
import { FilterState } from '@/types/match';
import { Button } from '@/components/ui/buttons/Button';

/**
 * FilterDrawer — Figma: Screens › Filters / Sheet
 *   Default · Results unlocked · Zero-result prevention
 *
 * The drawer is a dark island (data-theme="dark") that opens over the light app canvas,
 * so the backdrop here uses the same tokens as the real schedule screen.
 */
const meta: Meta<typeof FilterDrawer> = {
  title: 'Components/layouts/FilterDrawer',
  component: FilterDrawer,
  parameters: {
    // Fullscreen is required for the fixed scrim + bottom sheet
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

/** Size of the pretend week the live count is computed from */
const MOCK_WEEK_TOTAL = 12;

/**
 * Simulated live count so the "Show N matches" CTA responds as you toggle chips.
 * Each active filter narrows the week by 3; enough filters reach the zero-result state.
 * (The real count comes from ClientView's filtered list.)
 */
const mockMatchCount = (filters: FilterState) =>
  Math.max(0, MOCK_WEEK_TOTAL - getActiveFilterCount(filters) * 3);

/**
 * Stateful wrapper that mirrors ClientView:
 * AnimatePresence (for exit animations) + filter state + a live match count.
 */
const FilterDrawerWrapper = ({
  initialState = DEFAULT_FILTERS,
  defaultOpen = true,
  fixedMatchCount,
}: {
  initialState?: FilterState;
  defaultOpen?: boolean;
  /** Pin the count (e.g. 0 for the zero-result state) instead of simulating it */
  fixedMatchCount?: number;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // Same guard as ClientView: invalid combos (e.g. Upcoming + Win) can't exist
  const [filters, setFilters] = useState<FilterState>(() =>
    normalizeFilters(initialState),
  );
  const matchCount = fixedMatchCount ?? mockMatchCount(filters);

  return (
    <div className='flex h-dvh flex-col items-center justify-center gap-(--space-stack-md) bg-(--color-bg-canvas) p-(--space-gutter) text-center'>
      <h2 className='text-display text-(--color-text-primary)'>Schedule</h2>
      <p className='text-meta max-w-70 text-(--color-text-secondary)'>
        Stand-in for the match list behind the sheet. {matchCount} of{' '}
        {MOCK_WEEK_TOTAL} matches shown · {getActiveFilterCount(filters)}{' '}
        filters active.
      </p>
      <Button onClick={() => setIsOpen(true)}>Open filters</Button>

      {/* AnimatePresence is required for the sheet + scrim exit animations */}
      <AnimatePresence>
        {isOpen && (
          <FilterDrawer
            onClose={() => setIsOpen(false)}
            filters={filters}
            setFilters={setFilters}
            matchCount={matchCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/** Figma: Filters / Sheet · Default — nothing applied, "Showing all 12 matches". */
export const Default: Story = {
  render: () => <FilterDrawerWrapper />,
};

/**
 * Figma: Filters / Sheet · Results unlocked — Result chips are enabled because Final is selected.
 * (Previously this story used Upcoming + Win, which the drawer now prevents.)
 */
export const ResultsUnlocked: Story = {
  render: () => (
    <FilterDrawerWrapper
      initialState={{
        ageGroup: 'u13',
        homeAway: 'home',
        urgency: [],
        timeOfDay: [],
        matchState: 'final',
        resultsState: 'W',
      }}
    />
  ),
};

/** Many filters across every group — chips wrap, group status shows joined labels. */
export const WithActiveFilters: Story = {
  render: () => (
    <FilterDrawerWrapper
      initialState={{
        ageGroup: 'u9',
        homeAway: 'home',
        urgency: ['conflict', 'tbd'],
        timeOfDay: ['morning', 'afternoon'],
        matchState: 'upcoming',
        resultsState: null,
      }}
      fixedMatchCount={2}
    />
  ),
};

/**
 * Figma: Filters / Sheet · Zero-result prevention — CTA disables to "No matches"
 * and the inline hint explains why, before the user closes the sheet.
 */
export const ZeroResults: Story = {
  render: () => (
    <FilterDrawerWrapper
      initialState={{
        ...DEFAULT_FILTERS,
        timeOfDay: ['evening'],
        matchState: 'upcoming',
        urgency: ['conflict'],
      }}
      fixedMatchCount={0}
    />
  ),
};

/** Starts closed — tests the open animation, focus move to Close, and Escape/scrim to dismiss. */
export const ClosedByDefault: Story = {
  render: () => <FilterDrawerWrapper defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const open = within(canvasElement).getByRole('button', {
      name: 'Open filters',
    });

    // Opens with focus on Close
    await userEvent.click(open);
    const sheet = await screen.findByRole('dialog', { name: 'Filters' });
    await waitFor(() =>
      expect(
        within(sheet).getByRole('button', { name: 'Close filters' }),
      ).toHaveFocus(),
    );

    // Escape closes; focus returns once the exit animation finishes
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(open).toHaveFocus());

    // Tapping the scrim closes too
    await userEvent.click(open);
    await screen.findByRole('dialog', { name: 'Filters' });
    await userEvent.click(document.querySelector('[data-sheet-scrim]')!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};
