import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { SeasonWrapCard } from './SeasonWrapCard';

/** Off-season headline: celebrate first, then look ahead. Figma: SeasonWrapCard. */
const meta: Meta<typeof SeasonWrapCard> = {
  title: 'Organisms/SeasonWrapCard',
  component: SeasonWrapCard,
  parameters: { layout: 'padded' },
  args: {
    season: 'Fall 2026',
    totals: { gp: 6, w: 4, d: 1, l: 1 },
    upcomingSeason: 'Spring 2027',
    seasonHref: '/?view=season&season=fall-2026',
    onViewSeason: fn(),
  },
  decorators: [
    (Story) => (
      <div className='max-w-lg'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SeasonWrapCard>;

export const NextSeasonScheduled: Story = {
  args: {
    next: {
      label: 'Spring 2027 starts',
      when: 'Sat, Apr 10 · 10:00 AM',
      href: '/?date=2027-04-10',
    },
  },
};
export const NotScheduledYet: Story = {};
