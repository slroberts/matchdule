import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MatchCard } from './MatchCard';
import {
  NOW,
  u9Home,
  u13Away,
  bgSunday,
  withLiveScore,
  withScore,
} from '@/lib/test-utils/story-data';

/**
 * Light detail card — the regular card and the MANUALLY expanded state in the focus stack.
 * Clock pinned (parameters.now) so each state renders the same every time.
 */
const meta: Meta<typeof MatchCard> = {
  title: 'Molecules/MatchCard',
  component: MatchCard,
  parameters: { layout: 'padded', now: NOW.gameDayMorning },
  decorators: [
    (Story) => (
      <div className='max-w-lg'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MatchCard>;

export const Upcoming: Story = { args: { match: u9Home } };
export const Away: Story = { args: { match: u13Away } };
export const Live: Story = {
  args: { match: withLiveScore(u9Home, 1, 0) },
  parameters: { now: NOW.duringGame },
};
export const FinalWin: Story = {
  args: { match: withScore(u9Home, 3, 1) },
  parameters: { now: NOW.afterFirstGame },
};
export const FinalDraw: Story = {
  args: { match: withScore(u9Home, 2, 2) },
  parameters: { now: NOW.afterFirstGame },
};
/** Game over, score not posted yet */
export const Pending: Story = {
  args: { match: u9Home },
  parameters: { now: NOW.afterFirstGame },
};
export const Canceled: Story = {
  args: { match: { ...u13Away, status: 'canceled' } },
};
export const TightGap: Story = {
  args: { match: { ...u13Away, isTightGap: true } },
};
export const Conflict: Story = {
  args: { match: { ...bgSunday, isConflict: true } },
};
export const TimeTBD: Story = { args: { match: { ...bgSunday, time: 'TBD' } } };
/** Focus stack: opened by hand → shows the ⌃ collapse control */
export const Collapsible: Story = {
  args: { match: u13Away, id: 'match-demo', onCollapse: fn() },
};
