import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';

// Optional: point at a preinstalled Chromium (e.g. sandboxes) instead of Playwright's download.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const dirname = path.dirname(new URL(import.meta.url).pathname);

// Every story is rendered in Chromium and checked with axe (a11y.test = 'error').
export default defineConfig({
  plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
  esbuild: { jsx: 'automatic' },
  // Pre-bundle up front so Vite doesn't re-optimise mid-run (causes "failed to find the runner").
  optimizeDeps: { include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', '@ozzyos/react > react-aria-components', '@storybook/react-vite', '@storybook/addon-a11y/preview', 'storybook/test'] },
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: executablePath ? { executablePath } : {} }),
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['.storybook/vitest.setup.js'],
  },
});
