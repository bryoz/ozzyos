# OzzyOS Design System — Plan (v2: React)

## Context
One design system for (a) client marketing/blog sites and (b) **SaaS apps**, with per-client branding. WordPress integration is **out of scope** for this spec (to be addressed later). Requirements: Storybook + Chromatic, Style Dictionary with two-way Figma token/Variable sync, Figma components, npm distribution. Repo `bryoz/ozzyos` is **public**.

Built so far: pnpm/Turborepo monorepo, DTCG tokens (2 brands × light/dark), Style Dictionary → CSS/JS/JSON, WCAG contrast gate, `@ozzyos/css` foundation, `@ozzyos/react` `Button`, Storybook 10 (react-vite) with axe on every story, CI/Chromatic/Changesets workflows with npm trusted publishing.

**Changes in v2:** React replaces Lit as the component framework (SaaS developer experience: accessible primitives, form libraries, SSR). WordPress theme work and the `theme.json` token output are removed from scope.

Decisions:
- **React components** on React Aria Components; framework-free tokens + CSS remain usable by any site.
- **Figma Professional** → custom private plugin for DTCG ↔ Variables sync; no Code Connect.
- **Multi-brand themes** via `data-brand` / `data-theme` attributes.
- **Public npm + jsDelivr CDN**, Changesets, npm trusted publishing (OIDC).

## Core principle: CSS is the shared contract
Tokens and `@ozzyos/css` are framework-free. React components render documented class names (`.oz-button`, `.oz-accordion`…) and add behaviour; all visual styling lives in `@ozzyos/css`, one file per component. No CSS-in-JS. This keeps a future non-React integration (e.g. a CMS theme) possible without restyling anything.

## Architecture
```
ozzyos/
  tokens/                 DTCG JSON: core/, semantic/{light,dark}.json, brands/*.json
  packages/
    tokens/     @ozzyos/tokens   Style Dictionary build (CSS vars, JS, JSON)                   [done]
    css/        @ozzyos/css      reset, base, layout, prose, + per-component CSS             [partly done]
    react/      @ozzyos/react    React components on React Aria Components [Button done]
  apps/storybook/                Storybook 10 (react-vite)
  figma/plugin/                  private plugin: DTCG ↔ Figma Variables
```

### React components (`@ozzyos/react`)
- Built on **React Aria Components** (unstyled, accessible, keyboard/focus/ARIA handled; exposes state as `data-*` attributes that plain CSS can target, e.g. `.oz-button[data-pressed]`).
- `react`/`react-dom` as **peerDependencies** (>=18); ESM build with `tsup`, per-component entry points, `"use client"` banners for Next.js App Router.
- API conventions: `variant`, `size`, `className` passthrough, `ref` forwarding; names match Figma variant names 1:1.
- Server-rendering friendly by default (no window access at render).

### Token pipeline (unchanged, built)
Core → semantic → brand; CSS scopes `[data-brand][data-theme]`; contrast gate in build; Style Dictionary outputs CSS/JS/JSON. Figma plugin: export Variables → DTCG JSON → PR; import JSON → create/update collections & modes. Pro mode-count limits may require one Figma file per brand.

### Storybook + Chromatic
- Switch to `@storybook/react-vite`; keep brand/mode toolbar decorator, a11y addon (`test: 'error'`), Chromatic modes (house brand light+dark default; full matrix opt-in via `allModes`).
- Add `@storybook/addon-vitest` for interaction tests; `@storybook/addon-designs` for Figma frame embeds.
- Chromatic workflow stays path-filtered with TurboSnap to stay within 5,000 free snapshots/month.

### Figma components
Library built from tokens (Variables) + components with variant props mirroring React props; generated via Figma MCP from Storybook/source, refined by hand. Code Connect deferred (needs Organization plan). Limit Figma to foundations + core components.

### Inventory
| Tier | Marketing/blog | SaaS |
|---|---|---|
| CSS foundation | typography, prose, layout, button | same |
| Core | button, badge, card, alert, accordion, tabs, nav, dialog, disclosure | input, textarea, select, checkbox, radio, switch, field, tooltip, toast, menu |
| Patterns | hero, feature grid, CTA, testimonial, pricing, footer, post list, TOC | data table, pagination, combobox, app shell, empty state, skeleton |

## Accessibility testing
Target: **WCAG 2.2 AA** for every component and pattern. Automated tools catch roughly a third of issues, so the strategy layers automated gates (block merges) with a short manual checklist (blocks releases). All tooling is free.

### Layer 1 — Design time (tokens & Figma)
- **Contrast gate** (built: `packages/tokens/src/contrast.js`): every brand × mode fails the build below 4.5:1 text / 3:1 UI. Extend pairs as semantic tokens grow (status-on-subtle backgrounds, disabled is exempt but documented, focus ring vs every surface token, link vs surrounding text 3:1 when not underlined).
- **Figma**: designers use only Variables (no raw hex), so contrast-checked pairs are the only ones available. Annotate focus order, heading levels and accessible names on component specs.

### Layer 2 — Static analysis (every PR, CI `lint`)
- `eslint-plugin-jsx-a11y` (strict) on `@ozzyos/react` and Storybook.
- Stylelint: forbid `outline: none` without a `:focus-visible` replacement; `stylelint-a11y`-style rules for `prefers-reduced-motion` on animations.
- TypeScript: required `aria-label`/`children` unions so icon-only buttons can't compile without an accessible name.

### Layer 3 — Component tests (every PR, CI `test`)
- **axe on render**: Vitest + Testing Library + `vitest-axe` for each component state (default, disabled, invalid, open/closed).
- **Keyboard & focus behaviour** (Vitest browser mode or Storybook `play` functions via `@storybook/addon-vitest`), per APG pattern:
  - Tab order and no focus traps (except dialog, which must trap and **return focus** on close).
  - Arrow keys/Home/End for tabs, menus, radio groups; Escape closes dialog/menu/tooltip; Enter/Space activate.
  - Accessible name, role, and state (`aria-expanded`, `aria-selected`, `aria-invalid` + `aria-describedby` on errors) asserted via `getByRole`.
- **Storybook a11y addon** with `a11y: { test: 'error' }`: axe runs on **every story** in CI through the Vitest addon; violations fail the build. Run under both light and dark globals so dark-mode contrast is covered.

### Layer 4 — Visual / preference modes (Chromatic, budget-aware)
- Chromatic modes on core components only (opt-in to stay under 5,000 snapshots/mo): `forcedColors: 'active'` (Windows High Contrast), `prefersReducedMotion: 'reduce'`, 200% zoom via a narrow-viewport mode (320 CSS px ≈ 400% reflow).
- Stories for focus-visible state (`play` focuses the element) so focus-ring regressions show as visual diffs.

### Layer 5 — Manual checklist (per component before first release, per release for changed components)
- Screen readers: **VoiceOver + Safari** (macOS/iOS), **NVDA + Firefox/Chrome** (Windows; free). Verify name/role/state announcements and live-region toasts.
- Keyboard-only walkthrough; 200%/400% zoom reflow; Windows High Contrast; reduced motion; touch target ≥ 24×24 px (WCAG 2.5.8); focus not obscured by sticky headers (2.4.11).
- Results recorded in each component's docs page (Storybook MDX "Accessibility" section: keyboard map, ARIA notes, known limitations, last tested date/AT versions).

### Gates
| Gate | When | Blocks |
|---|---|---|
| Contrast, ESLint/Stylelint, axe unit, keyboard tests, Storybook a11y | every PR | merge |
| Chromatic preference modes | PRs touching core components | UI Review approval |
| Manual AT checklist | new/changed component | release (Changeset PR) |

### Component definition of done (a11y)
Uses semantic HTML/React Aria primitive; APG keyboard pattern implemented and tested; visible focus ≥ 3:1; accessible name required by types; states exposed via ARIA; works in forced colors and reduced motion; zero axe violations in all stories/modes; docs page lists keyboard map and AT test results.

## Phases & outcomes
- **Phase 0 — Foundations** ✅ (pipeline green; secrets/npm setup pending on your side).
- **Phase 1 — Tokens + CSS + Figma plugin**: tokens ✅, CSS foundation ✅ partial, Figma plugin v1. *Outcome:* Figma ↔ JSON round trip < 15 min; brand switch = one attribute; contrast gate green.
- **Phase 2 — Core components**: React core inventory + shared CSS; Figma library v1. *Outcome:* each component has stories per variant/state, 0 axe violations, keyboard tests, Chromatic baselines.
- **Phase 3 — Patterns**: marketing and SaaS patterns in React, Next.js example app. *Outcome:* example app Lighthouse ≥90 perf / ≥95 a11y; it consumes `@ozzyos/react` with typed props.
- **Phase 4 — Hardening**: docs, deprecation policy, bundle budgets (per-component < 10 kB gz excl. React/React Aria), plugin auto-commit.

## Costs (unchanged)
New spend **$0/mo** beyond Figma Professional (~$16/mo annual). Chromatic free (5,000 snapshots/mo), GitHub Actions free (public repo), npm public + jsDelivr free, Tokens Studio paid tier avoided via custom plugin.

## Critical review (v2)
**Pros**
- Best-in-class SaaS DX: React Aria accessibility, form libraries, SSR/RSC compatibility, mainstream tooling.
- CSS-first contract keeps styling framework-independent, so a later CMS integration reuses tokens and CSS unchanged.
- Narrower scope (no WordPress) makes the hobby timeline realistic.

**Cons / risks**
- **Client marketing sites are not yet served** beyond tokens + CSS; the WordPress integration is deferred and will need behaviour re-implemented for interactive components (React won't run in a PHP theme).
- **No drop-in components for non-React sites** (only CSS via CDN).
- **React Aria is a sizeable dependency** for SaaS bundles; tree-shaken per component.
- Remaining risks from v1: hobby-scale scope, homemade Figma plugin, no Code Connect, Chromatic free cap, Figma/code double maintenance.

**Cut first if short on time:** SaaS patterns, Next example app, plugin auto-commit, full Chromatic brand matrix.

## Verification
- `pnpm build && pnpm test`: tokens + contrast gate, CSS, `@ozzyos/react` (Vitest + axe), Storybook build.
- Storybook (react-vite): Button stories render across brand/mode toolbar; a11y panel clean; screenshot check of ozzy/light and example-client/dark.
- A11y gates prove they bite: temporarily remove a Button's label → TS/ESLint fail; set a low-contrast token → contrast gate fails; add `outline: none` → Stylelint fails; story axe violation → `pnpm test` fails.
- `pnpm pack` `@ozzyos/react`, install into a scratch Next.js app, render `<Button>` server-side without errors.
- Release workflow dry run: `changeset status`; after merge, release PR publishes with provenance.
