import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Flag, TriangleAlert, Undo2 } from 'lucide-react';
import { Badge } from './Badge';

/** Labels are sentence case in source — caps come from the text style. */
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'inverse', 'accent', 'warning', 'destructive'],
    },
    size: { control: 'radio', options: ['xs', 'sm', 'md'] },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Venue: Story = { args: { children: 'Home', variant: 'default' } };
export const AgeGroup: Story = {
  args: { children: 'U13', variant: 'inverse' },
};
export const ThisWeek: Story = {
  args: { children: 'This week', variant: 'accent', size: 'xs' },
};

/** Warning = quiet marker: neutral pill + amber icon (Figma: Tone=Warning) */
export const TightGap: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <TriangleAlert aria-hidden='true' />
        Tight gap
      </>
    ),
  },
};
export const Conflict: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <Flag aria-hidden='true' />
        Conflict
      </>
    ),
  },
};

/** Header "back" action pill */
export const BackToThisWeek: Story = {
  args: {
    size: 'xs',
    className: 'text-(--color-accent-on-surface)',
    children: (
      <>
        <Undo2 strokeWidth={2} aria-hidden='true' />
        This week
      </>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <Badge size='xs' variant='inverse'>
        U9 · xs
      </Badge>
      <Badge size='sm' variant='inverse'>
        U9 · sm
      </Badge>
      <Badge size='md' variant='inverse'>
        U9 · md
      </Badge>
    </div>
  ),
};
