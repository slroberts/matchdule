/** "just now" · "12 min ago" · "3 h ago" · "yesterday" · "4 days ago" */
export const relativeTime = (then: number, now: number) => {
  const mins = Math.max(0, Math.round((now - then) / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

/** Data older than this is flagged "may be out of date" (the scraper may be stuck) */
export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
