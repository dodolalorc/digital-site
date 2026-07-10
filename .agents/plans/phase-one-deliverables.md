# Phase 1 Deliverables: Contracts Before Extraction

This plan captures the first concrete RFC refactor stage for Navfolio v1.0.0.
The goal is to make future package extraction boring: first define boundaries,
then map the current codebase, then extract the smallest contracts and runtime
surfaces that prove the design.

## Order Of Work

### 1. Package Boundary RFC

Write the package boundary RFC before moving implementation code.

Required content:

- Target repositories under https://github.com/navfolio.
- Package responsibilities for core, types, utils, default theme, official
  plugins, docs, and scaffold.
- Allowed dependency directions.
- What must remain private during the RFC.
- Compatibility promises for current Astro blog users.

Primary files to update:

- `.agents/plans/package-boundaries.md`
- `.agents/context/navfolio-org-repositories.md`
- `.agents/templates/package-proposal.md` when a repeated package proposal shape
  becomes clear.

### 2. Current Dependency Inventory

Map current source areas to future packages before code extraction.

Inventory targets:

- Astro config and integration lifecycle.
- Content collections and content loading helpers.
- Markdown, MDX, Mermaid, math, and TOC rendering.
- Blog routes, archive behavior, RSS, and metadata.
- Vibe and project feature routes.
- Search index generation and runtime search UI.
- Comment provider components and adapters.
- Layouts, cards, theme styles, and shared UI components.
- Build-time scripts and deployment assumptions.

Expected artifact:

- A table of `current file or module -> target package -> extraction risk`.

### 3. Public Contracts First

Design the type contracts before extracting runtime code.

Initial contract candidates:

- `NavfolioConfig`
- `NavfolioPlugin`
- `NavfolioTheme`
- `NavfolioContentEntry`
- `NavfolioNavigationItem`
- `NavfolioRenderContext`
- content collection descriptors
- plugin lifecycle hooks
- theme slot and component contracts

Success criteria:

- Contracts explain how blog, search, comments, MDX, math, and theme packages
  communicate without importing each other's internals.
- Contracts can be reviewed without moving page components.
- Type definitions do not depend on default theme implementation details.

### 4. Thin Core Prototype

Prototype the thinnest useful `@navfolio/core` shape.

Core should own:

- user config normalization
- plugin registration
- Astro integration factory
- shared build context
- content pipeline coordination

Core must not own:

- blog-specific pages
- default theme components
- feature plugin implementation details
- docs content

Success criteria:

- The prototype shows how an app author would install core.
- At least one feature plugin can register through the proposed API.
- The current site can still build through the existing path while the
  prototype is being evaluated.

### 5. First Official Plugin Prototype

Use `@navfolio/plugin-blog` as the first serious extraction target because it
touches the real Astro blog surface: content collections, Markdown/MDX,
frontmatter, article routes, archive data, RSS, TOC, Mermaid, and theme output.

Success criteria:

- The plugin API is forced to handle realistic content behavior.
- Blog-owned behavior does not leak into core.
- Theme-owned rendering remains replaceable.
- Existing users can understand the migration path.

### 6. Default Theme Boundary

Sketch `@navfolio/theme-default` after the core plus blog plugin prototype is
clear enough to know what data the theme consumes.

Success criteria:

- Theme depends on public contracts, not local source paths.
- Feature plugins do not import default theme components.
- Theme slots and override points are documented before publication.

## First Stage Done Means

- Package boundary RFC exists and names the `navfolio/*` repositories.
- Current dependency inventory is complete enough to pick extraction order.
- Public contracts draft exists for core, plugins, themes, and content.
- Thin core prototype proves the registration shape.
- Blog plugin prototype validates the most important content path.
- Default theme boundary is documented, even if implementation extraction waits.

## Non-goals For Phase 1

- Publishing npm packages.
- Creating all `navfolio/*` repositories.
- Migrating every feature plugin.
- Rewriting documentation site content.
- Forcing the current repository into a permanent monorepo before the boundary
  RFC is accepted.
