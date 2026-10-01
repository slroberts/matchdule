import { describe, expect, it } from 'vitest';
import { bg, match, soricha, soricha9, team } from '@/lib/test-utils/fixtures';
import {
  buildFeedIcs,
  buildMatchIcs,
  feedKey,
  feedLabel,
  getMatchEvent,
  googleCalendarUrl,
  icsFilename,
} from './match-event';

const NOW = Date.UTC(2026, 9, 1, 12, 0, 0); // fixed DTSTAMP

describe('getMatchEvent', () => {
  it('titles the event from the club side, with age group and a clean opponent name', () => {
    const m = match({
      homeTeam: soricha(),
      awayTeam: team({ name: 'ALBION SC Brooklyn B13' }),
    });
    expect(getMatchEvent(m).title).toBe('Soricha U13 vs Albion SC Brooklyn');
  });

  it('uses the away club when the tracked team plays away', () => {
    const m = match({
      homeTeam: team({ name: 'Metro Stars' }),
      awayTeam: soricha9(),
    });
    const e = getMatchEvent(m);
    expect(e.title).toBe('Soricha U9 vs Metro Stars');
    expect(e.description).toContain('Away game');
  });

  it('makes a TBD kickoff an all-day event on the New York date', () => {
    const m = match({ at: '2026-10-03T23:59', time: 'TBD' });
    const e = getMatchEvent(m);
    expect(e.allDay).toBe(true);
    expect(e.startDate).toBe('20261003');
    expect(e.endDate).toBe('20261004'); // exclusive end
    expect(e.description).toContain('Kickoff time TBD');
  });

  it('drops a TBD field from LOCATION and says so in the notes', () => {
    const e = getMatchEvent(match({ location: 'TBD' }));
    expect(e.location).toBe('');
    expect(e.description).toContain('Field TBD.');
  });
});

describe('buildMatchIcs', () => {
  it('writes UTC start/end — 1:00 PM EDT is 17:00Z, 105 minutes long', () => {
    const ics = buildMatchIcs(match({ id: 'g1', at: '2026-10-03T13:00' }), NOW);
    expect(ics).toContain('DTSTART:20261003T170000Z');
    expect(ics).toContain('DTEND:20261003T184500Z');
    expect(ics).toContain('UID:g1@matchdule');
    expect(ics).toContain('DTSTAMP:20261001T120000Z');
  });

  it('handles standard time — 1:00 PM EST in November is 18:00Z', () => {
    expect(buildMatchIcs(match({ at: '2026-11-14T13:00' }), NOW)).toContain(
      'DTSTART:20261114T180000Z',
    );
  });

  it('uses DATE values for all-day events', () => {
    const ics = buildMatchIcs(
      match({ at: '2026-10-03T23:59', time: 'TBD' }),
      NOW,
    );
    expect(ics).toContain('DTSTART;VALUE=DATE:20261003');
    expect(ics).toContain('DTEND;VALUE=DATE:20261004');
    expect(ics).not.toMatch(/DTSTART:\d/);
  });

  it('escapes commas and semicolons and uses CRLF line endings', () => {
    const ics = buildMatchIcs(
      match({ location: 'Field 3, Gate B; North' }),
      NOW,
    );
    expect(ics).toContain('LOCATION:Field 3\\, Gate B\\; North');
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
    expect(ics.endsWith('\r\n')).toBe(true);
  });

  it('folds lines longer than 75 octets', () => {
    const ics = buildMatchIcs(match({ location: 'A'.repeat(200) }), NOW);
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(ics).toContain('\r\n A'); // continuation line
  });
});

describe('icsFilename', () => {
  it('slugs the title', () => {
    const m = match({
      homeTeam: soricha(),
      awayTeam: team({ name: 'B&G Soccer Academy' }),
    });
    expect(icsFilename(m)).toBe('soricha-u13-vs-b-and-g-soccer-academy.ics');
  });
});

describe('googleCalendarUrl', () => {
  it('prefills title, UTC dates, location and New York time zone', () => {
    const url = new URL(googleCalendarUrl(match({ at: '2026-10-03T13:00' })));
    expect(url.origin + url.pathname).toBe(
      'https://calendar.google.com/calendar/render',
    );
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe(
      '20261003T170000Z/20261003T184500Z',
    );
    expect(url.searchParams.get('location')).toBe('Crotona Park Turf Field #2');
    expect(url.searchParams.get('ctz')).toBe('America/New_York');
  });

  it('uses date-only range for TBD kickoffs', () => {
    const url = new URL(
      googleCalendarUrl(match({ at: '2026-10-03T23:59', time: 'TBD' })),
    );
    expect(url.searchParams.get('dates')).toBe('20261003/20261004');
  });
});

describe('team feed', () => {
  const u13 = match({ id: 'a', homeTeam: soricha() });
  const u9 = match({
    id: 'b',
    homeTeam: team({ name: 'Metro' }),
    awayTeam: soricha9(),
  });
  const bgGame = match({ id: 'c', homeTeam: bg() });
  const canceled = match({ id: 'd', homeTeam: soricha(), status: 'canceled' });
  const all = [u13, u9, bgGame, canceled];

  it('keys each tracked team, home or away', () => {
    expect(feedKey(u13)).toBe('soricha-u13');
    expect(feedKey(u9)).toBe('soricha-u9');
    expect(feedKey(bgGame)).toBe('b-and-g');
    expect(feedLabel(u9)).toBe('Soricha U9');
  });

  it("includes only that team's games, named for the team", () => {
    const { ics, count } = buildFeedIcs(all, 'soricha-u13', NOW);
    expect(count).toBe(2);
    expect(ics).toContain('UID:a@matchdule');
    expect(ics).not.toContain('UID:b@matchdule');
    expect(ics).toContain('X-WR-CALNAME:Matchdule · Soricha U13');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  });

  it('marks canceled games so calendars cross them out', () => {
    const { ics } = buildFeedIcs(all, 'soricha-u13', NOW);
    const canceledEvent = ics.slice(ics.indexOf('UID:d@matchdule'));
    expect(
      canceledEvent.slice(0, canceledEvent.indexOf('END:VEVENT')),
    ).toContain('STATUS:CANCELLED');
  });

  it('asks calendar apps to refresh every 6 hours', () => {
    const { ics } = buildFeedIcs(all, 'b-and-g', NOW);
    expect(ics).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT6H');
  });

  it('returns zero games for an unknown team', () => {
    expect(buildFeedIcs(all, 'nope', NOW).count).toBe(0);
  });
});
