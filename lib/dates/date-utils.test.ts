import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { getTimeOfDayAssets, getWeekData } from './date-utils';
import { Sun, Sunset } from 'lucide-react';

describe('Date Utilities', () => {
  describe('getTimeOfDayAssets', () => {
    it('returns Sun and false for empty or missing times', () => {
      const result = getTimeOfDayAssets('');
      expect(result.isLateAfternoon).toBe(false);
      expect(result.TimeIcon).toBe(Sun);
    });

    it('returns Sun and false for morning times', () => {
      const result = getTimeOfDayAssets('9:30 AM');
      expect(result.isLateAfternoon).toBe(false);
      expect(result.TimeIcon).toBe(Sun);
    });

    it('returns Sun and false for early afternoon times (before 3 PM)', () => {
      const result = getTimeOfDayAssets('1:15 PM');
      expect(result.isLateAfternoon).toBe(false);
      expect(result.TimeIcon).toBe(Sun);
    });

    it('returns Sun and false for exactly 12:00 PM (noon)', () => {
      const result = getTimeOfDayAssets('12:00 PM');
      expect(result.isLateAfternoon).toBe(false);
      expect(result.TimeIcon).toBe(Sun);
    });

    it('returns Sunset and true for exactly 3:00 PM', () => {
      const result = getTimeOfDayAssets('3:00 PM');
      expect(result.isLateAfternoon).toBe(true);
      expect(result.TimeIcon).toBe(Sunset);
    });

    it('returns Sunset and true for evening times', () => {
      const result = getTimeOfDayAssets('7:45 PM');
      expect(result.isLateAfternoon).toBe(true);
      expect(result.TimeIcon).toBe(Sunset);
    });
  });

  describe('getWeekData', () => {
    beforeAll(() => {
      vi.useFakeTimers();
      // Freeze time to a strict UTC string representing May 6, 2026 at 12:00 PM EDT in New York.
      // This ensures the America/New_York timezone offset logic is heavily tested.
      vi.setSystemTime(new Date('2026-05-06T16:00:00Z'));
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('defaults to the current New York week when no argument is passed', () => {
      // Target: May 6, 2026. Monday is May 4, Sunday is May 10.
      const result = getWeekData();
      expect(result.dateRange).toBe('May 4 - 10');
      expect(result.isCurrentWeek).toBe(true);
    });

    it('calculates the correct date range for a future week', () => {
      // Target: May 16, 2026 (Saturday). Monday is May 11, Sunday is May 17.
      const result = getWeekData('2026-05-16');
      expect(result.dateRange).toBe('May 11 - 17');
      expect(result.isCurrentWeek).toBe(false);
    });

    it('calculates the correct date range for a week spanning two months', () => {
      // Target: April 30, 2026 (Thursday). Monday is Apr 27, Sunday is May 3.
      const result = getWeekData('2026-04-30');
      expect(result.dateRange).toBe('Apr 27 - May 3');
      expect(result.isCurrentWeek).toBe(false);
    });

    it('inverts the T12:00:00 hack correctly to prevent UTC midnight shifts', () => {
      // If pass "2026-05-04" without a time, native Date parsing in UTC environments
      // often shifts it backwards to May 3rd at 8:00 PM EST.
      // Function injects T12:00:00, forcing it to parse safely as May 4th.
      const result = getWeekData('2026-05-04');
      expect(result.weekStart.getDate()).toBe(4);
      expect(result.weekStart.getMonth()).toBe(4); // 0-indexed, 4 is May
    });

    it('safely formats prevWeekDate and nextWeekDate to YYYY-MM-DD without UTC shifts', () => {
      const result = getWeekData('2026-05-06');
      // Previous Monday should be April 27
      expect(result.prevWeekDate).toBe('2026-04-27');
      // Next Monday should be May 11
      expect(result.nextWeekDate).toBe('2026-05-11');
    });

    it('calculates the ISO week number correctly', () => {
      // May 6, 2026 falls in the 19th week of the year
      const result = getWeekData('2026-05-06');
      expect(result.weekNumber).toBe(19);
    });

    it('defensively falls back to the current NY date if given garbage strings', () => {
      const result = getWeekData('invalid-garbage-date');
      // Should fall back to the mocked May 6, 2026 week
      expect(result.dateRange).toBe('May 4 - 10');
      expect(result.isCurrentWeek).toBe(true);
    });
  });
});
