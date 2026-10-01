import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { match, soricha9, team } from '@/lib/test-utils/fixtures';
import { CalendarButton } from './CalendarButton';

/** Figma: Footer › Calendar + Organisms › CalendarSheet — tap to open the sheet */
const meta: Meta<typeof CalendarButton> = {
  title: 'UI/CalendarButton',
  component: CalendarButton,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof CalendarButton>;

const timed = match({
  at: '2026-11-14T13:00',
  awayTeam: team({ name: 'ALBION SC Brooklyn B13' }),
});

export const Timed: Story = { args: { match: timed } };

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

/** Shared sheet behavior (BottomSheet — same as Filters): focus Close, Escape closes, focus returns. */
export const OpensSheet: Story = {
  args: { match: timed },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Add to calendar',
    });
    await userEvent.click(button);

    // Portaled to <body>, so query the whole screen
    const sheet = await screen.findByRole('dialog', {
      name: 'Add to calendar',
    });
    await expect(
      within(sheet).getByText(/Soricha U13 vs Albion SC Brooklyn/),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        within(sheet).getByRole('button', { name: 'Close' }),
      ).toHaveFocus(),
    );
    await expect(
      within(sheet).getByRole('link', {
        name: /Subscribe to all Soricha U13 games/,
      }),
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // Focus returns when the exit animation finishes and the sheet unmounts
    await waitFor(() => expect(button).toHaveFocus());
  },
};
