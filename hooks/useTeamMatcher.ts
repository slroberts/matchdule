// hooks/useTeamMatcher.ts
import { useMemo } from "react";
import type { TeamFilter } from "@/types/schedule";

const TEAM_FILTERS: TeamFilter[] = [
  "All Teams",
  "B&G 2017",
  "B&G 2015",
  "Soricha 2014",
];

export function useTeamMatcher() {
  return useMemo(() => {
    const rx = {
      "B&G 2017": /\bB&G\s*2017\b/i,
      "B&G 2015": /\bB&G\s*2015\b/i,
      "Soricha 2014": /\bSoricha\s*2014\b/i,
    } as const;

    const map: Record<TeamFilter, (name: string) => boolean> = {
      "All Teams": () => true,
      "B&G 2017": (s) => rx["B&G 2017"].test(s),
      "B&G 2015": (s) => rx["B&G 2015"].test(s),
      "Soricha 2014": (s) => rx["Soricha 2014"].test(s),
    };

    const matchTeam = (filter: TeamFilter, teamName: string) =>
      map[filter](teamName ?? "");

    return { map, matchTeam, TEAM_FILTERS };
  }, []);
}

export { TEAM_FILTERS };
