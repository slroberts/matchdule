import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ActiveFilters } from './ActiveFilters';
import { DEFAULT_FILTERS } from './FilterDrawer/FilterDrawer';
import type { FilterState } from '@/types/match';

/** Applied-filter chips under the header: tap to remove, "Clear all" to reset. */
const meta: Meta<typeof ActiveFilters> = {
  title: 'Layouts/ActiveFilters',
  component: ActiveFilters,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className='page-canvas py-4'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ActiveFilters>;

const THREE: FilterState = {
  ...DEFAULT_FILTERS,
  homeAway: 'home',
  ageGroup: 'u13',
  timeOfDay: ['morning'],
};
const MANY: FilterState = {
  ...DEFAULT_FILTERS,
  homeAway: 'away',
  ageGroup: 'u9',
  timeOfDay: ['morning', 'afternoon'],
  urgency: ['conflict', 'tight-gap'],
  matchState: 'final',
  resultsState: 'W',
};

const Controlled = ({ initial }: { initial: FilterState }) => {
  const [filters, setFilters] = useState(initial);
  return <ActiveFilters filters={filters} setFilters={setFilters} />;
};

export const ThreeFilters: Story = {
  render: () => <Controlled initial={THREE} />,
};
/** Wraps onto multiple rows */
export const ManyFilters: Story = {
  render: () => <Controlled initial={MANY} />,
};
/** Nothing applied → renders nothing (just the silent live region) */
export const None: Story = {
  render: () => <Controlled initial={DEFAULT_FILTERS} />,
};

/**
 * Interaction test — the accessibility contract:
 *  1. removing a chip moves keyboard focus to the NEXT chip (never lost to <body>)
 *  2. the removal is announced ("… filter removed")
 *  3. "Clear all" removes every chip and announces it
 */
export const RemoveAndClear: Story = {
  render: () => <Controlled initial={THREE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chips = () =>
      canvas.queryAllByRole('button', { name: /^Remove filter:/ });

    const [first, second] = chips();
    const nextName = second.getAttribute('aria-label')!;
    const removedLabel = first
      .getAttribute('aria-label')!
      .replace('Remove filter: ', '');

    await userEvent.click(first);
    await waitFor(() => expect(chips()).toHaveLength(2));
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('aria-label', nextName),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      `${removedLabel} filter removed`,
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await waitFor(() => expect(chips()).toHaveLength(0));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'All filters cleared',
    );
  },
};
