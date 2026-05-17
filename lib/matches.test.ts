/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMatches } from './matches';
import { createClient } from '@supabase/supabase-js';

// MOCK THE DEPENDENCIES
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js unstable_cache completely so it simply runs our function directly during tests
vi.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}));

describe('getMatches', () => {
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

  it('successfully fetches and sorts matches chronologically via calculated primitive timestamps', async () => {
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

    // Assert: Check Supabase client initialization constraints
    expect(createClient).toHaveBeenCalledWith(
      'https://mock.supabase.co',
      'mock-key',
    );
    expect(mockFrom).toHaveBeenCalledWith('matches');
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Assert: Verify primitive timestamp numerical sorting (March must precede May)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('2'); // Mar 29
    expect(result[1].id).toBe('1'); // May 30
    expect(result[0].date).toBe('Mar 29, 2026');
    expect(result[0].timestamp).toBeGreaterThan(0);
  });

  it('handles same-day matches by correctly evaluating chronological time offsets', async () => {
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

    // Assert: 9:00AM (B) must sort natively before 1:00PM (A) based on timestamp integer checks
    expect(result[0].id).toBe('B');
    expect(result[1].id).toBe('A');
    expect(result[1].timestamp).toBeGreaterThan(result[0].timestamp);
  });

  it('returns an empty array gracefully if data payload returns null', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: null });

    const result = await getMatches();

    expect(result).toEqual([]);
  });

  it('throws an unhandled error instance if the database connection fails', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'relation "matches" does not exist' },
    });

    await expect(getMatches()).rejects.toThrow('Database connection failed');
  });
});
