import { useMemo } from "react";
import type { Game } from "@/types/schedule";
import { parseISOZoned, fmtTime } from "@/lib/date";

export function useTightGap(
  weekGames: Game[] | null | undefined,
  thresholdMin = 75,
): string | null {
  return useMemo(() => {
    if (!weekGames?.length) return null;

    const tz = "America/New_York";

    const sorted = [...weekGames].sort((a, b) => {
      const da = a.dateISO.localeCompare(b.dateISO);
      if (da !== 0) return da;
      if (a.startISO && b.startISO) return a.startISO.localeCompare(b.startISO);
      if (a.startISO && !b.startISO) return -1;
      if (!a.startISO && b.startISO) return 1;
      return 0;
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      const g1 = sorted[i];
      const g2 = sorted[i + 1];
      if (!g1.startISO || !g1.endISO || !g2.startISO) continue;

      const end1 = parseISOZoned(g1.endISO, tz)?.getTime();
      const start2 = parseISOZoned(g2.startISO, tz)?.getTime();
      if (end1 == null || start2 == null) continue;

      const gapMin = Math.round((start2 - end1) / 60000);
      if (gapMin >= 0 && gapMin < thresholdMin) {
        const t1 = fmtTime(parseISOZoned(g1.startISO, tz)!, tz).replace(
          /\s+/g,
          "",
        );
        const t2 = fmtTime(parseISOZoned(g2.startISO, tz)!, tz).replace(
          /\s+/g,
          "",
        );
        const team1 = g1.team.match(/U\d+/)?.[0] ?? g1.team;
        const team2 = g2.team.match(/U\d+/)?.[0] ?? g2.team;
        return `${team1} ${t1} → ${team2} ${t2} (${gapMin} min)`;
      }
    }
    return null;
  }, [weekGames, thresholdMin]);
}
