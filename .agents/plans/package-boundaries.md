# Package Boundary Notes

Target organization: https://github.com/navfolio

The current repository is the RFC staging area. Long-term official packages
should live in focused repositories under the `navfolio` organization after
their boundaries are accepted.

## Boundary Rules

- Core must not import theme components.
- Types must not import Astro runtime values unless they are type-only imports.
- Plugins may depend on `@navfolio/types` and `@navfolio/utils`.
- Plugins should expose an Astro Integration and any user-facing schema helpers.
- `@navfolio/mdx-components` is not a plugin: it is an optional component
  package imported explicitly by MDX authors. It may use theme CSS variables,
  but must not import files from a consumer's `src/` directory.
- Theme may depend on plugin data contracts, but feature plugins should not
  depend on theme internals.
- Shared build tools belong in package templates or workspace scripts, not in
  feature packages.

## Proposed Dependency Direction

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

@navfolio/theme-default
  -> @navfolio/types
  -> official plugin data contracts

@navfolio/types
  -> type-only public dependencies
```

## Target Repository Names

- `navfolio/core` for `@navfolio/core`
- `navfolio/types` for `@navfolio/types`
- `navfolio/utils` for `@navfolio/utils`
- `navfolio/theme-default` for `@navfolio/theme-default`
- `navfolio/plugin-blog` for `@navfolio/plugin-blog`
- `navfolio/plugin-vibe` for `@navfolio/plugin-vibe`
- `navfolio/plugin-projects` for `@navfolio/plugin-projects`
- `navfolio/plugin-search` for `@navfolio/plugin-search`
- `navfolio/plugin-comments` for `@navfolio/plugin-comments`
- `navfolio/plugin-mdx` for `@navfolio/plugin-mdx`
- `navfolio/mdx-components` for `@navfolio/mdx-components`
- `navfolio/friend-circle-sync` for `@navfolio/friend-circle-sync`
- `navfolio/plugin-math` for `@navfolio/plugin-math`
- `navfolio/create-navfolio` for `create-navfolio`
- `navfolio/docs` for documentation, already known to exist

## Anti-patterns To Avoid

- Moving code into a package while keeping imports pointed at `src/*`.
- Letting core know about blog, vibe, projects, or comments by name.
- Letting plugin packages import Astro pages from the default theme.
- Publishing package APIs before migration examples prove them.
- Creating plugin hooks that duplicate Astro lifecycle hooks without a reason.
- Putting MDX authoring components into the Markdown rendering plugin.
- Making a theme component responsible for RSS crawling, cache policy, or CI
  orchestration. Those responsibilities belong to `friend-circle-sync`.
