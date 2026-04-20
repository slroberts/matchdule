import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MatchCard } from './MatchCard';
import { Match, Team } from '../types/match';

const meta: Meta<typeof MatchCard> = {
  title: 'Molecules/MatchCard/States',
  component: MatchCard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MatchCard>;

// --- MOCK TEAMS ---
const SORICHA: Team = {
  name: 'Soricha',
  utility: 'soricha',
  score: 0,
  result: null,
};
const BANDG: Team = { name: 'B&G', utility: 'b-and-g', score: 0, result: null };
const AWAY_TEAM: Team = {
  name: 'Tigers',
  utility: 'away',
  score: 0,
  result: null,
};

// --- SORICHA STORIES ---
export const SorichaUpcoming: Story = {
  name: 'Soricha / Upcoming',
  args: {
    match: {
      id: 's1',
      homeTeam: SORICHA,
      awayTeam: AWAY_TEAM,
      time: '10:00 AM',
      location: 'Randall Island - Field 4',
      status: 'upcoming',
      date: 'Sunday, Apr 19',
    },
  },
};

export const SorichaCanceled: Story = {
  name: 'Soricha / Canceled',
  args: {
    match: {
      id: 's2',
      homeTeam: SORICHA,
      awayTeam: AWAY_TEAM,
      time: '10:00 AM',
      location: 'Randall Island - Field 4',
      status: 'canceled',
      date: 'Sunday, Apr 19',
    },
  },
};

export const SorichaLive: Story = {
  name: 'Soricha / Live (Winning)',
  args: {
    match: {
      ...SorichaUpcoming.args?.match,
      status: 'live',
      homeTeam: { ...SORICHA, score: 2 },
      awayTeam: { ...AWAY_TEAM, score: 1 },
    } as Match,
  },
};

export const SorichaConflict: Story = {
  name: 'Soricha / Conflict Warning',
  args: {
    match: {
      ...SorichaUpcoming.args?.match,
      isConflict: true,
    } as Match,
  },
};

// --- B&G STORIES ---
export const BandGUpcoming: Story = {
  name: 'B&G / Upcoming',
  args: {
    match: {
      id: 'bg1',
      homeTeam: BANDG,
      awayTeam: { ...AWAY_TEAM, name: 'Lions' },
      time: '12:30 PM',
      location: 'Randall Island - Field 7',
      status: 'upcoming',
      date: 'Sunday, Apr 19',
    },
  },
};

export const BandGFinal: Story = {
  name: 'B&G / Final (Win)',
  args: {
    match: {
      ...BandGUpcoming.args?.match,
      status: 'final',
      homeTeam: { ...BANDG, score: 3, result: 'W' },
      awayTeam: { ...AWAY_TEAM, name: 'Lions', score: 0, result: 'L' },
    } as Match,
  },
};

export const BandGTightGap: Story = {
  name: 'B&G / Tight Gap Warning',
  args: {
    match: {
      ...BandGUpcoming.args?.match,
      isTightGap: true,
    } as Match,
  },
};

export const BandGLateKickoff: Story = {
  name: 'B&G / Late Afternoon',
  args: {
    match: {
      ...BandGUpcoming.args?.match,
      id: 'bg-late',
      time: '3:30 PM', // This should trigger the Sunset icon
      date: 'Sunday, Apr 19',
    } as Match,
  },
};

export const DrawState: Story = {
  name: 'Shared / Draw Result',
  args: {
    match: {
      ...SorichaUpcoming.args?.match,
      status: 'final',
      homeTeam: { ...SORICHA, score: 0, result: 'D' },
      awayTeam: { ...AWAY_TEAM, score: 0, result: 'D' },
    } as Match,
  },
};
