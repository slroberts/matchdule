import { Suspense } from 'react';
import { Clock, Flag, FoldHorizontal } from 'lucide-react';
import { MatchList } from '@/components/MatchList';
import { Header } from '@/components/Header';
import { MatchSkeleton } from '@/components/MatchSkeleton';
import { Alert } from '@/components/ui/Alert';
import { getMatches } from '@/lib/matches';
import { getWeekData } from '@/lib/date-utils';
import { getPaginationBounds, processWeekSpacing } from '@/lib/match-utils';

export default async function HomePage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  // Parse the URL
  const searchParams = await props.searchParams;
  const selectedDate = searchParams.date || new Date();
  const weekInfo = getWeekData(selectedDate);

  // Fetch matches (This is heavily cached, so it's nearly instant!)
  const allMatches = await getMatches();

  // Calculate "Game Week" Number dynamically based on the FIRST game in the DB
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
    <>
      <Header
        dateRange={weekInfo.dateRange}
        weekNumber={gameWeekNumber}
        isCurrentWeek={weekInfo.isCurrentWeek}
        prevWeekDate={weekInfo.prevWeekDate}
        nextWeekDate={weekInfo.nextWeekDate}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
      <main className='p-6'>
        <Suspense key={weekInfo.dateRange} fallback={<MatchSkeleton />}>
          {/* Pass the already-fetched matches down to the child */}
          <ScheduleDataViewer allMatches={allMatches} weekInfo={weekInfo} />
        </Suspense>
      </main>
    </>
  );
}

// Use this to intentionally trigger the Suspense fallback for a clean transition
async function ScheduleDataViewer({
  allMatches,
  weekInfo,
}: {
  allMatches: Awaited<ReturnType<typeof getMatches>>;
  weekInfo: ReturnType<typeof getWeekData>;
}) {
  const currentWeekMatches = allMatches.filter((match) => {
    const matchTime = new Date(match.date).getTime();
    const endOfSunday = new Date(weekInfo.weekEnd);
    endOfSunday.setHours(23, 59, 59, 999);
    return (
      matchTime >= weekInfo.weekStart.getTime() &&
      matchTime <= endOfSunday.getTime()
    );
  });

  const {
    matchesWithSpacingStatus,
    conflictDetails,
    tightGapDetails,
    tbdDetails,
    hasConflict,
    hasTightGap,
    hasTBD,
  } = processWeekSpacing(currentWeekMatches);

  return (
    <>
      {(hasConflict || hasTightGap || hasTBD) && (
        <div className='flex flex-col gap-3 w-full max-w-md mx-auto mb-6'>
          {hasConflict && (
            <Alert
              variant='destructive'
              icon={<Flag size={18} strokeWidth={2.5} />}
              title={`${conflictDetails.length} Schedule Conflict ${conflictDetails.length > 1 ? 's' : ''}`}
              description='You have overlapping matches. You cannot be in two places at once.'
              details={conflictDetails}
            />
          )}

          {hasTightGap && !hasConflict && (
            <Alert
              variant='warning'
              icon={<FoldHorizontal size={18} strokeWidth={2.5} />}
              title={`${tightGapDetails.length} Schedule Overlap ${tightGapDetails.length > 1 ? 's' : ''}`}
              description='Matches are scheduled very close together. Pack snacks and plan travel accordingly.'
              details={tightGapDetails}
            />
          )}

          {hasTBD && (
            <Alert
              variant='warning'
              icon={<Clock size={18} strokeWidth={2.5} />}
              title={`${tbdDetails.length} Schedule Note ${tbdDetails.length > 1 ? 's' : ''}`}
              description={`The exact kickoff time for ${tbdDetails.length > 1 ? 'these matches' : 'the match'} is currently TBD.`}
              details={tbdDetails}
            />
          )}
        </div>
      )}

      <MatchList matches={matchesWithSpacingStatus} />
    </>
  );
}
