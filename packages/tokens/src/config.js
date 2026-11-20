import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const TOKENS = path.join(ROOT, 'tokens');
export const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

/** Brand shown when no data-brand attribute is set. */
export const DEFAULT_BRAND = 'ozzy';
export const MODES = ['light', 'dark'];

export const brands = () =>
  readdirSync(path.join(TOKENS, 'brands'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort((a, b) => (a === DEFAULT_BRAND ? -1 : b === DEFAULT_BRAND ? 1 : a.localeCompare(b)));

export const sourcesFor = (brand, mode) => [
  path.join(TOKENS, 'core/*.json'),
  path.join(TOKENS, `brands/${brand}.json`),
  path.join(TOKENS, `semantic/${mode}.json`),
];

/** CSS selector(s) a brand × mode scope applies to. Nested scopes are supported. */
export const selectorFor = (brand, mode) => {
  const b = `[data-brand="${brand}"]`;
  const isDefault = brand === DEFAULT_BRAND;
  if (mode === 'light') return isDefault ? `:root, ${b}` : b;
  const sel = [`${b}[data-theme="dark"]`, `${b} [data-theme="dark"]`];
  if (isDefault) sel.unshift(':root[data-theme="dark"]', '[data-theme="dark"]:not([data-brand])');
  return sel.join(',\n');
};
