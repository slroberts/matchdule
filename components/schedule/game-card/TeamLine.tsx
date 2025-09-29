type Props = {
  name: string;
  initial: string;
  score: number | null;
};

export default function TeamLine({ name, initial, score }: Props) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
      {/* Avatar */}
      <div
        className="grid size-9 place-items-center rounded-full bg-muted text-foreground/40 text-lg font-black sm:size-10"
        aria-hidden
        title={name}
      >
        {initial}
      </div>

      {/* Team name (+ optional meta) */}
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-base sm:text-lg font-black leading-tight tracking-tight uppercase"
          title={name}
        >
          {name}
        </div>
      </div>

      {/* Score */}
      <div className="pl-1">
        <span
          className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-muted/40 px-2 text-lg font-black tabular-nums leading-none ring-1 ring-border/60 sm:h-12 sm:min-w-12"
          aria-label="Score"
        >
          {typeof score === "number" ? score : "—"}
        </span>
      </div>
    </div>
  );
}
