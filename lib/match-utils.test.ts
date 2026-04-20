import { describe, it, expect } from 'vitest';
import { getStatusConfig } from './match-utils';
import { Radio, CheckCircle2, XCircle } from 'lucide-react';

describe('getStatusConfig', () => {
  it('returns the correct config for "live" status', () => {
    const config = getStatusConfig('live');
    expect(config?.label).toBe('LIVE');
    expect(config?.icon).toBe(Radio);
    expect(config?.className).toContain('animate-pulse');
  });

  it('returns the correct config for "final" status', () => {
    const config = getStatusConfig('final');
    expect(config?.label).toBe('FINAL');
    expect(config?.icon).toBe(CheckCircle2);
    expect(config?.className).toContain('text-surface-muted');
  });

  it('returns the correct config for "canceled" status', () => {
    const config = getStatusConfig('canceled');
    expect(config?.label).toBe('CANCELED');
    expect(config?.icon).toBe(XCircle);
    expect(config?.className).toContain('line-through');
  });

  it('returns null for "upcoming" or unknown statuses', () => {
    // Upcoming should return null because we show the clock icon instead
    expect(getStatusConfig('upcoming')).toBeNull();
    // @ts-expect-error - testing invalid input
    expect(getStatusConfig('invalid-status')).toBeNull();
  });
});
