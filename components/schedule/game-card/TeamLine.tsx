import { cn } from "@/lib/utils";
import { Volleyball } from "lucide-react";

type Props = {
  name: string;
  score: number | null;
  avatarClassName?: string;
  dimScore?: boolean;
};

export default function TeamLine({
  name,
  score,
  avatarClassName,
  dimScore,
}: Props) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
      <div
        className={cn(
          "grid size-8 place-items-center rounded-full text-lg font-black sm:size-10",
          "bg-conic from-black to-zinc-400 to-50% text-white",
          avatarClassName,
        )}
        aria-hidden
        title={name}
      >
        <Volleyball className="w-6 h-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="truncate text-base sm:text-lg font-black leading-tight tracking-tight uppercase"
          title={name}
        >
          {name}
        </div>
      </div>

      <div className="pl-1">
        <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-muted/40 px-2 text-lg font-black tabular-nums leading-none ring-1 ring-border/60 sm:h-12 sm:min-w-12">
          {typeof score === "number" ? (
            <span className={cn(dimScore && "text-foreground/40")}>
              {score}
            </span>
          ) : (
            <span className="text-foreground/40">—</span>
          )}
        </span>
      </div>
    </div>
  );
}
