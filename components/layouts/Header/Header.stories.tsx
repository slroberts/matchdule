import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Header } from './Header';

/** Figma: AppHeader + WeekNavigator · Season / Snapshot header. Ranges use an en dash. */
const meta: Meta<typeof Header> = {
  title: 'Layouts/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: {
    dateRange: 'Sep 21 – 27',
    seasonLabel: 'Fall 2026',
    isCurrentWeek: true,
    prevWeekDate: '2026-09-14',
    nextWeekDate: '2026-09-28',
    hasPrev: true,
    hasNext: true,
    setIsFilterOpen: fn(),
    activeFilterCount: 0,
  },
};
export default meta;
type Story = StoryObj<typeof Header>;

export const CurrentWeek: Story = {};
/** Any other week → "↩ This week" action pill */
export const OtherWeek: Story = {
  args: { dateRange: 'Oct 12 – 18', isCurrentWeek: false },
};
export const FiltersActive: Story = { args: { activeFilterCount: 3 } };
export const FirstWeek: Story = {
  args: {
    dateRange: 'Mar 23 – 29',
    seasonLabel: 'Spring 2026',
    isCurrentWeek: false,
    hasPrev: false,
  },
};
/** Season's final week — next arrow disabled */
export const LastWeek: Story = {
  args: { dateRange: 'Nov 9 – 15', isCurrentWeek: false, hasNext: false },
};
export const OffSeason: Story = {
  args: {
    dateRange: 'Aug 10 – 16',
    seasonLabel: 'Off Season',
    isCurrentWeek: false,
  },
};
/** Season tab: title + freshness, no week pager, no Filters */
export const SeasonMode: Story = {
  args: {
    mode: 'season',
    seasonHeader: {
      title: 'Fall 2026',
      subtitle: 'Results through Sun, Sep 27',
    },
  },
};
