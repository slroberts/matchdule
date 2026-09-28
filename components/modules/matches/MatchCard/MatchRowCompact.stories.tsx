import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MatchRowCompact } from './MatchRowCompact';
import {
  NOW,
  u9Home,
  u13Away,
  bgSunday,
  withScore,
} from '@/lib/test-utils/story-data';

/** Collapsed row: WHO (club + age) · AGAINST (vs opponent) · WHERE (Home/Away + field). */
const meta: Meta<typeof MatchRowCompact> = {
  title: 'Molecules/MatchRowCompact',
  component: MatchRowCompact,
  parameters: { layout: 'padded', now: NOW.weekAhead },
  args: { onExpand: fn(), controlsId: 'match-demo' },
  decorators: [
    (Story) => (
      <div className='max-w-lg'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MatchRowCompact>;

export const Upcoming: Story = { args: { match: u9Home } };
export const AwayWithTightGap: Story = {
  args: { match: { ...u13Away, isTightGap: true } },
};
export const Conflict: Story = {
  args: { match: { ...bgSunday, isConflict: true } },
};
export const Live: Story = {
  args: { match: u9Home },
  parameters: { now: NOW.duringGame },
};
export const Won: Story = {
  args: { match: withScore(u9Home, 3, 1) },
  parameters: { now: NOW.afterFirstGame },
};
export const Lost: Story = {
  args: { match: withScore(u9Home, 0, 2) },
  parameters: { now: NOW.afterFirstGame },
};
/** Finished, no score → "FT · Pending" */
export const Pending: Story = {
  args: { match: u9Home },
  parameters: { now: NOW.afterFirstGame },
};
export const LongOpponentName: Story = {
  args: {
    match: {
      ...u9Home,
      awayTeam: {
        ...u9Home.awayTeam,
        name: 'Griffin United Soccer Club Bronx Travel Academy',
      },
    },
  },
};
