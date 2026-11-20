# OzzyOS

Multi-brand design system for client marketing/blog sites (WordPress) and SaaS apps.

- **Plan, costs and trade-offs:** [`docs/PLAN.md`](docs/PLAN.md)
- **Tokens:** `tokens/` — W3C DTCG JSON (core → semantic → brand), built with Style Dictionary
- **Packages:** `@ozzyos/tokens`, `@ozzyos/css`, `@ozzyos/components` (Lit)
- **Docs / visual tests:** Storybook (`apps/storybook`) published via Chromatic

## Develop

```sh
pnpm install
pnpm build        # tokens (+ WCAG contrast gate) → css → components → storybook
pnpm test
pnpm storybook    # http://localhost:6006 — use the Brand / Mode toolbar
```

## Use in a site

```html
<html data-brand="ozzy" data-theme="light">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ozzyos/css/dist/ozzyos.css" />
  <script type="module" src="https://cdn.jsdelivr.net/npm/@ozzyos/components/+esm"></script>
  <article class="oz-prose">…</article>
  <oz-button href="/contact">Get in touch</oz-button>
</html>
```

or `npm i @ozzyos/css @ozzyos/components`. WordPress: use the generated
`@ozzyos/tokens/wordpress/<brand>.theme.json` (block theme lands in Phase 1b).


## Add a client brand

1. Copy `tokens/brands/example-client.json` → `tokens/brands/<client>.json`, change the aliases.
2. `pnpm build` — the contrast gate fails the build if the brand breaks WCAG AA.
3. Add the brand to the Storybook toolbar list in `apps/storybook/.storybook/preview.js`.

## Secrets to add in GitHub

- `CHROMATIC_PROJECT_TOKEN` — from chromatic.com (free plan)
- `NPM_TOKEN` — npm automation token for the `@ozzyos` scope
