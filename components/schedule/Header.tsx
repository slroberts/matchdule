"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import ControlsBar from "./ControlsBar";
import { Filters, FilterScope, TeamFilter } from "@/types/schedule";
import { FilterSheet } from ".";

interface HeaderProps {
  season: string;
  setSeason: React.Dispatch<React.SetStateAction<string>>;
  week: string | null;
  setWeek: React.Dispatch<React.SetStateAction<string | null>>;
  teamFilter: TeamFilter;
  setTeamFilter: React.Dispatch<React.SetStateAction<TeamFilter>>;
  weekOptions: string[];
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onApplyFilters?: (f: Filters) => void;
  onClearFilters?: () => void;
  subtitle?: string;
  scope: FilterScope;
  setScope: (v: FilterScope) => void;
}

export default function Header({
  season,
  setSeason,
  week,
  setWeek,
  teamFilter,
  setTeamFilter,
  weekOptions,
  filtersOpen,
  setFiltersOpen,
  onApplyFilters,
  onClearFilters,
  subtitle = "— Know who plays when—always.",
  scope,
  setScope,
}: HeaderProps) {
  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-40 -mx-4 px-4",
        "bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75",
      )}
    >
      {/* Title row */}
      <div className="flex items-center justify-between py-3">
        <div className="flex min-w-0 mb-2">
          <div className="min-w-0 flex items-center gap-1">
            <span>
              <CalendarDays className="h-6 w-6 text-primary" aria-hidden />
            </span>
            <h1 className="truncate text-xl sm:text-xl font-bold tracking-tight">
              Matchdule
            </h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      {/* Controls row */}
      <div className="pb-3">
        <ControlsBar
          season={season}
          setSeason={setSeason}
          week={week}
          setWeek={setWeek}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          weekOptions={weekOptions}
          setFiltersOpen={setFiltersOpen}
          scope={scope}
          setScope={setScope}
        />
      </div>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        onApply={onApplyFilters}
        onClear={onClearFilters}
      />
    </header>
  );
}
