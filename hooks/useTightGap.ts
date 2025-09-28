// hooks/useTightGap.ts
import { useMemo } from "react";
import type { Game } from "@/types/schedule";

export function useTightGap(
  weekGames: Game[] | null | undefined,
  thresholdMin = 75,
): string | null {
  return useMemo(() => {
    if (!weekGames?.length) return null;

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

      const end1 = new Date(g1.endISO).getTime();
      const start2 = new Date(g2.startISO).getTime();
      const gapMin = Math.round((start2 - end1) / 60000);

      if (gapMin >= 0 && gapMin < thresholdMin) {
        const t1 =
          g1.timeText?.replace(/\s+/g, "") ||
          new Date(g1.startISO).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        const t2 =
          g2.timeText?.replace(/\s+/g, "") ||
          new Date(g2.startISO).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        const team1 = g1.team.match(/U\d+/)?.[0] ?? g1.team;
        const team2 = g2.team.match(/U\d+/)?.[0] ?? g2.team;
        return `${team1} ${t1} → ${team2} ${t2} (${gapMin} min)`;
      }
    }

    return null;
  }, [weekGames, thresholdMin]);
}
