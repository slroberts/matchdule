import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CalendarOff, Flag, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';
import { EmptyState } from './EmptyState';

/** Figma: Molecules › EmptyState — every "nothing here" moment shares this shell. */
const meta: Meta<typeof EmptyState> = {
  title: 'States/EmptyState',
  component: EmptyState,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className='page-canvas min-h-dvh py-8'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const RestWeek: Story = {
  args: {
    icon: CalendarOff,
    title: 'Rest week',
    body: 'No matches scheduled this week.',
  },
};

export const NoSeasonResults: Story = {
  args: {
    icon: Trophy,
    title: 'No results yet',
    body: 'Your teams’ records will show up here after their first final whistle.',
  },
};

export const WithAction: Story = {
  args: {
    as: 'h1',
    icon: Flag,
    title: 'Offside!',
    body: 'This page doesn’t exist. The link may be old or mistyped.',
    action: <Button>Back to schedule</Button>,
  },
};
