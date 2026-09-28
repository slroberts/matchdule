import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScheduleSkeleton } from './ScheduleSkeleton';

/** Loading shell: real week, tabs and tab bar — only rows shimmer. Figma: Schedule / Loading. */
const meta: Meta<typeof ScheduleSkeleton> = {
  title: 'States/ScheduleSkeleton',
  component: ScheduleSkeleton,
  parameters: { layout: 'fullscreen' },
  args: {
    dateRange: 'Sep 21 – 27',
    seasonLabel: 'Fall 2026',
    isCurrentWeek: true,
    activeTeam: 'Soricha',
  },
};
export default meta;
type Story = StoryObj<typeof ScheduleSkeleton>;

export const Schedule: Story = {};
export const OtherWeek: Story = {
  args: {
    dateRange: 'Oct 12 – 18',
    isCurrentWeek: false,
    activeTeam: 'All Teams',
  },
};
export const SeasonTab: Story = { args: { view: 'season' } };
