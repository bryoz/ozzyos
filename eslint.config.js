import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/storybook-static/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  // Accessibility: strict JSX a11y rules on components and stories.
  {
    files: ['**/*.{jsx,tsx}'],
    ...jsxA11y.flatConfigs.strict,
    plugins: { 'jsx-a11y': jsxA11y, 'react-hooks': reactHooks },
    rules: { ...jsxA11y.flatConfigs.strict.rules, ...reactHooks.configs.recommended.rules },
  }
);
