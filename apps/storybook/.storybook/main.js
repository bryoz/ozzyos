/** @type {import('@storybook/react-vite').StorybookConfig} */
export default {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)', '../../../packages/react/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Use the automatic JSX runtime everywhere (stories outside this app, .storybook/*.jsx).
  viteFinal: (config) => ({ ...config, esbuild: { ...config.esbuild, jsx: 'automatic' } }),
};
