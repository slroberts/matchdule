import { describe, expect, it } from 'vitest';
import { deriveStatus, MATCH_LENGTH_MS } from '@/hooks/use-match-status';
import { et, match } from '@/lib/test-utils/fixtures';

describe('deriveStatus (the shared match clock)', () => {
  const kickoff = et('2026-11-14T13:00');
  const game = match({ at: '2026-11-14T13:00' });

  it('trusts the server status while the clock is unknown (SSR / hydration)', () => {
    expect(deriveStatus(game, null)).toBe('upcoming');
  });

  it('upcoming → live at kickoff → final after 105 min', () => {
    expect(deriveStatus(game, kickoff - 1)).toBe('upcoming');
    expect(deriveStatus(game, kickoff)).toBe('live');
    expect(deriveStatus(game, kickoff + MATCH_LENGTH_MS)).toBe('live');
    expect(deriveStatus(game, kickoff + MATCH_LENGTH_MS + 1)).toBe('final');
  });

  it('never un-finals or un-cancels a game', () => {
    expect(deriveStatus({ ...game, status: 'final' }, kickoff - 60_000)).toBe(
      'final',
    );
    expect(
      deriveStatus({ ...game, status: 'canceled' }, kickoff + 60_000),
    ).toBe('canceled');
  });

  it('TBD games keep their server status (no reliable kickoff)', () => {
    expect(
      deriveStatus({ ...game, time: 'TBD' }, kickoff + MATCH_LENGTH_MS * 2),
    ).toBe('upcoming');
  });
});
