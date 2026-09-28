/**
 * Shared story data — built from the unit-test fixtures so stories and tests agree.
 * All times are New York wall-clock; pair with `parameters: { now: NOW.* }`.
 */
import type { Match } from '@/types/match';
import {
  bg,
  et,
  final,
  match,
  soricha,
  soricha9,
  team,
} from '@/lib/test-utils/fixtures';

/** Pinned "now" values for stories (ISO with offset = unambiguous) */
export const NOW = {
  /** Sat Nov 14, 11:00 AM — the 1:00 PM game is "Today", 2 h away */
  gameDayMorning: '2026-11-14T11:00:00-05:00',
  /** Sat Nov 14, 1:30 PM — the 1:00 PM game is LIVE */
  duringGame: '2026-11-14T13:30:00-05:00',
  /** Sat Nov 14, 3:00 PM — 1:00 PM game finished (no score yet = Pending) */
  afterFirstGame: '2026-11-14T15:00:00-05:00',
  /** Sat Nov 14, 8:00 PM — the season's last games are done */
  seasonOver: '2026-11-14T20:00:00-05:00',
  /** Mon Nov 9, 10:00 AM — the week ahead, nothing played yet */
  weekAhead: '2026-11-09T10:00:00-05:00',
} as const;

/** Week bounds for Nov 9–15, 2026 (New York) */
export const WEEK = {
  start: et('2026-11-09T00:00'),
  end: et('2026-11-15T23:59'),
};

// ── Single games ──────────────────────────────────────────────────────
export const u9Home = match({
  id: 'u9-home',
  at: '2026-11-14T13:00',
  time: '1:00 PM',
  homeTeam: soricha9(),
  awayTeam: team({ name: 'Pelham Bay Soccer Club PBSC Cedar Boys' }),
  location: 'Bronx Park East',
});

export const u13Away = match({
  id: 'u13-away',
  at: '2026-11-14T16:30',
  time: '4:30 PM',
  homeTeam: team({ name: 'DV7 NY' }),
  awayTeam: soricha({ name: 'Soricha Foot SFA EDP' }),
  location: "Randall's Island",
});

export const bgSunday = match({
  id: 'bg-sun',
  at: '2026-11-15T09:45',
  time: '9:45 AM',
  homeTeam: bg(),
  awayTeam: team({ name: 'Albion SC Brooklyn' }),
  location: 'Crotona Park Turf Field #2',
});

export const withScore = (m: Match, club: number, opp: number): Match => {
  const clubIsHome = m.homeTeam.utility !== 'away';
  const res = (a: number, b: number) =>
    (a > b ? 'W' : a < b ? 'L' : 'D') as 'W' | 'L' | 'D';
  const [h, a] = clubIsHome ? [club, opp] : [opp, club];
  return {
    ...m,
    status: 'final',
    homeTeam: { ...m.homeTeam, score: h, result: res(h, a) },
    awayTeam: { ...m.awayTeam, score: a, result: res(a, h) },
  };
};

/** In-progress score (status stays upcoming — the pinned clock makes it LIVE) */
export const withLiveScore = (m: Match, club: number, opp: number): Match => {
  const clubIsHome = m.homeTeam.utility !== 'away';
  const [h, a] = clubIsHome ? [club, opp] : [opp, club];
  return {
    ...m,
    homeTeam: { ...m.homeTeam, score: h },
    awayTeam: { ...m.awayTeam, score: a },
  };
};

// ── A season of results (for Season tab / wrap stories) ────────────────
export const fallResults: Match[] = [
  final(3, 1, { id: 'f1', at: '2026-09-20T10:00' }),
  final(1, 1, { id: 'f2', at: '2026-09-27T10:00' }),
  final(5, 1, { id: 'f3', at: '2026-10-04T10:00' }),
  final(2, 0, { id: 'f4', at: '2026-10-18T10:00' }),
  final(4, 2, {
    id: 'f5',
    at: '2026-10-03T13:00',
    homeTeam: soricha9({ score: 4, result: 'W' }),
  }),
  final(2, 0, {
    id: 'f6',
    at: '2026-10-17T13:00',
    homeTeam: soricha9({ score: 2, result: 'W' }),
  }),
];

export const springResults: Match[] = [
  final(2, 3, { id: 's1', at: '2026-04-11T10:00' }),
  final(1, 0, { id: 's2', at: '2026-04-18T10:00' }),
  final(0, 0, { id: 's3', at: '2026-05-02T10:00' }),
];
