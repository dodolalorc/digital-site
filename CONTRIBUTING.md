# Contributing to Navfolio

Languages: English | [简体中文](#简体中文)

Navfolio is an Astro starter for personal publishing, project display, lightweight notes, and optional page modules. Contributions should keep the template readable, modular, easy to configure, and consistent with the existing calm interface.

## Project Structure

- `astro-navfolio` is the main template repository.
- `src/docs` is a git submodule for the documentation/demo content repository.
- `@navfolio/plugin-markdown` owns Markdown and MDX rendering extensions.
- `@navfolio/pages` is the unified page-module entry.
- `@navfolio/page-projects` and `@navfolio/page-vibe` are built-in page modules.
- `@navfolio/page-template` is the reference package for custom page modules.

Keep changes in the package that owns the behavior. A Markdown syntax feature belongs in the Markdown plugin. A reusable page capability should be shaped as a page module. The main template should mostly wire configuration, content, routes, and visual integration together.

## Discuss First

Open an issue before starting any non-trivial PR. Please describe:

- which page, component, config field, content workflow, plugin, or page module will change;
- what real use case is blocked or improved;
- whether it changes routes, schemas, visual behavior, dependencies, generated content, or existing user config;
- how it should behave when the related page module or content source is disabled.

Typos, broken links, and small documentation fixes can go straight to a PR.

## Development Rules

- Keep one PR focused on one problem.
- Use Bun and the existing Astro, TypeScript, content collection, CSS token, and module patterns.
- Do not add dependencies, large refactors, route changes, or visual redesigns without issue agreement.
- Prefer configuration-driven behavior in `navfolio.config.ts` for advanced module/page behavior.
- Keep `src/config/site.toml` as the quick site/content styling entry, not a place for complex module logic.
- Update docs when behavior, configuration, scripts, page modules, or plugin usage changes.
- Include screenshots or short screen recordings for visible UI changes, including mobile when relevant.

## Content And Docs

The documentation site is mounted through the `src/docs` submodule. When docs content changes:

1. Commit and push the docs submodule first.
2. Update the submodule pointer in `astro-navfolio`.
3. Run `bun run docs:build` from the main repository.

Use demo content that explains Navfolio itself. Avoid long sample articles that distract from template usage unless they demonstrate a specific feature.

## Local Checks

```sh
bun install
bun run dev
bun run build
bun run format:check
```

For docs/demo content:

```sh
bun run docs:build
bun run docs:dev
```

Run `bun install` only when dependencies are missing or changed. For meaningful code, route, schema, config, plugin, or page-module changes, run `bun run build` before submitting.

## Review

Maintainers review for project fit, scope, build health, route safety, configuration clarity, reading comfort, mobile behavior, and maintenance cost. A PR may be closed if the idea is only suitable for a personal fork or if the implementation expands beyond the issue agreement.

---

# 简体中文

Navfolio 是一个基于 Astro 的个人发布、项目展示、轻量笔记和可选页面模块模板。贡献时请保持项目可读、模块化、易配置，并与现有安静克制的界面风格一致。

## 项目结构

- `astro-navfolio` 是博客模板主仓库。
- `src/docs` 是文档站和演示内容的 git 子仓库。
- `@navfolio/plugin-markdown` 负责 Markdown 和 MDX 渲染扩展。
- `@navfolio/pages` 是统一的页面模块入口。
- `@navfolio/page-projects` 和 `@navfolio/page-vibe` 是内置页面模块。
- `@navfolio/page-template` 是给自定义页面模块贡献者参考的模板包。

请把改动放在真正拥有该行为的包里。Markdown 语法能力应放在 Markdown 插件中。可复用的页面能力应按页面模块组织。主模板应主要负责配置、内容、路由和视觉整合。

## 先讨论

非微小改动请先开 issue，再开始写 PR。Issue 中请说明：

- 会改动哪个页面、组件、配置字段、内容工作流、插件或页面模块；
- 解决了什么真实使用问题；
- 是否会影响路由、schema、视觉行为、依赖、生成内容或既有用户配置；
- 当相关页面模块或内容源被禁用时应该如何表现。

错别字、失效链接和很小的文档修正可以直接提交 PR。

## 开发规则

- 一个 PR 只解决一个清晰的问题。
- 使用 Bun，并沿用现有 Astro、TypeScript、内容集合、CSS token 和模块写法。
- 未经 issue 确认，不要新增依赖、大范围重构、路由变更或视觉改版。
- 高级页面/模块行为优先放在 `navfolio.config.ts` 中配置。
- `src/config/site.toml` 应作为快速站点和内容样式入口，不承载复杂模块逻辑。
- 行为、配置、脚本、页面模块或插件用法变化时，请同步更新文档。
- UI 改动请附截图或简短录屏；涉及移动端时也要覆盖移动端。

## 内容与文档

文档站通过 `src/docs` 子仓库挂载。修改文档内容时：

1. 先在 docs 子仓库提交并推送。
2. 再在 `astro-navfolio` 中更新子仓库指针。
3. 在主仓库运行 `bun run docs:build`。

演示内容应优先解释 Navfolio 本身。除非是为了展示特定功能，否则不要加入会分散注意力的长篇示例文章。

## 本地检查

```sh
bun install
bun run dev
bun run build
bun run format:check
```

文档站和演示内容：

```sh
bun run docs:build
bun run docs:dev
```

只有依赖缺失或发生变化时才需要运行 `bun install`。涉及代码、路由、schema、配置、插件或页面模块的有效改动，提交前请运行 `bun run build`。

## Review

维护者会关注项目契合度、改动范围、构建状态、路由安全、配置清晰度、阅读舒适度、移动端表现和维护成本。如果想法只适合个人 fork，或实现超出 issue 中确认的范围，PR 可能会被关闭。
