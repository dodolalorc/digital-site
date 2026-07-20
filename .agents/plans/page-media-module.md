# Page Media Module Boundary

Date: 2026-07-20

`@navfolio/page-media` is an optional page module for a single media shelf of
books, films, series, albums, and podcasts. It owns the injected Astro route,
responsive anchor navigation, and media-card presentation. It consumes only
the host's stable `virtual:navfolio/page-runtime` surface.

The host owns the `media` Astro content collection and the `[config.pages.media]`
site configuration schema. This keeps the content contract available to Astro
at build time without making the page package depend on host-relative paths.

`@navfolio/pages` is the unified public entry point for `projectsModule()`,
`vibeModule()`, and `mediaModule()`. These modules remain optional: only
entries included in `navfolio.config.ts` contribute their route, collection,
navigation target, and content scaffold.

WeRead Sync remains a build-time metadata source for books. It does not become
a page dependency and does not own personal ratings or notes.
