import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GameBadge from './GameBadge';

/**
 * Match result. variant="dot" = form dots (Season tab) · variant="label" = result word
 * above a score (cards). Only a win is green; loss/draw stay neutral in the label.
 */
const meta: Meta<typeof GameBadge> = {
  title: 'UI/GameBadge',
  component: GameBadge,
  tags: ['autodocs'],
  argTypes: {
    result: { control: 'radio', options: ['W', 'D', 'L'] },
    variant: { control: 'radio', options: ['dot', 'label'] },
  },
};
export default meta;
type Story = StoryObj<typeof GameBadge>;

export const Dot: Story = { args: { result: 'W', variant: 'dot' } };
export const Label: Story = { args: { result: 'W', variant: 'label' } };

export const AllResults: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-1.5'>
        <GameBadge result='W' /> <GameBadge result='D' />{' '}
        <GameBadge result='L' />
      </div>
      <div className='flex items-center gap-4'>
        <GameBadge result='W' variant='label' />
        <GameBadge result='D' variant='label' />
        <GameBadge result='L' variant='label' />
      </div>
    </div>
  ),
};

/** No result (upcoming / pending) → renders nothing */
export const NoResult: Story = { args: { result: null } };
