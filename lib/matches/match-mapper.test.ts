import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mapApiToMatch,
  parseCrossBrowserDate,
} from '@/lib/matches/match-mapper';
import { et } from '@/lib/test-utils/fixtures';

/** Raw scraped row with defaults — override only what a test cares about */
const raw = (over: Partial<Parameters<typeof mapApiToMatch>[0]> = {}) => ({
  team_queried: 'Soricha',
  game_id: 'g1',
  date_time: 'Nov 14, 2026 1:00 PM',
  home_team: 'Soricha Foot SFA EDP',
  score_or_status: '',
  away_team: 'Albion SC Brooklyn',
  venue: 'Crotona Park Turf Field #2',
  ...over,
});

describe('mapApiToMatch · called-off games', () => {
  it.each([
    ['Rained Out', 'Rained out'],
    ['CANCELLED', 'Cancelled'],
    ['Canceled', 'Canceled'],
    ['Postponed', 'Postponed'],
    ['Weather Delay', 'Weather delay'],
  ])('%j → canceled with note %j (never "Pending")', (scoreOrStatus, note) => {
    const m = mapApiToMatch(
      raw({ date_time: 'Sep 27, 2026 1:00PM', score_or_status: scoreOrStatus }),
    );
    expect(m.status).toBe('canceled');
    expect(m.statusNote).toBe(note);
  });

  it.each(['Rescheduled', 'Scheduled', '-', '', 'Y', 'N'])(
    '%j is not a called-off status',
    (scoreOrStatus) => {
      const m = mapApiToMatch(raw({ score_or_status: scoreOrStatus }));
      expect(m.status).not.toBe('canceled');
      expect(m.statusNote).toBeUndefined();
    },
  );

  it('a real score is never treated as called off', () => {
    const m = mapApiToMatch(raw({ score_or_status: '2 - 4' }));
    expect(m.status).toBe('final');
  });
});

describe('mapApiToMatch · dates & times (real messy source strings)', () => {
  it.each([
    ['Nov 14, 2026 1:00 PM', 'Nov 14, 2026', '1:00 PM'],
    ['Nov 14 2026 1:00 PM Scheduled', 'Nov 14, 2026', '1:00 PM'], // status word after the date
    ['Nov 14 2026 N 4:30PM', 'Nov 14, 2026', '4:30PM'], // stray token
    ['Sat Nov 14 2026 1:00 PM EST', 'Nov 14, 2026', '1:00 PM'], // weekday + timezone
    ['November 14, 2026 1:00 PM Rescheduled', 'Nov 14, 2026', '1:00 PM'], // long month
    ['NOV 14 2026 1:00 pm', 'Nov 14, 2026', '1:00 PM'], // all caps / lowercase meridiem
    ['Nov\u00A014,\u00A02026\u00A01:00\u00A0PM', 'Nov 14, 2026', '1:00 PM'], // non-breaking spaces
    ['Oct 3, 2026 TBD', 'Oct 3, 2026', 'TBD'], // no time yet
  ])('%j → date %j, time %j', (dateTime, date, time) => {
    const m = mapApiToMatch(raw({ date_time: dateTime }));
    expect(m.date).toBe(date);
    expect(m.time).toBe(time);
  });

  it('computes the kickoff instant in New York time (EST in November)', () => {
    const m = mapApiToMatch(
      raw({ date_time: 'Nov 14 2026 1:00 PM Scheduled' }),
    );
    expect(m.timestamp).toBe(Date.UTC(2026, 10, 14, 18, 0)); // 1 PM EST = 18:00Z
  });

  it('computes the kickoff instant in New York time (EDT in October)', () => {
    const m = mapApiToMatch(raw({ date_time: 'Oct 3, 2026 4:00 PM' }));
    expect(m.timestamp).toBe(Date.UTC(2026, 9, 3, 20, 0)); // 4 PM EDT = 20:00Z
  });

  it('puts TBD games at the end of their day (23:59) so they sort last', () => {
    const m = mapApiToMatch(raw({ date_time: 'Oct 3, 2026 TBD' }));
    expect(m.timestamp).toBe(et('2026-10-03T23:59'));
  });
});

describe('parseCrossBrowserDate', () => {
  it('returns null for unparseable dates instead of throwing', () => {
    expect(parseCrossBrowserDate('Scheduled', '1:00 PM')).toBeNull();
    expect(parseCrossBrowserDate('Foo 14, 2026', '1:00 PM')).toBeNull();
  });
  it('handles 12 AM / 12 PM correctly', () => {
    expect(parseCrossBrowserDate('Nov 14, 2026', '12:00 PM')?.getTime()).toBe(
      et('2026-11-14T12:00'),
    );
    expect(parseCrossBrowserDate('Nov 14, 2026', '12:30 AM')?.getTime()).toBe(
      et('2026-11-14T00:30'),
    );
  });
});

describe('mapApiToMatch · venues', () => {
  it.each([
    ["RANDALL'S ISLAND", "Randall's Island"], // all caps → title case, no capital after apostrophe
    ["Randall'S Island", "Randall's Island"], // mixed case with the 'S bug
    ['RED HOOK BALL FIELDS - FIELD 3', 'Red Hook Ball Fields'], // " - FIELD 3" suffix dropped
    ['Crotona Park Turf Field #2', 'Crotona Park Turf Field #2'], // already fine → untouched
    ['BRONX PARK EAST', 'Bronx Park East'],
    ['', 'TBD'],
    ['   ', 'TBD'],
  ])('%j → %j', (venue, expected) => {
    expect(mapApiToMatch(raw({ venue })).location).toBe(expected);
  });
});

describe('mapApiToMatch · scores, results & status', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('parses a posted score → final, with W/L from each side', () => {
    vi.setSystemTime(et('2026-11-15T09:00'));
    const m = mapApiToMatch(raw({ score_or_status: '3 - 1' }));
    expect(m.status).toBe('final');
    expect(m.homeTeam).toMatchObject({ score: 3, result: 'W' });
    expect(m.awayTeam).toMatchObject({ score: 1, result: 'L' });
  });

  it('parses a draw', () => {
    const m = mapApiToMatch(raw({ score_or_status: '2-2' }));
    expect(m.homeTeam.result).toBe('D');
    expect(m.awayTeam.result).toBe('D');
  });

  it('marks cancelled games regardless of spelling', () => {
    expect(mapApiToMatch(raw({ score_or_status: 'Cancelled' })).status).toBe(
      'canceled',
    );
    expect(mapApiToMatch(raw({ score_or_status: 'CANCELED' })).status).toBe(
      'canceled',
    );
  });

  it('is upcoming before kickoff', () => {
    vi.setSystemTime(et('2026-11-14T12:00'));
    expect(mapApiToMatch(raw()).status).toBe('upcoming');
  });

  it('is live between kickoff and kickoff + 105 min', () => {
    vi.setSystemTime(et('2026-11-14T13:30'));
    expect(mapApiToMatch(raw()).status).toBe('live');
  });

  it('REGRESSION: a past game with NO score is final (shown as "Pending"), not upcoming', () => {
    // Last spring's unscored games used to stay "upcoming" and hijack "Next up"
    vi.setSystemTime(et('2026-09-28T10:00'));
    const m = mapApiToMatch(
      raw({ date_time: 'Apr 11, 2026 1:00 PM', score_or_status: '' }),
    );
    expect(m.status).toBe('final');
    expect(m.homeTeam.score).toBeUndefined();
    expect(m.homeTeam.result).toBeNull();
  });
});

describe('mapApiToMatch · team identity', () => {
  it.each([
    ['Soricha Foot SFA EDP', 'soricha'],
    ['SORICHA FOOT SFA /18', 'soricha'],
    ['B&G Soccer Academy', 'b-and-g'],
    ['B & G 2017 Boys Elite Blue', 'b-and-g'],
    ['B-and-G Boys', 'b-and-g'],
    ['BAG FC', 'b-and-g'],
    ['Baggio United', 'away'], // REGRESSION: "bag" inside a word is NOT B&G
    ['Albion SC Brooklyn', 'away'],
  ])('%j → %j', (name, utility) => {
    expect(mapApiToMatch(raw({ home_team: name })).homeTeam.utility).toBe(
      utility,
    );
  });

  it('dedupes repeated words from the source', () => {
    expect(
      mapApiToMatch(raw({ away_team: 'Albion Albion SC - Brooklyn' })).awayTeam
        .name,
    ).toBe('Albion SC Brooklyn');
  });
});

describe('mapApiToMatch · venue FIELD suffix (regression)', () => {
  it.each([
    ['RED HOOK BALL FIELDS', 'Red Hook Ball Fields'], // REGRESSION: "FIELDS" used to become "S"
    ['CROTONA PARK FIELD 3', 'Crotona Park'],
    ['CROTONA PARK FIELD #3', 'Crotona Park'],
    ['CROTONA PARK FIELD', 'Crotona Park'],
    ['FIELDSTON LODGE', 'Fieldston Lodge'], // "FIELD" as part of a word stays
  ])('%j → %j', (venue, expected) => {
    expect(mapApiToMatch(raw({ venue })).location).toBe(expected);
  });
});

describe('mapApiToMatch · hyphenated venue names (regression)', () => {
  it.each([
    ['BEDFORD-STUYVESANT PARK', 'Bedford-Stuyvesant Park'], // a hyphen INSIDE the name stays
    ['Bedford-Stuyvesant Park - Field 3', 'Bedford-Stuyvesant Park'], // " - suffix" still dropped
    ['WARDS ISLAND - FIELD 12', 'Wards Island'],
  ])('%j → %j', (venue, expected) => {
    expect(mapApiToMatch(raw({ venue })).location).toBe(expected);
  });
});

describe('mapApiToMatch · age groups (scraper home_age / away_age)', () => {
  it('puts the age on the side it was scraped for', () => {
    const m = mapApiToMatch(raw({ home_age: 'U13', away_age: null }));
    expect(m.homeTeam.age).toBe('U13');
    expect(m.awayTeam.age).toBeUndefined();
  });

  it('works when our team is away', () => {
    const m = mapApiToMatch(
      raw({
        home_team: 'Triboro United SC Jade',
        away_team: 'Soricha Foot SFA CJSL',
        away_age: 'U9',
      }),
    );
    expect(m.homeTeam.age).toBeUndefined();
    expect(m.awayTeam.age).toBe('U9');
  });

  it('two of our teams playing each other keep both ages', () => {
    const m = mapApiToMatch(raw({ home_age: 'U13', away_age: 'U13' }));
    expect([m.homeTeam.age, m.awayTeam.age]).toEqual(['U13', 'U13']);
  });

  it.each([
    [' u9 ', 'U9'],
    ['', undefined],
    ['Under 9', undefined],
    [undefined, undefined],
  ])('%j → %j', (input, expected) => {
    expect(mapApiToMatch(raw({ home_age: input })).homeTeam.age).toBe(expected);
  });

  it('never reads the age from the team name', () => {
    const m = mapApiToMatch(raw({ home_team: 'Soricha Foot SFA EDP' }));
    expect(m.homeTeam.age).toBeUndefined();
  });
});
