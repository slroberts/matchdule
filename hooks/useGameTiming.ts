import { useMemo } from 'react';
import type { Game } from '@/types/schedule';
import { parseISOZoned, fmtTime } from '@/lib/date';

type TimingOpts = {
  tz?: string;
  durationMinutes?: number; // fallback when no endISO
  tightGapThresholdMin?: number; // e.g., 75
};

export type ConflictPair = { a: Game; b: Game };
export type TightGapInfo = { a: Game; b: Game; gapMin: number; label?: string };

function toMsZoned(iso?: string, tz?: string): number | null {
  if (!iso) return null;
  const d = tz ? parseISOZoned(iso, tz) : new Date(iso);
  return d ? d.getTime() : null;
}

function normalizeInterval(
  g: Game,
  tz: string,
  durationMinutes: number
): { start: number; end: number } {
  const start = toMsZoned(g.startISO!, tz) ?? toMsZoned(g.dateISO, tz) ?? NaN;

  const end =
    toMsZoned(g.endISO!, tz) ??
    (Number.isFinite(start)
      ? (start as number) + durationMinutes * 60_000
      : NaN);

  return { start: start as number, end: end as number };
}

/**
 * Combined timing hook:
 * - conflicts: overlapping games (time intervals intersect)
 * - tightGaps: non-overlap but gap < threshold
 * - firstTightGapLabel: pretty string using fmtTime for the first tight gap
 */
export function useGameTiming(
  weekGames: Game[] | null | undefined,
  {
    tz = 'America/New_York',
    durationMinutes = 90,
    tightGapThresholdMin = 75,
  }: TimingOpts = {}
) {
  return useMemo(() => {
    if (!weekGames?.length) {
      return {
        conflicts: [] as ConflictPair[],
        tightGaps: [] as TightGapInfo[],
        firstTightGapLabel: null as string | null,
      };
    }

    // Build (start,end) in the given timezone
    const items = weekGames
      .map((g, idx) => ({
        idx,
        game: g,
        ...normalizeInterval(g, tz, durationMinutes),
      }))
      .filter((x) => Number.isFinite(x.start) && Number.isFinite(x.end))
      .sort((a, b) => a.start - b.start);

    const conflicts: ConflictPair[] = [];
    const tightGaps: TightGapInfo[] = [];

    // Sweep line:
    // - active: games whose end > current.start (i.e., still ongoing when current starts)
    // - lastFinished: the most recent game that ended before current.start
    const active: typeof items = [];
    let lastFinished: (typeof items)[number] | null = null;

    for (const curr of items) {
      // Remove ended games from active, tracking the latest finished one
      for (let i = active.length - 1; i >= 0; i--) {
        const g = active[i];
        if (g.end <= curr.start) {
          // This one has finished before current starts
          if (!lastFinished || g.end > lastFinished.end) lastFinished = g;
          active.splice(i, 1);
        }
      }

      // Whatever remains in active overlaps with curr => conflicts
      for (const prev of active) {
        conflicts.push({ a: prev.game, b: curr.game });
      }

      // Tight gap: last finished BEFORE current starts, and gap < threshold
      if (lastFinished) {
        const gapMs = curr.start - lastFinished.end;
        if (gapMs >= 0 && gapMs < tightGapThresholdMin * 60_000) {
          // Optional pretty label using fmtTime + parseISOZoned
          let label: string | undefined;
          const startA = toMsZoned(
            lastFinished.game.startISO ?? lastFinished.game.dateISO,
            tz
          );
          const startB = toMsZoned(curr.game.startISO ?? curr.game.dateISO, tz);

          if (startA != null && startB != null) {
            const t1 = fmtTime(new Date(startA), tz).replace(/\s+/g, '');
            const t2 = fmtTime(new Date(startB), tz).replace(/\s+/g, '');
            const team1 =
              lastFinished.game.team.match(/U\d+/)?.[0] ??
              lastFinished.game.team;
            const team2 = curr.game.team.match(/U\d+/)?.[0] ?? curr.game.team;
            label = `${team1} ${t1} → ${team2} ${t2} (${Math.round(
              gapMs / 60000
            )} min)`;
          }

          tightGaps.push({
            a: lastFinished.game,
            b: curr.game,
            gapMin: Math.round(gapMs / 60000),
            label,
          });
        }
      }

      // Current is now active
      active.push(curr);
    }

    // First formatted tight gap label (if any)
    const firstTightGapLabel = tightGaps.find((g) => g.label)?.label ?? null;

    return { conflicts, tightGaps, firstTightGapLabel };
  }, [weekGames, tz, durationMinutes, tightGapThresholdMin]);
}
