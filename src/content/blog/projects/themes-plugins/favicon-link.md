---
title: "🧩带图标的 Blog 跳转链接"
description: "记录为博客跳转链接添加 favicon 图标的字段设计与实现思路，对比默认路径和 Google Favicon 服务。"
date: "2025-08-21T01:31:51+08:00"
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

将在线链接升级成可以预览网页图标的样子~

quartz 主题中，展示链接的插件是[Plugin.CrawlLinks()](https://quartz.jzhao.xyz/plugins/CrawlLinks)，文档中介绍了现有的几种常用的设置，本文尝试将其拓展，增加一个`showLinkFavicon`属性：

```ts showLineNumbers warp {6}
Plugin.CrawlLinks({
	markdownLinkResolution: "shortest",
	openLinksInNewTab: true,
	lazyLoad: true,
	externalLinkIcon: true,
	showLinkFavicon: true,
}),
```

# 定义字段

在`quartz\plugins\transformers\links.ts`中，添加字段定义：

```ts showLineNumbers warp {7}
const defaultOptions: Options = {
  markdownLinkResolution: "absolute",
  prettyLinks: true,
  openLinksInNewTab: false,
  lazyLoad: false,
  externalLinkIcon: true,
  showLinkFavicon: true,
};
```

在`CrawlLinks`定义中添加实现：

```ts showLineNumbers warp {21-35}
export const CrawlLinks: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "LinkProcessing",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree: Root, file) => {
            const curSlug = simplifySlug(file.data.slug!)
            const outgoing: Set<SimpleSlug> = new Set()

            const transformOptions: TransformOptions = {
              strategy: opts.markdownLinkResolution,
              allSlugs: ctx.allSlugs,
            }

            visit(tree, "element", (node, _index, _parent) => {

            // ...

                if (isExternal && opts.showLinkFavicon) {
                  const domain = new URL(node.properties.href).hostname
                  if (domain) {
                    node.children.unshift({
                      type: "element",
                      tagName: "img",
                      properties: {
                        src: `https://s2.googleusercontent.com/s2/favicons?domain_url==${domain}`,
                        alt: "",
                        style: "width: 1em; height: auto; margin-left: 4px; margin-right: 4px; vertical-align: middle;",
                      },
                      children: [],
                    })
                  }
                }
            // ...

```

# 实现思路

## 直接使用 favicon 默认路径

大多数网站在根目录下有 favicon.ico 文件，可以通过示例中的方法捕获：

```ts
function getDefaultFaviconUrl(url: string): string {
  const domain = new URL(url).origin;
  return `${domain}/favicon.ico`;
}

// 使用示例
const faviconUrl = getDefaultFaviconUrl("https://example.com");
console.log("Default favicon URL:", faviconUrl);
```

但是 favicon.ico 并不是每个网站都设置在同样的路径下，其格式也不一定都是`.ico`。

## 使用 Google Favicon 服务

调用 Google favicon API，这个 api 可以仅通过网站域名即可抓取网站的 favicon，使用方法如下：

```plaintext
https://s2.googleusercontent.com/s2/favicons?domain_url=目标网站域名
```

还可以通过`sz`属性指定获取的 icon 的大小（如果访问的网站有这样的尺寸），`sz`属性的单位是`px`，默认值是 16：

```plaintext
https://s2.googleusercontent.com/s2/favicons?domain_url=example.com&sz=大小
```

```ts
async function getFaviconUrl(url: string): Promise<string | null> {
  try {
    // 提取域名
    const domain = new URL(url).hostname;
    return `https://s2.googleusercontent.com/s2/favicons?domain_url=${domain}`;
  } catch (error) {
    console.error("Error getting favicon:", error);
    return null;
  }
}

// 使用示例
getFaviconUrl("https://example.com").then((faviconUrl) => {
  console.log("Favicon URL:", faviconUrl);
});
```
