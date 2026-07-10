# Navfolio AI Engineering Workspace

This directory is the shared workspace for AI-assisted development on the
Navfolio RFC refactor. It keeps planning material, repeatable workflows, and
task-specific skills close to the repository so future agents can continue the
work without rediscovering the architecture intent.

## Directory Map

- `plans/`: RFC plans, package boundaries, milestones, and migration strategy.
- `workflows/`: Repeatable development workflows for refactor tasks.
- `skills/`: Focused agent skills for alignment, architecture, extraction, and
  review.
- `context/`: External references and project-specific background.
- `checklists/`: Readiness and review checklists for RFC milestones.
- `templates/`: Templates for RFC notes, package proposals, and follow-up tasks.

## Operating Rules

- Keep this directory documentation-first. Do not place generated build output,
  secrets, dependency caches, or large artifacts here.
- Prefer small, dated documents that can be reviewed independently.
- Link decisions back to GitHub issues, PRs, and source files.
- Treat `AGENT.md` at the repository root as the entry point for future agents.
- Keep English identifiers for package names and commands, but use Chinese prose
  when describing Navfolio product intent and RFC decisions.
- Treat https://github.com/navfolio as the future home for official packages
  once Phase 1 boundaries are accepted.

## Phase 1 Memory

- `plans/phase-one-deliverables.md`: first-stage sequence and acceptance
  criteria for the RFC refactor.
- `context/navfolio-org-repositories.md`: target GitHub organization and
  repository layout for `@navfolio/*` packages.

## Useful Skills

- `skills/super-power-skill.md`: route a task to the right local skill and
  workflow before starting implementation.
- `skills/grill-with-docs.md`: evidence-backed alignment for RFC decisions.
- `skills/grill-me.md`: quick stress-test for a plan or design.
- `skills/architecture-rfc.md`: preserve the long-term core plus plugin
  direction.
- `skills/package-extraction.md`: guide code movement into package boundaries.
- `skills/plugin-contract-review.md`: review plugin API shape before it
  hardens.
