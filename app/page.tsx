"use client";

import { useEffect, useState, useCallback } from "react";
import { Info, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import {
  Header,
  DaySection,
  EmptyState,
  LoadingList,
  PullToRefresh,
} from "@/components/schedule";
import type { Filters, TeamFilter, FilterScope } from "@/types/schedule";
import {
  useSchedule,
  useDefaultWeek,
  useWeekOptions,
  useTeamMatcher,
  useWeekGames,
  useDaysGrouping,
  useTightGap,
} from "@/hooks";

const TZ = "America/New_York";

export default function MatchduleWeekPage() {
  const { data, loading, error, refetch } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);
  const teams = data && [...new Set(data.map((g) => g.team).sort())];
  const [season, setSeason] = useState("Fall 2025");
  const [week, setWeek] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("All Teams");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    homeAway: [],
    result: [],
    dayparts: [],
  });

  // scope from localStorage (lazy init) + single writer effect
  const [scope, setScope] = useState<FilterScope>(() => {
    if (typeof window === "undefined") return "week";
    const saved = localStorage.getItem("matchdule:scope") as FilterScope | null;
    return saved === "week" || saved === "all" ? saved : "week";
  });
  useEffect(() => {
    localStorage.setItem("matchdule:scope", scope);
  }, [scope]);

  const pickDefaultWeek = useDefaultWeek();
  const weekOptions = useWeekOptions(data);
  const { matchTeam } = useTeamMatcher();

  const weekGames = useWeekGames(
    data,
    week,
    teamFilter,
    matchTeam,
    filters,
    TZ,
    scope,
  );
  const byDay = useDaysGrouping(weekGames, TZ);
  const tightGapMessage = useTightGap(weekGames, 75);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Auto-pick first/Default week once data arrives
  useEffect(() => {
    if (week === null && data?.length) {
      const chosen = pickDefaultWeek(data);
      setWeek(chosen ?? weekOptions[0] ?? null);
    }
  }, [data, week, weekOptions, pickDefaultWeek]);

  // Close open menus when refreshing starts
  useEffect(() => {
    if (refreshing) setFiltersOpen(false);
  }, [refreshing]);

  const clearFilters = useCallback(
    () => setFilters({ homeAway: [], result: [], dayparts: [] }),
    [],
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="mx-auto max-w-xl -mt-8 px-4 py-5 md:py-6 space-y-4">
        <Header
          teams={teams || []}
          season={season}
          setSeason={setSeason}
          week={week}
          setWeek={setWeek}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          weekOptions={weekOptions}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          onApplyFilters={setFilters}
          onClearFilters={clearFilters}
          scope={scope}
          setScope={setScope}
          refreshing={refreshing}
        />

        {loading || (scope === "week" && week === null) ? (
          <div className="mx-auto max-w-2xl px-4 py-6 text-sm text-muted-foreground">
            <LoadingList />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">Error: {error}</div>
        ) : byDay.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {!!tightGapMessage && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>
                  Tight gap this week:{" "}
                  <span className="font-medium">{tightGapMessage}</span>
                </AlertDescription>
              </Alert>
            )}

            {byDay.map(([label, games]) => (
              <DaySection key={label} dateLabel={label} games={games} />
            ))}

            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" /> Tap a card for details, maps, and
              sharing.
            </div>
          </div>
        )}
      </div>

      {refreshing && (
        <div className="fixed inset-0 z-40 bg-transparent pointer-events-none" />
      )}
    </PullToRefresh>
  );
}
