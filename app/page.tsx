import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { MatchSkeleton } from '@/components/modules/matches/MatchSkeleton';
import { getMatches } from '@/lib/matches/matches';
import { getWeekData } from '@/lib/dates/date-utils';
import { getPaginationBounds } from '@/lib/matches/match-utils';
import { ClientView } from '@/components/layouts/ClientView';
import { FilterState, INITIAL_FILTERS, TabOption, TABS } from '@/types/match';

export default async function HomePage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  // Parse the URL
  const searchParams = await props.searchParams;
  const selectedDate = searchParams.date || new Date();
  const weekInfo = getWeekData(selectedDate);

  // Read the cookie securely on the server
  const cookieStore = await cookies();
  const savedTeamCookie = cookieStore.get('matchdule_selected_team')?.value;
  const savedFiltersCookie = cookieStore.get('matchdule_filters');

  // Validate the cookie
  const initialTeam: TabOption =
    savedTeamCookie && (TABS as readonly string[]).includes(savedTeamCookie)
      ? (savedTeamCookie as TabOption)
      : 'All Teams';

  let initialFilters: FilterState = INITIAL_FILTERS;

  if (savedFiltersCookie?.value) {
    try {
      // Decode the URL-safe string back into standard JSON, then parse it
      initialFilters = JSON.parse(decodeURIComponent(savedFiltersCookie.value));
    } catch (error) {
      console.error('Failed to parse initial filters cookie, using defaults.');
    }
  }

  // Fetch all matches (Server-side)
  const allMatches = await getMatches();

  // Calculate "Game Week" Number dynamically
  let gameWeekNumber = 1;
  if (allMatches.length > 0) {
    const firstMatchDate = new Date(allMatches[0].date);
    const firstMatchWeek = getWeekData(firstMatchDate);

    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const diffMs =
      weekInfo.weekStart.getTime() - firstMatchWeek.weekStart.getTime();

    gameWeekNumber = Math.max(1, Math.floor(diffMs / msPerWeek) + 1);
  }

  // Calculate Dynamic Pagination Bounds based on DB dates
  const { hasPrev, hasNext } = getPaginationBounds(
    allMatches,
    weekInfo.weekEnd,
    weekInfo.weekStart,
  );

  return (
    // The Suspense boundary catches the loading state while the server fetches
    <Suspense key={weekInfo.dateRange} fallback={<MatchSkeleton />}>
      <ClientView
        allMatches={allMatches}
        weekInfo={weekInfo}
        gameWeekNumber={gameWeekNumber}
        hasPrev={hasPrev}
        hasNext={hasNext}
        initialTeam={initialTeam}
        initialFilters={initialFilters}
      />
    </Suspense>
  );
}
