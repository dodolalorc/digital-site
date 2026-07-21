# `@navfolio/theme-default` Migration

## Decision

The visual system moves to `navfolio/theme-default` as `@navfolio/theme-default`.
`@navfolio/core` owns only the package-addressable theme manifest contract; it
must never import the default theme's Astro components or CSS. The default
theme has a one-way runtime dependency on core for that contract.

## First Slice: Palette Tokens

The first transferable surface is the palette token file:

| Legacy owner              | New owner                                     | Compatibility rule                                                                |
| ------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/styles/palettes.css` | `@navfolio/theme-default/styles/palettes.css` | Keep the legacy file until the published package is installed in this repository. |

The two files must remain byte-for-byte equivalent while both exist. The first
slice is installed from `@navfolio/theme-default`; `src/styles/global.css` now
imports the package subpath and the local copy is removed.

## Subsequent Slices

1. Base tokens and global CSS structure. The host retains only its font and
   KaTeX imports; the theme owns all visual rules.
2. `BaseHead`, `Footer`, and base layout, behind package-addressable component
   entry points. The host adapters provide configuration, fallback image assets,
   navigation, and optional runtime controls through props and slots.
3. Blog layouts and presentational blog components. `BlogPost` is migrated as
   a slot-based shell; `BlogArticle` has moved its reading-page visual rules to
   the theme. The host keeps content data, navigation, image handling, Mermaid,
   comments, TOC, and footer composition.
4. Dashboard cards and widgets.

Content loading, page routes, Markdown pipeline configuration, search, and
comment providers remain in the host, core, or feature plugins. A theme may
consume their public data contracts but must not own them.

## Release and Host-Integration Gate

1. Build and release the core theme contract from `core`'s dedicated branch.
2. Build and release `@navfolio/theme-default` against that core version.
3. Refresh this repository's package dependency only after both releases are
   available.
4. Replace the local palette import, run `bun run format:check` and
   `bun run docs:build`, then remove the duplicated legacy stylesheet.

This order keeps the currently published `@navfolio/core` and the existing
Astro starter buildable throughout the migration.
