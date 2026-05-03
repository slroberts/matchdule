import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

// The primary state you see today
export const CurrentWeek: Story = {
  args: {
    dateRange: 'Oct 19 - 25',
    weekNumber: 43,
    isCurrentWeek: true,
  },
};

// The state when a user paginates forward/backward
export const OtherWeek: Story = {
  args: {
    dateRange: 'Oct 26 - Nov 1',
    weekNumber: 44,
    isCurrentWeek: false,
  },
};
