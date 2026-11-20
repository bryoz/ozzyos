import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', 'button/index': 'src/button/index.tsx' },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // Components use hooks/events: mark output as client components for Next.js App Router.
  onSuccess: 'node scripts/use-client.mjs',
});
