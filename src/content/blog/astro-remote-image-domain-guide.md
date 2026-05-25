---
title: 'Astro 远程图片域名白名单配置'
description: 'Astro 图片优化遇到远程图片加载失败时，如何通过 astro.config.mjs 配置允许的远程图片域名。'
date: '2026-05-21'
draft: false
heroImage: '/src/assets/figure/fail-loading-image.png'
showHeroImage: true
tags:
  - Astro
  - Image
  - Configuration
categories:
  - 站点建设
series:
  - Navfolio 模块手册
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

在 Astro 项目里使用 `<Image />` 引用远程图片时，如果构建阶段提示远程图片不被允许，通常不是图片地址本身失效，而是 Astro 的图片优化默认没有放行这个外部域名。

解决思路很简单：在 `astro.config.mjs` 里明确声明允许访问的远程图片域名。这样可以继续保留 Astro 的图片优化能力，也能避免把真实业务图片域名散落在页面组件里。

## 推荐配置

打开项目根目录的 `astro.config.mjs`，在 `defineConfig()` 里添加 `image` 配置：

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  // ... 其他配置
  integrations: [mdx(), sitemap()],

  image: {
    domains: ['images.example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
  },
});
```

这里的 `images.example.com` 是脱敏后的占位域名。实际使用时，把它替换成自己的图片 CDN、对象存储或静态资源域名即可。

## domains 和 remotePatterns

`domains` 适合最常见的固定域名场景：

```js
image: {
  domains: ['images.example.com'],
},
```

`remotePatterns` 更适合需要限制协议、域名或路径的场景：

```js
image: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.example.com',
      pathname: '/blog/**',
    },
  ],
},
```

如果图片都来自同一个正式 CDN，推荐先使用固定 hostname。只有在确实需要匹配多个子域名或限制路径时，再扩展 `remotePatterns`。

## 多个远程图片域名

如果站点图片来自多个独立域名，可以把它们都列出来：

```js
image: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.example.com',
    },
    {
      protocol: 'https',
      hostname: 'assets.example.com',
    },
  ],
},
```

尽量避免为了省事直接放开过宽的通配范围。图片白名单越具体，越容易排查构建错误，也更符合静态站点长期维护的习惯。

## 不推荐的处理方式

也可以选择绕过远程图片优化，比如在使用 `<Image />` 时关闭尺寸推断，或改用普通的 `<img>`：

```astro
<Image src="https://images.example.com/photo.png" inferSize={false} alt="示例图片" />
```

但这通常只适合临时排查。对博客和作品集来说，保留 Astro 的图片处理能力更稳妥，尤其是文章封面、插图和列表缩略图会长期复用。

## 修改后验证

配置完成后重新运行构建：

```sh
bun run build
```

如果错误消失，说明远程图片域名已经被 Astro 接受。后续新增图片源时，也应该优先回到 `astro.config.mjs` 维护白名单，而不是在单个页面里做零散绕过。
