import { useMemo, useCallback } from 'react';
import type { TeamFilter } from '@/types/schedule';

type WithTeam = { team?: string | null };

// normalize for comparison (NOT fuzzy; still exact after normalization)
function normTeam(s: string) {
  return s
    .replace(/&amp;/gi, '&')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function useTeamMatcher(games?: WithTeam[]) {
  // 1) Build unique display names (keeps original casing for UI)
  const TEAM_FILTERS: TeamFilter[] = useMemo(() => {
    if (!games?.length) return ['All Teams'];

    // Map normalizedKey -> displayLabel (first seen wins)
    const map = new Map<string, string>();

    for (const g of games) {
      const raw = g?.team ?? '';
      if (!raw.trim()) continue;

      const key = normTeam(raw);
      if (!key) continue;

      if (!map.has(key)) {
        // store a cleaned display version (nice for UI)
        const display = raw
          .replace(/&amp;/gi, '&')
          .normalize('NFKC')
          .replace(/\s+/g, ' ')
          .trim();

        map.set(key, display);
      }
    }

    const options = [...map.values()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return ['All Teams', ...options];
  }, [games]);

  // 2) Cache normalized filter keys so matchTeam is fast
  const filterKeySet = useMemo(() => {
    const set = new Set<string>();
    for (const t of TEAM_FILTERS) {
      if (t !== 'All Teams') set.add(normTeam(t));
    }
    return set;
  }, [TEAM_FILTERS]);

  // 3) Case-insensitive exact match (after normalization)
  const matchTeam = useCallback(
    (filter: TeamFilter, name?: string | null) => {
      if (filter === 'All Teams') return true;

      const filterKey = normTeam(filter);

      // If someone passes a filter that isn't in TEAM_FILTERS, still behave correctly:
      // (and this guards against typos / stale localStorage filters)
      if (!filterKey) return true;
      if (filterKeySet.size && !filterKeySet.has(filterKey)) return true;

      return normTeam(name ?? '') === filterKey;
    },
    [filterKeySet]
  );

  return { TEAM_FILTERS, matchTeam };
}
