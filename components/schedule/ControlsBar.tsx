import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Check } from "lucide-react";
import type { TeamFilter } from "@/types/schedule";

type Props = {
  season: string;
  setSeason: (v: string) => void;
  week: string | null;
  setWeek: (v: string) => void;
  teamFilter: TeamFilter;
  setTeamFilter: (v: TeamFilter) => void;
  weekOptions: string[];
  setFiltersOpen: (v: boolean) => void;
};

export default function ControlsBar({
  season,
  setSeason,
  week,
  setWeek,
  teamFilter,
  setTeamFilter,
  weekOptions,
  setFiltersOpen,
}: Props) {
  const TEAM_OPTIONS: TeamFilter[] = [
    "All Teams",
    "B&G 2017",
    "B&G 2015",
    "Soricha 2014",
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Season */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 rounded-full px-3"
            aria-label="Select season"
          >
            <span className="truncate max-w-[16ch]">{season}</span>
            <ChevronDown className="ms-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="min-w-48">
          <DropdownMenuLabel>Season</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {["Fall 2025"].map((s) => {
            const selected = s === season;
            return (
              <DropdownMenuItem
                key={s}
                onSelect={(e) => {
                  e.preventDefault();
                  setSeason(s);
                }}
                className="pr-8"
              >
                {s}
                {selected && <Check className="ml-auto h-4 w-4 opacity-80" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Week */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 rounded-full px-3"
            aria-label="Select week"
            disabled={!weekOptions.length}
          >
            <span className="truncate max-w-[16ch]">{week ?? "Week"}</span>
            <ChevronDown className="ms-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="min-w-48 max-h-[60vh] overflow-auto"
        >
          <DropdownMenuLabel>Week</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {weekOptions.map((w) => {
            const selected = w === week;
            return (
              <DropdownMenuItem
                key={w}
                onSelect={(e) => {
                  e.preventDefault();
                  setWeek(w);
                }}
                className="pr-8"
              >
                {w}
                {selected && <Check className="ml-auto h-4 w-4 opacity-80" />}
              </DropdownMenuItem>
            );
          })}
          {!weekOptions.length && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No weeks available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Teams */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 rounded-full px-3"
            aria-label="Select team"
          >
            <span className="truncate max-w-[16ch]">{teamFilter}</span>
            <ChevronDown className="ms-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="min-w-48">
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TEAM_OPTIONS.map((t) => {
            const selected = t === teamFilter;
            return (
              <DropdownMenuItem
                key={t}
                onSelect={(e) => {
                  e.preventDefault();
                  setTeamFilter(t);
                }}
                className="pr-8"
              >
                {t}
                {selected && <Check className="ml-auto h-4 w-4 opacity-80" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filters */}
      <Button
        variant="outline"
        className="h-9 rounded-full px-3"
        onClick={() => setFiltersOpen(true)}
        aria-label="Open filters"
      >
        <Filter className="h-4 w-4 me-2" /> Filters
      </Button>
    </div>
  );
}
