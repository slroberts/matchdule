import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FilterDrawer } from './FilterDrawer';
import { INITIAL_FILTERS, FilterState } from '@/types/match';
import { Button } from '@/components/ui/buttons/Button';

const meta: Meta<typeof FilterDrawer> = {
  title: 'Components/layouts/FilterDrawer',
  component: FilterDrawer,
  parameters: {
    // Setting layout to fullscreen is crucial for fixed/absolute overlays
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

/**
 * A stateful wrapper to simulate the exact environment the FilterDrawer runs in,
 * including Framer Motion's AnimatePresence for exit animations and
 * React state for the filter selections.
 */
const FilterDrawerWrapper = ({
  initialState = INITIAL_FILTERS,
}: {
  initialState?: FilterState;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialState);

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-brand-navy p-6'>
      <div className='text-center text-white'>
        <h2 className='mb-4 text-xl font-bold'>Underlying Page Content</h2>
        <p className='mb-6 text-sm text-white/60'>
          This represents the timeline or match list behind the drawer.
        </p>
        <Button
          onClick={() => setIsOpen(true)}
          className='bg-brand-primary text-brand-navy'
        >
          Open Filter Drawer
        </Button>
      </div>

      {/* The AnimatePresence wrapper is required for the exit animations to fire */}
      <AnimatePresence>
        {isOpen && (
          <FilterDrawer
            onClose={() => setIsOpen(false)}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const Default: Story = {
  render: () => <FilterDrawerWrapper />,
};

export const WithActiveFilters: Story = {
  render: () => (
    <FilterDrawerWrapper
      initialState={{
        homeAway: 'home',
        urgency: ['conflict', 'tbd'],
        timeOfDay: ['morning', 'afternoon'],
        matchState: 'upcoming',
      }}
    />
  ),
};

export const ClosedByDefault: Story = {
  render: () => {
    // A slightly modified wrapper just for demonstrating the open action
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

    return (
      <div className='flex h-screen flex-col items-center justify-center bg-brand-navy p-6'>
        <Button
          onClick={() => setIsOpen(true)}
          className='bg-white text-brand-navy'
        >
          Click to Open Filter Drawer
        </Button>

        <AnimatePresence>
          {isOpen && (
            <FilterDrawer
              onClose={() => setIsOpen(false)}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
};
