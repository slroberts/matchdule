'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import {
  Header,
  DaySection,
  EmptyState,
  LoadingList,
  PullToRefresh,
} from '@/components/schedule';
import type { Filters, TeamFilter, FilterScope } from '@/types/schedule';
import {
  useSchedule,
  useDefaultWeek,
  useWeekOptions,
  useTeamMatcher,
  useWeekGames,
  useDaysGrouping,
  useGameTiming,
} from '@/hooks';
import { formatGamesRange } from '@/lib/utils';

const TZ = 'America/New_York';

export default function MatchduleWeekPage() {
  const { data, loading, error, refetch } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);

  const [week, setWeek] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('All Teams');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    homeAway: [],
    result: [],
    dayparts: [],
  });

  // scope from localStorage (lazy init) + single writer effect
  const [scope, setScope] = useState<FilterScope>(() => {
    if (typeof window === 'undefined') return 'week';
    const stored = localStorage.getItem('matchdule:scope');
    return stored === 'week' || stored === 'all' ? stored : 'week';
  });

  useEffect(() => {
    localStorage.setItem('matchdule:scope', scope);
  }, [scope]);

  const getDefaultWeek = useDefaultWeek();
  const weekOptions = useWeekOptions(data);
  const { matchTeam } = useTeamMatcher();

  const weekGames = useWeekGames(
    data,
    week,
    teamFilter,
    matchTeam,
    filters,
    TZ,
    scope
  );
  const byDay = useDaysGrouping(weekGames, TZ);
  const rangeLabel = useMemo(
    () => formatGamesRange(weekGames, TZ, 'en-US'),
    [weekGames]
  );
  const { conflicts, tightGaps, firstTightGapLabel } = useGameTiming(
    weekGames,
    {
      tz: TZ,
      durationMinutes: 90,
      tightGapThresholdMin: 75,
    }
  );

  const defaultWeek = useMemo(() => {
    if (!data?.length) return '';
    return getDefaultWeek(data) ?? '';
  }, [data, getDefaultWeek]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Auto-pick first/Default week once data arrives
  useEffect(() => {
    if (week === null && defaultWeek) {
      setWeek(defaultWeek);
    }
  }, [week, defaultWeek]);

  // Close open menus when refreshing starts
  useEffect(() => {
    if (refreshing) setFiltersOpen(false);
  }, [refreshing]);

  const clearFilters = useCallback(
    () => setFilters({ homeAway: [], result: [], dayparts: [] }),
    []
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className='max-w-screen-sm mx-auto -mt-8 px-4 py-5 md:py-6 space-y-4'>
        <Header
          conflicts={conflicts}
          tightGaps={tightGaps}
          rangeLabel={rangeLabel}
          defaultWeek={defaultWeek}
          week={week}
          setWeek={setWeek}
          weekOptions={weekOptions}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          onApplyFilters={setFilters}
          onClearFilters={clearFilters}
          refreshing={refreshing}
        />

        {loading || (scope === 'week' && week === null) ? (
          <div className='mx-auto max-w-2xl px-4 py-6 text-sm text-muted-foreground'>
            <LoadingList />
          </div>
        ) : error ? (
          <div className='text-sm text-red-600'>
            Error: {typeof error === 'string' ? error : 'Something went wrong'}
          </div>
        ) : byDay.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {(conflicts.length > 0 || tightGaps.length > 0) && (
              <Alert
                variant='destructive'
                className='rounded-2xl'
                aria-live='polite'
              >
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription className='space-y-1'>
                  {conflicts.length > 0 && (
                    <div>
                      <span className='font-medium'>{conflicts.length}</span>{' '}
                      conflict{conflicts.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {tightGaps.length > 0 && (
                    <div>
                      <span className='font-medium'>{tightGaps.length}</span>{' '}
                      tight gap{tightGaps.length > 1 ? 's' : ''}
                      {firstTightGapLabel ? ` — ${firstTightGapLabel}` : null}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {byDay.map(([label, games]) => (
              <DaySection key={label} dateLabel={label} games={games} />
            ))}
          </div>
        )}
      </div>

      {refreshing && (
        <div className='fixed inset-0 z-40 bg-transparent pointer-events-none' />
      )}
    </PullToRefresh>
  );
}
