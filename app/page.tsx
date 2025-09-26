'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Info, AlertTriangle } from 'lucide-react';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { useSchedule } from '@/hooks/useSchedule';
import {
  ControlsBar,
  DaySection,
  EmptyState,
  LoadingList,
} from '@/components/schedule';
import type { Game, TeamFilter } from '@/types/schedule';

export default function MatchduleWeek() {
  const { data, loading, error } = useSchedule();

  const [season, setSeason] = useState('Fall 2025');
  const [week, setWeek] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('All Teams');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const TZ = 'America/New_York';

  // ---------- helpers for week defaulting ----------
  function atLocalMidnight(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const pickDefaultWeek = useCallback(
    (games: Game[], today = new Date()): string | null => {
      if (!games.length) return null;

      const explicit = new Map<string, { min: Date; max: Date }>();
      const inferred = new Map<string, Date>();

      for (const g of games) {
        const d = atLocalMidnight(new Date(g.dateISO));
        if (g.week) {
          const cur = explicit.get(g.week);
          if (!cur) explicit.set(g.week, { min: d, max: d });
          else {
            if (d < cur.min) cur.min = d;
            if (d > cur.max) cur.max = d;
          }
        } else {
          const key = d.toDateString();
          if (!inferred.has(key) || d < inferred.get(key)!)
            inferred.set(key, d);
        }
      }

      let ranges: Array<{ label: string; min: Date; max: Date }>;
      if (explicit.size) {
        ranges = [...explicit.entries()].map(([label, r]) => ({ label, ...r }));
      } else if (inferred.size) {
        const sorted = [...inferred.values()].sort(
          (a, b) => a.getTime() - b.getTime()
        );
        ranges = sorted.map((d, i) => ({
          label: `Week ${i + 1}`,
          min: d,
          max: d,
        }));
      } else {
        return null;
      }

      const todayMid = atLocalMidnight(today);

      const containing = ranges.find(
        (r) => todayMid >= r.min && todayMid <= r.max
      );
      if (containing) return containing.label;

      let bestFuture: { label: string; diff: number } | null = null;
      for (const r of ranges) {
        const diff = r.min.getTime() - todayMid.getTime();
        if (diff >= 0 && (!bestFuture || diff < bestFuture.diff))
          bestFuture = { label: r.label, diff };
      }
      if (bestFuture) return bestFuture.label;

      let bestPast: { label: string; diff: number } | null = null;
      for (const r of ranges) {
        const diff = todayMid.getTime() - r.max.getTime();
        if (diff >= 0 && (!bestPast || diff < bestPast.diff))
          bestPast = { label: r.label, diff };
      }
      return bestPast ? bestPast.label : null;
    },
    []
  );

  const weekOptions = useMemo(() => {
    if (!data?.length) return [] as string[];
    const labels = Array.from(
      new Set(data.map((g) => g.week || '').filter(Boolean))
    ) as string[];
    if (labels.length) return labels;
    const dates = Array.from(
      new Set(
        data.map((g) => atLocalMidnight(new Date(g.dateISO)).toDateString())
      )
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return dates.map((_, i) => `Week ${i + 1}`);
  }, [data]);

  useEffect(() => {
    if (week === null && data?.length) {
      const chosen = pickDefaultWeek(data);
      setWeek(chosen ?? weekOptions[0] ?? null);
    }
  }, [data, week, weekOptions, pickDefaultWeek]);

  const teamMatcher = useMemo(
    () =>
      ({
        'All Teams': () => true,
        'B&G 2017': (s: string) => /B&G 2017\b/.test(s),
        'B&G 2015': (s: string) => /B&G 2015\b/.test(s),
        'Soricha 2014': (s: string) => /Soricha 2014\b/.test(s),
      } as Record<TeamFilter, (s: string) => boolean>),
    []
  );

  const weekGames = useMemo(() => {
    if (!data) return [] as Game[];
    const inWeek = data.filter((g) => !week || g.week === week);
    return inWeek.filter((g) => teamMatcher[teamFilter](g.team));
  }, [data, week, teamFilter, teamMatcher]);

  const byDay = useMemo(() => {
    const m: Record<string, Game[]> = {};
    for (const g of weekGames) {
      const d = new Date(g.dateISO);
      const label = `${d.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: TZ,
      })} • ${d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: TZ,
      })}`;
      (m[label] ||= []).push(g);
    }
    Object.values(m).forEach((arr) => {
      arr.sort((a, b) => {
        if (a.startISO && b.startISO)
          return a.startISO.localeCompare(b.startISO);
        if (a.startISO && !b.startISO) return -1;
        if (!a.startISO && b.startISO) return 1;
        return a.team.localeCompare(b.team);
      });
    });
    return Object.entries(m).sort((a, b) => {
      const da = new Date(a[1][0].dateISO).getTime();
      const db = new Date(b[1][0].dateISO).getTime();
      return da - db;
    });
  }, [weekGames]);

  const tightGapMessage = useMemo(() => {
    const sorted = [...weekGames].sort((a, b) => {
      const da = a.dateISO.localeCompare(b.dateISO);
      if (da !== 0) return da;
      if (a.startISO && b.startISO) return a.startISO.localeCompare(b.startISO);
      if (a.startISO && !b.startISO) return -1;
      if (!a.startISO && b.startISO) return 1;
      return 0;
    });

    let msg: string | null = null;
    for (let i = 0; i < sorted.length - 1; i++) {
      const g1 = sorted[i],
        g2 = sorted[i + 1];
      if (!g1.startISO || !g1.endISO || !g2.startISO) continue;

      const end1 = new Date(g1.endISO).getTime();
      const start2 = new Date(g2.startISO).getTime();
      const gapMin = Math.round((start2 - end1) / 60000);

      if (gapMin >= 0 && gapMin < 75) {
        const t1 = g1.timeText.replace(/\s+/g, '');
        const t2 = g2.timeText.replace(/\s+/g, '');
        const team1 = g1.team.match(/U\d+/)?.[0] ?? g1.team;
        const team2 = g2.team.match(/U\d+/)?.[0] ?? g2.team;
        msg = `${team1} ${t1} → ${team2} ${t2} (${gapMin} min)`;
        break;
      }
    }
    return msg;
  }, [weekGames]);

  return (
    <div className='mx-auto max-w-xl px-4 py-5 md:py-6 space-y-4'>
      <header className='space-y-2.5'>
        <div className='flex items-center gap-2'>
          <CalendarDays className='h-5 w-5' />
          <h1 className='text-xl font-semibold tracking-tight'>Matchdule</h1>
          <span className='text-sm text-muted-foreground'>
            — Know who plays when—always.
          </span>
        </div>

        <ControlsBar
          season={season}
          setSeason={setSeason}
          week={week}
          setWeek={setWeek}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          weekOptions={weekOptions}
          setFiltersOpen={setFiltersOpen}
        />

        {/* Filters sheet (opened via ControlsBar button) */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side='right' className='w-[360px]'>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className='mt-4 space-y-4'>
              <Tabs defaultValue='ha'>
                <TabsList className='grid grid-cols-3'>
                  <TabsTrigger value='ha'>Home/Away</TabsTrigger>
                  <TabsTrigger value='result'>Result</TabsTrigger>
                  <TabsTrigger value='time'>Time</TabsTrigger>
                </TabsList>

                <TabsContent value='ha' className='pt-3 space-x-2'>
                  <Badge className='me-2 rounded-full' variant='secondary'>
                    Home
                  </Badge>
                  <Badge className='me-2 rounded-full' variant='secondary'>
                    Away
                  </Badge>
                  <Badge className='rounded-full' variant='secondary'>
                    TBD
                  </Badge>
                </TabsContent>

                <TabsContent value='result' className='pt-3 space-x-2'>
                  <Badge variant='secondary' className='rounded-full'>
                    W
                  </Badge>
                  <Badge variant='secondary' className='rounded-full'>
                    L
                  </Badge>
                  <Badge variant='secondary' className='rounded-full'>
                    D
                  </Badge>
                </TabsContent>

                <TabsContent
                  value='time'
                  className='pt-3 text-sm text-muted-foreground'
                >
                  Morning • Afternoon • Evening
                </TabsContent>
              </Tabs>

              <Separator />

              <div className='flex justify-end gap-2'>
                <Button variant='ghost' onClick={() => setFiltersOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Body */}
      {loading || week === null ? (
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
