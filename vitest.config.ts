import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // We use workspace-style projects to separate Logic from Storybook
    projects: [
      // 1. The Storybook Project (Existing)
      {
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      // 2. The Unit Test Project (New!)
      {
        test: {
          name: 'unit',
          include: ['**/*.test.ts'], // Only look in your helpers folder
          environment: 'node', // Logic doesn't need a browser, so this is 10x faster
        },
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
          },
        },
      },
    ],
  },
});
