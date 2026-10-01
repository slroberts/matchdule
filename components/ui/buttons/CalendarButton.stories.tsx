import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { match, soricha9, team } from '@/lib/test-utils/fixtures';
import { CalendarButton } from './CalendarButton';

/** Figma: Footer › Calendar + Organisms › CalendarMenu — click to open the menu */
const meta: Meta<typeof CalendarButton> = {
  title: 'UI/CalendarButton',
  component: CalendarButton,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof CalendarButton>;

export const Timed: Story = {
  args: {
    match: match({
      at: '2026-11-14T13:00',
      awayTeam: team({ name: 'ALBION SC Brooklyn B13' }),
    }),
  },
};

/** Kickoff TBD → all-day event */
export const KickoffTBD: Story = {
  args: {
    match: match({
      at: '2026-11-15T23:59',
      time: 'TBD',
      awayTeam: soricha9(),
      homeTeam: team({ name: 'Metro Stars' }),
    }),
  },
};
