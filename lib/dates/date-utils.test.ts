import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Moon, Sun, Sunset, Clock } from 'lucide-react';
import {
  getSeason,
  getTimeOfDayAssets,
  getTimePeriod,
  getWeekData,
} from '@/lib/dates/date-utils';
import { et } from '@/lib/test-utils/fixtures';

describe('getTimePeriod — ONE definition for filter chips, card icons and filtering', () => {
  it.each([
    ['9:45 AM', 'morning'],
    ['11:59 AM', 'morning'],
    ['12:00 PM', 'afternoon'], // noon is afternoon
    ['1:00 PM', 'afternoon'], // REGRESSION: used to show a sun but filter as afternoon
    ['4:59 PM', 'afternoon'],
    ['5:00 PM', 'evening'],
    ['12:30 AM', 'morning'], // 00:30
    ['1:00PM', 'afternoon'], // no space (source format)
    ['1 pm', 'afternoon'],
    ['4:30 p.m.', 'afternoon'],
    ['TBD', 'unknown'],
    ['', 'unknown'],
    ['13:00 PM', 'unknown'], // invalid hour
  ])('%j → %s', (time, period) => {
    expect(getTimePeriod(time)).toBe(period);
  });

  it('maps periods to the same icons as the filter chips', () => {
    expect(getTimeOfDayAssets('9:00 AM').TimeIcon).toBe(Sun);
    expect(getTimeOfDayAssets('1:00 PM').TimeIcon).toBe(Sunset);
    expect(getTimeOfDayAssets('6:00 PM').TimeIcon).toBe(Moon);
    expect(getTimeOfDayAssets('TBD').TimeIcon).toBe(Clock);
  });
});

describe('getSeason (header label)', () => {
  it.each([
    [new Date(2026, 2, 15), 'Spring 2026'],
    [new Date(2026, 4, 31), 'Spring 2026'],
    [new Date(2026, 5, 1), 'Off Season'], // REGRESSION: June used to count as Spring
    [new Date(2026, 7, 10), 'Off Season'],
    [new Date(2026, 8, 13), 'Fall 2026'],
    [new Date(2026, 10, 30), 'Fall 2026'],
    [new Date(2026, 11, 20), 'Off Season'],
  ])('%s → %j', (date, label) => {
    expect(getSeason(date)).toBe(label);
  });
});

describe('getWeekData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(et('2026-09-23T10:00')); // Wed Sep 23
  });
  afterEach(() => vi.useRealTimers());

  it('builds a Monday–Sunday range with an en dash', () => {
    expect(getWeekData('2026-09-23').dateRange).toBe('Sep 21 – 27');
  });

  it('spans months', () => {
    expect(getWeekData('2026-09-30').dateRange).toBe('Sep 28 – Oct 4');
  });

  it('a Sunday belongs to the week that started the Monday before', () => {
    expect(getWeekData('2026-09-27').dateRange).toBe('Sep 21 – 27');
  });

  it('knows the current week', () => {
    expect(getWeekData('2026-09-25').isCurrentWeek).toBe(true);
    expect(getWeekData('2026-09-30').isCurrentWeek).toBe(false);
    expect(getWeekData().isCurrentWeek).toBe(true); // no date = today
  });

  it('prev / next links point at Mondays, as YYYY-MM-DD', () => {
    const w = getWeekData('2026-09-23');
    expect(w.prevWeekDate).toBe('2026-09-14');
    expect(w.nextWeekDate).toBe('2026-09-28');
  });

  it('falls back to this week for garbage input', () => {
    expect(getWeekData('not-a-date').dateRange).toBe('Sep 21 – 27');
  });
});
