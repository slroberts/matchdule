import { useMemo } from "react";
import { atLocalMidnight } from "@/lib/date";
import type { Game } from "@/types/schedule";

export function useWeekOptions(data: Game[] | null | undefined): string[] {
  return useMemo(() => {
    if (!data?.length) return [];

    // Prefer explicit week labels
    const explicit = Array.from(
      new Set(
        data.map((g) => g.week?.trim()).filter((v): v is string => Boolean(v)),
      ),
    );
    if (explicit.length) return explicit;

    // Fallback: infer sequential weeks by unique dates
    const uniqueDayStamps = new Set<number>();
    for (const g of data) {
      const d = atLocalMidnight(new Date(g.dateISO));
      uniqueDayStamps.add(d.getTime());
    }

    const sorted = Array.from(uniqueDayStamps).sort((a, b) => a - b);
    return sorted.map((_, i) => `Week ${i + 1}`);
  }, [data]);
}
