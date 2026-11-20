import '@ozzyos/css';

const BRANDS = ['ozzy', 'example-client'];

/** Applies brand + mode attributes to <html>, mirroring how sites consume the tokens. */
const withTheme = (Story, { globals }) => {
  const el = document.documentElement;
  el.dataset.brand = globals.brand ?? 'ozzy';
  el.dataset.theme = globals.theme ?? 'light';
  return <Story />;
};

/** @type {import('@storybook/react-vite').Preview} */
export default {
  decorators: [withTheme],
  globalTypes: {
    brand: { description: 'Client brand', toolbar: { title: 'Brand', icon: 'paintbrush', items: BRANDS, dynamicTitle: true } },
    theme: { description: 'Colour mode', toolbar: { title: 'Mode', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true } },
  },
  initialGlobals: { brand: 'ozzy', theme: 'light' },
  parameters: {
    // Fail story tests on any axe violation (runs in a real browser, so colour contrast is checked).
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    controls: { expanded: true },
    // Keep the default Chromatic matrix small to stay inside the free snapshot budget.
    chromatic: {
      modes: {
        light: { brand: 'ozzy', theme: 'light' },
        dark: { brand: 'ozzy', theme: 'dark' },
      },
    },
  },
  tags: ['autodocs'],
};
