import { useMemo } from 'react';
import type { Game } from '@/types/schedule';
import { parseISOZoned, fmtTime } from '@/lib/date';

type TimingOpts = {
  tz?: string;
  durationMinutes?: number; // fallback when no endISO
  tightGapThresholdMin?: number; // e.g., 75
};

export type ConflictPair = { a: Game; b: Game };
export type ConflictInfo = {
  a: Game;
  b: Game;
  overlapMin: number;
  label?: string;
};

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

function shortTeam(team: string) {
  return team.match(/U\d+/)?.[0] ?? team;
}

function compactTime(d: Date, tz: string) {
  return fmtTime(d, tz).replace(/\s+/g, '');
}

/**
 * Combined timing hook:
 * - conflicts: overlapping games (time intervals intersect)
 * - tightGaps: non-overlap but gap < threshold
 * - firstTightGapLabel: pretty string for the first tight gap
 * - firstConflictLabel: pretty string for the first conflict
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
        conflictInfos: [] as ConflictInfo[],
        tightGaps: [] as TightGapInfo[],
        firstConflictLabel: null as string | null,
        firstTightGapLabel: null as string | null,
      };
    }

    const items = weekGames
      .map((g, idx) => ({
        idx,
        game: g,
        ...normalizeInterval(g, tz, durationMinutes),
      }))
      .filter((x) => Number.isFinite(x.start) && Number.isFinite(x.end))
      .sort((a, b) => a.start - b.start);

    const conflicts: ConflictPair[] = [];
    const conflictInfos: ConflictInfo[] = [];
    const tightGaps: TightGapInfo[] = [];

    const active: typeof items = [];
    let lastFinished: (typeof items)[number] | null = null;

    for (const curr of items) {
      // Remove ended games from active; track latest one that finished
      for (let i = active.length - 1; i >= 0; i--) {
        const g = active[i];
        if (g.end <= curr.start) {
          if (!lastFinished || g.end > lastFinished.end) lastFinished = g;
          active.splice(i, 1);
        }
      }

      // Conflicts: everything still active overlaps curr
      for (const prev of active) {
        conflicts.push({ a: prev.game, b: curr.game });

        const overlapMs =
          Math.min(prev.end, curr.end) - Math.max(prev.start, curr.start);
        const overlapMin = Math.max(0, Math.round(overlapMs / 60_000));

        let label: string | undefined;
        if (overlapMin > 0) {
          const teamA = shortTeam(prev.game.team);
          const teamB = shortTeam(curr.game.team);
          const tA = compactTime(new Date(prev.start), tz);
          const tB = compactTime(new Date(curr.start), tz);
          label = `${teamA} ${tA} ↔ ${teamB} ${tB} (overlap ${overlapMin} min)`;
        }

        conflictInfos.push({
          a: prev.game,
          b: curr.game,
          overlapMin,
          label,
        });
      }

      // Tight gaps: last finished before curr starts, and gap < threshold
      if (lastFinished) {
        const gapMs = curr.start - lastFinished.end;
        if (gapMs >= 0 && gapMs < tightGapThresholdMin * 60_000) {
          const t1 = compactTime(new Date(lastFinished.start), tz);
          const t2 = compactTime(new Date(curr.start), tz);
          const team1 = shortTeam(lastFinished.game.team);
          const team2 = shortTeam(curr.game.team);

          const label = `${team1} ${t1} → ${team2} ${t2} (${Math.round(
            gapMs / 60_000
          )} min)`;

          tightGaps.push({
            a: lastFinished.game,
            b: curr.game,
            gapMin: Math.round(gapMs / 60_000),
            label,
          });
        }
      }

      active.push(curr);
    }

    const firstTightGapLabel = tightGaps.find((g) => g.label)?.label ?? null;
    const firstConflictLabel =
      conflictInfos.find((c) => c.label)?.label ?? null;

    return {
      conflicts,
      conflictInfos,
      tightGaps,
      firstConflictLabel,
      firstTightGapLabel,
    };
  }, [weekGames, tz, durationMinutes, tightGapThresholdMin]);
}
