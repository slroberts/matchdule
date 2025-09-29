import type { Game, Result } from "@/types/schedule";

export type ShareOpts = {
  /** Target timezone for date formatting (defaults to America/New_York) */
  tz?: string;
  /** URL to include (defaults to current page) */
  url?: string;
};

function fmtDate(dISO: string, tz: string) {
  const d = new Date(dISO);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "short",
    timeZone: tz,
  }).format(d);
}

function fmtResult(result: Result, forG: number | null, agG: number | null) {
  if (!result) return null;
  const score =
    typeof forG === "number" && typeof agG === "number"
      ? ` ${forG}–${agG}`
      : "";
  const word = result === "W" ? "Win" : result === "L" ? "Loss" : "Draw";
  return `Final: ${word}${score}`;
}

export function buildShareData(game: Game, opts: ShareOpts = {}) {
  const tz = opts.tz ?? "America/New_York";
  const url =
    opts.url ?? (typeof window !== "undefined" ? window.location.href : "");

  const title = `${game.team} vs ${game.opponent}`;

  const lines: string[] = [];

  // ⬅️ Add matchup to the body text
  lines.push(`${game.team} vs ${game.opponent}`);

  // When & where
  const when = `${fmtDate(game.dateISO, tz)} • ${game.timeText || "TBD"}`;
  const where = `@ ${game.location || "Location TBD"}`;
  lines.push(`${when} ${where}`);

  // Optional meta (week + Home/Away)
  const meta: string[] = [];
  if (game.week) meta.push(game.week);
  meta.push(
    game.homeAway === "HOME"
      ? "@ Home"
      : game.homeAway === "AWAY"
      ? "@ Away"
      : "TBD",
  );
  if (meta.length) lines.push(meta.join(" • "));

  // Result
  const res = fmtResult(game.result, game.scoreFor, game.scoreAgainst);
  if (res) lines.push(res);

  const text = lines.join("\n");
  return { title, text, url };
}

export type SharePayload = {
  title: string;
  text: string;
  url?: string;
};

/** Returns true if the native share sheet was opened (even if user cancels). */
export async function tryWebShare(
  input: Game | SharePayload,
  opts?: ShareOpts,
): Promise<boolean> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const payload: SharePayload =
    "team" in input
      ? buildShareData(input as Game, opts)
      : (input as SharePayload);

  const shareData: ShareData = {
    title: payload.title,
    text: payload.text,
    url: payload.url,
  };

  const navAny = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (typeof navAny.share !== "function") return false;

  try {
    if (typeof navAny.canShare === "function" && !navAny.canShare(shareData)) {
      // Try URL-only fallback for picky UAs
      if (!payload.url) return false;
      await navAny.share({ url: payload.url });
      return true;
    }

    await navAny.share(shareData);
    return true;
  } catch (err: unknown) {
    // Browser cancel → considered "used" (opened share sheet)
    if (
      (err instanceof DOMException && err.name === "AbortError") ||
      (typeof err === "object" &&
        err !== null &&
        "name" in err &&
        (err as { name?: string }).name === "AbortError")
    ) {
      return true;
    }
    return false;
  }
}
