# RFC Refactor Plan

Branch: `rfc-refactor`

Issue: https://github.com/dodolalorc/astro-navfolio/issues/68

## Goal

Prepare Navfolio for a v1.0.0 architecture where the current monolithic Astro
theme becomes a core framework plus a set of independently versioned plugins and
themes.

## Principles

- Keep the existing site working while boundaries are extracted.
- Prefer Astro Integration compatibility over a custom runtime framework.
- Make package boundaries explicit before moving code.
- Split by ownership and lifecycle, not by current folder names alone.
- Use the Quartz model as the reference for collaboration: core product repo
  plus focused community package repositories.
- Avoid locking user projects to the default theme.

## Phase 0: RFC Inventory

Deliverables:

- Map current source files to proposed packages.
- Identify shared types that must move before code extraction.
- Identify runtime behavior that must stay in `@navfolio/core`.
- Identify user-facing compatibility risks.
- Create spike notes for package manager, release, and migration decisions.

## Phase 1: Contracts And Workspace

Deliverables:

- First-stage delivery plan in `.agents/plans/phase-one-deliverables.md`.
- Target `navfolio/*` repository map in
  `.agents/context/navfolio-org-repositories.md`.
- `@navfolio/types` package with plugin and config interfaces.
- `@navfolio/core` package skeleton exposing an Astro integration factory.
- `@navfolio/utils` package skeleton for shared helpers.
- pnpm workspace or equivalent package graph proposal.
- Changesets release policy.
- Plugin template conventions.

Decision checkpoints:

- Confirm whether the current repository becomes a monorepo during the RFC or
  remains a staging repo before packages move to the `navfolio` organization.
- Confirm whether user config is loaded through Astro `integrations` only or
  through a Navfolio `plugins` array that compiles to Astro integrations.

## Phase 2: Feature Extraction

Candidate extraction order:

1. `@navfolio/plugin-math` and `@navfolio/plugin-mdx`, because they are smaller
   and mostly integration/config oriented.
2. `@navfolio/plugin-search`, because Pagefind has clear build-time behavior.
3. `@navfolio/plugin-comments`, because adapters are already isolated.
4. `@navfolio/plugin-blog`, `plugin-vibe`, and `plugin-projects`, after content
   collection contracts are stable.
5. `@navfolio/theme-default`, after content APIs stop depending on local
   component paths.

## Phase 3: Migration

Deliverables:

- `navfolio-migrate` or `create-navfolio` migration path.
- v0.x to v1.0.0 mapping table.
- Example project using core plus default plugins.
- Documentation for replacing the default theme.

## Phase 4: Ecosystem

Deliverables:

- Official plugin directory.
- Plugin authoring guide.
- Compatibility matrix for core and official plugins.
- Release policy and support window for v0.x.

## Initial Package Boundary Map

| Current Area                                                 | Target Package                                         |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| `astro.config.mjs`, config loading, lifecycle orchestration  | `@navfolio/core`                                       |
| config schema and plugin interfaces                          | `@navfolio/types`                                      |
| `src/utils/content-*`, dates, grouping, search helpers       | `@navfolio/utils` or feature plugin utilities          |
| `src/content.config.ts`, blog pages, RSS, archive components | `@navfolio/plugin-blog` plus `@navfolio/theme-default` |
| `src/pages/vibe.astro`, vibe utilities and content           | `@navfolio/plugin-vibe` plus theme surfaces            |
| `src/pages/projects/*`, project content                      | `@navfolio/plugin-projects` plus theme surfaces        |
| Pagefind configuration and search UI integration             | `@navfolio/plugin-search` plus theme search component  |
| comments components and adapters                             | `@navfolio/plugin-comments`                            |
| MDX components and remark/rehype enhancements                | `@navfolio/plugin-mdx`                                 |
| KaTeX and math rendering                                     | `@navfolio/plugin-math`                                |
| layouts, cards, visual styles, theme previews                | `@navfolio/theme-default`                              |
