import StyleDictionary from 'style-dictionary';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DIST, MODES, brands, selectorFor, sourcesFor } from './config.js';

const isCore = (token) => token.filePath.includes(`${path.sep}core${path.sep}`);

const scopedCss = [];

for (const brand of brands()) {
  for (const mode of MODES) {
    const name = `${brand}-${mode}`;
    const platforms = {
      css: {
        transformGroup: 'css',
        prefix: 'oz',
        buildPath: `${DIST}/css/`,
        files: [
          // Theme-dependent tokens (semantic + brand), scoped to brand × mode selectors.
          {
            destination: `themes/${name}.css`,
            format: 'css/variables',
            filter: (t) => !isCore(t),
            options: { selector: selectorFor(brand, mode), outputReferences: false },
          },
        ],
      },
      js: {
        transformGroup: 'js',
        buildPath: `${DIST}/js/`,
        files: [
          { destination: `${name}.js`, format: 'javascript/es6' },
          { destination: `${name}.d.ts`, format: 'typescript/es6-declarations' },
        ],
      },
      json: {
        transformGroup: 'js',
        buildPath: `${DIST}/json/`,
        files: [{ destination: `${name}.json`, format: 'json/nested' }],
      },
    };

    // Core primitives are identical for every brand × mode: emit once.
    if (scopedCss.length === 0) {
      platforms.css.files.push({
        destination: 'core.css',
        format: 'css/variables',
        filter: isCore,
        options: { selector: ':root' },
      });
    }
    const sd = new StyleDictionary({ source: sourcesFor(brand, mode), platforms, log: { verbosity: 'silent' } });
    await sd.buildAllPlatforms();
    scopedCss.push(`themes/${name}.css`);
  }
}

// Single all-in-one stylesheet: core + every brand × mode scope.
const cssDir = path.join(DIST, 'css');
const bundle = ['core.css', ...scopedCss]
  .map((f) => readFileSync(path.join(cssDir, f), 'utf8'))
  .join('\n');
mkdirSync(cssDir, { recursive: true });
writeFileSync(path.join(cssDir, 'tokens.css'), bundle);

console.log(`Built tokens for ${brands().length} brand(s) × ${MODES.length} modes → ${path.relative(process.cwd(), DIST)}`);
