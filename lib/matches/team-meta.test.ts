import { describe, expect, it } from 'vitest';
import {
  getAgeGroup,
  getClubLabel,
  getCrestBrand,
} from '@/lib/matches/team-meta';

describe('team identity', () => {
  it('age group from the raw team name', () => {
    expect(getAgeGroup('Soricha Foot SFA EDP')).toBe('U13');
    expect(getAgeGroup('Soricha Foot SFA /18')).toBe('U9');
    // Current scraper output ("SFA 2017/18 CJSL" → "SFA CJSL")
    expect(getAgeGroup('Soricha Foot SFA CJSL')).toBe('U9');
    expect(getAgeGroup('Albion SC Brooklyn')).toBeUndefined();
    expect(getAgeGroup(undefined)).toBeUndefined();
  });

  it('short club label matches the team tabs', () => {
    expect(getClubLabel({ utility: 'soricha' }, 'Soricha Foot SFA')).toBe(
      'Soricha',
    );
    expect(getClubLabel({ utility: 'b-and-g' }, 'B&G Soccer Academy')).toBe(
      'B&G',
    );
    expect(getClubLabel({ utility: 'away' }, 'Albion SC Brooklyn')).toBe(
      'Albion SC Brooklyn',
    );
  });

  it('crest colorway: Soricha yellow/blue, everyone else graphite', () => {
    expect(getCrestBrand({ utility: 'soricha' })).toBe('soricha');
    expect(getCrestBrand({ utility: 'b-and-g' })).toBe('opponent');
    expect(getCrestBrand({ utility: 'away' })).toBe('opponent');
  });
});
