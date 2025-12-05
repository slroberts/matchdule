import { useMemo } from 'react';
import type { Game } from '@/types/schedule';

type GroupedDays = Array<[label: string, games: Game[]]>;

export function useDaysGrouping(
  weekGames: Game[] | null | undefined,
  tz: string,
  locale = 'en-US'
): GroupedDays {
  return useMemo(() => {
    if (!weekGames?.length) return [];

    const map: Record<string, Game[]> = {};

    for (const g of weekGames) {
      const d = new Date(g.dateISO);
      const label =
        `${d.toLocaleDateString(locale, {
          weekday: 'short',
          timeZone: tz,
        })} • ` +
        `${d.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          timeZone: tz,
        })}`;

      (map[label] ||= []).push(g);
    }

    // sort within each day by start time (fallback: team)
    for (const arr of Object.values(map)) {
      arr.sort((a, b) => {
        if (a.startISO && b.startISO)
          return a.startISO.localeCompare(b.startISO);
        if (a.startISO && !b.startISO) return -1;
        if (!a.startISO && b.startISO) return 1;
        return a.team.localeCompare(b.team);
      });
    }

    // sort day buckets chronologically
    return Object.entries(map).sort((a, b) => {
      const da = new Date(a[1][0].dateISO).getTime();
      const db = new Date(b[1][0].dateISO).getTime();
      return da - db;
    });
  }, [weekGames, tz, locale]);
}
