import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Link from 'next/link';
import { fn } from 'storybook/test';
import { Button, buttonClasses } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Show 12 matches', variant: 'primary' },
};
export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};
export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
};
export const Ghost: Story = {
  args: { children: 'Clear all', variant: 'ghost' },
};
export const Disabled: Story = {
  args: { children: 'No matches', variant: 'primary', disabled: true },
};

/** Navigation that looks like a button: style the Link itself — never <Link><Button/></Link>. */
export const AsLink: Story = {
  render: () => (
    <Link href='/' className={buttonClasses()}>
      Back to schedule
    </Link>
  ),
};
