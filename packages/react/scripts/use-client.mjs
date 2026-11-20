// esbuild drops module-level directives when bundling; re-add "use client" to every output module
// so Next.js App Router treats these components as client components.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : [];
  });

for (const file of walk('dist')) {
  const src = readFileSync(file, 'utf8');
  if (!src.startsWith('"use client"')) writeFileSync(file, `"use client";\n${src}`);
}
