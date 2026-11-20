// Concatenate tokens + foundation layers into one distributable stylesheet (no build deps).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const tokens = readFileSync(require.resolve('@ozzyos/tokens/css'), 'utf8');
const layers = ['reset', 'base', 'layout', 'prose', 'button'];
const body = layers.map((l) => readFileSync(new URL(`../src/${l}.css`, import.meta.url), 'utf8')).join('\n');

mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
writeFileSync(
  new URL('../dist/ozzyos.css', import.meta.url),
  `@layer oz.tokens, oz.reset, oz.base, oz.layout, oz.components;\n@layer oz.tokens {\n${tokens}\n}\n${body}`
);
writeFileSync(new URL('../dist/foundation.css', import.meta.url), body);
console.log('Built @ozzyos/css');
