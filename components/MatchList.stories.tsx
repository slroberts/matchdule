import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MatchList } from './MatchList';
import { Match } from '../types/match';

const meta: Meta<typeof MatchList> = {
  title: 'Organisms/MatchList',
  component: MatchList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MatchList>;

const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: { name: 'Soricha', utility: 'soricha', score: 0, result: null },
    awayTeam: { name: 'Tigers', utility: 'away', score: 0, result: null },
    time: '10:00 AM',
    location: 'Field 4',
    status: 'upcoming',
    date: 'Sunday, Apr 19',
  },
  {
    id: '2',
    homeTeam: { name: 'B&G', utility: 'b-and-g', score: 2, result: null },
    awayTeam: { name: 'Lions', utility: 'away', score: 1, result: null },
    time: '1:30 PM',
    location: 'Field 7',
    status: 'live',
    date: 'Sunday, Apr 19',
  },
  {
    id: '3',
    homeTeam: { name: 'Soricha', utility: 'soricha', score: 1, result: 'D' },
    awayTeam: { name: 'Eagles', utility: 'away', score: 1, result: 'D' },
    time: '4:00 PM', // Sunset icon test
    location: 'Field 2',
    status: 'final',
    date: 'Sunday, Apr 19',
  },
];

export const Default: Story = {
  args: {
    matches: mockMatches,
  },
};
