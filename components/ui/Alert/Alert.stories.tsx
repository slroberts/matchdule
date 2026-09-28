import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Clock, Flag, TriangleAlert } from 'lucide-react';
import { Alert } from './Alert';

/**
 * Week alert — a HEADLINE: dark card, the icon carries the tone (amber / red).
 * Muted: steps back to a hairline outline, grey text, no expand. (Figma: AlertBanner)
 */
const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: { icon: { control: false } },
};
export default meta;
type Story = StoryObj<typeof Alert>;

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

export const TightGap: Story = {
  args: {
    variant: 'warning',
    icon: <TriangleAlert {...ICON} />,
    title: '1 tight gap this week',
    description:
      'Less than an hour between games. Plan travel and pack snacks.',
    details: ['Soricha U9 9:45 AM → Soricha U13 12:00 PM (45 min gap)'],
  },
};

export const Conflict: Story = {
  args: {
    variant: 'destructive',
    icon: <Flag {...ICON} />,
    title: '1 schedule conflict',
    description: 'Two games overlap. Someone will need to cover one of them.',
    details: ['B&G 10:00 AM ↔ Soricha U9 10:30 AM (overlap 60 min)'],
  },
};

export const TimeTBD: Story = {
  args: {
    variant: 'warning',
    icon: <Clock {...ICON} />,
    title: '1 kickoff time TBD',
    description: 'The league hasn’t posted a time yet.',
    details: ['Soricha U13 vs Albion SC Brooklyn'],
  },
};

/** Interaction test: Mute steps the alert back, Unmute restores it. */
export const MuteAndUnmute: Story = {
  args: TightGap.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /mute/i }));
    await expect(canvas.getByText(/muted/i)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /unmute/i }));
    await expect(canvas.queryByText(/· muted/i)).not.toBeInTheDocument();
  },
};
