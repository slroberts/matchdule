'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flag, FoldHorizontal } from 'lucide-react';

import {
  Header,
  EmptyState,
  LoadingList,
  PullToRefresh,
  GameCard,
} from '@/components/schedule';

import type { Filters, FilterScope } from '@/types/schedule';
import {
  useSchedule,
  useDefaultWeek,
  useWeekOptions,
  useTeamMatcher,
  useWeekGames,
  useDaysGrouping,
  useGameTiming,
} from '@/hooks';

import { cn, formatGamesRange } from '@/lib/utils';
import TimingAlert from '@/components/schedule/TimingAlert';

const TZ = 'America/New_York';

/** (keep here for now — easy to move to /hooks/useLocalStorageState.ts) */
function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function useWeekNav({
  week,
  setWeek,
  weekOptions,
  defaultWeek,
  refreshing,
}: {
  week: string | null;
  setWeek: React.Dispatch<React.SetStateAction<string | null>>;
  weekOptions: string[];
  defaultWeek: string | null;
  refreshing: boolean;
}) {
  const currentWeek = week ?? defaultWeek ?? weekOptions[0] ?? '';
  const currentIndex = weekOptions.indexOf(currentWeek);

  const canPrev = !refreshing && currentIndex > 0;
  const canNext =
    !refreshing && currentIndex >= 0 && currentIndex < weekOptions.length - 1;

  const isCurrentWeek = !!defaultWeek && currentWeek === defaultWeek;

  const onPrev = () => {
    if (!canPrev) return;
    setWeek(weekOptions[currentIndex - 1] ?? null);
  };

  const onNext = () => {
    if (!canNext) return;
    setWeek(weekOptions[currentIndex + 1] ?? null);
  };

  const onJumpToCurrent = () => {
    if (!defaultWeek || refreshing) return;
    setWeek(defaultWeek);
  };

  return {
    currentWeek,
    isCurrentWeek,
    canPrev,
    canNext,
    onPrev,
    onNext,
    onJumpToCurrent,
  };
}

export default function MatchduleWeekPage() {
  const { data, loading, error, refetch } = useSchedule();
  const getDefaultWeek = useDefaultWeek();
  const weekOptions = useWeekOptions(data);
  const { matchTeam } = useTeamMatcher();

  const [refreshing, setRefreshing] = useState(false);
  const [week, setWeek] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    homeAway: [],
    result: [],
    dayparts: [],
  });

  const [scope] = useLocalStorageState<FilterScope>('matchdule:scope', 'week');

  const defaultWeek = useMemo(() => {
    if (!data?.length) return null;
    return getDefaultWeek(data) ?? null;
  }, [data, getDefaultWeek]);

  // Auto-pick default week once data arrives
  useEffect(() => {
    if (week === null && defaultWeek) setWeek(defaultWeek);
  }, [week, defaultWeek]);

  // Close open menus when refreshing starts
  useEffect(() => {
    if (refreshing) setFiltersOpen(false);
  }, [refreshing]);

  const weekNav = useWeekNav({
    week,
    setWeek,
    weekOptions,
    defaultWeek,
    refreshing,
  });

  const weekGames = useWeekGames(
    data,
    week,
    'All Teams',
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

  const { conflicts, tightGaps, firstTightGapLabel, firstConflictLabel } =
    useGameTiming(weekGames, {
      tz: TZ,
      durationMinutes: 90,
      tightGapThresholdMin: 75,
    });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const clearFilters = useCallback(
    () => setFilters({ homeAway: [], result: [], dayparts: [] }),
    []
  );

  const isInitialWeekLoading = scope === 'week' && week === null;

  const hasConflicts = conflicts.length > 0;
  const hasTightGaps = tightGaps.length > 0;

  const content = (() => {
    if (loading || isInitialWeekLoading) {
      return (
        <div className='mx-auto max-w-2xl px-4 py-6 text-sm text-muted-foreground'>
          <LoadingList />
        </div>
      );
    }

    if (error) {
      return (
        <div className='text-sm text-red-600'>
          Error: {typeof error === 'string' ? error : 'Something went wrong'}
        </div>
      );
    }

    if (byDay.length === 0) return <EmptyState />;

    return (
      <div className='space-y-3'>
        <TimingAlert
          tone='conflict'
          show={hasConflicts}
          title='Game Conflict'
          countLabel={`${conflicts.length} Conflict${
            conflicts.length === 1 ? '' : 's'
          }`}
          firstLabel={firstConflictLabel}
          resetKey={`conflict:${weekNav.currentWeek}:${conflicts.length}:${
            firstConflictLabel ?? ''
          }`}
          icon={<Flag className='aspect-square w-5 h-5' aria-hidden />}
        />

        <TimingAlert
          tone='tightgap'
          show={hasTightGaps}
          title='Game Tight Gap'
          countLabel={`${tightGaps.length} Tight gap${
            tightGaps.length === 1 ? '' : 's'
          }`}
          firstLabel={firstTightGapLabel}
          resetKey={`tightgap:${weekNav.currentWeek}:${tightGaps.length}:${
            firstTightGapLabel ?? ''
          }`}
          icon={
            <FoldHorizontal className='aspect-square w-5 h-5' aria-hidden />
          }
        />

        {byDay.map(([label, games]) => (
          <div key={label}>
            {games.map((game) => (
              <GameCard key={game.id} game={game} label={label} />
            ))}
          </div>
        ))}
      </div>
    );
  })();

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className='max-w-screen-sm mx-auto -mt-8 px-4 py-5 md:py-6 space-y-4'>
        <Header
          rangeLabel={rangeLabel}
          currentWeek={weekNav.currentWeek}
          isCurrentWeek={weekNav.isCurrentWeek}
          onJumpToCurrent={weekNav.onJumpToCurrent}
          canPrev={weekNav.canPrev}
          canNext={weekNav.canNext}
          onPrev={weekNav.onPrev}
          onNext={weekNav.onNext}
          hasConflicts={hasConflicts}
          hasTightGaps={hasTightGaps}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          onApplyFilters={setFilters}
          onClearFilters={clearFilters}
          refreshing={refreshing}
        />

        {content}
      </div>

      {refreshing && (
        <div className='fixed inset-0 z-40 bg-transparent pointer-events-none' />
      )}
    </PullToRefresh>
  );
}
