---
title: "为最近笔记添加排序和筛选"
description: "记录为最近笔记列表添加排序和筛选功能的配置方式与实现思路。"
date: "2025-08-02T03:55:35+08:00"
draft: false
showHeroImage: false
tags:
  - 项目实践
  - 博客主题
  - Quartz
  - 前端
categories:
  - 项目实践
series:
  - 博客主题改造
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

有时候会更新一些目录页说明，更新说明时会出现博客左上角的“最近笔记”模块显示成这些目录页的更新，于是在自定义设置中记录一下`Component.RecentNotes({})`的使用。

quartz 主题官方有一篇介绍：[最近笔记](https://quartz.zituoguan.com/features/recent-notes)

## 设置配置

- 自定义筛选：传递额外参数  `Component.RecentNotes({ filter: someFilterFunction })`。筛选函数应具有签名  `(f: QuartzPluginData) => boolean`。
- 自定义排序：传递额外参数  `Component.RecentNotes({ sort: someSortFunction })`。默认情况下，Quartz 会按日期排序并在有相同日期时按字母顺序排序。排序函数应具有签名  `(f1: QuartzPluginData, f2: QuartzPluginData) => number`。可参考  `quartz/components/PageList.tsx`  中的  `byDateAndAlphabetical`  示例。

```ts title="quartz.layout.ts" showLineNumbers warp {1, 8-25}
import { QuartzPluginData } from "./quartz/plugins/vfile"

// ...

Component.DesktopOnly(Component.RecentNotes({
  limit: 3,
  showTags: false,
  filter: (f) => f.frontmatter?.tags?.includes('intro') ? false : true,
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => {
	if (f1.frontmatter?.date && f2.frontmatter?.date) {
	  // Sort by date
	  if (f1.frontmatter?.date && f2.frontmatter?.date) {
		return f1.frontmatter.date < f2.frontmatter.date ? 1 : -1
	  } else if (f1.frontmatter?.date && !f2.frontmatter?.date) {
		return -1
	  } else if (!f1.frontmatter?.date && f2.frontmatter?.date) {
		return 1
	  }

	  const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
	  const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
	  return f1Title.localeCompare(f2Title)
	}
	return 0
  }
})),
```

在`frontmatter.ts`中添加页面参数：

```ts title="frontmatter.ts" showLineNumbers warp {11-12}
declare module "vfile" {
  interface DataMap {
    aliases: FullSlug[];
    frontmatter: { [key: string]: unknown } & {
      title: string;
    } & Partial<{
        tags: string[];
        aliases: string[];
        modified: string;
        created: string;
        date: string;
        lastmod: string;
        published: string;
        description: string;
        socialDescription: string;
        publish: boolean | string;
        draft: boolean | string;
        lang: string;
        enableToc: string;
        cssclasses: string[];
        socialImage: string;
        featuredImage: string;
        comments: boolean | string;
      }>;
  }
}
```
