import { Team } from '@/types/match';

/**
 * Team presentation helpers shared by MatchTeamRow, MatchRowCompact and VersusCard.
 * TODO(scraper): age group should come from the data, not this list — add an `age` field per team in scraper/main.py's team config and a column in Supabase, then read it in mapApiToMatch. Until then, a new team needs a row in AGE_GROUPS below.
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

/** Short club label — matches the team tabs ("Soricha", "B&G"). Falls back to the display name. */
const CLUB_LABELS: Partial<Record<Team['utility'], string>> = {
  soricha: 'Soricha',
  'b-and-g': 'B&G',
};

export const getClubLabel = (team: Pick<Team, 'utility'>, fallback: string) =>
  CLUB_LABELS[team.utility] ?? fallback;
