import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * getMatches must NEVER throw: a failure becomes { ok: false } so the page shows
 * "Couldn't load the schedule · Try again" instead of crashing or faking "Rest week".
 */

const select = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({ select }) }),
}));

const row = (over: Record<string, unknown> = {}) => ({
  team_queried: 'Soricha',
  game_id: 'g1',
  date_time: 'Nov 14, 2026 1:00 PM',
  home_team: 'Soricha Foot SFA EDP',
  score_or_status: '',
  away_team: 'Albion SC Brooklyn',
  venue: 'Crotona Park',
  ...over,
});

describe('getMatches', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'pk_test');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    select.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const load = async () => (await import('@/lib/matches/matches')).getMatches();

  it('returns matches sorted by kickoff + the latest data timestamp', async () => {
    select.mockResolvedValue({
      data: [
        row({
          game_id: 'late',
          date_time: 'Nov 14, 2026 4:30 PM',
          updated_at: '2026-09-28T14:00:00Z',
        }),
        row({
          game_id: 'early',
          date_time: 'Nov 14, 2026 1:00 PM',
          updated_at: '2026-09-28T15:30:00Z',
        }),
      ],
      error: null,
    });
    const r = await load();
    expect(r.ok).toBe(true);
    expect(r.matches.map((m) => m.id)).toEqual(['early', 'late']);
    expect(r.updatedAt).toBe(Date.parse('2026-09-28T15:30:00Z'));
  });

  it('prefers scraped_at over updated_at', async () => {
    select.mockResolvedValue({
      data: [
        row({
          scraped_at: '2026-09-28T16:00:00Z',
          updated_at: '2026-09-01T00:00:00Z',
        }),
      ],
      error: null,
    });
    expect((await load()).updatedAt).toBe(Date.parse('2026-09-28T16:00:00Z'));
  });

  it('ignores created_at (first insert ≠ last scrape) → updatedAt null, the line hides', async () => {
    select.mockResolvedValue({
      data: [row({ created_at: '2026-08-01T00:00:00Z' })],
      error: null,
    });
    expect((await load()).updatedAt).toBeNull();
  });

  it('a database error → { ok: false, reason: "database" }, logged, NOT thrown', async () => {
    select.mockResolvedValue({
      data: null,
      error: { message: 'JWT expired', code: 'PGRST301' },
    });
    const r = await load();
    expect(r).toMatchObject({ ok: false, reason: 'database', matches: [] });
    expect(console.error).toHaveBeenCalled();
  });

  it('a network crash → { ok: false, reason: "unexpected" }, NOT thrown', async () => {
    select.mockRejectedValue(new Error('fetch failed'));
    expect(await load()).toMatchObject({ ok: false, reason: 'unexpected' });
  });

  it('missing env vars → { ok: false, reason: "config" }', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(await load()).toMatchObject({ ok: false, reason: 'config' });
  });

  it('an empty table is a successful, empty schedule (not an error)', async () => {
    select.mockResolvedValue({ data: [], error: null });
    expect(await load()).toMatchObject({ ok: true, matches: [] });
  });
});
