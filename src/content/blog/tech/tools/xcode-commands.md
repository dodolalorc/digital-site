---
title: "💻常用 xcode 使用命令"
description: "Xcode 常用命令笔记，整理安装多版本 Xcode、license、xcode-select 路径切换和验证命令。"
date: "2025-08-02T00:20:02+08:00"
draft: false
showHeroImage: false
tags:
  - 开发工具
  - Xcode
  - 命令行
categories:
  - 开发工具
series:
  - 开发环境配置
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> [!abstract]+ Xcode 介绍
>
> Xcode 是苹果官方推出的集成开发环境（IDE），专为苹果的 Mac OS、iOS、iPad OS、watch OS 等应用开发设计，在 Mac 系统上作用是否广泛。使用 Mac 作为开发工具时必不可少的东西。

# XCode 安装

## 1. App Store 安装

在 `App Store` 可以直接搜索获得最新的 XCode 版本

## 2.安装各种版本的 Xcode

### 获取所需版本 Xcode 压缩包

[Xcode Releases](https://xcodereleases.com/) 可以搜索安装各个版本的 Xcode，所有的可获得版本均来自官方下载连接。

### 重命名 Xcode 并移动到应用程序文件夹中

解压后将 Xcode 重命名为 `Xcode_{版本号}` ，如 `Xcode_16.2` ，将其从 `Downloads` 文件夹下移动到`/Applications` 下。

```bash
cd Downloads
mv Xcode.app Xcode_16.2.app
mv Xcode_16.2.app /Applications

# 查看
cd /Applications
ls
```

### 同意 License

从上面的链接下载的 Xcode 还没有同意使用许可，命令行运行：

```bash
sudo xcodebuild -license
```

按照提示输入密码即可。

# xcode-select

`xcode-select`  是 macOS 上管理  **Xcode 和命令行工具**  的核心命令，主要用于切换、查询和配置 Xcode 的默认路径。

## 安装命令行工具

```bash
xcode-select --install
```

## 查询当前 Xcode 路径

```bash
xcode-select --print-path
```

**OR**

```bash
xcode-select -p
```

输出示例：

```bash
/Applications/Xcode.app/Contents/Developer
```

## 切换版本

如果系统安装了多个 Xcode 版本，可以切换默认版本`sudo xcode-select --switch <路径>`，举例：

```bash
sudo xcode-select --switch /Applications/Xcode-beta.app/Contents/Developer
```

- 路径必须指向  `Contents/Developer`，而非  `.app`  根目录。
- 所有修改路径的操作均需  `sudo`  权限。

## 手动设置工具路径

```bash
sudo xcode-select --set <路径>
```

## 验证配置有效性

```bash
xcode-select --check
```
