import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataFreshness } from './DataFreshness';

const NOW = '2026-11-14T11:00:00-05:00';
const minutesAgo = (m: number) => Date.parse(NOW) - m * 60_000;

/** "Updated 12 min ago" — amber after 24 h (scraper may be stuck). Figma: DataFreshness. */
const meta: Meta<typeof DataFreshness> = {
  title: 'States/DataFreshness',
  component: DataFreshness,
  parameters: { layout: 'padded', now: NOW },
};
export default meta;
type Story = StoryObj<typeof DataFreshness>;

export const Fresh: Story = { args: { updatedAt: minutesAgo(12) } };
export const HoursAgo: Story = { args: { updatedAt: minutesAgo(3 * 60) } };
export const Stale: Story = { args: { updatedAt: minutesAgo(2 * 24 * 60) } };
/** No scraper timestamp → renders nothing */
export const Unknown: Story = { args: { updatedAt: null } };
