/**
 * Stories opt in with `parameters: { now: '2026-11-14T15:00:00-05:00' }` (New York time).
 * Everything that reads the clock (useMatchClock → VersusCard, rows, focus stack,
 * DataFreshness) then renders the same state every time — in Storybook AND in the
 * Vitest browser run.
 */
import MockDate from 'mockdate';
import type { Preview } from '@storybook/nextjs-vite';
import '../styles/globals.css'; // ← tokens + text styles; without this every story is unstyled

const preview: Preview = {
  // …keep your existing parameters/decorators…
  beforeEach: ({ parameters }) => {
    if (parameters.now) {
      MockDate.set(parameters.now as string);
      return () => MockDate.reset();
    }
  },
};

export default preview;
