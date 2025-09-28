import { useMemo } from "react";
import type { Game, TeamFilter } from "@/types/schedule";

export function useWeekGames(
  data: Game[] | null | undefined,
  week: string | null,
  teamFilter: TeamFilter,
  matchTeam: (filter: TeamFilter, teamName: string) => boolean,
) {
  return useMemo(() => {
    if (!data?.length) return [] as Game[];
    const inWeek = data.filter((g) => !week || g.week === week);
    return inWeek.filter((g) => matchTeam(teamFilter, g.team));
  }, [data, week, teamFilter, matchTeam]);
}
