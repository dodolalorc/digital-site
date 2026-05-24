---
title: "🙆‍♀️Github Action实践"
description: "GitHub Actions 实践笔记，记录 SSH Key、Secrets、workflow 触发条件和私有仓库发布流程配置。"
date: "2024-07-05T23:11:39+08:00"
draft: false
showHeroImage: false
tags:
  - 开发工具
  - GitHub Actions
  - 自动化部署
  - CI/CD
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## 前言

本篇记录利用 github action 实现自动化构建和部署的过程。

本站除了部署在 github page 上，还部署在本人的服务器上，懒惰的 ddl 直到现在才去上手实验，因此利用在 github action 中实现两种部署方式。

## Github Action

Github Action 是 Github 提供的持续集成服务，可以在代码仓库中配置 workflow，实现自动化构建、测试、部署等功能。

有一些术语需要了解：

- `Workflow`：一个 workflow 由一个或多个 job 组成，可以在不同的操作系统环境中运行。
- `Job`：一个 job 由一系列 step 组成，可以在同一个 runner 上运行。
- `Step`：一个 step 由一个或多个 action 组成，可以在同一个 runner 上运行。
- `Action`：一个 action 是一个独立的任务，可以在不同的 runner 上运行。

## 配置

这里我使用的是 github action 自带的`SSH Deploy` action，使用 ssh 链接远程服务器，将代码部署到服务器上。使用方法可以参考[这里](https://github.com/marketplace/actions/ssh-deploy)。

### 1. 创建 SSH Key 并添加到 github secrets

首先需要在服务器上生成一个 SSH Key，用于 github action 登录服务器。

```bash
ssh-keygen -m PEM -t rsa -b 4096
```

key 的生成过程中会提示输入密码，可以不输入，直接回车，默认保存在`/root/.ssh`目录下（这个可能不同的服务器环境会有区别，具体的默认位置在生成`ssh-key`的时候命令行有提示。

生成的 key 包含一个私钥`id_rsa`和一个公钥`id_rsa.pub`，私钥保存在本地，我们需要将公钥添加到服务器的`/root/.ssh/authorized_keys`文件中。

```bash
cat ./id_rsa.pub >> /root/.ssh/authorized_keys
```

考虑到我们并不想把私钥暴露在 github 公开仓库上，我们需要将私钥`id_rsa`添加到 github 的 secrets 中。

在仓库的`Settings`->`Security`->`Secrets and variables`->`Actions`中，选择`New repository secret`，添加一个`SSH_PRIVATE_KEY`，将私钥内容粘贴进去。

再新建三个 secrets，分别是`REMOTE_HOST`、`REMOTE_USER`、`REMOTE_TARGET`，分别对应服务器的地址、用户名、目标路径。

### 2. 创建 workflow

在代码仓库的`.github/workflows`目录下创建一个`.yml`文件，文件名可以自定义，如`deploy.yml`。

一个库可以有多个 workflow，github 只要发现`.github/workflows`目录下有`.yml`文件，就会自动运行 workflow。

内容可以参考如下：

```yaml
name: Deploy

# 触发条件
on:
  push:
    branches: [main]
  workflow_dispatch: # 手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "16.x"
      - name: ssh deploy
        uses: easingthemes/ssh-deploy@v5.0.3
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rlgoDzvc -i"
          SOURCE: ""
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.REMOTE_TARGET }}
```

向 github 仓库 push 代码之后，我们在`Actions`选项卡中可以看到 workflow 的运行情况。假如运行失败，可以点进去查看具体的错误信息，进行调试。

之后每次 push 到 main 分支或者手动触发 workflow，github action 就会自动运行 workflow，将代码部署到服务器上。

## 更新 2024-09-22

之前部署的时候只上传了`public/`文件夹，最近有同步源码的需求，但是源码包含一些隐私信息，并不适合上传到 github 的公开仓库，所以现在的需求是：

- 将源码上传到一个私有仓库
- 从私有仓库中将`public/`文件夹同步到`<username>.github.io`公开仓库中，并部署到`github page`

因此新增了一个在源码仓库根目录下的 workflow，将源码上传到私有仓库，通过 hugo 官方提供的 action，将生产的站点文件同步到`<username>.github.io`公开仓库中。

### 创建私有仓库

首先在 github 上创建一个私有仓库，用于存放源码。

### 创建 personal access token

在 github 的`Settings`->`Developer settings`->`Personal access tokens`中，点击`Generate new token`，勾选`repo`权限，生成一个 token，将 token 复制下来。

### 添加 secrets

在源码仓库的`Settings`->`Security`->`Secrets and variables`->`Actions`中，添加一个`ACTION_ACCESS_TOKEN`，将刚刚生成的 token 粘贴进去，这个命名要和 workflow 文件中的一致。

### 创建 workflow

在私有仓库的`.github/workflows`目录下创建一个`gh-page.yml`文件。

文件内容如下：

```yaml
name: github pages deploy

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3 # 引用actions/checkout这个action，与所在的github仓库同名
        with:
          submodules: flase # 是否获取子模块
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v3

      - name: Setup Hugo # 步骤名自取
        uses: peaceiris/actions-hugo@v3 # hugo官方提供的action，用于在任务环境中获取hugo
        with:
          hugo-version: "latest" # 获取最新版本的hugo
          extended: true

      - name: Build
        run: hugo --minify # 使用hugo构建静态网页

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4 # 一个自动发布github pages的action
        with:
          # github_token: ${{ secrets.GITHUB_TOKEN }} 该项适用于发布到源码相同repo的情况，不能用于发布到其他repo
          external_repository: dodolalorc/dodolalorc.github.io # 发布到哪个repo
          personal_token: ${{ secrets.ACTION_ACCESS_TOKEN }} # 发布到其他repo需要提供上面生成的personal access token
          publish_dir: ./public/ # 注意这里指的是要发布哪个文件夹的内容，而不是指发布到目的仓库的什么位置，因为hugo默认生成静态网页到public文件夹，所以这里发布public文件夹里的内容
          keep_files: true # 是否保留其他文件
          publish_branch: main # 发布到哪个branch
          commit_message: ${{ github.event.head_commit.message }} # 提交信息
```

由于现在的`xxx.github.io`对应的仓库是在 GitHub action 中构建站点后直接 commit 同步的，故原来在公开仓库中的 workflows 并不方便添加到这个 commit 里，我这里的解决思路是将原来 ssh 连接云服务器进行 deploy 的代码进行修改，添加自动构建内容，再直接用 ssh 连接到云服务器，完成云服务器的内容更新。修改后的`remote-deploy.yml`参考如下：

```yaml
name: Deploy to remote server

# 触发条件
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "16.x"

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: "latest"
          extended: true

      - name: Build
        run: hugo --minify

      - name: ssh deploy
        uses: easingthemes/ssh-deploy@v5.1.0
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rlgoDzvc -i"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.REMOTE_TARGET }}
          SOURCE: "public/"
          # SCRIPT_BEFORE: |
          #   whoami
          #   ls -al
          # SCRIPT_AFTER: |
          #   cd ${{ secrets.REMOTE_TARGET }}
          #   ls -al
          #   pwd
          #   echo "Deployed successfully"
```
