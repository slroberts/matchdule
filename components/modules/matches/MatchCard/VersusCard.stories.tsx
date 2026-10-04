import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { VersusCard } from './VersusCard';
import {
  NOW,
  u9Home,
  u13Away,
  withLiveScore,
  withScore,
} from '@/lib/test-utils/story-data';

/** The focus-stack highlight (dark = "next up"). Figma: VersusCard. */
const meta: Meta<typeof VersusCard> = {
  title: 'Organisms/VersusCard',
  component: VersusCard,
  parameters: { layout: 'padded', now: NOW.weekAhead },
  args: { onCollapse: fn(), id: 'versus-demo' },
  decorators: [
    (Story) => (
      <div className='max-w-lg'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof VersusCard>;

/** > 24 h away: one-line countdown ("Kickoff in 5d 3h") */
export const Upcoming: Story = { args: { match: u9Home } };
/** Game day: amber tile countdown */
export const Today: Story = {
  args: { match: u9Home },
  parameters: { now: NOW.gameDayMorning },
};
/** Urgency — Figma: Urgency=Tight gap / Urgency=Conflict */
export const TightGap: Story = {
  args: { match: { ...u9Home, isTightGap: true } },
};
export const Conflict: Story = {
  args: { match: { ...u9Home, isConflict: true } },
};
/** Called off by the league — struck time + reason, never "Pending" */
export const RainedOut: Story = {
  args: { match: { ...u9Home, status: 'canceled', statusNote: 'Rained out' } },
  parameters: { now: NOW.afterFirstGame },
};
export const AwayGame: Story = {
  args: { match: u13Away },
  parameters: { now: NOW.gameDayMorning },
};
export const Live: Story = {
  args: { match: withLiveScore(u9Home, 1, 0) },
  parameters: { now: NOW.duringGame },
};
/** Live before the first score update → VS + "Live" */
export const LiveNoScore: Story = {
  args: { match: u9Home },
  parameters: { now: NOW.duringGame },
};
export const Won: Story = {
  args: { match: withScore(u9Home, 4, 2) },
  parameters: { now: NOW.afterFirstGame },
};
export const Lost: Story = {
  args: { match: withScore(u9Home, 1, 3) },
  parameters: { now: NOW.afterFirstGame },
};
export const Draw: Story = {
  args: { match: withScore(u9Home, 2, 2) },
  parameters: { now: NOW.afterFirstGame },
};
/** Finished, score not posted: VS + grey "Pending" */
export const Pending: Story = {
  args: { match: u9Home },
  parameters: { now: NOW.afterFirstGame },
};
