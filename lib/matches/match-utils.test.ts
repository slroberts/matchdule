import { describe, expect, it } from 'vitest';
import {
  analyzeMatchSpacing,
  cleanTeamName,
  getPaginationBounds,
  getStatusConfig,
  hasScores,
  isAwaitingResult,
  processWeekSpacing,
} from '@/lib/matches/match-utils';
import {
  bg,
  final,
  match,
  soricha,
  soricha9,
  team,
} from '@/lib/test-utils/fixtures';

describe('cleanTeamName (display)', () => {
  it.each([
    // age brackets & divisions are cut
    ['FC Copa Academy Brooklyn B13/14 Black', 'FC Copa Academy Brooklyn'],
    ['Soricha Foot SFA EDP', 'Soricha Foot SFA'],
    ['Soricha Foot SFA /18', 'Soricha Foot SFA'],
    // shouting → title case, real acronyms kept
    ['ALBION SC Brooklyn', 'Albion SC Brooklyn'],
    [
      'GRIFFIN UNITED Soccer Club BRONX Travel',
      'Griffin United Soccer Club Bronx Travel',
    ],
    ['FC COPA Academy Brooklyn', 'FC Copa Academy Brooklyn'],
    [
      'Pelham Bay Soccer Club PBSC Cedar Boys',
      'Pelham Bay Soccer Club PBSC Cedar Boys',
    ],
    ['B&G Soccer Academy', 'B&G Soccer Academy'],
    ['DV7 NY', 'DV7 NY'],
    // REGRESSION: stray capitals inside a word
    [
      'Long Island CIty Youth Soccer Academy LIC',
      'Long Island City Youth Soccer Academy LIC',
    ],
    // names that must NOT change
    ['McDonald Park United', 'McDonald Park United'],
  ])('%j → %j', (input, expected) => {
    expect(cleanTeamName(input)).toBe(expected);
  });

  it('returns an empty string for empty input', () => {
    expect(cleanTeamName('')).toBe('');
  });
});

describe('scores & the "Pending" state', () => {
  it('hasScores needs BOTH scores', () => {
    expect(hasScores(final(2, 1))).toBe(true);
    expect(
      hasScores(match({ homeTeam: soricha({ score: 2 }), awayTeam: team() })),
    ).toBe(false);
  });

  it('isAwaitingResult: final + no score → Pending', () => {
    const unscored = match({ status: 'final' });
    expect(isAwaitingResult(unscored, 'final')).toBe(true);
    expect(isAwaitingResult(final(2, 1), 'final')).toBe(false);
    expect(isAwaitingResult(unscored, 'upcoming')).toBe(false);
  });

  it('status badges use sentence-case labels (caps come from CSS)', () => {
    expect(getStatusConfig('final')?.label).toBe('Final');
    expect(getStatusConfig('canceled')?.label).toBe('Canceled');
    expect(getStatusConfig('final', { awaitingResult: true })?.label).toBe(
      'Pending',
    );
    expect(getStatusConfig('upcoming')).toBeNull();
  });
});

describe('analyzeMatchSpacing (90 min of play)', () => {
  const at = (time: string, date = 'Oct 18, 2026') => match({ time, date });

  it('9:45 AM → 12:00 PM = 45 min gap → tight gap', () => {
    expect(analyzeMatchSpacing(at('9:45 AM'), at('12:00 PM'))).toMatchObject({
      isConflict: false,
      isTightGap: true,
      gapMins: 45,
    });
  });

  it('exactly 60 min apart is still a tight gap (≤ threshold)', () => {
    expect(analyzeMatchSpacing(at('9:00 AM'), at('11:30 AM')).isTightGap).toBe(
      true,
    );
  });

  it('61+ min apart is fine', () => {
    expect(analyzeMatchSpacing(at('9:00 AM'), at('11:31 AM')).isTightGap).toBe(
      false,
    );
  });

  it('overlapping games → conflict with overlap minutes', () => {
    expect(analyzeMatchSpacing(at('9:45 AM'), at('10:30 AM'))).toMatchObject({
      isConflict: true,
      isTightGap: false,
      overlapMins: 45,
    });
  });

  it('order of arguments does not matter', () => {
    expect(analyzeMatchSpacing(at('12:00 PM'), at('9:45 AM')).gapMins).toBe(45);
  });

  it('different days or TBD never conflict', () => {
    expect(
      analyzeMatchSpacing(at('9:45 AM'), at('10:30 AM', 'Oct 19, 2026'))
        .isConflict,
    ).toBe(false);
    expect(analyzeMatchSpacing(at('TBD'), at('10:30 AM')).isConflict).toBe(
      false,
    );
  });
});

describe('processWeekSpacing', () => {
  it('flags both games of a tight-gap pair and writes one detail line', () => {
    const a = match({
      time: '9:45 AM',
      date: 'Oct 18, 2026',
      homeTeam: soricha9(),
    });
    const b = match({
      time: '12:00 PM',
      date: 'Oct 18, 2026',
      homeTeam: soricha(),
    });
    const out = processWeekSpacing([a, b]);
    expect(out.hasTightGap).toBe(true);
    expect(out.tightGapDetails).toHaveLength(1);
    expect(out.matchesWithSpacingStatus.every((m) => m.isTightGap)).toBe(true);
  });

  it('ignores finished and canceled games', () => {
    const a = final(2, 1, { time: '9:45 AM', date: 'Oct 18, 2026' });
    const b = match({ time: '10:30 AM', date: 'Oct 18, 2026', homeTeam: bg() });
    expect(processWeekSpacing([a, b]).hasConflict).toBe(false);
  });

  it('lists TBD games', () => {
    const out = processWeekSpacing([match({ time: 'TBD' })]);
    expect(out.hasTBD).toBe(true);
    expect(out.tbdDetails[0]).toMatch(/vs/);
  });
});

describe('getPaginationBounds (timestamps, not raw date text)', () => {
  const weekStart = new Date(2026, 9, 5); // Mon Oct 5
  const weekEnd = new Date(2026, 9, 11); // Sun Oct 11

  it('allows both directions when games exist before and after', () => {
    const games = [
      match({ at: '2026-09-27T13:00' }),
      match({ at: '2026-10-10T13:00' }),
      match({ at: '2026-11-14T13:00' }),
    ];
    expect(getPaginationBounds(games, weekEnd, weekStart)).toEqual({
      hasPrev: true,
      hasNext: true,
    });
  });

  it('REGRESSION: junk date text ("Nov 14 2026 Scheduled") does not break the bounds', () => {
    const games = [
      match({ at: '2026-09-27T13:00', date: 'Sep 27 2026 Scheduled' }),
      match({ at: '2026-11-14T13:00', date: 'Nov 14 2026 N' }),
    ];
    expect(getPaginationBounds(games, weekEnd, weekStart)).toEqual({
      hasPrev: true,
      hasNext: true,
    });
  });

  it('stops at the last game (the season final week has no "next")', () => {
    const games = [
      match({ at: '2026-09-27T13:00' }),
      match({ at: '2026-10-10T16:30' }),
    ];
    expect(getPaginationBounds(games, weekEnd, weekStart).hasNext).toBe(false);
  });

  it('no games → no paging', () => {
    expect(getPaginationBounds([], weekEnd, weekStart)).toEqual({
      hasPrev: false,
      hasNext: false,
    });
  });
});
