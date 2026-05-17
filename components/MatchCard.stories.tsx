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

// --- HELPER FOR DYNAMIC TIMESTAMPS ---
const now = Date.now();
const MINUTE = 60 * 1000;

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

// --- BASE MATCH BLUEPRINT  ---
const baseSorichaMatch: Match = {
  id: 's1',
  homeTeam: SORICHA,
  awayTeam: AWAY_TEAM,
  time: '10:00 AM',
  location: 'Randall Island - Field 4',
  status: 'upcoming',
  date: 'May 17, 2026',
  timestamp: now + 120 * MINUTE, // Default: 2 hours in the future
};

// --- STORIES ---

export const SorichaUpcoming: Story = {
  name: 'Soricha / Upcoming',
  args: {
    match: baseSorichaMatch,
  },
};

export const SorichaLive: Story = {
  name: 'Soricha / Live (Dynamic)',
  args: {
    match: {
      ...baseSorichaMatch,
      id: 's-live',
      homeTeam: { ...SORICHA, score: 2 },
      awayTeam: { ...AWAY_TEAM, score: 1 },
      timestamp: now - 30 * MINUTE, // Started 30 mins ago (inside 105 min window)
    },
  },
};

export const SorichaCanceled: Story = {
  name: 'Soricha / Canceled',
  args: {
    match: {
      ...baseSorichaMatch,
      id: 's2',
      status: 'canceled',
      timestamp: now - 500 * MINUTE,
    },
  },
};

export const BandGFinal: Story = {
  name: 'B&G / Final (Win)',
  args: {
    match: {
      id: 'bg1',
      homeTeam: { ...BANDG, score: 3, result: 'W' },
      awayTeam: { ...AWAY_TEAM, name: 'Lions', score: 0, result: 'L' },
      time: '12:30 PM',
      location: 'Randall Island - Field 7',
      status: 'final',
      date: 'May 17, 2026',
      timestamp: now - 200 * MINUTE, // Finished 200 mins ago
    },
  },
};

export const SorichaConflict: Story = {
  name: 'Soricha / Conflict Warning',
  args: {
    match: {
      ...baseSorichaMatch,
      id: 's-conflict',
      isConflict: true,
    },
  },
};

export const BandGTightGap: Story = {
  name: 'B&G / Tight Gap Warning',
  args: {
    match: {
      id: 'bg-tight',
      homeTeam: BANDG,
      awayTeam: AWAY_TEAM,
      time: '12:30 PM',
      location: 'Randall Island - Field 7',
      status: 'upcoming',
      date: 'May 17, 2026',
      timestamp: now + 60 * MINUTE,
      isTightGap: true,
    },
  },
};

export const BandGLateKickoff: Story = {
  name: 'B&G / Late Afternoon',
  args: {
    match: {
      id: 'bg-late',
      homeTeam: BANDG,
      awayTeam: AWAY_TEAM,
      time: '5:30 PM',
      location: 'Randall Island - Field 7',
      status: 'upcoming',
      date: 'May 17, 2026',
      timestamp: now + 300 * MINUTE,
    },
  },
};

export const DrawState: Story = {
  name: 'Shared / Draw Result',
  args: {
    match: {
      id: 'draw-1',
      homeTeam: { ...SORICHA, score: 1, result: 'D' },
      awayTeam: { ...AWAY_TEAM, score: 1, result: 'D' },
      time: '9:00 AM',
      location: 'Randall Island - Field 2',
      status: 'final',
      date: 'May 17, 2026',
      timestamp: now - 300 * MINUTE,
    },
  },
};
