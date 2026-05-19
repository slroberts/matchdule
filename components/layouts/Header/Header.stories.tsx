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

// The standard current week (can navigate both ways)
export const CurrentWeek: Story = {
  args: {
    dateRange: 'Oct 19 - 25',
    weekNumber: 43,
    isCurrentWeek: true,
    prevWeekDate: '2026-10-12',
    nextWeekDate: '2026-10-26',
    hasPrev: true,
    hasNext: true,
  },
};

// A standard past/future week
export const OtherWeek: Story = {
  args: {
    dateRange: 'Oct 26 - Nov 1',
    weekNumber: 44,
    isCurrentWeek: false,
    prevWeekDate: '2026-10-19',
    nextWeekDate: '2026-11-02',
    hasPrev: true,
    hasNext: true,
  },
};

// Reached the absolute first match in the database
export const FirstWeekBoundary: Story = {
  args: {
    dateRange: 'Mar 23 - 29',
    weekNumber: 13,
    isCurrentWeek: false,
    prevWeekDate: '2026-03-16',
    nextWeekDate: '2026-03-30',
    hasPrev: false, // Disables the left arrow
    hasNext: true,
  },
};

// Reached the absolute last match in the database
export const LastWeekBoundary: Story = {
  args: {
    dateRange: 'May 25 - 31',
    weekNumber: 22,
    isCurrentWeek: false,
    prevWeekDate: '2026-05-18',
    nextWeekDate: '2026-06-01',
    hasPrev: true,
    hasNext: false, // Disables the right arrow
  },
};
