---
title: "在 quartz 主题中给博客添加封面首图"
description: "记录在 Quartz 主题中为博客添加封面首图的实现步骤，涵盖插件结构和组件结构改造。"
date: "2025-07-28T01:35:30+08:00"
draft: false
showHeroImage: false
tags:
  - 项目实践
  - 博客主题
  - Quartz
  - 前端
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

上一个主题可以在博客首部设置一张自定义的图片，也一直觉得这样的设计很漂亮，在 quartz 中没有这样的默认主题，所以在这里手动添加了这样的设计~

# 步骤

## plugins 结构

在`quartz/plugins`中，定义了文章中各种内容转换的工具（`transformers`）、生成资源的工具（`Emitters`）以及发布逻辑（`Fliters`）。

在本次实现中，我们需要从`markdown`文章中读取传参`featuredImage`，然后将参数内容作为加载图片的 url，将图片渲染在页面上，所以我们需要像这样先给原`frontmatter.ts`添加一个可以识别的参数：

```typescript showLineNumbers warp {21}
/* existing codes */
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
/* existing codes */
```

## components 结构

quartz 的所有主题都在`quartz/components`下，以此为根目录，`index.ts`中总结了导出的所有组件的类型，将在`quartz.layout.ts`中以`import * as Component from "./quartz/components"`的形式导入，并以`Component.ArticleTitle()`这样的形式使用。

所以，我们模仿相同的文件结构，在`quartz/components`下新建一个tsx文件`FeaturedImage.tsx`，内容像这样：

```tsx title="FeaturedImage"
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import { classNames } from "../util/lang";

const FeaturedImage: QuartzComponent = ({
  fileData,
  displayClass,
}: QuartzComponentProps) => {
  const featuredImage = fileData.frontmatter?.featuredImage;
  if (featuredImage) {
    return (
      <div class={classNames(displayClass, "featured-image")}>
        <img src={featuredImage} alt="Featured" />
      </div>
    );
  } else {
    return null;
  }
};

FeaturedImage.css = `
.featured-image {
  margin: 0.5rem 0;
  height: 200px;
  overflow: hidden;
}
.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
`;

export default (() => FeaturedImage) satisfies QuartzComponentConstructor;
```

再在`index.ts`中将`FeaturedImage`导入，之后在`quartz.layout.ts`中添加即可：

```ts title="quartz.layout.ts" showLineNumbers warp {11}
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({
        rootName: "主页",
      }),
      condition: (page) => page.fileData.slug !== "_index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.FeaturedImage(),
    Component.TagList(),
```

之后重新构建页面，即可查看样式效果啦。

效果展示：

![image.png](https://img.dodolalorc.cn/i/2025/07/28/68866abbf28b1.png)

☆*: .｡. o(≧▽≦)o .｡.:*☆
