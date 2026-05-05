/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Flag, Clock, FoldHorizontal } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    // Centers the component and gives it breathing room
    layout: 'padded',
    // Subtle background to make the white text and shadow-sm pop
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8FAFC' },
        { name: 'dark', value: '#0F172A' },
      ],
    },
  },
  // Auto-generates documentation based on your TypeScript interface
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['destructive', 'warning'],
      description: 'Determines the gradient background and semantic intent.',
    },
    // Hide the icon from the controls panel since we pass JSX directly
    icon: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

/* =====================================================================
   STORIES
   ===================================================================== */

export const DestructiveConflict: Story = {
  args: {
    variant: 'destructive',
    icon: <Flag size={18} strokeWidth={2.5} />,
    title: '1 Schedule Conflict',
    description:
      'You have overlapping matches. You cannot be in two places at once.',
    details: ['B&G 2017 10:00 AM ↔ Soricha 2014 10:00 AM (overlap 90 min)'],
  },
};

export const WarningTightGap: Story = {
  args: {
    variant: 'warning',
    icon: <FoldHorizontal size={18} strokeWidth={2.5} />,
    title: '1 Schedule Overlap',
    description:
      'Matches are scheduled very close together. Pack snacks and plan travel accordingly.',
    details: ['B&G 2017 9:00 AM → Soricha 2014 10:30 AM (0 min gap)'],
  },
};

export const PendingTimeTBD: Story = {
  args: {
    variant: 'warning',
    icon: <Clock size={18} strokeWidth={2.5} />,
    title: '1 Schedule Note',
    description: 'The exact kickoff time for these matches is currently TBD.',
    details: ['B&G 2017 vs Rivals FC'],
  },
};

export const MultiConflictList: Story = {
  args: {
    variant: 'destructive',
    icon: <Flag size={18} strokeWidth={2.5} />,
    title: '3 Schedule Conflicts',
    description:
      'You have multiple overlapping matches this weekend. Please review the schedule carefully.',
    details: [
      'Soricha 2014 9:00 AM ↔ B&G 2017 9:30 AM (overlap 60 min)',
      'B&G 2017 1:00 PM ↔ Matchdule FC 1:00 PM (overlap 90 min)',
      'Soricha 2014 4:00 PM ↔ B&G 2017 4:15 PM (overlap 75 min)',
    ],
  },
};
