# OzzyOS

Multi-brand design system for client marketing sites and SaaS apps.

- **Plan, accessibility strategy, costs and trade-offs:** [`docs/PLAN.md`](docs/PLAN.md)
- **Tokens:** `tokens/` — W3C DTCG JSON (core → semantic → brand), built with Style Dictionary
- **Packages:** `@ozzyos/tokens`, `@ozzyos/css`, `@ozzyos/react`
- **Docs / visual tests:** Storybook (`apps/storybook`) published via Chromatic

## Develop

```sh
pnpm install
pnpm lint         # ESLint (jsx-a11y strict) + Stylelint (focus-outline guard)
pnpm build        # tokens (+ WCAG contrast gate) → css → react → storybook
pnpm typecheck
pnpm test         # unit + keyboard tests, axe on every story in Chromium
pnpm storybook    # http://localhost:6006 — use the Brand / Mode toolbar
```

First run of story tests locally may need `pnpm --filter @ozzyos/storybook exec playwright install chromium`.

## Use in a React app

```sh
npm i @ozzyos/react @ozzyos/css
```

```tsx
import '@ozzyos/css';
import { Button } from '@ozzyos/react';

// <html data-brand="ozzy" data-theme="light">
<Button variant="secondary" onPress={save}>Save</Button>
<Button href="/docs">Read the docs</Button>
```

## Use the styles without React

```html
<html data-brand="ozzy" data-theme="light">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ozzyos/css/dist/ozzyos.css" />
  <article class="oz-prose">…</article>
  <a class="oz-button" href="/contact">Get in touch</a>
</html>
```

## Add a client brand

1. Copy `tokens/brands/example-client.json` → `tokens/brands/<client>.json`, change the aliases.
2. `pnpm build`: the contrast gate fails the build if the brand breaks WCAG AA.
3. Add the brand to the Storybook toolbar list in `apps/storybook/.storybook/preview.jsx`.

## Releasing

Add a changeset (`pnpm changeset`) in your PR. On merge, the Release workflow opens a version PR; merging that publishes to npm via trusted publishing (OIDC, with provenance). The only repository secret needed is `CHROMATIC_PROJECT_TOKEN`.
