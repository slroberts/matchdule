import { MatchList } from '@/components/MatchList';
import { getMatches } from '@/lib/api';
import { Header } from '@/components/Header';

export default async function HomePage() {
  const matches = await getMatches();

  return (
    <div className='min-h-screen bg-surface-base'>
      <Header dateRange='Oct 19 -25' weekNumber={43} isCurrentWeek />

      {/* Main Content Area */}
      <main className='p-6'>
        <MatchList matches={matches} />
      </main>
    </div>
  );
}
