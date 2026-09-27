import { Team } from '@/types/match';

/**
 * Team presentation helpers shared by MatchTeamRow, MatchRowCompact and VersusCard.
 * TODO: move age group onto the Team data — mirrors the previous hard-coded name checks.
 */

const AGE_GROUPS: [nameIncludes: string, age: string][] = [
  ['Soricha Foot SFA EDP', 'U13'],
  ['Soricha Foot SFA /18', 'U9'],
];

export const getAgeGroup = (name?: string) =>
  AGE_GROUPS.find(([match]) => name?.includes(match))?.[1];

/** Crest colorway. Soricha = yellow/blue ball; every other team (incl. B&G) = graphite ball. */
export type CrestBrand = 'soricha' | 'opponent';

export const getCrestBrand = (team: Pick<Team, 'utility'>): CrestBrand =>
  team.utility === 'soricha' ? 'soricha' : 'opponent';
