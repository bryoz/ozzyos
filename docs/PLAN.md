# OzzyOS Design System — Plan

## Context
`bryoz/ozzyos` is empty. Goal: one design system serving (a) client marketing/blog sites (mostly WordPress today) and (b) SaaS apps, with per-client branding. Requirements: Storybook + Chromatic, Style Dictionary with two-way Figma token/Variable sync, Figma components for design work, npm distribution.

Decisions taken (from Q&A):
- **Lit web components** — framework-agnostic, so one component set works in WordPress, plain HTML and React SaaS.
- **Figma Professional** → no REST Variables write API and no Code Connect. Sync goes through a small custom Figma plugin (Plugin Variables API works on Pro).
- **Multi-brand themes** — core system + per-client brand token sets, light/dark modes.

## Recommendations (where you asked for advice)
1. **Distribution: npm *and* CDN.** Scoped packages `@ozzyos/*` on npm (public, or GitHub Packages if private). Every release also serves a prebuilt ESM bundle + CSS via jsDelivr, so WordPress/Webflow sites need no build step. Versioning via Changesets.
2. **WordPress stays the marketing/blog platform** (non-technical clients need its editor). The WordPress deliverable is a **block theme** generated from tokens — `theme.json` + block styles + block patterns — so clients edit with core blocks and stay on-brand. Keep the theme in Git (files, not DB) so Claude can work on it effectively.
3. **Token sync: free path first.** Tokens Studio's free tier syncs JSON to GitHub but **Figma Variables sync is a paid feature** (~€39–49/user/month). Instead build a small private Figma plugin (Plugin Variables API works on Pro) that imports/exports DTCG JSON ↔ Variable collections/modes. ~300–500 lines; runs as a local development plugin, no publishing or fees.
4. **Don't make everything a web component.** Typography, prose (blog body), layout and simple elements are **light-DOM CSS** (classes + tokens) — better for SEO, WordPress editor content, and no-JS rendering. Lit components are reserved for interactive/encapsulated UI.

## Architecture
pnpm workspaces + Turborepo monorepo.

```
ozzyos/
  tokens/                     # source of truth, DTCG JSON (synced with Figma)
    core/  (primitives: color ramps, space, type scale, radius, motion)
    semantic/ (light.json, dark.json → color.bg.surface, text.muted …)
    brands/  (ozzy.json, client-x.json → overrides semantic + font/radius)
  packages/
    tokens/        @ozzyos/tokens      Style Dictionary v4 build
    css/           @ozzyos/css         reset, typography, .prose, layout utils, light-DOM element classes
    components/    @ozzyos/components  Lit components (+ custom-elements.json manifest)
    react/         @ozzyos/react       auto-generated React wrappers (@lit/react) for SaaS
    wordpress/     ozzyos-theme        block theme: generated theme.json, block styles, patterns, enqueues CSS + component bundle
  apps/
    storybook/     Storybook 9 (web-components-vite)
  figma/plugin/    private plugin: DTCG JSON ↔ Figma Variables (import/export)
  .changeset/  .github/workflows/
```

### Token pipeline
- Format: **W3C DTCG** (`$value`, `$type`) — native to Style Dictionary v4 and maps cleanly to Figma Variables.
- Three tiers: **core → semantic → component** (e.g. `button.bg.primary` → `color.action.primary` → `blue.600`). Components consume only semantic/component tokens.
- Theming: brand × mode resolved at build to CSS scopes: `:root[data-brand="client-x"][data-theme="dark"] { … }`. Custom properties pierce shadow DOM, so Lit components theme automatically.
- Style Dictionary outputs:
  - CSS custom properties (per brand/mode) + `tokens.css` all-in-one
  - JS/TS ESM constants + `.d.ts`
  - JSON (flattened) for tooling
  - **WordPress `theme.json`** (palette, font sizes, spacing presets mapped to `--wp--preset--*`) via custom format
  - Optional Tailwind v4 `@theme` CSS for projects that use Tailwind
- Figma ↔ code loop (custom plugin):
  - Figma → code: plugin exports Variables as DTCG JSON → commit to a branch (manual paste/download first; optional later: plugin commits via GitHub API with a personal token) → PR → CI builds, Chromatic diff → merge → release.
  - Code → Figma: plugin imports `tokens/*.json` (from file or raw GitHub URL) and creates/updates collections and modes (Core; Semantic Light/Dark; Brand per client).
  - Pro plan caveat: Professional limits the number of modes per collection (verify current limit; historically 10) — fine for light/dark, constrains how many brands share one collection. Mitigation: brands as separate library files or swap brand JSON per client file.
- Lint: token schema validation + naming rules + WCAG contrast checks for every brand×mode pair in CI (fail the build on AA failures for text pairs).

### Components (Lit)
- Conventions: `oz-` prefix; shadow DOM; `::part` + CSS custom props for styling hooks; `ElementInternals` for form participation; slots for content; `custom-elements.json` generated (drives Storybook docs, React wrappers, editor autocomplete).
- Accessibility baseline WCAG 2.2 AA: keyboard, focus-visible, ARIA patterns per APG, reduced motion.
- SSR: `@lit-labs/ssr` declarative shadow DOM for Next (SaaS, if needed); WordPress uses client-side upgrade with light-DOM fallback content.
- WordPress usage: most marketing UI is core blocks styled by `theme.json`/block styles (no JS). Interactive components (accordion, tabs, dialog, nav) are exposed as a few custom blocks whose saved HTML is the `<oz-*>` element with slotted light-DOM content.

**Inventory (by phase)**
| Tier | Marketing/blog | SaaS |
|---|---|---|
| CSS foundation (P1) | typography, `.prose`, container/grid/stack, link, image/figure, button styles | same |
| Core components (P2) | button, icon, badge, card, accordion, tabs, nav/menu, dialog, alert | input, textarea, select, checkbox, radio, switch, field (label/help/error), tooltip, toast |
| Patterns (P3) | hero, feature grid, CTA, testimonial, pricing, footer, post list/card, author, TOC | data table, pagination, dropdown menu, combobox, sidebar/app shell, empty state, skeleton |

### Storybook + Chromatic
- Storybook 9 `@storybook/web-components-vite`; autodocs from the custom-elements manifest; addons: a11y, themes (brand + mode toolbar), `@storybook/addon-designs` (embed Figma frames per story), Vitest addon for interaction tests.
- Token docs pages: colour/type/space/radius rendered from built JSON.
- Chromatic in GitHub Actions: TurboSnap, **modes** (brand × light/dark), UI Review as design sign-off. Storybook published by Chromatic = living docs site.
- Snapshot budget (free tier = 5,000/month, testing pauses when exhausted): run Chromatic only on PRs touching `packages/` or `tokens/` (path filter) plus main; default modes = house brand light+dark only, full brand × viewport matrix on a `visual-full` label. Rough maths: 40 components × 4 stories × 2 modes = 320 snapshots per full build; TurboSnap typically cuts PR builds to a fraction of that.

### Figma components
- Figma library file built from the same tokens: Variables (collections: Core, Semantic with Light/Dark modes, Brand modes) and components whose props mirror code props (variant names identical to attribute values).
- Build it using the connected **Figma MCP** (`figma-generate-library` workflow) from the Storybook/component source, then designers refine. Keeps names and variants aligned by construction.
- Code Connect requires Organization/Enterprise — deferred. Interim: Storybook ↔ Figma links via addon-designs, and a parity checklist (component/variant names) checked in review.

### CI/CD (GitHub Actions)
- PR: install → lint (ESLint, Stylelint, token lint/contrast) → typecheck → build (turbo) → unit/interaction tests (Vitest browser mode) → Chromatic.
- Main: Changesets release PR → publish to npm → CDN available automatically via jsDelivr.

## Phases & outcomes

**Phase 0 — Foundations (week 1)**
Monorepo, tooling, CI skeleton, Changesets, Storybook boots, Chromatic project linked.
*Outcome:* empty-but-green pipeline; publishing a dummy `0.0.x` to npm works.

**Phase 1 — Tokens + CSS foundation (weeks 2–3)**
DTCG token sets (core, semantic light/dark, 2 brands: house + one real client), Style Dictionary build for CSS/JS/theme.json, `@ozzyos/css` typography/prose/layout, Figma Variables plugin v1 (import + export).
*Outcomes:* change a colour in Figma → export → PR → Chromatic diff → release, round trip under 15 min; brand switch is one attribute; contrast CI passes for every brand×mode.

**Phase 1b — WordPress block theme (weeks 3–4)** *(moved earlier: this is where most client work lives)*
Generated `theme.json`, block styles for core blocks, header/footer/post patterns, `.prose` for post content, editor styles matching front end.
*Outcomes:* a non-technical editor can build a landing page and blog post from patterns without leaving the brand; new client = new brand JSON + rebuild.

**Phase 2 — Core components (weeks 4–7)**
P2 inventory in Lit with stories, docs, a11y and interaction tests; React wrappers; Figma component library v1 matching code variants.
*Outcomes:* each component has ≥1 story per variant/state, 0 axe violations, keyboard tests, Chromatic baselines; Figma and code variant names match 1:1.

**Phase 3 — Patterns + integrations (weeks 8–11)**
Marketing and SaaS patterns; custom WP blocks wrapping interactive components; React/Next SaaS usage example.
*Outcomes:* Lighthouse ≥90 performance / ≥95 accessibility on the WP theme demo; WP theme passes Theme Check; SaaS example consumes `@ozzyos/react` with typed props.

**Phase 4 — Hardening (ongoing)**
Docs (usage, contribution, token naming), deprecation policy, bundle-size budgets (per-component entry points, `@ozzyos/components/button.js`), plugin auto-commit to GitHub, Code Connect only if the Figma plan is ever upgraded.
*Outcomes:* semver releases with changelogs; per-component JS < 10 kB gz; documented process for onboarding a new client brand in < 1 day.

## Definition of done (system-level)
- One token source drives Figma Variables, CSS, JS, theme.json — no hand-maintained duplicates.
- Every component: story, docs, a11y test, visual baseline, Figma counterpart.
- Install paths documented and tested: `npm i @ozzyos/components`, CDN `<script type="module">`, WordPress block theme.
- Adding a brand = new `brands/<client>.json` + Figma mode, no component changes.

## Verification
- `pnpm build` produces `packages/tokens/dist/{css,js,json,wordpress}`; snapshot test on outputs.
- `pnpm storybook` renders all stories across brand/mode toolbar; `pnpm test` runs Vitest browser + axe.
- Chromatic build on PR shows mode matrix; deliberately changing a token surfaces expected diffs.
- Round-trip test: edit a Variable in Figma, export via plugin, confirm PR + rebuilt CSS; edit JSON, import in Figma, confirm Variable updates.
- Run the WP theme in `wp-env` (Docker) locally/CI; verify editor and front end match, and render with JS disabled (light-DOM fallback) and enabled.

## Costs (hobby budget)
| Item | Cost | Notes |
|---|---|---|
| Figma Professional (1 Full seat) | ~$16/mo annual ($192/yr) or $20/mo monthly | Assumed already paid. Variables + plugin API work on Pro. |
| Figma variables sync plugin | $0 | Custom private plugin. Tokens Studio paid tier (~€39–49/user/mo, ~€470–590/yr) **not needed**. |
| Tokens Studio free | $0 | Optional; free tier lacks Variables sync, so low value here. |
| Chromatic Free | $0 | 5,000 snapshots/mo, Chrome only; pauses at limit. Next tier ~$149–179/mo — avoid via budget rules above. |
| Storybook hosting | $0 | Via Chromatic, or GitHub Pages. |
| GitHub repo + Actions | $0 | Public repo: unlimited Actions minutes. Private: 2,000 min/mo free (enough for this). |
| npm registry | $0 | Public scoped packages free. Private npm = $7/user/mo — use GitHub Packages (free within limits) if you want private. |
| CDN (jsDelivr/unpkg) | $0 | Serves from public npm automatically. Private packages → self-host bundle in the WP theme instead. |
| wp-env / local WP | $0 | Docker. |
| Domain for docs (optional) | ~$12/yr | Not needed; Chromatic URL works. |
| **Total new spend** | **$0/mo** (Figma already owned) | Worst realistic: $0 + optional domain. |

Decision for you: **public vs private repo/packages**. Public = everything free incl. CDN; private = still ~free, but no public CDN and Actions minutes capped.

## Critical review
**Pros**
- Single token source → Figma, CSS, JS, `theme.json`: big time saver once each client brand is a JSON file.
- Web components work in WordPress, plain HTML and React without per-framework rewrites.
- Zero recurring cost beyond Figma; all tooling is mainstream and well documented (good for Claude-assisted work).
- Chromatic + Storybook gives visual regression and a shareable client review link for free.

**Cons / risks**
- **Scope is large for a hobby project.** Monorepo + Lit + React wrappers + WP theme + Figma plugin + Figma library is several months of evenings. Mitigation: phases are ordered by value; Phases 0–1b alone deliver usable client sites. Treat Phase 3 SaaS patterns as on-demand.
- **Lit vs WordPress mismatch.** WordPress clients edit with blocks; web components don't appear as editable blocks without per-component block code. Most marketing value will come from `theme.json` + block styles, not Lit. Expect Lit to pay off mainly in SaaS.
- **Lit vs SaaS (React) friction.** React wrappers work, but form libraries, SSR/hydration and devtools are rougher than native React components. If SaaS becomes the main use, a React-native library (e.g. on Radix/React Aria) would be faster to build and nicer to use.
- **Shadow DOM trade-offs:** global CSS can't reach inside; clients/devs must use tokens, `::part` and slots. Good for consistency, annoying for one-off client tweaks.
- **Figma sync is homemade.** No Tokens Studio means maintaining a plugin; Figma API changes are on you. Kept small (JSON ↔ Variables only) to limit this.
- **No Code Connect on Pro**, so Figma ↔ code component parity is manual (naming checklist).
- **Chromatic free cap** can silently pause tests in a busy month; budget rules above are required, not optional.
- **Figma component library is double maintenance.** Every component exists twice. Keep the Figma library to foundations + core components; skip Figma versions of complex SaaS patterns unless designing with them.
- **Multi-brand × Pro mode limits** may force one Figma file per client brand.

**What I'd cut if time is short:** React wrappers (until a SaaS needs them), Phase 3 SaaS patterns, plugin auto-commit, viewport modes in Chromatic.

