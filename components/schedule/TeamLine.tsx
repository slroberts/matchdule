export default function TeamLine({
  name,
  initial,
  score,
}: {
  name: string;
  initial: string;
  score: number | null;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 sm:px-4">
      <div
        className="grid size-8 place-items-center rounded-full bg-muted text-foreground/80 text-xs font-semibold"
        aria-hidden
        title={name}
      >
        {initial}
      </div>

      <div className="min-w-0">
        <div
          className="truncate text-sm sm:text-base font-semibold leading-snug"
          title={name}
        >
          {name}
        </div>
      </div>

      <div className="pl-2">
        <span className="inline-flex h-7 min-w-9 items-center justify-center rounded-md bg-muted/40 px-2 text-base font-bold tabular-nums leading-none">
          {typeof score === "number" ? score : "—"}
        </span>
      </div>
    </div>
  );
}
