import { getMatches } from '@/lib/matches/matches';
import { buildMatchIcs, icsFilename } from '@/lib/calendar/match-event';

/**
 * GET /api/calendar/:id → one game as an .ics file (Figma: CalendarMenu › Apple Calendar or Outlook)
 *
 * Served from the server, not a data:/blob: URL, because iOS only shows its native
 * "Add to Calendar" sheet for a real response with Content-Type text/calendar —
 * client-generated downloads are unreliable in Safari and home-screen (PWA) mode.
 * `inline` lets iOS/macOS open it in Calendar; desktop browsers download it either way.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await getMatches();

  if (!result.ok) {
    return new Response('Schedule is unavailable right now. Try again.', {
      status: 503,
      headers: { 'Retry-After': '30' },
    });
  }

  const match = result.matches.find((m) => m.id === id);
  if (!match || match.status === 'canceled') {
    return new Response('Game not found.', { status: 404 });
  }

  return new Response(buildMatchIcs(match), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${icsFilename(match)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
