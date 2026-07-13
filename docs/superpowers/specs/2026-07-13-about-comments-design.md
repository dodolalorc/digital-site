# About 页面评论渲染修复设计

## 背景

About 页面从 `src/content/about.md` 或 `src/content/about.mdx` 加载内容，并与博客文章共用 `BlogArticle` 布局。内容 schema 已支持 `comments` 元信息，但布局目前只在内容集合为 `blog` 时挂载 `CommentSection`，导致 About 的 `comments` 配置没有进入现有评论判断链路。

## 目标

- About 页面在 `comments: true`（或使用 schema 默认值）时遵循站点评论配置。
- About 页面在 `comments: false` 时不渲染评论。
- 保持博客文章现有行为不变。
- 不改变 Projects 等其他复用 `BlogArticle` 的页面行为。

## 方案

在评论工具模块中定义支持评论的内容集合判断，仅允许 `blog` 与 `about`。`BlogArticle` 使用该判断决定是否挂载 `CommentSection`；挂载后仍由 `CommentSection` 处理页面元信息、全局开关、provider 配置完整性等现有规则。

数据流为：内容 frontmatter → Content Collection schema → `BlogArticle` → 支持集合判断 → `CommentSection` → 评论 provider。

## 测试

先添加失败测试，证明 `about` 应支持评论而 `projects` 不应被意外开启；再实现最小判断并让测试通过。最后运行相关单元测试、格式检查与带完整评论环境变量的 Astro 构建，并检查 `/about` 构建产物。

## 非目标

- 不调整评论 provider 配置模型。
- 不为 Projects 页面启用评论。
- 不修改 `src/docs` 子仓库中的内容。
