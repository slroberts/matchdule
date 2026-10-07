import { describe, expect, it } from 'vitest';
import {
  getAgeGroup,
  getClubLabel,
  getCrestBrand,
  hasAgeGroup,
} from '@/lib/matches/team-meta';

describe('team identity', () => {
  it('age group comes from the data, never the name', () => {
    expect(getAgeGroup({ age: 'U13' })).toBe('U13');
    expect(getAgeGroup({ age: 'U9' })).toBe('U9');
    // An opponent — or a row scraped before ages existed — has none
    expect(getAgeGroup({})).toBeUndefined();
    expect(getAgeGroup(undefined)).toBeUndefined();
  });

  it('hasAgeGroup matches either side', () => {
    const vs = (home?: 'U9' | 'U13', away?: 'U9' | 'U13') => ({
      homeTeam: { age: home },
      awayTeam: { age: away },
    });
    expect(hasAgeGroup(vs('U9'), 'U9')).toBe(true);
    expect(hasAgeGroup(vs(undefined, 'U9'), 'U9')).toBe(true);
    expect(hasAgeGroup(vs('U13'), 'U9')).toBe(false);
    expect(hasAgeGroup(vs(), 'U13')).toBe(false);
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
