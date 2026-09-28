import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { MatchSkeleton } from '@/components/modules/matches/MatchSkeleton';
import { getMatches } from '@/lib/matches/matches';
import { getWeekData } from '@/lib/dates/date-utils';
import { getPaginationBounds } from '@/lib/matches/match-utils';
import { ClientView } from '@/components/layouts/ClientView';
import { FilterState, INITIAL_FILTERS, TabOption, TABS } from '@/types/match';

// Always read fresh data: reschedules must show up on the next visit
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type WeekInfo = ReturnType<typeof getWeekData>;

export default async function HomePage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const weekInfo = getWeekData(searchParams.date);

  const cookieStore = await cookies();
  const savedTeamCookie = cookieStore.get('matchdule_selected_team')?.value;
  const savedFiltersCookie = cookieStore.get('matchdule_filters');

  const initialTeam: TabOption =
    savedTeamCookie && (TABS as readonly string[]).includes(savedTeamCookie)
      ? (savedTeamCookie as TabOption)
      : 'All Teams';

  let initialFilters: FilterState = INITIAL_FILTERS;
  if (savedFiltersCookie?.value) {
    try {
      initialFilters = JSON.parse(decodeURIComponent(savedFiltersCookie.value));
    } catch {
      console.error('Failed to parse initial filters cookie, using defaults.');
    }
  }

  // The data fetch lives INSIDE the boundary (in <Schedule>), so the skeleton streams
  // immediately while Supabase responds. (Awaiting it up here made the fallback unreachable.)
  return (
    <Suspense key={weekInfo.dateRange} fallback={<MatchSkeleton />}>
      <Schedule
        weekInfo={weekInfo}
        initialTeam={initialTeam}
        initialFilters={initialFilters}
      />
    </Suspense>
  );
}

async function Schedule({
  weekInfo,
  initialTeam,
  initialFilters,
}: {
  weekInfo: WeekInfo;
  initialTeam: TabOption;
  initialFilters: FilterState;
}) {
  const result = await getMatches();
  const allMatches = result.matches;

  // "Game week" number from the first game's kickoff (timestamp — never the raw date text)
  let gameWeekNumber = 1;
  if (allMatches.length > 0) {
    const firstMatchWeek = getWeekData(new Date(allMatches[0].timestamp));
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diffMs =
      weekInfo.weekStart.getTime() - firstMatchWeek.weekStart.getTime();
    gameWeekNumber = Math.max(1, Math.floor(diffMs / msPerWeek) + 1);
  }

  const { hasPrev, hasNext } = getPaginationBounds(
    allMatches,
    weekInfo.weekEnd,
    weekInfo.weekStart,
  );

  return (
    <ClientView
      allMatches={allMatches}
      weekInfo={weekInfo}
      gameWeekNumber={gameWeekNumber}
      hasPrev={hasPrev}
      hasNext={hasNext}
      initialTeam={initialTeam}
      initialFilters={initialFilters}
      loadFailed={!result.ok}
      updatedAt={result.updatedAt}
    />
  );
}
