/**
 * WCAG contrast gate: every brand × mode must meet AA for the pairs below.
 * Exits non-zero on failure so CI blocks the merge.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DIST, MODES, brands } from './config.js';

const PAIRS = [
  // [foreground, background, minimum ratio]
  ['color.text.default', 'color.bg.default', 4.5],
  ['color.text.muted', 'color.bg.default', 4.5],
  ['color.text.muted', 'color.bg.subtle', 4.5],
  ['color.text.link', 'color.bg.default', 4.5],
  ['color.action.on-primary', 'color.action.primary', 4.5],
  ['color.action.on-primary', 'color.action.primary-hover', 4.5],
  ['color.status.danger', 'color.bg.default', 4.5],
  ['color.border.strong', 'color.bg.default', 3],
  ['color.focus.ring', 'color.bg.default', 3],
];

const get = (obj, p) => p.split('.').reduce((o, k) => o?.[k], obj);

export function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let failures = 0;
  for (const brand of brands()) {
    for (const mode of MODES) {
      const tokens = JSON.parse(readFileSync(path.join(DIST, 'json', `${brand}-${mode}.json`), 'utf8'));
      for (const [fg, bg, min] of PAIRS) {
        const ratio = contrast(get(tokens, fg), get(tokens, bg));
        if (ratio < min) {
          failures++;
          console.error(`✗ ${brand}/${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)} (needs ${min})`);
        }
      }
    }
  }
  if (failures) {
    console.error(`${failures} contrast failure(s)`);
    process.exit(1);
  }
  console.log(`Contrast OK: ${PAIRS.length} pairs × ${brands().length} brands × ${MODES.length} modes`);
}
