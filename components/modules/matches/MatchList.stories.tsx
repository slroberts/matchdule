import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MatchList } from './MatchList';
import { Match } from '@/types/match';

const meta: Meta<typeof MatchList> = {
  title: 'Organisms/MatchList',
  component: MatchList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MatchList>;

// --- HELPER FOR DYNAMIC TIMESTAMPS ---
const now = Date.now();
const MINUTE = 60 * 1000;

const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: { name: 'Soricha', utility: 'soricha', score: 0, result: null },
    awayTeam: { name: 'Tigers', utility: 'away', score: 0, result: null },
    time: '10:00 AM',
    location: 'Field 4',
    status: 'upcoming',
    date: 'May 17, 2026',
    timestamp: now + 120 * MINUTE, // 2 hours in the future (Upcoming status remains stable)
  },
  {
    id: '2',
    homeTeam: { name: 'B&G', utility: 'b-and-g', score: 2, result: null },
    awayTeam: { name: 'Lions', utility: 'away', score: 1, result: null },
    time: '1:30 PM',
    location: 'Field 7',
    status: 'upcoming', // Component clock will automatically flip this to 'live'
    date: 'May 17, 2026',
    timestamp: now - 30 * MINUTE, // Started 30 mins ago (Actively pulsing Live)
  },
  {
    id: '3',
    homeTeam: { name: 'Soricha', utility: 'soricha', score: 1, result: 'D' },
    awayTeam: { name: 'Eagles', utility: 'away', score: 1, result: 'D' },
    time: '4:00 PM',
    location: 'Field 2',
    status: 'final',
    date: 'May 17, 2026',
    timestamp: now - 200 * MINUTE, // Concluded 200 minutes ago (Shows Final layout)
  },
];

export const Default: Story = {
  args: {
    matches: mockMatches,
  },
};
