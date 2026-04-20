import { describe, it, expect } from 'vitest';
import { getTimeOfDayAssets } from './date-utils';
import { Sun, Sunset } from 'lucide-react';

describe('getTimeOfDayAssets', () => {
  it('returns Sun icon for morning times', () => {
    const { TimeIcon } = getTimeOfDayAssets('10:00 AM');
    expect(TimeIcon).toBe(Sun);
  });

  it('returns Sun icon for noon (12:00 PM)', () => {
    const { TimeIcon } = getTimeOfDayAssets('12:00 PM');
    expect(TimeIcon).toBe(Sun);
  });

  it('returns Sunset icon for 3:00 PM and later', () => {
    const { TimeIcon } = getTimeOfDayAssets('3:00 PM');
    expect(TimeIcon).toBe(Sunset);
  });
});
