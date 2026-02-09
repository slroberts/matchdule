import { useMemo } from 'react';
import type { Game } from '@/types/schedule';
import { parseISOZoned } from '@/lib/date';

type GroupedDays = Array<[label: string, games: Game[]]>;

export function useDaysGrouping(
  weekGames: Game[] | null | undefined,
  tz: string,
  locale = 'en-US',
): GroupedDays {
  return useMemo(() => {
    if (!weekGames?.length) return [];

    // Cache formatters (big win vs calling toLocaleDateString repeatedly)
    const weekdayFmt = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      timeZone: tz,
    });

    const monthDayFmt = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      timeZone: tz,
    });

    // Group by dateISO (avoid JS Date("YYYY-MM-DD") UTC pitfall)
    const map = new Map<string, Game[]>();

    for (const g of weekGames) {
      const key = g.dateISO; // expected YYYY-MM-DD
      const bucket = map.get(key);
      if (bucket) bucket.push(g);
      else map.set(key, [g]);
    }

    // Sort games within each day
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        if (a.startISO && b.startISO)
          return a.startISO.localeCompare(b.startISO);
        if (a.startISO && !b.startISO) return -1;
        if (!a.startISO && b.startISO) return 1;
        return a.team.localeCompare(b.team);
      });
    }

    // Sort day buckets by dateISO (lexicographic works for YYYY-MM-DD)
    const sortedKeys = Array.from(map.keys()).sort((a, b) =>
      a.localeCompare(b),
    );

    return sortedKeys.map((dateISO) => {
      const d = parseISOZoned(`${dateISO}T00:00:00`, tz)!;
      const label = `${weekdayFmt.format(d)}, ${monthDayFmt.format(d)}`;
      return [label, map.get(dateISO)!] as const;
    });
  }, [weekGames, tz, locale]);
}
