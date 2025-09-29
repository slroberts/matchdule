// GameCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Share2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { HAChip, MapLink, StatusRibbon, TeamLine } from "..";
import { Game } from "@/types/schedule";

export default function GameCard({ game }: { game: Game }) {
  const hasScore =
    game.result ||
    (typeof game.scoreFor === "number" &&
      typeof game.scoreAgainst === "number");

  const leftAccent =
    game.result === "W"
      ? "before:bg-emerald-500"
      : game.result === "L"
      ? "before:bg-rose-500"
      : game.result === "D"
      ? "before:bg-zinc-400"
      : null;

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl border border-muted/40 transition-all",
        "hover:shadow-md focus-within:shadow-md",
        'before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[""]',
        leftAccent,
      )}
    >
      <div className="absolute right-0 top-0">
        <StatusRibbon game={game} />
      </div>

      <CardHeader className="pt-2">
        <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4">
          <div className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 ring-1 ring-border/60">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span className="text-sm font-semibold tabular-nums tracking-tight">
              {game.timeText || "TBD"}
            </span>
          </div>

          <MapLink address={game.location || undefined}>
            <div className="inline-flex min-w-0 max-w-[80vw] items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 ring-1 ring-border/60 sm:max-w-[46ch]">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span
                className="truncate text-sm font-medium"
                title={game.location || undefined}
              >
                {game.location || "Location TBD"}
              </span>
              <span className="mx-1 h-4 w-px bg-border/60" aria-hidden />
              <HAChip value={game.homeAway} />
            </div>
          </MapLink>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-lg border border-border/60 bg-card/40">
          <TeamLine
            name={game.team}
            initial={game.team.split(" ").at(0)?.[0] ?? "T"}
            score={hasScore ? game.scoreFor : null}
          />
          <div className="h-px w-full bg-border/70" />
          <TeamLine
            name={game.opponent}
            initial={game.opponent.split(" ").at(0)?.[0] ?? "O"}
            score={hasScore ? game.scoreAgainst : null}
          />
        </div>

        <div className="mt-4 pt-3 grid grid-cols-3 gap-2 sm:flex sm:items-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-full sm:w-auto"
          >
            <MapLink address={game.location || undefined}>
              <MapPin className="h-4 w-4 mr-1" aria-hidden />
              <span className="hidden xs:inline">Map</span>
            </MapLink>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-full sm:w-auto"
          >
            <Share2 className="h-4 w-4 mr-1" aria-hidden />
            <span className="hidden xs:inline">Share</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            className="rounded-full w-full sm:w-auto sm:ml-auto focus-visible:ring-2"
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
