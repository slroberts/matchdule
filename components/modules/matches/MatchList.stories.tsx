import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MatchList } from './MatchList';
import { u9Home } from '@/lib/test-utils/story-data';

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
  args: { nextMatch: u9Home },
};
export const RestWeekNothingAhead: Story = {};
export const NoFilterResults: Story = {
  args: { hasActiveFilters: true, onClearFilters: fn() },
};
