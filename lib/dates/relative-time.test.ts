import { describe, expect, it } from 'vitest';
import { relativeTime, STALE_AFTER_MS } from '@/lib/dates/relative-time';

const NOW = Date.UTC(2026, 8, 28, 16, 0);
const ago = (ms: number) => NOW - ms;
const MIN = 60_000;

describe('relativeTime ("Updated … ago")', () => {
  it.each([
    [0, 'just now'],
    [20 * 1000, 'just now'],
    [1 * MIN, '1 min ago'],
    [12 * MIN, '12 min ago'],
    [59 * MIN, '59 min ago'],
    [60 * MIN, '1 h ago'],
    [3 * 60 * MIN, '3 h ago'],
    [24 * 60 * MIN, 'yesterday'],
    [4 * 24 * 60 * MIN, '4 days ago'],
  ])('%i ms ago → %j', (ms, label) => {
    expect(relativeTime(ago(ms), NOW)).toBe(label);
  });

  it('never says "-3 min ago" if clocks disagree (future timestamp)', () => {
    expect(relativeTime(NOW + 5 * MIN, NOW)).toBe('just now');
  });

  it('flags data older than a day as stale', () => {
    expect(STALE_AFTER_MS).toBe(24 * 60 * MIN);
  });
});
