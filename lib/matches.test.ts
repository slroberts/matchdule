/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMatches } from './matches';
import { createClient } from '@supabase/supabase-js';

// MOCK THE DEPENDENCIES
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('getMatches', () => {
  // Updated mock chain: from -> select (order is now handled in JS)
  const mockSelect = vi.fn();
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'mock-key';

    vi.mocked(createClient).mockReturnValue({
      from: mockFrom,
    } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('successfully fetches and sorts matches chronologically', async () => {
    const mockDbData = [
      {
        game_id: '1',
        date_time: 'May 30, 2026 10:00AM',
        home_team: 'Team A',
        away_team: 'Team X',
        score_or_status: '-',
        venue: 'Field 1',
      },
      {
        game_id: '2',
        date_time: 'Mar 29, 2026 10:30AM',
        home_team: 'Team B',
        away_team: 'Team Y',
        score_or_status: '-',
        venue: 'Field 2',
      },
    ];
    mockSelect.mockResolvedValueOnce({ data: mockDbData, error: null });

    // Act
    const result = await getMatches();

    // Assert: Check Supabase calls
    expect(createClient).toHaveBeenCalledWith(
      'https://mock.supabase.co',
      'mock-key',
    );
    expect(mockFrom).toHaveBeenCalledWith('matches');
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Assert: Verify Sorting Logic (March must be index 0, May index 1)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('2'); // Mar 29
    expect(result[1].id).toBe('1'); // May 30
    expect(result[0].date).toBe('Mar 29, 2026');
  });

  it('handles same-day matches by sorting by time', async () => {
    const mockDbData = [
      {
        date_time: 'Apr 11, 2026 1:00PM',
        game_id: 'A',
        home_team: 'T1',
        away_team: 'T3',
        score_or_status: '-',
        venue: 'V',
      },
      {
        date_time: 'Apr 11, 2026 9:00AM',
        game_id: 'B',
        home_team: 'T2',
        away_team: 'T4',
        score_or_status: '-',
        venue: 'V',
      },
    ];
    mockSelect.mockResolvedValueOnce({ data: mockDbData, error: null });

    const result = await getMatches();

    // Assert: 9:00AM (B) should come before 1:00PM (A)
    expect(result[0].id).toBe('B');
    expect(result[1].id).toBe('A');
  });

  it('returns an empty array gracefully if data is null', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: null });

    const result = await getMatches();

    expect(result).toEqual([]);
  });

  it('throws an error if the database connection fails', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'relation "matches" does not exist' },
    });

    await expect(getMatches()).rejects.toThrow('Database connection failed');
  });
});
