import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { StandingsView } from './StandingsView';
import { fallResults, springResults } from '@/lib/test-utils/story-data';

/** The Season tab: one season at a time + ‹ › pager. Figma: Season / Snapshot. */
const meta: Meta<typeof StandingsView> = {
  title: 'Layouts/Season tab',
  component: StandingsView,
  parameters: { layout: 'fullscreen' },
  args: {
    activeTeam: 'All Teams',
    matches: [...springResults, ...fallResults],
    seasonHrefFor: (s: string) =>
      `/?view=season&season=${s.toLowerCase().replace(' ', '-')}`,
    onSelectSeason: fn(),
  },
  decorators: [
    (Story) => (
      <div className='page-canvas min-h-dvh py-4'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof StandingsView>;

/** Newest season: "Fall 2026 so far", flags (Undefeated, win streak, biggest win) */
export const CurrentSeason: Story = {};
/** Past season: "Spring 2026 · Final", › enabled */
export const PastSeason: Story = { args: { selectedSeason: 'Spring 2026' } };
export const OneTeam: Story = { args: { activeTeam: 'Soricha' } };
export const NoResultsYet: Story = { args: { matches: [] } };
