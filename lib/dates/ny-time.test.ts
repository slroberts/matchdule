import { describe, expect, it } from 'vitest';
import { seasonOf } from '@/lib/matches/season-stats';
import { formatNY, nyDateKey, nyDayDiff } from '@/lib/dates/ny-time';
import { et } from '@/lib/test-utils/fixtures';

/**
 * Evening kickoffs in New York are already "tomorrow" in UTC (Vercel's server TZ).
 * Anything that buckets by calendar day/month must use New York time, not the
 * machine's local time — or server and browser disagree.
 */
describe('timezone edges (run under TZ=UTC as well as America/New_York)', () => {
  it('a 9:30 PM July 31 game is still Spring', () => {
    expect(seasonOf(et('2026-07-31T21:30'))).toBe('Spring 2026');
  });
});

describe('ny-time helpers (same answer on a UTC server and a NY phone)', () => {
  const lateSat = et('2026-11-14T21:30'); // Sat 9:30 PM ET = Sun 02:30 UTC

  it('day key stays on Saturday', () => {
    expect(nyDateKey(lateSat)).toBe('2026-11-14');
  });

  it('formats the NY weekday', () => {
    expect(
      formatNY(lateSat, { weekday: 'long', month: 'short', day: 'numeric' }),
    ).toBe('Saturday, Nov 14');
  });

  it('counts calendar days, not 24h blocks', () => {
    expect(nyDayDiff(et('2026-11-15T09:00'), lateSat)).toBe(1); // "Tomorrow", 11.5h later
    expect(nyDayDiff(et('2026-11-14T08:00'), lateSat)).toBe(0); // same day
  });

  it('handles the DST change (Nov 1, 2026)', () => {
    expect(nyDayDiff(et('2026-11-02T09:00'), et('2026-10-31T21:00'))).toBe(2);
  });
});
