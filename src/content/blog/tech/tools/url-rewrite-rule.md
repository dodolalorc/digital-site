---
title: "🌐URL 重写规则和静态资源解析逻辑"
description: "URL 重写与静态资源解析笔记，记录问题背景、原因分析和对应的规则修复方案。"
date: "2025-07-14"
draft: false
showHeroImage: false
tags:
  - 前端
  - URL重写
  - 静态资源
  - 部署
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# 问题背景

最近部署博客页面时遇到这样的问题：同样的页面结构，部署到我的两个域名下：`dodolalorc.cn` 和 `dodolalorc.github.io`，对应的网页内容是相同的，但是 dodolalorc.cn 需要写成`https://dodolalorc.cn/links.html`才能显示内容，否则会报404，`dodolalorc.github.io`就不需要这样。

# 原因记录

这种差异主要源于两个域名所对应的**服务器配置不同**，本质原因是服务器如何解析 “无后缀 URL”。

我的 `dodolalorc.cn` 配置在服务器上，而 `dodolalorc.github.io` 将走 `github page` 的代理。

当访问一个 URL（如`a.github.io/about`或`a.cn/about`）时，服务器需要判断这个请求对应的实际文件是什么。

- 对于`a.github.io/about`：服务器被配置为 “自动补全`.html`后缀”，即自动将`about`解析为`about.html`，因此能找到对应的文件并返回内容。
- 对于`a.cn/about`：服务器**没有配置自动补全后缀**，它会严格按照请求的路径查找文件（即寻找`about`这个 “无后缀文件”），但实际文件是`about.html`，因此找不到，返回 404；只有手动加上`.html`（即`a.cn/about.html`），才能匹配到实际文件。

`a.github.io`通常是托管在**GitHub Pages**上的静态网站，而 GitHub Pages 默认配置了 “友好 URL 规则”，会自动处理无后缀的 URL 请求。具体逻辑包括：

- **自动补全`.html`后缀**：当请求`/about`时，服务器会先检查是否存在`about.html`文件，若存在则直接返回。
- **支持目录索引**：如果`about`是一个文件夹，服务器会自动查找`about/index.html`（即默认索引文件）。

这种配置是 GitHub Pages 为了简化静态网站访问而预设的，目的是让 URL 更简洁（如`xxx/about`比`xxx/about.html`更易读）。

`a.cn`对应的服务器**没有配置 “自动补全`.html`” 的规则**，因此遵循 “严格匹配” 逻辑：

- 当请求`a.cn/about`时，服务器会直接查找名为`about`的 “无后缀文件”（而非`about.html`）。
- 由于实际文件是`about.html`（而非`about`），服务器找不到对应资源，就会返回 404 错误。
- 只有手动指定完整文件名`about.html`，才能匹配到实际文件，因此`a.cn/about.html`能正常访问。

# 解决方法

我的服务器使用 Nginx 服务器，于是选择在 Nginx 的站点配置中添加：

```nginx
location / {
    # 当请求的文件不存在时，尝试补全.html
    if (!-e $request_filename) {
        rewrite ^(.*)$ $1.html last;
    }
}
```

配置后，`a.cn/about`会被自动解析为`a.cn/about.html`，无需手动加后缀。
