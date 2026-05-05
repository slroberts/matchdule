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
  // Fetch & Parse Data
  const searchParams = await props.searchParams;
  const selectedDate = searchParams.date || new Date();
  const weekInfo = getWeekData(selectedDate);
  const allMatches = await getMatches();

  // Calculate "Game Week" Number
  let gameWeekNumber = 1;
  if (allMatches.length > 0) {
    const firstMatchDate = new Date(allMatches[0].date);
    const firstMatchWeek = getWeekData(firstMatchDate);

    // Find the difference in milliseconds between the current week start and season week start
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const diffMs =
      weekInfo.weekStart.getTime() - firstMatchWeek.weekStart.getTime();

    // Divide by msPerWeek, round down, and add 1 (so the first week is Week 1)
    // Math.max guarantees we never show a negative week or Week 0 if they scroll back before the season starts
    gameWeekNumber = Math.max(1, Math.floor(diffMs / msPerWeek) + 1);
  }

  // Calculate State (Delegated to helpers)
  const { hasPrev, hasNext } = getPaginationBounds(
    allMatches,
    weekInfo.weekEnd,
    weekInfo.weekStart,
  );

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
        </Suspense>
      </main>
    </>
  );
}
