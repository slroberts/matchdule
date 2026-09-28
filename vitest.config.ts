import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Projects separate logic tests from Storybook tests
    projects: [
      // 1. Storybook (browser)
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
      // 2. Unit (Node) — pure logic: lib/**, hooks/**
      {
        test: {
          name: 'unit',
          include: ['**/*.test.ts'],
          exclude: ['node_modules/**', '.next/**', 'storybook-static/**'],
          environment: 'node', // no browser needed for logic — much faster
        },
        resolve: {
          alias: {
            // Same mapping as tsconfig "paths": "@/*" → "./*" (repo root — there is no src/)
            '@': dirname,
          },
        },
      },
    ],
  },
});
