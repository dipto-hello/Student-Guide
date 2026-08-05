import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';

/**
 * Storybook is scoped to `client/src`.
 *
 * It builds against `.storybook/vite.config.ts` rather than the app's own
 * config — see that file for why the two are kept separate.
 */
const config: StorybookConfig = {
  stories: ['../client/src/**/*.stories.@(ts|tsx)'],

  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: path.resolve(import.meta.dirname, 'vite.config.ts'),
      },
    },
  },
};

export default config;
