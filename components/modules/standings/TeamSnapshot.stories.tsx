import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TeamSnapshot } from './TeamSnapshot';
import { getSeasonStats } from '@/lib/matches/season-stats';
import { final, soricha9 } from '@/lib/test-utils/fixtures';
import type { Match } from '@/types/match';

/**
 * One team's season card — every achievement-flag case side by side.
 * Built with the REAL stats function, so the cards match what the app computes.
 */
const meta: Meta<typeof TeamSnapshot> = {
  title: 'Organisms/TeamSnapshot',
  component: TeamSnapshot,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className='max-w-lg'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TeamSnapshot>;

/** results: [club, opponent] per game, oldest → newest (Oct Saturdays) */
const teamFrom = (results: [number, number][], u9 = false) => {
  const games: Match[] = results.map(([c, o], i) =>
    final(c, o, {
      at: `2026-10-${String(3 + i * 7).padStart(2, '0')}T10:00`,
      ...(u9
        ? {
            homeTeam: soricha9({
              score: c,
              result: c > o ? 'W' : c < o ? 'L' : 'D',
            }),
          }
        : {}),
    }),
  );
  return getSeasonStats(games, 'All Teams')[0].teams[0];
};

/** 🛡 Undefeated + 🔥 3-game win streak */
export const UndefeatedAndStreak: Story = {
  args: {
    team: teamFrom(
      [
        [4, 2],
        [2, 0],
        [3, 1],
      ],
      true,
    ),
  },
};
/** 🔥 streak only (an early loss) */
export const WinStreak: Story = {
  args: {
    team: teamFrom([
      [0, 2],
      [2, 1],
      [3, 0],
    ]),
  },
};
/** 🛡 Undefeated only (latest game a draw — no streak) */
export const UndefeatedWithDraw: Story = {
  args: {
    team: teamFrom([
      [2, 1],
      [1, 1],
    ]),
  },
};
/** 🏆 Biggest win — the fallback when there's no other flag */
export const BiggestWin: Story = {
  args: {
    team: teamFrom([
      [5, 1],
      [0, 1],
    ]),
  },
};
/** No flags — nothing filler */
export const NoFlags: Story = {
  args: {
    team: teamFrom([
      [1, 0],
      [0, 1],
    ]),
  },
};
/** Negative goal difference → red tile */
export const Struggling: Story = {
  args: {
    team: teamFrom([
      [0, 3],
      [1, 1],
      [0, 2],
    ]),
  },
};
