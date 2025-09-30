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
import type { FilterScope, TeamFilter } from "@/types/schedule";
import * as React from "react";
import { useState } from "react";

type Props = {
  season: string;
  setSeason: (v: string) => void;
  week: string | null;
  setWeek: React.Dispatch<React.SetStateAction<string | null>>;
  teamFilter: TeamFilter;
  setTeamFilter: (v: TeamFilter) => void;
  weekOptions: string[];
  setFiltersOpen: (v: boolean) => void;
  scope: FilterScope;
  setScope: (v: FilterScope) => void;
  refreshing: boolean;
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
  scope,
  setScope,
  refreshing,
}: Props) {
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const guardOpen =
    (set: React.Dispatch<React.SetStateAction<boolean>>) => (next: boolean) => {
      if (refreshing) return; // ignore open requests while refreshing
      set(next);
    };

  const stopIfRefreshing: React.PointerEventHandler<HTMLButtonElement> = (
    e,
  ) => {
    if (refreshing) e.preventDefault(); // block press on trigger
  };

  return (
    <div className="space-y-4">
      {/* Row 1: scope + filters */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full border border-border/60 p-0.5 shrink-0">
          <Button
            type="button"
            variant={scope === "week" ? "default" : "ghost"}
            className="h-8 rounded-full px-2 text-xs sm:px-3 sm:text-sm"
            onClick={() => {
              setScope("week");
              if (!week) setWeek(weekOptions[0] ?? null);
            }}
            disabled={refreshing}
          >
            <span className="sm:hidden">Wk</span>
            <span className="hidden sm:inline">This Week</span>
          </Button>

          <Button
            type="button"
            variant={scope === "all" ? "default" : "ghost"}
            className="h-8 rounded-full px-2 text-xs sm:px-3 sm:text-sm"
            onClick={() => {
              setScope("all");
              setWeek(null);
            }}
            disabled={refreshing}
          >
            <span className="sm:hidden">All</span>
            <span className="hidden sm:inline">All Weeks</span>
          </Button>
        </div>

        <Button
          variant="outline"
          className="ml-auto h-8 rounded-full px-2 sm:px-3 shrink-0"
          onClick={() => setFiltersOpen(true)}
          aria-label="Open filters"
          disabled={refreshing}
        >
          <Filter className="h-4 w-4 me-0 sm:me-2" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* Row 2: three equal columns */}
      <div className="grid grid-cols-3 gap-2">
        {/* Season */}
        <DropdownMenu
          open={!refreshing && seasonOpen}
          onOpenChange={guardOpen(setSeasonOpen)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-full rounded-full px-2"
              aria-label="Select season"
              disabled={refreshing}
              onPointerDown={stopIfRefreshing}
            >
              <span className="truncate text-xs sm:text-sm">{season}</span>
              <ChevronDown className="ms-1 h-3.5 w-3.5 sm:ms-2 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="min-w-44"
          >
            <DropdownMenuLabel>Season</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["Fall 2025"].map((s) => (
              <DropdownMenuItem
                key={s}
                onSelect={() => setSeason(s)}
                className="pr-8"
              >
                {s}
                {s === season && (
                  <Check className="ml-auto h-4 w-4 opacity-80" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Week */}
        <DropdownMenu
          open={!refreshing && weekOpen}
          onOpenChange={guardOpen(setWeekOpen)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-full rounded-full px-2 justify-between"
              aria-label="Select week"
              title={
                scope === "all"
                  ? "Disabled when viewing all weeks"
                  : "Select week"
              }
              disabled={scope === "all" || !weekOptions.length || refreshing}
              onPointerDown={stopIfRefreshing}
            >
              <span className="truncate text-xs sm:text-sm">
                {week ?? "Week"}
              </span>
              <ChevronDown className="ms-1 h-3.5 w-3.5 sm:ms-2 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="min-w-44 max-h-[60vh] overflow-auto"
          >
            <DropdownMenuLabel>Week</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {weekOptions.map((w) => (
              <DropdownMenuItem
                key={w}
                onSelect={() => setWeek(w)}
                className="pr-8"
              >
                {w}
                {w === week && <Check className="ml-auto h-4 w-4 opacity-80" />}
              </DropdownMenuItem>
            ))}
            {!weekOptions.length && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No weeks available
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Teams */}
        <DropdownMenu
          open={!refreshing && teamOpen}
          onOpenChange={guardOpen(setTeamOpen)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-full rounded-full px-2"
              aria-label="Select team"
              disabled={refreshing}
              onPointerDown={stopIfRefreshing}
            >
              <span className="truncate text-xs sm:text-sm">{teamFilter}</span>
              <ChevronDown className="ms-1 h-3.5 w-3.5 sm:ms-2 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="min-w-44"
          >
            <DropdownMenuLabel>Teams</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(
              ["All Teams", "B&G 2017", "B&G 2015", "Soricha 2014"] as const
            ).map((t) => (
              <DropdownMenuItem
                key={t}
                onSelect={() => setTeamFilter(t)}
                className="pr-8"
              >
                {t}
                {t === teamFilter && (
                  <Check className="ml-auto h-4 w-4 opacity-80" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
