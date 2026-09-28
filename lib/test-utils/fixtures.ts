import type { Match, MatchStatus, Team } from '@/types/match';

/**
 * Test fixtures — build Match objects with sensible defaults.
 * Timestamps are real Eastern-time instants (tests run with TZ=America/New_York).
 */

let seq = 0;

/** New York wall-clock time → epoch ms (e.g. et('2026-11-14T13:00')). Handles EDT/EST. */
export const et = (local: string) => {
  const [d, t = '12:00'] = local.split('T');
  const guess = new Date(`${d}T${t}:00Z`).getTime();
  // Correct by NY's offset at that instant (4h EDT / 5h EST)
  const offsetH = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  })
    .format(new Date(guess))
    .includes('EDT')
    ? 4
    : 5;
  return guess + offsetH * 3_600_000;
};

type TeamInit = Partial<Team> & { name?: string };

export const team = (init: TeamInit = {}): Team => ({
  name: 'Opponent FC',
  utility: 'away',
  ...init,
});

export const soricha = (init: TeamInit = {}) =>
  team({ name: 'Soricha Foot SFA EDP', utility: 'soricha', ...init });
export const soricha9 = (init: TeamInit = {}) =>
  team({ name: 'Soricha Foot SFA /18', utility: 'soricha', ...init });
export const bg = (init: TeamInit = {}) =>
  team({ name: 'B&G Soccer Academy', utility: 'b-and-g', ...init });

export const match = (init: Partial<Match> & { at?: string } = {}): Match => {
  const { at = '2026-10-03T13:00', ...rest } = init;
  const timestamp = rest.timestamp ?? et(at);
  const [d] = at.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][m - 1];
  return {
    id: `m${++seq}`,
    homeTeam: soricha(),
    awayTeam: team(),
    time: '1:00 PM',
    location: 'Crotona Park Turf Field #2',
    date: `${month} ${day}, ${y}`,
    status: 'upcoming' as MatchStatus,
    timestamp,
    ...rest,
  };
};

/** A final game from the club's (home) perspective: final(3, 1) = won 3–1 */
export const final = (
  clubScore: number,
  oppScore: number,
  init: Partial<Match> & { at?: string } = {},
) =>
  match({
    status: 'final',
    homeTeam: soricha({
      score: clubScore,
      result: clubScore > oppScore ? 'W' : clubScore < oppScore ? 'L' : 'D',
    }),
    awayTeam: team({
      score: oppScore,
      result: oppScore > clubScore ? 'W' : oppScore < clubScore ? 'L' : 'D',
    }),
    ...init,
  });
