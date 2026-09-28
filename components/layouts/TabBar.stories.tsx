import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { TabBar } from './TabBar';

/** Tabs are real links (/?view=season) but plain clicks call onSelect (pushState). */
const meta: Meta<typeof TabBar> = {
  title: 'Layouts/TabBar',
  component: TabBar,
  parameters: { layout: 'fullscreen' },
  args: {
    hrefFor: (view) => (view === 'season' ? '/?view=season' : '/'),
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className='page-canvas h-40'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TabBar>;

export const Schedule: Story = { args: { view: 'schedule' } };
export const Season: Story = { args: { view: 'season' } };
