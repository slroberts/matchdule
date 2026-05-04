import { MatchList } from '@/components/MatchList';
import { getMatches } from '@/lib/matches';
import { Header } from '@/components/Header';
import { getWeekData } from '@/lib/date-utils';
import { Suspense } from 'react';
import { MatchSkeleton } from '@/components/MatchSkeleton';

export default async function HomePage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedDate = searchParams.date || new Date();
  const weekInfo = getWeekData(selectedDate);
  const allMatches = await getMatches();

  let hasPrev = false;
  let hasNext = false;

  if (allMatches.length > 0) {
    // Because getMatches already sorts chronologically, [0] is earliest and [length-1] is latest
    const firstMatchDate = new Date(allMatches[0].date).getTime();
    const lastMatchDate = new Date(
      allMatches[allMatches.length - 1].date,
    ).getTime();

    // Set end of Sunday to 11:59 PM to catch late games
    const endOfSunday = new Date(weekInfo.weekEnd);
    endOfSunday.setHours(23, 59, 59, 999);

    // Can we go back? Only if Monday of the CURRENT week is after the FIRST match
    hasPrev = weekInfo.weekStart.getTime() > firstMatchDate;

    // Can we go forward? Only if Sunday of the CURRENT week is before the LAST match
    hasNext = endOfSunday.getTime() < lastMatchDate;
  }

  // Filter matches to ONLY show games happening in this specific week
  const currentWeekMatches = allMatches.filter((match) => {
    const matchTime = new Date(match.date).getTime();
    const endOfSunday = new Date(weekInfo.weekEnd);
    endOfSunday.setHours(23, 59, 59, 999);

    return (
      matchTime >= weekInfo.weekStart.getTime() &&
      matchTime <= endOfSunday.getTime()
    );
  });

  return (
    <>
      <Header
        dateRange={weekInfo.dateRange}
        weekNumber={weekInfo.weekNumber}
        isCurrentWeek={weekInfo.isCurrentWeek}
        prevWeekDate={weekInfo.prevWeekDate}
        nextWeekDate={weekInfo.nextWeekDate}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
      <main className='p-6'>
        <Suspense key={weekInfo.dateRange} fallback={<MatchSkeleton />}>
          <MatchList matches={currentWeekMatches} />
        </Suspense>
      </main>
    </>
  );
}
