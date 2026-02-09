import { useMemo } from 'react';
import type { Filters, FilterScope, Game, TeamFilter } from '@/types/schedule';

type Daypart = 'morning' | 'afternoon' | 'evening';

export function useWeekGames(
  data: Game[] | null | undefined,
  week: string | null,
  teamFilter: TeamFilter,
  matchTeam: (filter: TeamFilter, name: string) => boolean,
  filters: Filters,
  tz = 'America/New_York',
  scope: FilterScope = 'week',
) {
  return useMemo(() => {
    if (!data) return [] as Game[];

    const base =
      scope === 'week'
        ? data.filter((g) => g.week && g.week.trim() === week)
        : data;

    const homeAwaySet = new Set(filters?.homeAway ?? []);
    const resultSet = new Set(filters?.result ?? []);
    const daypartSet = new Set(filters?.dayparts ?? []);

    // Cache formatter once per memo run
    const hourFmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: tz,
    });

    const getDaypart = (startISO?: string | null): Daypart | null => {
      if (!startISO) return null;
      const hour = Number(hourFmt.format(new Date(startISO)));
      if (hour >= 5 && hour <= 11) return 'morning';
      if (hour >= 12 && hour <= 16) return 'afternoon';
      if (hour >= 17 && hour <= 22) return 'evening';
      return null;
    };

    return base.filter((g) => {
      if (!matchTeam(teamFilter, g.team)) return false;
      if (homeAwaySet.size && !homeAwaySet.has(g.homeAway)) return false;

      if (resultSet.size) {
        // supports filters containing null too
        if (!resultSet.has(g.result)) return false;
      }

      if (daypartSet.size) {
        const dp = getDaypart(g.startISO);
        if (!dp || !daypartSet.has(dp)) return false;
      }

      return true;
    });
  }, [
    data,
    week,
    teamFilter,
    matchTeam,
    filters?.homeAway,
    filters?.result,
    filters?.dayparts,
    tz,
    scope,
  ]);
}
