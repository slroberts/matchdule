import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LoadError } from './LoadError';

/** Fetch failed → honest error + "Try again" (router.refresh — mocked by nextjs-vite). */
const meta: Meta<typeof LoadError> = {
  title: 'States/LoadError',
  component: LoadError,
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className='page-canvas min-h-dvh py-8'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
export const Default: StoryObj<typeof LoadError> = {};
