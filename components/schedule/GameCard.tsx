import { cn } from "@/lib/utils";
import { Clock, MapPin, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent } from "../ui/card";
import { HAChip, StatusChip, TeamLine } from ".";
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
      : "before:bg-primary/20";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl border border-muted/40 transition-all",
        "hover:shadow-md focus-within:shadow-md",
        // subtle left accent
        'before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[""]',
        leftAccent,
      )}
    >
      <div className="absolute right-0 top-0">
        <StatusChip game={game} />
      </div>

      {/* Top meta strip */}
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT — Primary: Time + Location */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time (prominent) */}
            <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 ring-1 ring-border/60">
              <Clock className="h-4 w-4" aria-hidden />
              <span className="text-sm font-semibold tabular-nums tracking-tight">
                {game.timeText || "TBD"}
              </span>
            </div>

            {/* Location pill */}
            <div className="inline-flex max-w-[70vw] items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 ring-1 ring-border sm:max-w-[42ch]">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span
                className="truncate text-sm font-medium"
                title={game.location || undefined}
              >
                {game.location || "Location TBD"}
              </span>
              <HAChip value={game.homeAway} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Teams block: names left, scores right — crisp alignment */}
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

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2  pt-3">
          <Button variant="secondary" size="sm" className="rounded-full">
            <MapPin className="h-4 w-4 mr-1" aria-hidden /> Map
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full">
            <Share2 className="h-4 w-4 mr-1" aria-hidden /> Share
          </Button>
          <Button
            variant="default"
            size="sm"
            className="ml-auto rounded-full focus-visible:ring-2"
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
