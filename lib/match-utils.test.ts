import { describe, it, expect } from 'vitest';
import {
  getStatusConfig,
  analyzeMatchSpacing,
  getTrackedTeam,
  getOpponentTeam,
  formatShortName,
  getPaginationBounds,
  processWeekSpacing,
} from './match-utils';
import { Radio, CheckCircle2, XCircle } from 'lucide-react';
import { Match } from '@/types/match';

// Helper to quickly generate matches for spacing tests
const createMockMatch = (date: string, time: string): Match => {
  return {
    id: Math.random().toString(),
    date,
    time,
    location: 'Test Field',
    status: 'upcoming',
    homeTeam: { name: 'Home', score: 0 },
    awayTeam: { name: 'Away', score: 0 },
  } as Match;
};

describe('Match Utilities', () => {
  describe('getStatusConfig', () => {
    it('returns the correct config for "live" status', () => {
      const config = getStatusConfig('live');
      expect(config?.label).toBe('LIVE');
      expect(config?.icon).toBe(Radio);
      expect(config?.className).toContain('animate-pulse');
    });

    it('returns the correct config for "final" status', () => {
      const config = getStatusConfig('final');
      expect(config?.label).toBe('FINAL');
      expect(config?.icon).toBe(CheckCircle2);
      expect(config?.className).toContain('text-surface-muted');
    });

    it('returns the correct config for "canceled" status', () => {
      const config = getStatusConfig('canceled');
      expect(config?.label).toBe('CANCELED');
      expect(config?.icon).toBe(XCircle);
      expect(config?.className).toContain('line-through');
    });

    it('returns null for "upcoming" or unknown statuses', () => {
      expect(getStatusConfig('upcoming')).toBeNull();
      // @ts-expect-error - testing invalid input
      expect(getStatusConfig('invalid-status')).toBeNull();
    });
  });

  describe('getTrackedTeam & getOpponentTeam', () => {
    it('extracts B&G as tracked and opponent correctly (Home)', () => {
      const match = {
        homeTeam: { name: 'B&G 2017 Boys Elite' },
        awayTeam: { name: 'Opponent FC' },
      } as Match;
      expect(getTrackedTeam(match)).toBe('B&G 2017 Boys Elite');
      expect(getOpponentTeam(match)).toBe('Opponent FC');
    });

    it('extracts B&G as tracked and opponent correctly (Away)', () => {
      const match = {
        homeTeam: { name: 'Opponent FC' },
        awayTeam: { name: 'B&G 2017 Boys Elite' },
      } as Match;
      expect(getTrackedTeam(match)).toBe('B&G 2017 Boys Elite');
      expect(getOpponentTeam(match)).toBe('Opponent FC');
    });

    it('extracts Soricha as tracked and opponent correctly (Home)', () => {
      const match = {
        homeTeam: { name: 'Soricha 2014 Girls' },
        awayTeam: { name: 'Opponent FC' },
      } as Match;
      expect(getTrackedTeam(match)).toBe('Soricha 2014 Girls');
      expect(getOpponentTeam(match)).toBe('Opponent FC');
    });

    it('falls back to the Home team if neither keyword is found', () => {
      const match = {
        homeTeam: { name: 'Random Home Team' },
        awayTeam: { name: 'Random Away Team' },
      } as Match;
      expect(getTrackedTeam(match)).toBe('Random Home Team');
      expect(getOpponentTeam(match)).toBe('Random Away Team'); // If tracked is Home, Opponent is Away
    });
  });

  describe('formatShortName', () => {
    it('defaults to returning the first two words', () => {
      expect(formatShortName('B&G 2017 Boys Elite Blue')).toBe('B&G 2017');
    });

    it('handles custom word counts', () => {
      expect(formatShortName('Soricha 2014 Girls Local', 3)).toBe(
        'Soricha 2014 Girls',
      );
    });

    it('safely handles names shorter than the requested length', () => {
      expect(formatShortName('GotSport')).toBe('GotSport');
    });
  });

  describe('analyzeMatchSpacing', () => {
    const defaultDate = 'Oct 19, 2026';

    it('returns false for everything if either match is TBD', () => {
      const matchA = createMockMatch(defaultDate, '10:00 AM');
      const matchB = createMockMatch(defaultDate, 'TBD');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(false);
      expect(result.isTightGap).toBe(false);
      expect(result.overlapMins).toBe(0);
      expect(result.gapMins).toBe(0);
    });

    it('returns false for everything if matches are on different dates', () => {
      const matchA = createMockMatch('Oct 19, 2026', '10:00 AM');
      const matchB = createMockMatch('Oct 20, 2026', '10:00 AM');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(false);
      expect(result.isTightGap).toBe(false);
    });

    it('detects a direct conflict (games at exact same time)', () => {
      const matchA = createMockMatch(defaultDate, '10:00 AM');
      const matchB = createMockMatch(defaultDate, '10:00 AM');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(true);
      expect(result.isTightGap).toBe(false);
      expect(result.overlapMins).toBe(90);
    });

    it('detects a partial conflict and calculates correct overlap minutes', () => {
      const matchA = createMockMatch(defaultDate, '10:00 AM');
      const matchB = createMockMatch(defaultDate, '11:00 AM');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(true);
      expect(result.isTightGap).toBe(false);
      expect(result.overlapMins).toBe(30);
    });

    it('detects a tight gap and calculates correct gap minutes', () => {
      const matchA = createMockMatch(defaultDate, '10:00 AM');
      const matchB = createMockMatch(defaultDate, '12:00 PM');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(false);
      expect(result.isTightGap).toBe(true);
      expect(result.gapMins).toBe(30);
    });

    it('returns clean schedule if games are far apart', () => {
      const matchA = createMockMatch(defaultDate, '10:00 AM');
      const matchB = createMockMatch(defaultDate, '2:00 PM');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(false);
      expect(result.isTightGap).toBe(false);
      expect(result.gapMins).toBe(150);
    });

    it('handles custom tight gap thresholds', () => {
      const matchA = createMockMatch(defaultDate, '10:00 AM');
      const matchB = createMockMatch(defaultDate, '1:00 PM');

      const resultDefault = analyzeMatchSpacing(matchA, matchB);
      expect(resultDefault.isTightGap).toBe(false);

      const resultCustom = analyzeMatchSpacing(matchA, matchB, 120);
      expect(resultCustom.isTightGap).toBe(true);
    });

    it('safely parses different string formats', () => {
      const matchA = createMockMatch(defaultDate, '10:30AM');
      const matchB = createMockMatch(defaultDate, '12:05 pm');

      const result = analyzeMatchSpacing(matchA, matchB);
      expect(result.isConflict).toBe(false);
      expect(result.isTightGap).toBe(true);
      expect(result.gapMins).toBe(5);
    });
  });

  describe('getPaginationBounds', () => {
    const weekStart = new Date('Oct 19, 2026 00:00:00');
    const weekEnd = new Date('Oct 25, 2026 00:00:00');

    it('returns false for both bounds if there are no matches', () => {
      const result = getPaginationBounds([], weekEnd, weekStart);
      expect(result.hasPrev).toBe(false);
      expect(result.hasNext).toBe(false);
    });

    it('returns hasPrev true if a match exists before the weekStart', () => {
      const matches = [
        createMockMatch('Oct 18, 2026', '10:00 AM'),
        createMockMatch('Oct 20, 2026', '10:00 AM'),
      ];
      const result = getPaginationBounds(matches, weekEnd, weekStart);
      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(false);
    });

    it('returns hasNext true if a match exists after the weekEnd', () => {
      const matches = [
        createMockMatch('Oct 20, 2026', '10:00 AM'),
        createMockMatch('Oct 26, 2026', '10:00 AM'),
      ];
      const result = getPaginationBounds(matches, weekEnd, weekStart);
      expect(result.hasPrev).toBe(false);
      expect(result.hasNext).toBe(true);
    });
  });

  describe('processWeekSpacing', () => {
    const defaultDate = 'Oct 19, 2026';

    it('returns clean state when there are no matches', () => {
      const result = processWeekSpacing([]);
      expect(result.hasConflict).toBe(false);
      expect(result.hasTightGap).toBe(false);
      expect(result.hasTBD).toBe(false);
      expect(result.conflictDetails).toHaveLength(0);
      expect(result.tightGapDetails).toHaveLength(0);
      expect(result.tbdDetails).toHaveLength(0);
    });

    it('detects TBD matches and formats the opponent vs string', () => {
      const m1 = {
        ...createMockMatch(defaultDate, 'TBD'),
        id: '1',
        homeTeam: { name: 'B&G 2017 Boys Elite', score: 0 },
        awayTeam: { name: 'Rivals FC Blue', score: 0 },
      } as Match;

      const result = processWeekSpacing([m1]);

      expect(result.hasTBD).toBe(true);
      expect(result.tbdDetails).toHaveLength(1);
      // Ensures the formatShortName logic correctly cut off "Boys Elite" and "Blue"
      expect(result.tbdDetails[0]).toBe('B&G 2017 vs Rivals FC');
    });

    it('detects conflicts, deduplicates pairs, and formats the detail string', () => {
      const m1 = {
        ...createMockMatch(defaultDate, '10:00 AM'),
        id: '1',
        homeTeam: { name: 'B&G 2017 Boys', score: 0 },
        awayTeam: { name: 'Opponent A', score: 0 },
      } as Match;

      const m2 = {
        ...createMockMatch(defaultDate, '10:00 AM'),
        id: '2',
        homeTeam: { name: 'Soricha 2014 Girls', score: 0 },
        awayTeam: { name: 'Opponent B', score: 0 },
      } as Match;

      const result = processWeekSpacing([m1, m2]);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictDetails).toHaveLength(1);
      expect(result.conflictDetails[0]).toBe(
        'B&G 2017 10:00 AM ↔ Soricha 2014 10:00 AM (overlap 90 min)',
      );
    });

    it('detects tight gaps, deduplicates pairs, and formats the detail string', () => {
      const m1 = {
        ...createMockMatch(defaultDate, '10:00 AM'),
        id: '1',
        homeTeam: { name: 'B&G 2017 Boys', score: 0 },
        awayTeam: { name: 'Opponent A', score: 0 },
      } as Match;

      const m2 = {
        ...createMockMatch(defaultDate, '12:00 PM'),
        id: '2',
        homeTeam: { name: 'Soricha 2014 Girls', score: 0 },
        awayTeam: { name: 'Opponent B', score: 0 },
      } as Match;

      const result = processWeekSpacing([m1, m2]);

      expect(result.hasTightGap).toBe(true);
      expect(result.tightGapDetails).toHaveLength(1);
      expect(result.tightGapDetails[0]).toBe(
        'B&G 2017 10:00 AM → Soricha 2014 12:00 PM (30 min gap)',
      );
    });
  });
});
