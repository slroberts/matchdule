"use client";

import { cn } from "@/lib/utils";
import ControlsBar from "./ControlsBar";
import { Filters, FilterScope, TeamFilter } from "@/types/schedule";
import { FilterSheet } from ".";
import MatchduleSymbol from "@/public/matchdule-symbol.svg";
import MatchduleWord from "@/public/matchdule-wordmark.svg";
import Image from "next/image";

interface HeaderProps {
  teams: string[];
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
  refreshing: boolean;
}

export default function Header({
  teams,
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
  scope,
  setScope,
  refreshing,
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
        <div className="w-full flex flex-col items-center">
          <h1 className="w-full flex justify-center gap-1">
            <Image
              src={MatchduleSymbol}
              height={30}
              width={32}
              alt="Matchdule Logo Symbol"
            />
            <Image
              src={MatchduleWord}
              height={150}
              width={190}
              alt="Matchdule Logo Wordmark"
            />
          </h1>
        </div>
      </div>
      {/* Controls row */}
      <div className="pb-3">
        <ControlsBar
          teams={teams}
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
          refreshing={refreshing}
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
