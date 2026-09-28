import { createClient } from '@supabase/supabase-js';
import { mapApiToMatch } from './match-mapper';
import { Match } from '@/types/match';

/**
 * Loads the schedule. NEVER throws — the page decides how to show a failure:
 *   ok: true  → matches (sorted by kickoff) + updatedAt (last scraper run, if the table records it)
 *   ok: false → a friendly error state with "Try again", instead of a crashed page or a
 *               misleading "Rest week"
 * The real error is logged server-side (Vercel logs) for debugging.
 */

export type MatchesResult =
  | { ok: true; matches: Match[]; updatedAt: number | null }
  | {
      ok: false;
      matches: Match[];
      updatedAt: null;
      reason: 'config' | 'database' | 'unexpected';
    };

/**
 * Freshness = when the SCRAPER last ran. Prefer `scraped_at` (set on every row each run);
 * `updated_at` works only if the scraper touches every row. `created_at` is deliberately
 * ignored — it's the first insert, so an old-but-correct schedule would look "out of date".
 */
type RowTimestamps = { scraped_at?: string | null; updated_at?: string | null };

const latestTimestamp = (rows: RowTimestamps[]) => {
  let latest: number | null = null;
  for (const row of rows) {
    const value = row.scraped_at ?? row.updated_at;
    const t = value ? Date.parse(value) : NaN;
    if (!Number.isNaN(t) && (latest === null || t > latest)) latest = t;
  }
  return latest;
};

export const getMatches = async (): Promise<MatchesResult> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error('[getMatches] Missing Supabase env vars');
    return { ok: false, matches: [], updatedAt: null, reason: 'config' };
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('matches').select('*');

    if (error) {
      console.error('[getMatches] Supabase error:', error.message, error.code);
      return { ok: false, matches: [], updatedAt: null, reason: 'database' };
    }

    const rows = data ?? [];
    const matches = rows
      .map(mapApiToMatch)
      .sort((a, b) => a.timestamp - b.timestamp);
    return { ok: true, matches, updatedAt: latestTimestamp(rows) };
  } catch (err) {
    // Network failures, bad JSON, mapper bugs — never take the page down
    console.error('[getMatches] Unexpected error:', err);
    return { ok: false, matches: [], updatedAt: null, reason: 'unexpected' };
  }
};
