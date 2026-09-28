import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MatchList } from './MatchList';

/**
 * MatchList now renders the EMPTY states only — the list itself is CollapsibleMatchList
 * (see Organisms/CollapsibleMatchList).
 */
const meta: Meta<typeof MatchList> = {
  title: 'Organisms/MatchList (empty states)',
  component: MatchList,
  parameters: { layout: 'fullscreen' },
  args: { matches: [] },
  decorators: [
    (Story) => (
      <div className='page-canvas min-h-dvh py-8'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MatchList>;

export const RestWeek: Story = {
  args: { nextMatch: { href: '/?date=2026-09-13', label: 'Sun, Sep 13' } },
};
export const RestWeekNothingAhead: Story = {};
export const NoFilterResults: Story = {
  args: { hasActiveFilters: true, onClearFilters: fn() },
};
