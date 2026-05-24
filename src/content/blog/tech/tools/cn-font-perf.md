---
title: 中文字体加载优化：在博客里混合使用字体子集和完整字体
description: ""
date: 2026-05-25T02:28:58+08:00
draft: false
heroImage: https://dodola-images-1324351636.cos.ap-guangzhou.myqcloud.com/a215e12a9c7b8e5f21f3d1311a1da6b7.png
showHeroImage: false
tags:
  - Web性能
  - 性能优化
  - 前端
  - 字体子集化
  - CSS
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

最近给自己的 Astro 博客主题 [Navfolio](https://github.com/dodolalorc/astro-navfolio) 做性能优化时，重新处理了一下中文字体加载。

一开始我直接用了 `LXGW WenKai` 的 npm webfont 包，在全局 CSS 里引入：

```css
@import "lxgw-wenkai-webfont/style.css";
```

这样确实省事，但很快就发现问题：

- 哪怕首页只有几个中文标题，浏览器也可能去下载完整的中文字体文件。

中文字体和英文字体不太一样，完整字库通常很大，几 MB 很常见。放在全局渲染链路里，就容易拖慢首屏。

后来我把思路改成了：

```txt
UI 页面：用字体子集
文章正文：用系统字体或完整字体
```

也就是首页、About、Projects、标签页、文章列表这些内容比较固定的地方，使用一个构建时生成的小字体；真正长篇阅读的正文，则不强行走子集。

## 为什么不全站子集化

我一开始也想过全站都做字体子集，但实际并不太合适。

博客正文的字符量变化太大，一篇文章里可能有中文、英文、标点、代码、特殊符号，甚至 emoji。每次改文章都要重新生成子集，构建流程会变复杂；而且文章越多，最后收集出来的字符也会越来越多，优化效果反而没那么明显。

更重要的是，正文阅读最怕字体突然 fallback。缺字、字形不一致、段落中途切换字体，这些问题在长文里会很明显。所以我更愿意让正文保持稳定，把优化重点放在 UI 层。

## 我的做法

我没有手动维护字符列表，而是在构建时自动扫描页面和组件里的文本，提取需要的中文字符，再生成一个 UI 专用字体。

扫描范围大概是这些：

```txt
src/pages
src/components
src/layouts
site.toml
文章 frontmatter
```

但不会扫描 Markdown 正文，因为这个字体只服务界面，不服务长文阅读。

生成流程大概是：

```txt
扫描 UI 文本
提取中文字符
生成 chars.txt
使用 pyftsubset 输出 woff2
构建时自动执行
```

用到的工具是 `fonttools`：

```bash
pip install fonttools brotli
```

然后用 `pyftsubset` 生成字体：

```bash
pyftsubset LXGWWenKai-Regular.ttf \
  --text-file=chars.txt \
  --flavor=woff2 \
  --layout-features='*' \
  --output-file=lxgw-ui-subset.woff2
```

UI 层再单独声明这个子集字体：

```css
@font-face {
  font-family: "LXGW UI Subset";
  src: url("/fonts/lxgw-ui-subset.woff2") format("woff2");
  font-display: swap;
}

.ui-text {
  font-family: "LXGW UI Subset", "PingFang SC", "Microsoft YaHei", sans-serif;
}
```

正文则使用更稳的字体栈：

```css
.article-content {
  font-family:
    "PingFang SC",
    "Microsoft YaHei",
    system-ui,
    sans-serif;
}
```

如果确实想在正文里用完整的中文字体，也建议只在文章页按需加载，不要直接挂到 `body` 上。

## 一个小坑

最需要避免的是这种写法：

```css
body {
  font-family: "LXGW WenKai";
}
```

这相当于告诉浏览器：全站都有可能需要完整中文字体。最后可能只是为了首页几个字，就让首屏背上整个字体文件。

## 最后效果

改成混合方案之后，首页字体资源明显小了，首屏也轻了不少。正文没有强行套子集字体，所以阅读体验也比较稳定。

这次优化之后，我对中文字体的理解也变了：问题不只是 CDN、缓存或者压缩格式，而是字体加载范围有没有设计好。

对博客这类站点来说，我现在更倾向于这个方案：

```txt
界面用子集字体，正文用稳定字体。
```

简单一点，也更不容易出问题。
