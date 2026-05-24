---
title: "使用 Obsidian + GitHub Actions + GitHub Pages 搭建内容发布流"
description: "Obsidian、GitHub Actions 与 GitHub Pages 内容发布流笔记，整理多个仓库之间的同步与部署脚本。"
date: "2026-05-14T20:05:30+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

最近又在折腾博客主题了，想到可能之后还会折腾，每次换主题都需要考虑到旧的 md 文章的元数据、文件结构是否符合新的主题的需求。

同时，也可以告别在 obsidian 中写文章时，每次迁移之后要按照不同的正则表达式重新调整一下 ob 的过滤的繁琐，为了以后不再面对无用文件占据左侧文件栏、更改配置等问题，特意调整了一下书写文章的新流程。

# 三个 GitHub 仓库之间的协作

固定的写作工作流会包含 3 个仓库之间的协作：

```bash
obsidian-posts/
  posts/
    xxx.md

astro-blog/
  src/content/blog/   ← 构建时由 Action 拉取 posts 填充
  package.json
  astro.config.mjs

<username>.github.io/
  ← Astro 构建产物发布到这里
```

- `obsidian-posts`：这是一个纯 markdown/mdx 的仓库，用来记录最纯粹的文章内容，不包含任何构建网页的框架
- `astro-blog`：这是用来接受 markdown 文章的仓库，包含了文章的构建步骤
- `<username>.github.io`：也就是 GitHub Page 的部署仓库

这三个仓库之间使用 GitHub Action 进行互相通信，当在 `obsidian-posts` 中完成写作后，通过 git push 到 GitHub 仓库，触发 workflow，这一步将把 posts 的内容覆盖推送到`astro-blog`。

在`astro-blog`接收到 push 之后，触发构建和部署的流水线，构建产物 `dist/`将推送到`<username>.github.io/`，即部署推送到 GitHub Page 中。

# workflow 脚本

## obsidian-posts 到 astro-blog

```yml
name: Notify Astro Blog

on:
  push:
    branches:
      - main

jobs:
  sync-content-to-blog-repo:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      TARGET_REPO: <target_repo> # 换成你的目标构建仓库
      TARGET_BRANCH: main
      TARGET_PATH: src/content # 换成目标构建仓库会读取md内容的位置，从根目录开始
    steps:
      - name: Checkout source content repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Checkout target blog repository
        uses: actions/checkout@v4
        with:
          repository: ${{ env.TARGET_REPO }}
          ref: ${{ env.TARGET_BRANCH }}
          token: ${{ secrets.BLOG_REPO_TOKEN }}
          path: target-repo

      - name: Sync content (exclude .github)
        shell: bash
        run: |
          mkdir -p "target-repo/${TARGET_PATH}"
          rsync -av --delete \
            --exclude='.git' \
            --exclude='.github' \
            --exclude='target-repo' \
            ./ "target-repo/${TARGET_PATH}/"

      - name: Commit and push changes to target repository
        shell: bash
        run: |
          cd target-repo
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          if [ -z "$(git status --porcelain)" ]; then
            echo "No changes to commit."
            exit 0
          fi

          git add .
          git commit -m "chore: sync content from digital-garden (${GITHUB_SHA::7})"
          git push origin "${TARGET_BRANCH}"
```

### 细节提示

- 由于是跨仓库进行推送，当前的 git action 需要使用包含读写权限的密钥，这个密钥需要放在`obsidian-posts`仓库的`Setting->Secrets and variables->Actions`中，选择新加密钥`New repository secret`，保持密钥名称和 yml 脚本中的内容一致。
- 更多细节可以参考[此处](###BLOG_REPO_TOKEN如何生成)

## `astro-blog` 到 `<username>.github.io`

这一步的部署和之前提过的 GitHub page 的部署完全一样，如果之前有配置过，这次就不需要怎么改动了。

```yml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]

  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: deploy-github-pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: dist

      - name: Add CNAME
        run: echo "dodolalorc.cn" > dist/CNAME

      - name: Deploy to external GitHub Pages repository
        uses: peaceiris/actions-gh-pages@v4
        with:
          external_repository: dodolalorc/dodolalorc.github.io
          personal_token: ${{ secrets.ACTION_ACCESS_TOKEN }}
          publish_branch: main
          publish_dir: ./dist/
          keep_files: false
          commit_message: "${{ github.event.head_commit.message || format('deploy: {0}', github.sha) }}"

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 小细节

如果你的`<username>.github.io`配置了自定义域名，需要在构建完成后将 cname 写入 dist 根目录中。每次推送到`<username>.github.io`是覆写的。如果不配置可能会无法正确解析。

聪明的 uu 可能也发现了，如果 astro-blog 已经构建好了，其实是可以直接通过 github action 在当前仓库部署到 GitHub page 的，这一步就按需使用啦，如果想利用`<username>.github.io`的 GitHub page 域名，就直接使用 workflow 进行跨仓库推送，否则只需要在当前的`astro-blog`的 GitHub page 中配置自定义域名即可。

## 更多问题

### BLOG_REPO_TOKEN 如何生成，需要什么权限

可以用 GitHub Personal Access Token（PAT）来作为 BLOG_REPO_TOKEN。推荐用 Fine-grained token（更安全、权限更小）。

操作步骤如下：

#### GitHub 密钥生成位置

1. 登录 GitHub，进入 Settings
2. 左侧进 Developer settings
3. 进入 Personal access tokens -> Fine-grained tokens
4. 点击 Generate new token

#### 填写内容

- `Token name`：比如 obsidian-posts-sync
- `Expiration`：建议设置过期时间（例如 90 天）
- `Resource owner`：选择你有权限的账号/组织
- `Repository access`：选择 Only select repositories，只勾选目标仓库 astro-blog
- `设置权限（Repository permissions）`：
  Contents -> Read and write（必须）
  其他保持 No access 即可
- 点击生成，复制 token（只会显示一次）

#### 将 token 加到“内容仓库”的 Secret：

打开当前仓库 `obsidian-blog` ：Settings -> Secrets and variables -> Actions

选择 New repository secret

Name 填：BLOG_REPO_TOKEN
Secret 填：刚复制的 token

选择保存，完成后，这个 workflow 里 ${{ secrets.BLOG_REPO_TOKEN }} 就能用了。

补充两点：

如果目标仓库在组织下，组织策略可能限制 PAT，需要组织管理员允许。
token 过期后同步会失败，到期前重新生成并更新同名 secret 即可。
