import { Suspense } from 'react';
import { MatchList } from '@/components/MatchList';
import { MatchSkeleton } from '@/components/MatchSkeleton';
import { getMatches } from '@/lib/matches';
import { Header } from '@/components/Header';

export default async function HomePage() {
  return (
    <>
      <Header dateRange='Oct 19 -25' weekNumber={43} isCurrentWeek />
      <main className='p-6'>
        <Suspense fallback={<MatchSkeleton />}>
          <MatchFeed />
        </Suspense>
      </main>
    </>
  );
}

async function MatchFeed() {
  const matches = await getMatches();

  return <MatchList matches={matches} />;
}
