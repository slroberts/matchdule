import { useMemo } from "react";
import type { Filters, FilterScope, Game, TeamFilter } from "@/types/schedule";

function getDaypart(
  startISO?: string,
  tz = "America/New_York",
): "morning" | "afternoon" | "evening" | null {
  if (!startISO) return null;
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: tz,
    }).format(new Date(startISO)),
  );
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 22) return "evening";
  return null;
}

export function useWeekGames(
  data: Game[] | null | undefined,
  week: string | null,
  teamFilter: TeamFilter,
  matchTeam: (filter: TeamFilter, name: string) => boolean,
  filters: Filters,
  tz = "America/New_York",
  scope: FilterScope = "week",
) {
  return useMemo(() => {
    if (!data) return [] as Game[];

    // scope
    const base =
      scope === "week" ? data.filter((g) => !week || g.week === week) : data;

    // sets (guard against undefined)
    const homeAwaySet = new Set(filters?.homeAway ?? []);
    const resultSet = new Set(filters?.result ?? []);
    const daypartSet = new Set(filters?.dayparts ?? []);

    // apply all filters
    return base.filter((g) => {
      if (!matchTeam(teamFilter, g.team)) return false;

      if (homeAwaySet.size && !homeAwaySet.has(g.homeAway)) return false;

      if (resultSet.size) {
        if (!g.result || !resultSet.has(g.result)) return false;
      }

      if (daypartSet.size) {
        const daypart = getDaypart(g.startISO ?? undefined, tz);
        if (!daypart || !daypartSet.has(daypart)) return false;
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
