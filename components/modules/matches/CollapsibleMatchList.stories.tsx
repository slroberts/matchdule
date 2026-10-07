import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { CollapsibleMatchList } from './CollapsibleMatchList';
import {
  NOW,
  WEEK,
  u9Home,
  u13Away,
  bgSunday,
  withScore,
  fallResults,
  springResults,
} from '@/lib/test-utils/story-data';
import { match, soricha } from '@/lib/test-utils/fixtures';

/**
 * The focus stack. Clock pinned per story so the highlight, final-week marker and
 * season wrap are deterministic. Figma: Screens › 01 · Schedule.
 */
const meta: Meta<typeof CollapsibleMatchList> = {
  title: 'Organisms/CollapsibleMatchList',
  component: CollapsibleMatchList,
  parameters: { layout: 'fullscreen', now: NOW.gameDayMorning },
  args: {
    isCurrentWeek: true,
    weekStart: WEEK.start,
    weekEnd: WEEK.end,
    seasonHrefFor: (s: string) =>
      `/?view=season&season=${s.toLowerCase().replace(' ', '-')}`,
    onViewSeason: fn(),
    onClearFilters: fn(),
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
type Story = StoryObj<typeof CollapsibleMatchList>;

const nextSeasonGame = match({
  id: 'spring-1',
  at: '2027-04-10T10:00',
  homeTeam: soricha(),
});
const week = [u9Home, u13Away, bgSunday];

/** Game day: the 1:00 PM game is the dark highlight, others compact */
export const GameDay: Story = {
  args: { matches: week, focusPool: [...fallResults, ...week, nextSeasonGame] },
};

/** 1:30 PM: the 1:00 PM game is LIVE (highlight shows the score + pulse) */
export const LiveGame: Story = {
  args: { matches: week, focusPool: [...fallResults, ...week, nextSeasonGame] },
  parameters: { now: NOW.duringGame },
};

/** Season's final week, before the games: "Final week of Fall 2026" marker */
export const FinalWeek: Story = {
  args: {
    matches: [u9Home, u13Away],
    focusPool: [...fallResults, u9Home, u13Away, nextSeasonGame],
  },
  parameters: { now: NOW.weekAhead },
};

/** After the last game: results + "That's a wrap" (next season scheduled) */
export const SeasonComplete: Story = {
  args: {
    matches: [withScore(u9Home, 3, 1), withScore(u13Away, 1, 2)],
    focusPool: [
      ...fallResults,
      withScore(u9Home, 3, 1),
      withScore(u13Away, 1, 2),
      nextSeasonGame,
    ],
  },
  parameters: { now: NOW.seasonOver },
};

/** Empty week between seasons → Spring wrap instead of "Rest week" */
export const BetweenSeasons: Story = {
  args: {
    matches: [],
    isCurrentWeek: false,
    weekStart: new Date('2026-08-10T00:00:00-04:00').getTime(),
    weekEnd: new Date('2026-08-16T23:59:00-04:00').getTime(),
    focusPool: [...springResults, ...fallResults],
  },
  parameters: { now: NOW.weekAhead },
};

/** Empty MID-season week (Oct 5–11: games before and after, same season) → "Rest week" */
export const RestWeek: Story = {
  args: {
    matches: [],
    isCurrentWeek: false,
    weekStart: new Date('2026-10-05T00:00:00-04:00').getTime(),
    weekEnd: new Date('2026-10-11T23:59:00-04:00').getTime(),
    focusPool: [...fallResults, ...week],
    nextMatch: week[0],
  },
};
