# Navfolio Organization Repository Plan

Owner: the user owns the `navfolio` GitHub organization.

Organization URL: https://github.com/navfolio

This repository, `dodolalorc/astro-navfolio`, is the RFC staging repository for
the v1.0.0 refactor. The long-term package ecosystem should live under the
`navfolio` organization as focused repositories, following the Quartz-inspired
model: one recognizable product ecosystem with small package repositories that
can be versioned, reviewed, and maintained independently.

## Current Known Repositories

- `navfolio/docs`: documentation repository. This already exists and is used by
  the current project as the documentation source.
- `navfolio/mdx-components`: official Astro/MDX content component library. It
  now owns author-imported components such as friend links, friend circles,
  carousels, long images, Mermaid initialization, and zoomable images.
- `navfolio/friend-circle-sync`: framework-independent CLI and composite
  GitHub Action for synchronizing friend RSS/Atom feeds into static JSON.

## Target Official Package Repositories

Create these repositories only after the Phase 1 package boundary RFC is
accepted. Until then, keep design notes in `.agents/` and prototype code in the
current RFC branch.

| Repository                    | Package                        | Responsibility                                                                                           |
| ----------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `navfolio/core`               | `@navfolio/core`               | Astro integration factory, config orchestration, plugin registration, content pipeline coordination      |
| `navfolio/types`              | `@navfolio/types`              | Public TypeScript contracts for config, plugins, themes, content entries, navigation, and render context |
| `navfolio/utils`              | `@navfolio/utils`              | Shared pure helpers that are not tied to one feature plugin or theme                                     |
| `navfolio/theme-default`      | `@navfolio/theme-default`      | Default layouts, components, styles, theme-level slots, and visual defaults                              |
| `navfolio/plugin-blog`        | `@navfolio/plugin-blog`        | Blog content collection contract, article/archive/RSS behavior, Markdown/MDX-facing blog features        |
| `navfolio/plugin-vibe`        | `@navfolio/plugin-vibe`        | Vibe content feature and data contract                                                                   |
| `navfolio/plugin-projects`    | `@navfolio/plugin-projects`    | Project content feature and data contract                                                                |
| `navfolio/plugin-search`      | `@navfolio/plugin-search`      | Search indexing and runtime search integration, including Pagefind-oriented build behavior               |
| `navfolio/plugin-comments`    | `@navfolio/plugin-comments`    | Comment provider contracts and adapters                                                                  |
| `navfolio/plugin-mdx`         | `@navfolio/plugin-mdx`         | MDX integration helpers, MDX component contracts, remark/rehype defaults that are not blog-only          |
| `navfolio/mdx-components`     | `@navfolio/mdx-components`     | Optional author-facing Astro components imported directly from MDX; not a rendering pipeline plugin      |
| `navfolio/friend-circle-sync` | `@navfolio/friend-circle-sync` | CLI and GitHub Action that discovers RSS/Atom feeds and writes portable static friend-circle JSON        |
| `navfolio/plugin-math`        | `@navfolio/plugin-math`        | Math rendering integration and KaTeX/remark-math style configuration                                     |
| `navfolio/create-navfolio`    | `create-navfolio`              | Project scaffold, migration entry points, starter selection                                              |

## Dependency Direction

```text
create-navfolio
  -> @navfolio/core
  -> @navfolio/theme-default
  -> official plugin defaults

@navfolio/core
  -> @navfolio/types
  -> @navfolio/utils
  -> astro

@navfolio/plugin-*
  -> @navfolio/types
  -> @navfolio/utils
  -> astro

@navfolio/mdx-components
  -> astro peer dependency
  -> optional UI/runtime peer dependencies

@navfolio/friend-circle-sync
  -> no Astro or theme dependency
  -> JSON output consumed by any static-site runtime

@navfolio/theme-default
  -> @navfolio/types
  -> official plugin data contracts

@navfolio/types
  -> type-only public dependencies
```

## Repository Creation Rules

- Do not create a `navfolio/*` repository until its package boundary, public
  entry points, and first migration target are written down.
- Each package repository should start with a minimal README, package manifest,
  license, release policy, and compatibility note.
- Keep `@navfolio/core` independent from `@navfolio/theme-default`.
- Keep feature plugins independent from default theme components.
- Keep `@navfolio/mdx-components` separate from `@navfolio/plugin-markdown`:
  the latter configures the Markdown/MDX pipeline, while the former exports
  optional content blocks for authors to import.
- Keep the current Astro site buildable while code is staged and extracted.

## Open Decisions

- Whether the current RFC branch should first become a temporary monorepo before
  splitting code into the `navfolio/*` repositories.
- Whether official plugin repositories should use identical release automation
  or a shared template generated by `create-navfolio`.
- Whether documentation examples should import packages from published versions
  only, or allow local workspace links during pre-1.0 development.
