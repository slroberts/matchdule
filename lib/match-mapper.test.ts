import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mapApiToMatch } from './match-mapper';

// Helper to quickly generate raw match data for testing
const createMockRawMatch = (
  overrides: Partial<Parameters<typeof mapApiToMatch>[0]> = {},
) => ({
  team_queried: '3802474',
  game_id: '123',
  date_time: 'May 10, 2026 10:30AM',
  home_team: 'Soricha Foot SFA',
  score_or_status: '-',
  away_team: 'FC United BX',
  venue: 'Crotona Park',
  ...overrides,
});

describe('mapApiToMatch', () => {
  // Lock the system time so our "past vs future" tests never randomly break in CI/CD
  beforeAll(() => {
    vi.useFakeTimers();
    // We are freezing time to: May 3, 2026 at 12:00 PM (Noon)
    vi.setSystemTime(new Date('May 3, 2026 12:00:00'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('Team Names & Utility Classification', () => {
    it('deduplicates redundant club and team names', () => {
      const raw = createMockRawMatch({ home_team: 'FC United BX FC United' });
      const result = mapApiToMatch(raw);
      expect(result.homeTeam.name).toBe('FC United BX');
    });

    it('removes trailing single-letter team identifiers (like "B")', () => {
      const raw = createMockRawMatch({
        home_team: 'B&G Soccer Academy B&G SOCCER B',
      });
      const result = mapApiToMatch(raw);
      expect(result.homeTeam.name).toBe('B&G Soccer Academy');
    });

    it('gracefully handles missing team names', () => {
      const raw = createMockRawMatch({ away_team: '' });
      const result = mapApiToMatch(raw);
      expect(result.awayTeam.name).toBe('Unknown Team');
    });

    it('correctly assigns branding utility based on keywords', () => {
      const raw = createMockRawMatch({
        home_team: 'B&G Soccer Academy',
        away_team: 'Soricha Foot',
      });
      const result = mapApiToMatch(raw);
      expect(result.homeTeam.utility).toBe('b-and-g');
      expect(result.awayTeam.utility).toBe('soricha');
    });
  });

  describe('Date & Time Parsing (Regex)', () => {
    it('handles double spaces between year and time', () => {
      const raw = createMockRawMatch({ date_time: 'Apr 11, 2026  1:00PM' });
      const result = mapApiToMatch(raw);
      expect(result.date).toBe('Apr 11, 2026');
      expect(result.time).toBe('1:00PM');
    });

    it('strips timezone and "Rescheduled" noise', () => {
      const raw = createMockRawMatch({
        date_time: 'Apr 11, 2026 7:00AM CDT CDT Rescheduled',
      });
      const result = mapApiToMatch(raw);
      expect(result.date).toBe('Apr 11, 2026');
      expect(result.time).toBe('7:00AM');
    });

    it('gracefully handles missing time, defaulting to TBD', () => {
      const raw = createMockRawMatch({ date_time: 'May 30, 2026' });
      const result = mapApiToMatch(raw);
      expect(result.date).toBe('May 30, 2026');
      expect(result.time).toBe('TBD');
    });
  });

  describe('Venue Sanitization', () => {
    it('returns TBD for empty or null venue strings', () => {
      const raw = createMockRawMatch({ venue: '   ' });
      const result = mapApiToMatch(raw);
      expect(result.location).toBe('TBD');
    });

    it('cleans up whitespace and removes extra "FIELD" text', () => {
      const raw = createMockRawMatch({ venue: 'Van Cortlandt Park - FIELD 1' });
      const result = mapApiToMatch(raw);
      expect(result.location).toBe('Van Cortlandt Park');
    });
  });

  describe('Explicit Scores and Status', () => {
    it('parses valid scores and determines W/L/D results', () => {
      const raw = createMockRawMatch({ score_or_status: '3 - 1' });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('final');
      expect(result.homeTeam.score).toBe(3);
      expect(result.awayTeam.score).toBe(1);
      expect(result.homeTeam.result).toBe('W');
      expect(result.awayTeam.result).toBe('L');
    });

    it('identifies canceled matches and ignores scores', () => {
      const raw = createMockRawMatch({ score_or_status: 'Canceled - Weather' });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('canceled');
      expect(result.homeTeam.score).toBeUndefined();
    });
  });

  describe('Time-Based Fallback for Hidden Scores', () => {
    // Remember: We froze time to May 3, 2026 12:00 PM

    it('marks past games with hidden scores as final', () => {
      const raw = createMockRawMatch({
        date_time: 'May 02, 2026 1:00PM', // Yesterday
        score_or_status: 'Hidden',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('final');
      expect(result.homeTeam.score).toBeUndefined(); // Score remains undefined for UI to show a dash
    });

    it('leaves future games with hidden scores as upcoming', () => {
      const raw = createMockRawMatch({
        date_time: 'May 04, 2026 1:00PM', // Tomorrow
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('upcoming');
    });

    it('handles past games that had no time specified (TBD fallback)', () => {
      const raw = createMockRawMatch({
        date_time: 'May 01, 2026', // A few days ago, no time
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('final');
    });

    it('leaves today’s games as upcoming if the time has not passed', () => {
      const raw = createMockRawMatch({
        date_time: 'May 03, 2026 5:00PM', // Later today (Current mocked time is 12:00 PM)
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('upcoming');
    });
  });
});
