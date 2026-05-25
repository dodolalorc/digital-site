---
title: '分类与系列模块使用说明'
description: '了解 Navfolio 如何用轻量 frontmatter 自动生成分类页和系列阅读路径。'
date: '2026-05-25'
draft: false
showHeroImage: false
tags:
  - Astro
  - Content
  - Guide
categories:
  - 内容管理
series:
  - Navfolio 模块手册
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

Navfolio 的分类与系列模块用来给博客文章增加两层轻量组织方式：`categories` 负责把文章放进稳定主题，`series` 负责把互相关联的文章串成可连续阅读的路径。

这两个字段都保持和 `tags` 接近的写法。作者不需要在每篇文章里维护额外的 `name`、`title` 或 `order`，只要写字符串数组即可。

## Frontmatter 写法

在任意博客文章的 frontmatter 中加入：

```yaml
categories:
  - 内容管理
series:
  - Navfolio 模块手册
```

也可以写成更紧凑的数组：

```yaml
categories: ['内容管理']
series: ['Navfolio 模块手册']
```

`categories` 和 `series` 都是可选字段。没有填写时，文章仍然会正常渲染，只是不会出现在对应的分类页或系列页里。

## 分类页如何生成

构建时，Navfolio 会扫描所有已发布的博客文章，把相同分类聚合到一起，并生成：

```text
/blog/categories/
/blog/categories/[category]/
```

分类名会保留原始展示文本，URL 会自动转换成稳定 slug。中文、空格和大小写差异都会由工具函数处理，作者不用单独维护链接。

## 系列页如何生成

`series` 用来表达一组文章之间的阅读关系。构建时会生成：

```text
/blog/series/
/blog/series/[series]/
```

系列内文章默认按发布日期从早到晚排列，形成自然的阅读顺序。这个规则避免了每篇文章都要手写 `order` 的负担，也让系列更适合长期追加内容。

如果一篇文章属于多个系列，可以写多个字符串：

```yaml
series:
  - Navfolio 模块手册
  - Astro 内容系统
```

文章页会展示这些系列入口；系列上下篇导航会优先使用第一个系列。

## Category、Tag、Series 的区别

`tags` 适合表达文章里的关键词，例如 `Astro`、`Search`、`Markdown`。它们更自由，数量可以多一些。

`categories` 适合表达稳定栏目，例如 `Guide`、`Essay`、`Project`。它们帮助读者按大主题浏览。

`series` 适合表达阅读路径，例如 `Navfolio 模块手册`。它强调文章之间的先后关系，适合教程、迁移记录、项目构建日志或连续笔记。

## 内容维护建议

保持字段简洁，比提前设计一套复杂分类体系更重要。先从少量稳定的 `categories` 和自然形成的 `series` 开始，等文章数量增加后再调整名称。

Navfolio 会负责把这些轻量信息变成可访问的浏览入口，作者只需要继续写文章。
