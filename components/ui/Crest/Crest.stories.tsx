import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Crest } from './Crest';

/** Team identity: Soricha yellow/blue, everyone else graphite. Figma: Crest (Tone × Size). */
const meta: Meta<typeof Crest> = {
  title: 'UI/Crest',
  component: Crest,
  tags: ['autodocs'],
  argTypes: {
    brand: { control: 'radio', options: ['soricha', 'opponent'] },
    size: { control: 'radio', options: ['sm', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Crest>;

export const Soricha: Story = { args: { brand: 'soricha', size: 'sm' } };
export const Opponent: Story = { args: { brand: 'opponent', size: 'sm' } };

/** All four combinations, on light and on the dark Versus surface */
export const Matrix: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-4'>
        <Crest brand='soricha' size='sm' />
        <Crest brand='opponent' size='sm' />
        <Crest brand='soricha' size='lg' />
        <Crest brand='opponent' size='lg' />
      </div>
      <div
        data-theme='dark'
        className='flex items-center gap-4 rounded-(--radius-card) bg-(image:--gradient-versus) p-4'
      >
        <Crest brand='soricha' size='lg' />
        <Crest brand='opponent' size='lg' />
      </div>
    </div>
  ),
};
