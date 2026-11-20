import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast } from '../src/contrast.js';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('core primitives are emitted once at :root', () => {
  const css = read('css/core.css');
  assert.match(css, /:root \{/);
  assert.match(css, /--oz-color-blue-600: #2563eb;/);
});

test('default brand light theme applies at :root', () => {
  const css = read('css/themes/ozzy-light.css');
  assert.match(css, /:root, \[data-brand="ozzy"\] \{/);
  assert.match(css, /--oz-color-action-primary: #2563eb;/);
});

test('client brand overrides semantic tokens', () => {
  const css = read('css/themes/example-client-light.css');
  assert.match(css, /--oz-color-action-primary: #0f766e;/);
  assert.doesNotMatch(css, /--oz-color-blue-600/, 'core primitives must not leak into theme scopes');
});

test('contrast helper matches known values', () => {
  assert.equal(contrast('#000000', '#ffffff').toFixed(0), '21');
});
