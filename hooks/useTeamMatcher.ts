import { useMemo, useCallback } from "react";
import type { TeamFilter } from "@/types/schedule";

type WithTeam = { team?: string | null };

export function useTeamMatcher(games?: WithTeam[]) {
  // Build options from data (optional)
  const TEAM_FILTERS: TeamFilter[] = useMemo(() => {
    if (!games) return ["All Teams"];
    const uniq = new Set<string>();
    for (const g of games) if (g?.team) uniq.add(g.team);
    return ["All Teams", ...[...uniq].sort()];
  }, [games]);

  // Case-insensitive exact match
  const matchTeam = useCallback(
    (filter: TeamFilter, name?: string | null) =>
      filter === "All Teams"
        ? true
        : (name ?? "").toLowerCase() === filter.toLowerCase(),
    [],
  );

  return { TEAM_FILTERS, matchTeam };
}
