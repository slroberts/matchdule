import { AgeGroup, Team } from '@/types/match';

/**
 * Team presentation helpers shared by MatchTeamRow, MatchRowCompact and VersusCard.
 * Age comes from the data (scraper TEAMS config → home_age / away_age → Team.age).
 * Adding a team = one entry in scraper/main.py, nothing here.
 */

export const getAgeGroup = (team?: Pick<Team, 'age'>): AgeGroup | undefined =>
  team?.age;

/** Does either side of the match belong to this age group? (U9 / U13 filter) */
export const hasAgeGroup = (
  match: { homeTeam: Pick<Team, 'age'>; awayTeam: Pick<Team, 'age'> },
  age: AgeGroup,
) => match.homeTeam.age === age || match.awayTeam.age === age;

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
