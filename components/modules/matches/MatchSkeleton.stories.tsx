import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MatchSkeleton } from './MatchSkeleton';

const meta: Meta<typeof MatchSkeleton> = {
  title: 'Organisms/MatchSkeleton',
  component: MatchSkeleton,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MatchSkeleton>;

export const FeedLoading: Story = {
  render: () => (
    <div className='w-[400px]'>
      <MatchSkeleton />
    </div>
  ),
};
