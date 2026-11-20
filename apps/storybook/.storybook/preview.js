import { setCustomElementsManifest } from '@storybook/web-components-vite';
import manifest from '@ozzyos/components/custom-elements.json';
import '@ozzyos/css';
import '@ozzyos/components';

setCustomElementsManifest(manifest);

const BRANDS = ['ozzy', 'example-client'];

/** Applies brand + mode attributes to <html>, mirroring how sites consume the tokens. */
const withTheme = (story, { globals }) => {
  const el = document.documentElement;
  el.dataset.brand = globals.brand ?? 'ozzy';
  el.dataset.theme = globals.theme ?? 'light';
  return story();
};

/** @type {import('@storybook/web-components-vite').Preview} */
export default {
  decorators: [withTheme],
  globalTypes: {
    brand: { description: 'Client brand', toolbar: { title: 'Brand', icon: 'paintbrush', items: BRANDS, dynamicTitle: true } },
    theme: { description: 'Colour mode', toolbar: { title: 'Mode', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true } },
  },
  initialGlobals: { brand: 'ozzy', theme: 'light' },
  parameters: {
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    controls: { expanded: true },
    // Chromatic modes: keep the default matrix small to stay inside the free snapshot budget.
    chromatic: {
      modes: {
        light: { brand: 'ozzy', theme: 'light' },
        dark: { brand: 'ozzy', theme: 'dark' },
      },
    },
  },
  tags: ['autodocs'],
};
