import { describe, expect, it } from 'vitest';
import {
  getSeasonStats,
  nextSeasonName,
  seasonOf,
} from '@/lib/matches/season-stats';
import {
  bg,
  et,
  final,
  match,
  soricha,
  soricha9,
  team,
} from '@/lib/test-utils/fixtures';

const fall = (day: number, clubScore: number, oppScore: number, over = {}) =>
  final(clubScore, oppScore, {
    at: `2026-10-${String(day).padStart(2, '0')}T13:00`,
    ...over,
  });

describe('seasonOf / nextSeasonName', () => {
  it.each([
    ['2026-08-01T10:00', 'Fall 2026'], // Aug starts Fall
    ['2026-11-14T13:00', 'Fall 2026'],
    ['2026-12-31T13:00', 'Fall 2026'],
    ['2027-01-10T13:00', 'Spring 2027'], // winter games belong to Spring
    ['2026-07-31T13:00', 'Spring 2026'],
  ])('%j → %j', (at, season) => {
    expect(seasonOf(et(at))).toBe(season);
  });

  it('next season rolls the year only after Fall', () => {
    expect(nextSeasonName('Fall 2026')).toBe('Spring 2027');
    expect(nextSeasonName('Spring 2026')).toBe('Fall 2026');
  });
});

describe('getSeasonStats · record', () => {
  const [stats] = getSeasonStats(
    [fall(3, 3, 1), fall(10, 1, 1), fall(17, 0, 2)],
    'All Teams',
  );
  const t = stats.teams[0];

  it('counts W / D / L and points (3 / 1 / 0)', () => {
    expect(t).toMatchObject({ gp: 3, w: 1, d: 1, l: 1, pts: 4 });
  });

  it('goals and goal difference', () => {
    expect(t).toMatchObject({ gf: 4, ga: 4, gd: 0 });
  });

  it('season totals across teams', () => {
    expect(stats.totals).toEqual({ gp: 3, w: 1, d: 1, l: 1 });
  });

  it('uses the club label and age from the raw name', () => {
    expect(t).toMatchObject({
      label: 'Soricha',
      age: 'U13',
      utility: 'soricha',
    });
  });
});

describe('getSeasonStats · form', () => {
  it('is chronological (oldest → newest) even if input is shuffled', () => {
    const [s] = getSeasonStats(
      [fall(17, 0, 2), fall(3, 3, 1), fall(10, 1, 1)],
      'All Teams',
    );
    expect(s.teams[0].form).toEqual(['W', 'D', 'L']);
  });

  it('keeps only the last 5', () => {
    const games = [1, 2, 3, 4, 5, 6].map((d) => fall(d, 1, 0));
    games.push(fall(7, 0, 1));
    const [s] = getSeasonStats(games, 'All Teams');
    expect(s.teams[0].form).toEqual(['W', 'W', 'W', 'W', 'L']);
  });
});

describe('getSeasonStats · what counts', () => {
  it('REGRESSION: skips finished games still awaiting a score ("Pending")', () => {
    const [s] = getSeasonStats(
      [fall(3, 2, 1), match({ at: '2026-10-10T13:00', status: 'final' })],
      'All Teams',
    );
    expect(s.teams[0].gp).toBe(1);
  });

  it('ignores upcoming games', () => {
    const [s] = getSeasonStats(
      [fall(3, 2, 1), match({ at: '2026-10-24T13:00' })],
      'All Teams',
    );
    expect(s.teams[0].gp).toBe(1);
  });

  it('counts our team when it plays AWAY', () => {
    const away = match({
      at: '2026-10-03T13:00',
      status: 'final',
      homeTeam: team({ score: 1, result: 'L' }),
      awayTeam: soricha({ score: 4, result: 'W' }),
    });
    const [s] = getSeasonStats([away], 'All Teams');
    expect(s.teams[0]).toMatchObject({ w: 1, gf: 4, ga: 1 });
  });

  it('team tab filters to that club', () => {
    const games = [
      fall(3, 2, 1),
      final(0, 1, {
        at: '2026-10-04T13:00',
        homeTeam: bg({ score: 0, result: 'L' }),
      }),
    ];
    const [s] = getSeasonStats(games, 'B&G');
    expect(s.teams.map((t) => t.label)).toEqual(['B&G']);
  });

  it('separates teams of the same club by age (U9 vs U13)', () => {
    const u9 = final(4, 2, {
      at: '2026-10-03T10:00',
      homeTeam: soricha9({ score: 4, result: 'W' }),
    });
    const [s] = getSeasonStats([fall(3, 2, 1), u9], 'All Teams');
    expect(s.teams.map((t) => t.age).sort()).toEqual(['U13', 'U9']);
  });

  it('seasons are newest first', () => {
    const spring = final(1, 0, { at: '2026-04-11T13:00' });
    expect(
      getSeasonStats([spring, fall(3, 2, 1)], 'All Teams').map((s) => s.season),
    ).toEqual(['Fall 2026', 'Spring 2026']);
  });

  it('no results → empty list', () => {
    expect(getSeasonStats([match()], 'All Teams')).toEqual([]);
  });
});

describe('getSeasonStats · achievement flags', () => {
  const flagsOf = (games: ReturnType<typeof fall>[]) =>
    getSeasonStats(games, 'All Teams')[0].teams[0].flags.map((f) => f.label);

  it('2+ games, no losses → Undefeated (+ streak when the latest are wins)', () => {
    expect(flagsOf([fall(3, 2, 1), fall(10, 1, 0)])).toEqual([
      'Undefeated',
      '2-game win streak',
    ]);
  });

  it('draws keep Undefeated but break the streak', () => {
    expect(flagsOf([fall(3, 2, 1), fall(10, 1, 1)])).toEqual(['Undefeated']);
  });

  it('streak counts the full season, not just the 5 form dots', () => {
    const games = [1, 2, 3, 4, 5, 6, 7, 8].map((d) => fall(d, 1, 0));
    games.unshift(fall(0 + 1, 0, 3, { at: '2026-09-27T13:00' })); // an early loss
    expect(flagsOf(games)).toEqual(['8-game win streak']);
  });

  it('a single game is never "Undefeated"', () => {
    expect(flagsOf([fall(3, 2, 1)])).toEqual([]);
  });

  it('biggest win (margin ≥ 3) appears ONLY when there are no other flags', () => {
    expect(flagsOf([fall(3, 5, 1), fall(10, 0, 1)])).toEqual([
      'Biggest win 5–1',
    ]);
    expect(flagsOf([fall(3, 0, 1), fall(10, 5, 1), fall(17, 3, 0)])).toEqual([
      '2-game win streak',
    ]);
  });

  it('no filler when nothing stands out', () => {
    expect(flagsOf([fall(3, 1, 0), fall(10, 0, 1)])).toEqual([]);
  });
});
