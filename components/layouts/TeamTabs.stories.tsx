import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { TeamTabs } from './TeamTabs';
import type { TabOption } from '@/types/match';

/** Team switcher: scrolling pills with a sliding teal indicator; ←/→ move between tabs. */
const meta: Meta<typeof TeamTabs> = {
  title: 'Layouts/TeamTabs',
  component: TeamTabs,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className='page-canvas py-4'>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TeamTabs>;

/** Stateful, like ClientView, so the indicator actually slides */
const Controlled = ({ initial = 'All Teams' as TabOption }) => {
  const [team, setTeam] = useState<TabOption>(initial);
  return <TeamTabs activeTeam={team} onTeamChange={setTeam} />;
};

export const AllTeams: Story = { render: () => <Controlled /> };
export const SorichaSelected: Story = {
  render: () => <Controlled initial='Soricha' />,
};

/** Interaction test: click selects; arrow keys move selection (wraps around). */
export const ClickAndKeyboard: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = (name: string) => canvas.getByRole('tab', { name });

    await userEvent.click(tab('B&G'));
    await expect(tab('B&G')).toHaveAttribute('aria-selected', 'true');
    await expect(tab('All Teams')).toHaveAttribute('aria-selected', 'false');

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Soricha')).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}'); // wraps to the first tab
    await expect(tab('All Teams')).toHaveAttribute('aria-selected', 'true');
  },
};
