# AGENT.md

This repository is preparing the Navfolio v1 refactor. Future AI coding work
should use `.agents/` as the coordination directory.

When this repository is opened from the Navfolio multi-repository workspace,
also read `../AGENT.md` and `../.agents/README.md`. They define the dependency,
documentation-submodule, delivery, and PR-review rules that apply across the
official plugin and page repositories. These local instructions add the v1
refactor-specific constraints below.

## Start Here

1. Read `.agents/README.md`.
2. Read `.agents/context/issue-68-summary.md`.
3. Read `.agents/context/quartz-reference.md`.
4. Read `.agents/context/navfolio-org-repositories.md`.
5. Read `.agents/plans/phase-one-deliverables.md`.
6. Read `.agents/skills/super-power-skill.md` for skill routing.
7. Pick the workflow in `.agents/workflows/` that matches the task.
8. Update `.agents/plans/` when architecture assumptions change.

## Current Branch Intent

The `v1` branch is the active refactor branch for moving Navfolio from a single
Astro theme repository toward a core framework plus plugin and page-module
ecosystem.

The target architecture follows issue #68:

- `@navfolio/core`
- `@navfolio/types`
- `@navfolio/utils`
- official `@navfolio/plugin-*` packages
- `@navfolio/theme-default`
- `create-navfolio`

Quartz is the reference collaboration model: a central product repository plus
focused community/official package repositories.

The user owns the `navfolio` GitHub organization. Future official repositories
for `@navfolio/core`, `@navfolio/types`, `@navfolio/utils`,
`@navfolio/theme-default`, official plugins, and `create-navfolio` should be
created there after their Phase 1 boundaries are accepted.

## Guardrails

- Keep the current site buildable while refactoring.
- Article content is sourced from the separate docs sub-repository mounted at
  `src/docs`. For content-aware local preview and build checks, prefer
  `bun run docs:dev` and `bun run docs:build`.
- Do not move UI and data contracts in the same step unless the plan says why.
- Keep core independent from the default theme.
- Prefer Astro Integration-compatible plugin APIs.
- Use `rg` to inspect imports before moving files.
- Use `grill-with-docs` before making broad RFC package-boundary decisions.
- Do not edit `src/docs` as part of core refactor work unless the task
  explicitly includes documentation content.

## Verification Defaults

- `bun run format:check`
- `bun run docs:build`

For local preview during refactor work, use `bun run docs:dev` so the app reads
article content from the docs sub-repository. Use the plain `bun run dev` or
`bun run build` path only when intentionally checking the starter/default
`src/content` mode.

The local pre-commit hook may require Python fonttools. On managed Python
environments, use the repository Vercel pattern: create a virtual environment
and put `.venv/bin` on `PATH`.
