'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Filter,
  MapPin,
  Share2,
  Info,
  AlertTriangle,
  Clock,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import type { Game } from '@/lib/schedule';
import { useSchedule } from '@/hooks/useSchedule';

type TeamFilter = 'All Teams' | 'B&G 2017' | 'B&G 2015' | 'Soricha 2014';

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

  function pickDefaultWeek(games: Game[], today = new Date()): string | null {
    if (!games.length) return null;

    // Build explicit week ranges; if none exist, we’ll infer single-day “weeks”
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
        if (!inferred.has(key) || d < inferred.get(key)!) inferred.set(key, d);
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

    // 1) Week containing today
    const containing = ranges.find(
      (r) => todayMid >= r.min && todayMid <= r.max
    );
    if (containing) return containing.label;

    // 2) Nearest future
    let bestFuture: { label: string; diff: number } | null = null;
    for (const r of ranges) {
      const diff = r.min.getTime() - todayMid.getTime();
      if (diff >= 0 && (!bestFuture || diff < bestFuture.diff))
        bestFuture = { label: r.label, diff };
    }
    if (bestFuture) return bestFuture.label;

    // 3) Most recent past
    let bestPast: { label: string; diff: number } | null = null;
    for (const r of ranges) {
      const diff = todayMid.getTime() - r.max.getTime();
      if (diff >= 0 && (!bestPast || diff < bestPast.diff))
        bestPast = { label: r.label, diff };
    }
    return bestPast ? bestPast.label : null;
  }

  // Build Week options from data (prefer explicit week labels)
  const weekOptions = useMemo(() => {
    if (!data?.length) return [] as string[];
    const labels = Array.from(
      new Set(data.map((g) => g.week || '').filter(Boolean))
    ) as string[];
    if (labels.length) return labels;
    // Fallback: infer sequential weeks by unique date buckets
    const dates = Array.from(
      new Set(
        data.map((g) => atLocalMidnight(new Date(g.dateISO)).toDateString())
      )
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return dates.map((_, i) => `Week ${i + 1}`);
  }, [data]);

  // Choose default week once data arrives
  useEffect(() => {
    if (week === null && data?.length) {
      const chosen = pickDefaultWeek(data);
      setWeek(chosen ?? weekOptions[0] ?? null);
    }
  }, [data, week, weekOptions]);

  /** Filter to the selected week + team */
  const weekGames = useMemo(() => {
    if (!data) return [] as Game[];
    const inWeek = data.filter((g) => !week || g.week === week);

    const teamSet: Record<TeamFilter, (s: string) => boolean> = {
      'All Teams': () => true,
      'B&G 2017': (s) => /U9\b/.test(s),
      'B&G 2015': (s) => /U11\b/.test(s),
      'Soricha 2014': (s) => /U12\b/.test(s),
    };

    return inWeek.filter((g) => teamSet[teamFilter](g.team));
  }, [data, week, teamFilter]);

  /** Group by local day label, e.g., "Sat • Oct 18" */
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

  /** Tight-gap detection (< 75 min) */
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

  // ----- UI helpers -----
  function HAChip({ value }: { value: Game['homeAway'] }) {
    const map: Record<Game['homeAway'], { label: string; className: string }> =
      {
        HOME: {
          label: 'HOME',
          className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        },
        AWAY: {
          label: 'AWAY',
          className:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        },
        TBD: {
          label: 'TBD',
          className:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        },
      };
    return (
      <Badge className={`rounded-full px-2.5 ${map[value].className}`}>
        {map[value].label}
      </Badge>
    );
  }

  function GameCard({ game }: { game: Game }) {
    return (
      <Card className='rounded-2xl shadow-sm border-muted/40'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <span className='font-semibold'>{game.team}</span>
            <span className='text-muted-foreground'>vs</span>
            <span className='font-medium'>{game.opponent}</span>
            <span className='mx-1'>•</span>
            <HAChip value={game.homeAway} />
            <span className='ms-auto inline-flex items-center gap-1 text-sm text-muted-foreground'>
              <Clock className='h-4 w-4' /> {game.timeText || 'TBD'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0 text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <MapPin className='h-4 w-4' />
            <span className='truncate'>{game.location || 'TBD'}</span>
          </div>
          <div className='mt-3 flex items-center gap-2'>
            <Button variant='secondary' size='sm' className='rounded-full'>
              <MapPin className='h-4 w-4 me-1' /> Map
            </Button>
            <Button variant='secondary' size='sm' className='rounded-full'>
              <Share2 className='h-4 w-4 me-1' /> Share
            </Button>
            <Button
              variant='default'
              size='sm'
              className='rounded-full ms-auto'
            >
              Details
            </Button>
          </div>
          {game.result && (
            <div className='mt-3'>
              <Badge variant='outline' className='rounded-full'>
                {game.result} {game.scoreFor ?? '—'}–{game.scoreAgainst ?? '—'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function DaySection({
    dateLabel,
    games,
  }: {
    dateLabel: string;
    games: Game[];
  }) {
    if (!games.length) return null;
    return (
      <section className='space-y-3'>
        <div className='text-xs uppercase tracking-wide text-muted-foreground'>
          {dateLabel}
        </div>
        <div className='space-y-3'>
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className='mx-auto max-w-2xl px-4 py-6 space-y-4'>
      {/* Header */}
      <header className='space-y-3'>
        <div className='flex items-center gap-2'>
          <CalendarDays className='h-5 w-5' />
          <h1 className='text-xl font-semibold'>Matchdule</h1>
          <span className='text-sm text-muted-foreground'>
            — Know who plays when—always.
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Season */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='rounded-full'>
                {season} <ChevronDown className='ms-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuLabel>Season</DropdownMenuLabel>
              {['Fall 2025'].map((s) => (
                <DropdownMenuItem key={s} onClick={() => setSeason(s)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Week (dynamic) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='rounded-full'>
                {week ?? 'Week'} <ChevronDown className='ms-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuLabel>Week</DropdownMenuLabel>
              {weekOptions.map((w) => (
                <DropdownMenuItem key={w} onClick={() => setWeek(w)}>
                  {w}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Team Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='rounded-full'>
                {teamFilter} <ChevronDown className='ms-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuLabel>Teams</DropdownMenuLabel>
              {(
                ['All Teams', 'B&G 2017', 'B&G 2015', 'Soricha 2014'] as const
              ).map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTeamFilter(t)}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filters (placeholder) */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' className='rounded-full'>
                <Filter className='h-4 w-4 me-2' /> Filters
              </Button>
            </SheetTrigger>
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
        </div>
      </header>

      {/* Conflict Banner (tight gap) */}
      {loading || week === null ? (
        <div className='mx-auto max-w-2xl px-4 py-6 text-sm text-muted-foreground'>
          Loading schedule…
        </div>
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

          {/* Error */}
          {error && <div className='text-sm text-red-600'>Error: {error}</div>}

          {/* Days (from data) */}
          {!error &&
            byDay.map(([label, games]) => (
              <DaySection key={label} dateLabel={label} games={games} />
            ))}

          {/* Footer help */}
          <div className='mt-4 text-xs text-muted-foreground flex items-center gap-2'>
            <Info className='h-4 w-4' /> Tap a card for details, maps, and
            sharing.
          </div>
        </div>
      )}
    </div>
  );
}
