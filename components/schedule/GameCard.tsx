import { cn } from "@/lib/utils";
import { Clock, MapPin, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent } from "../ui/card";
import { DividerDot, HAChip, StatusChip, TeamLine } from ".";
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
      {/* Top meta strip */}
      <CardHeader className="-mb-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusChip game={game} />
          <DividerDot />
          <div className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden />
            <span className="tabular-nums">{game.timeText || "TBD"}</span>
          </div>
          <DividerDot className="hidden sm:inline" />
          <div className="hidden sm:inline-flex items-center gap-2">
            <HAChip value={game.homeAway} />
            <DividerDot />
            <MapPin className="h-4 w-4" aria-hidden />
            <span
              className="truncate max-w-[36ch]"
              title={game.location || undefined}
            >
              {game.location || "TBD"}
            </span>
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

        {/* Mobile-only extra meta */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
          <HAChip value={game.homeAway} />
          <DividerDot />
          <MapPin className="h-4 w-4" aria-hidden />
          <span className="truncate">{game.location || "TBD"}</span>
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
