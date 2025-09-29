'use client';

import { useEffect, useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import {
  Header,
  DaySection,
  EmptyState,
  LoadingList,
} from '@/components/schedule';
import type { Filters, TeamFilter, FilterScope } from '@/types/schedule';
import {
  useSchedule,
  useDefaultWeek,
  useWeekOptions,
  useTeamMatcher,
  useWeekGames,
  useDaysGrouping,
  useTightGap,
} from '@/hooks';

export default function MatchduleWeekPage() {
  const { data, loading, error } = useSchedule();

  const [season, setSeason] = useState('Fall 2025');
  const [week, setWeek] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('All Teams');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    homeAway: [],
    result: [],
    dayparts: [],
  });
  const [scope, setScope] = useState<FilterScope>('week');

  const pickDefaultWeek = useDefaultWeek();
  const weekOptions = useWeekOptions(data);
  const { matchTeam } = useTeamMatcher();
  const weekGames = useWeekGames(
    data,
    week,
    teamFilter,
    matchTeam,
    filters,
    'America/New_York',
    scope
  );
  const byDay = useDaysGrouping(weekGames, 'America/New_York');
  const tightGapMessage = useTightGap(weekGames, 75);

  useEffect(() => {
    if (week === null && data?.length) {
      const chosen = pickDefaultWeek(data);
      setWeek(chosen ?? weekOptions[0] ?? null);
    }
  }, [data, week, weekOptions, pickDefaultWeek]);
  useEffect(() => {
    const saved = localStorage.getItem('matchdule:scope') as FilterScope | null;
    if (saved === 'week' || saved === 'all') setScope(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('matchdule:scope', scope);
  }, [scope]);

  return (
    <div className='mx-auto max-w-xl px-4 py-5 md:py-6 space-y-4'>
      <Header
        season={season}
        setSeason={setSeason}
        week={week}
        setWeek={setWeek}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        weekOptions={weekOptions}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        onApplyFilters={(f) => setFilters(f)}
        onClearFilters={() =>
          setFilters({ homeAway: [], result: [], dayparts: [] })
        }
        scope={scope}
        setScope={setScope}
      />

      {loading || (scope === 'week' && week === null) ? (
        <div className='mx-auto max-w-2xl px-4 py-6 text-sm text-muted-foreground'>
          <LoadingList />
        </div>
      ) : error ? (
        <div className='text-sm text-red-600'>Error: {error}</div>
      ) : byDay.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {!!tightGapMessage && (
            <Alert variant='destructive' className='rounded-2xl'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Tight gap this week:{' '}
                <span className='font-medium'>{tightGapMessage}</span>
              </AlertDescription>
            </Alert>
          )}

          {byDay.map(([label, games]) => (
            <DaySection key={label} dateLabel={label} games={games} />
          ))}

          <div className='mt-4 text-xs text-muted-foreground flex items-center gap-2'>
            <Info className='h-4 w-4' /> Tap a card for details, maps, and
            sharing.
          </div>
        </div>
      )}
    </div>
  );
}
