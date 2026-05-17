import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mapApiToMatch, parseCrossBrowserDate } from './match-mapper';

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
    // We are freezing system time to: Sunday, May 3, 2026 at 12:00 PM (Noon)
    vi.setSystemTime(new Date(2026, 4, 3, 12, 0, 0));
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

  describe('Time-Based Live, Upcoming, and Final Status Windows', () => {
    // Remember: System time is frozen to May 3, 2026 12:00 PM (Noon)

    it('calculates a valid numerical timestamp metric on returned matches', () => {
      const raw = createMockRawMatch({ date_time: 'May 03, 2026 12:00PM' });
      const result = mapApiToMatch(raw);
      const expectedTimestamp = new Date(2026, 4, 3, 12, 0, 0).getTime();
      expect(result.timestamp).toBe(expectedTimestamp);
    });

    it('marks active matches inside the 105-minute window as live', () => {
      const raw = createMockRawMatch({
        date_time: 'May 03, 2026 11:30AM', // Kickoff was 30 mins ago, match is actively playing
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('live');
    });

    it('marks running games exactly at kickoff boundary as live', () => {
      const raw = createMockRawMatch({
        date_time: 'May 03, 2026 12:00PM', // Kickoff is exactly right now
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('live');
    });

    it('marks games that completed their 105-minute loop as final', () => {
      const raw = createMockRawMatch({
        date_time: 'May 03, 2026 10:00AM', // Game started 2 hours ago (120 mins). It is over.
        score_or_status: 'Hidden',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('final');
    });

    it('marks old historical games with hidden scores as final', () => {
      const raw = createMockRawMatch({
        date_time: 'May 02, 2026 1:00PM', // Yesterday
        score_or_status: 'Hidden',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('final');
      expect(result.homeTeam.score).toBeUndefined();
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
        date_time: 'May 01, 2026', // A few days ago, no time string parsed
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('final');
    });

    it('leaves today’s games as upcoming if the time has not passed', () => {
      const raw = createMockRawMatch({
        date_time: 'May 03, 2026 5:00PM', // Later today at 5:00 PM
        score_or_status: '-',
      });
      const result = mapApiToMatch(raw);
      expect(result.status).toBe('upcoming');
    });
  });

  describe('Cross-Browser Date Engine Verification', () => {
    it('successfully instantiates dates without parsing string engine dependencies', () => {
      const dateInstance = parseCrossBrowserDate('May 3, 2026', '10:15 AM');
      expect(dateInstance).not.toBeNull();
      expect(dateInstance!.getFullYear()).toBe(2026);
      expect(dateInstance!.getMonth()).toBe(4); // May is index 4
      expect(dateInstance!.getDate()).toBe(3);
      expect(dateInstance!.getHours()).toBe(10);
      expect(dateInstance!.getMinutes()).toBe(15);
    });

    it('handles PM hour conversions securely', () => {
      const dateInstance = parseCrossBrowserDate('May 3, 2026', '3:45 PM');
      expect(dateInstance!.getHours()).toBe(15); // 24-hour time conversion
    });

    it('returns null gracefully for structural compilation errors', () => {
      const invalidInstance = parseCrossBrowserDate('NotADate 99', 'TBD');
      expect(invalidInstance).toBeNull();
    });
  });
});
