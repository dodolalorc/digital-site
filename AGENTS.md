# Navfolio Agent Guide

Navfolio is an Astro-first personal blog, digital garden, and AI-native editorial space. The product direction is content-first: calm reading, lightweight interaction, notebook-like atmosphere, and implementation-friendly structure.

The interface should feel:

- soft but structured
- expressive but quiet
- dynamic but restrained
- lightweight like GitHub
- readable like a notebook
- personal and editorial, not commercial

Avoid:

- generic AI-generated layouts
- SaaS landing page patterns
- heavy shadows or strong neumorphism
- excessive gradients and decorative noise
- oversized animations or restless motion
- inconsistent spacing, color, and typography systems

## Repository Sources of Truth

Agent guidance lives in `.agents/`.

```txt
.agents/
├─ skills/
├─ plans/
├─ reviewers/
└─ workflows/
```

Use these folders before making code changes:

- `.agents/workflows/` defines how to work.
- `.agents/plans/` defines product behavior and feature requirements when present.
- `.agents/skills/` defines visual language, typography, surface treatment, and motion.
- `.agents/reviewers/` defines final self-review standards.

If a matching plan does not exist, do not block. Infer the smallest reasonable behavior from the user request and existing code, then keep the implementation narrow.

## Required Agent Flow

Before coding:

1. Identify the task type.
2. Read the matching workflow in `.agents/workflows/`.
3. Read related plans in `.agents/plans/` if present.
4. Read only the relevant visual skills in `.agents/skills/`.
5. Inspect existing routes, layouts, components, utilities, styles, and content sources.
6. Implement the smallest complete change.
7. Run the relevant reviewer checklists from `.agents/reviewers/`.
8. Verify with Bun commands.
9. Summarize what changed and what was verified.

Do not jump straight into coding for visual or product changes. First understand the local pattern and the intended behavior.

## Workflow Selection

Use these workflows as the primary operating instructions:

- `.agents/workflows/implement-feature.md` for new pages, components, content behavior, interactions, or configuration.
- `.agents/workflows/fix-bug.md` for broken behavior, regressions, rendering issues, routing problems, CSS bugs, or build failures.
- `.agents/workflows/redesign-page.md` for visual redesign, layout improvements, hierarchy, motion, or responsive polish.
- `.agents/workflows/refactor-component.md` for restructuring code while preserving behavior.
- `.agents/workflows/review-before-submit.md` before final response, commit, or PR.

When a task spans multiple categories, follow the workflow for the primary risk first, then apply `review-before-submit.md`.

## Plans Usage

`.agents/plans/` is for product logic and behavior contracts:

- page responsibilities
- feature requirements
- interaction rules
- state behavior
- content model expectations
- accepted constraints and non-goals

When implementing from a plan:

- Treat the plan as the behavioral source of truth.
- Prefer code that directly expresses the plan instead of adding broad abstractions.
- If the plan conflicts with existing code, preserve existing behavior unless the user request clearly asks to change it.
- If the plan is missing or incomplete, make a small implementation assumption and state it in the final response when relevant.

## Skills Usage

Use only the skills that match the change:

- `quietfolio` for calm editorial pages, long-form reading, layout rhythm, restrained color, and subtle motion.
- `github-soft-surface` for cards, borders, surfaces, quiet hover states, and GitHub-like grouping.
- `blog-visual-style` for typography, Maple Mono, LXGW WenKai, metadata, code text, and article reading.

Skills are not decorative inspiration. They are implementation constraints. Reuse their rules through CSS variables, existing components, and local layout patterns.

## Reviewer Usage

Use reviewers as final checklists:

- `ai-drift-review.md` for avoiding generic AI/template output.
- `anti-saas-review.md` for avoiding product-marketing tone.
- `article-page-review.md` for article reading pages and TOC.
- `homepage-review.md` for homepage structure and atmosphere.
- `editorial-review.md` for writing-first flow.
- `typography-review.md` for line length, hierarchy, and rhythm.
- `spacing-review.md` for whitespace consistency.
- `surface-review.md` for borders, cards, and shadows.
- `color-review.md` for muted palette discipline.
- `motion-review.md` for calm, low-amplitude motion.
- `mobile-review.md` for small-screen reading comfort.
- `visual-density-review.md` for low visual pressure.

Apply the reviewers that match the touched surface. Do not mechanically run every checklist for every tiny code change.

## Astro and Code Conventions

This project is Astro-first.

Prefer:

- Astro components for UI composition
- TypeScript for utilities and client scripts
- content collections for structured content
- CSS variables and existing global tokens
- server-rendered markup by default
- partial hydration only where interactivity requires it
- small, composable components
- simple data flow over abstraction-heavy patterns

Avoid:

- introducing heavy frameworks without a clear need
- client-side hydration for static UI
- broad rewrites during focused tasks
- one-off style systems when tokens already exist
- hidden global behavior that is hard to trace

Important paths:

- `src/pages/` for routes
- `src/layouts/` for page shells
- `src/components/` for reusable UI
- `src/styles/global.css` for global styles and tokens
- `src/content.config.ts` and `src/content/` for content collections
- `src/utils/` for shared behavior
- `src/data/site.ts` and `src/config/site.toml` for site data/config

## Visual Principles

Layout:

- Use clean grids and stable spacing rhythm.
- Keep desktop and mobile visually related.
- Avoid chaotic asymmetry.
- Preserve reading flow over decorative composition.

Cards and surfaces:

- Use subtle borders.
- Use shadows sparingly and lightly.
- Prefer soft separation over strong elevation.
- Avoid nested cards and heavy boxed sections.

Motion:

- Prefer opacity, subtle translate, and soft scale.
- Keep hover movement low-amplitude.
- Avoid bouncing, elastic movement, dramatic parallax, and flashy entrances.
- Use motion to clarify state, not to attract attention.

Typography:

- Article content is the visual center.
- Keep line length and line-height comfortable.
- Use stable heading rhythm.
- Avoid oversized headings inside compact UI.
- Use `blog-visual-style` rules when touching fonts or article typography.

## TOC and Reading Position

The article TOC is a reading-position indicator, not decoration.

Requirements:

- sync active state with article scroll position
- smoothly navigate when clicking TOC items
- update active heading in real time
- keep active state lightweight and calm
- use `IntersectionObserver`

Avoid:

- scroll polling
- scroll jank
- aggressive active indicators
- flashing transitions

## Performance Principles

Performance is part of the design quality.

Prefer:

- `IntersectionObserver` over scroll listeners
- transform/opacity animations over layout-triggering animation
- lightweight DOM structures
- minimal re-rendering
- minimal client hydration
- simple utility functions over dependency additions

Avoid:

- layout thrashing
- expensive scroll calculations
- oversized component trees
- unnecessary observers
- dependency additions for small local behavior

## Bun Commands

Use Bun for this repository. Do not write npm, pnpm, or yarn commands unless explicitly requested.

Common commands:

```bash
bun install
bun run dev
bun run build
bun run preview
bun run format
bun run format:check
```

Verification guidance:

- Run `bun install` only when dependencies changed or are missing.
- Run `bun run build` after meaningful code, route, content schema, or Astro config changes.
- Run `bun run format:check` before final review when formatting may have changed.
- Run `bun run dev` when manual browser verification is needed.

## Final Self-Check

Before finishing, confirm:

- The newest user request is answered.
- The relevant workflow was followed.
- Related plans were checked when available.
- Relevant skills and reviewers were applied.
- The UI remains calm, readable, and integrated.
- Mobile behavior is coherent.
- Motion is subtle and useful.
- Build/format checks were run when appropriate.
- Any unverified areas are stated honestly.

The best Navfolio change should feel memorable through restraint, not complexity.
