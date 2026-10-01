import { getMatches } from '@/lib/matches/matches';
import { buildFeedIcs } from '@/lib/calendar/match-event';

/**
 * GET /api/calendar/feed/:team.ics → every game for one team as a subscribable calendar
 * Figma: CalendarMenu › Subscribe to all [team] games
 *
 * Calendar apps poll this URL (Apple via webcal://, Google via "add by URL"), so the
 * response is edge-cached for 15 min: many subscribers ≠ many Supabase queries.
 * `:team` is a feedKey ("soricha-u9", "b-and-g"); the ".ics" suffix is optional.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ team: string }> },
) {
  const key = (await params).team.replace(/\.ics$/i, '').toLowerCase();
  const result = await getMatches();

  if (!result.ok) {
    return new Response('Schedule is unavailable right now. Try again.', {
      status: 503,
      headers: { 'Retry-After': '300' },
    });
  }

  const { ics, count } = buildFeedIcs(result.matches, key);
  if (count === 0) return new Response('Team not found.', { status: 404 });

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="matchdule-${key}.ics"`,
      'Cache-Control':
        'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
