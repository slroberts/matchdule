import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Game, HomeAway, Result } from '@/types/schedule';
import { dateKeyInTZ } from '@/lib/date';

const TZ = 'America/New_York';

function normalizeHA(v?: string | null): HomeAway {
  const s = (v || '').trim().toUpperCase();
  if (s === 'HOME' || s === 'H') return 'HOME';
  if (s === 'AWAY' || s === 'A') return 'AWAY';
  return 'TBD';
}

function normalizeResult(v?: string | null): Result {
  const s = (v || '').trim().toUpperCase();
  return s === 'W' || s === 'L' || s === 'D' ? (s as Result) : null;
}

type Rel = { name: string };

type DbEvent = {
  id: string;
  week: string | null;
  day: string | null;
  time_text: string | null;
  start_at: string | null;
  end_at: string | null;
  opponent: string | null;
  home_away: string | null;
  result: string | null;
  score_for: number | null;
  score_against: number | null;
  teams: Rel | Rel[] | null;
  locations: Rel | Rel[] | null;
};

function pickName(rel: Rel | Rel[] | null | undefined) {
  if (!rel) return '';
  return Array.isArray(rel) ? rel[0]?.name ?? '' : rel.name ?? '';
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY! ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      id,
      week,
      day,
      time_text,
      start_at,
      end_at,
      opponent,
      home_away,
      result,
      score_for,
      score_against,
      teams ( name ),
      locations ( name )
    `,
    )
    .order('start_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as DbEvent[];

  const games: Game[] = rows.map((e) => {
    const startISO = e.start_at ? new Date(e.start_at).toISOString() : null;
    const endISO = e.end_at ? new Date(e.end_at).toISOString() : null;

    const dateISO = startISO
      ? dateKeyInTZ(startISO, TZ)
      : endISO
      ? dateKeyInTZ(endISO, TZ)
      : '1970-01-01';

    return {
      id: e.id,
      week: e.week,
      dateISO,
      startISO,
      endISO,
      timeText: e.time_text ?? 'TBD',
      day: (e.day ?? '').trim(),
      team: pickName(e.teams),
      location: pickName(e.locations),
      opponent: e.opponent ?? '',
      homeAway: normalizeHA(e.home_away),
      result: normalizeResult(e.result),
      scoreFor: e.score_for ?? null,
      scoreAgainst: e.score_against ?? null,
    };
  });

  // Optional: keep stable sort in case null times exist
  games.sort((a, b) => {
    const da = a.dateISO.localeCompare(b.dateISO);
    if (da !== 0) return da;
    if (a.startISO && b.startISO) return a.startISO.localeCompare(b.startISO);
    if (a.startISO && !b.startISO) return -1;
    if (!a.startISO && b.startISO) return 1;
    return 0;
  });

  return NextResponse.json(games, {
    headers: {
      // start conservative; we can tune later
      'Cache-Control': 'no-store',
    },
  });
}
