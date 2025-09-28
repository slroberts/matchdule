import { useCallback } from "react";
import { atLocalMidnight } from "@/lib/date";
import type { Game } from "@/types/schedule";

export function useDefaultWeek() {
  return useCallback((games: Game[], today = new Date()): string | null => {
    if (!games?.length) return null;

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
        (a, b) => a.getTime() - b.getTime(),
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
      (r) => todayMid >= r.min && todayMid <= r.max,
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
  }, []);
}
