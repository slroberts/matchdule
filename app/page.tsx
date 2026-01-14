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

const TZ = 'America/New_York';

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

type TimingTone = 'conflict' | 'tightgap';

function BoldLabel({ label, tone }: { label: string; tone: TimingTone }) {
  const sep = tone === 'conflict' ? '↔' : '→';

  // pull trailing meta "(...)" if present
  const metaStart = label.lastIndexOf('(');
  const hasMeta = metaStart !== -1 && label.endsWith(')');
  const meta = hasMeta ? label.slice(metaStart).trim() : '';
  const main = hasMeta ? label.slice(0, metaStart).trim() : label.trim();

  // split around arrow
  const parts = main.split(sep).map((s) => s.trim());
  if (parts.length !== 2) return <>{label}</>;

  const parseSide = (s: string) => {
    const tokens = s.split(/\s+/).filter(Boolean);
    if (tokens.length < 2) return { team: s, time: '' };
    return { team: tokens.slice(0, -1).join(' '), time: tokens.at(-1) ?? '' };
  };

  const a = parseSide(parts[0]);
  const b = parseSide(parts[1]);

  return (
    <>
      <span className='font-bold'>{a.team}</span>{' '}
      <span className='font-bold'>{a.time}</span> {sep}{' '}
      <span className='font-bold'>{b.team}</span>{' '}
      <span className='font-bold'>{b.time}</span>{' '}
      {meta ? <span className='text-white/80'>{meta}</span> : null}
    </>
  );
}

function TimingAlert({
  show,
  title,
  tone,
  countLabel,
  firstLabel,
  icon,
}: {
  show: boolean;
  title: string;
  tone: TimingTone;
  countLabel: string;
  firstLabel: string | null;
  icon: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  // reset dismissal when the message changes (week changes, counts change, label changes, etc.)
  const resetKey = `${tone}:${countLabel}:${firstLabel ?? ''}`;

  useEffect(() => setDismissed(false), [resetKey]);

  if (!show || dismissed) return null;

  const gradient =
    tone === 'conflict'
      ? 'bg-gradient-to-b from-[#FB2C36] to-[#E7000B]'
      : 'bg-gradient-to-b from-[#FBB000] to-[#F0A30A]';

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-4 mt-6 mb-4 rounded-2xl text-white',
        gradient
      )}
      aria-live='polite'
    >
      <div className='mt-1'>{icon}</div>

      <div className='flex-1'>
        <div className='font-bold text-sm'>{title}</div>

        <div className='text-sm mt-1'>
          {countLabel}
          {firstLabel ? (
            <>
              {' — '}
              <BoldLabel label={firstLabel} tone={tone} />
            </>
          ) : null}
        </div>

        <button
          type='button'
          onClick={() => setDismissed(true)}
          className={cn(
            'mt-4 ml-auto block text-xs underline underline-offset-2',
            'opacity-90 hover:opacity-100'
          )}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
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
    if (!data?.length) return '';
    return getDefaultWeek(data) ?? '';
  }, [data, getDefaultWeek]);

  useEffect(() => {
    if (week === null && defaultWeek) setWeek(defaultWeek);
  }, [week, defaultWeek]);

  useEffect(() => {
    if (refreshing) setFiltersOpen(false);
  }, [refreshing]);

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

  const conflictsCountLabel = `Conflict${conflicts.length === 1 ? '' : 's'}`;
  const tightGapsCountLabel = `Tight gap${tightGaps.length === 1 ? '' : 's'}`;

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

        {loading || isInitialWeekLoading ? (
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
          <div className='space-y-3'>
            <TimingAlert
              tone='conflict'
              show={conflicts.length > 0}
              title='Game Conflict'
              countLabel={conflictsCountLabel}
              firstLabel={firstConflictLabel}
              icon={<Flag className='aspect-square w-5 h-5' aria-hidden />}
            />

            <TimingAlert
              tone='tightgap'
              show={tightGaps.length > 0}
              title='Game Tight Gap'
              countLabel={tightGapsCountLabel}
              firstLabel={firstTightGapLabel}
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
        )}
      </div>

      {refreshing && (
        <div className='fixed inset-0 z-40 bg-transparent pointer-events-none' />
      )}
    </PullToRefresh>
  );
}
