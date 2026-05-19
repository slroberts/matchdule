import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge', // How it appears in the sidebar
  component: Badge,
  tags: ['autodocs'], // Generates automatic documentation
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Matchdule',
    variant: 'default',
  },
};

export const Conflict: Story = {
  args: {
    children: 'Game Conflict',
    variant: 'destructive',
  },
};

export const TightGap: Story = {
  args: {
    children: 'Tight Gap',
    variant: 'warning',
  },
};

export const ThisWeek: Story = {
  args: {
    children: 'This Week',
    variant: 'primary',
  },
};
