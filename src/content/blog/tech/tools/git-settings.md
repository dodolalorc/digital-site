---
title: "🔑Git环境配置和SSH公钥设置"
description: "Git 环境配置笔记，整理 SSH 密钥生成、Git 全局配置、换行符策略、默认分支和别名设置。"
date: "2025-08-02T01:31:10+08:00"
draft: false
showHeroImage: false
tags:
  - 开发工具
  - Git
  - SSH
  - 环境配置
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

一般远程仓库都支持使用 ssh 访问和读写数据，提供 ssh 进行连接时，会使用本地的私钥文件进行身份验证，配置 ssh 密钥的步骤即：

1. 在本地生成 ssh 密钥对
2. 上传公钥到远程存储库

# 配置密钥

## 1. 生成 ssh 密钥对

    `windows` 用户建议使用PowerShell

```bash
ssh-keygen -t ed25519 -C "SSH Key"
```

- `-t`：key 类型
- `-C`：注释

在命令行一路回车（三次）即可，将把密钥放在默认路径下。

## 2. 查看生成的 SSH 公钥和私钥

```bash
ls ~/.ssh/
```

默认会将 ssh 密钥放在`~`路径下的隐藏文件夹`.ssh`中。输出：、

```bash
id_ed25519  id_ed25519.pub
```

- 私钥文件  `id_ed25519`
- 公钥文件  `id_ed25519.pub`

## 3. 读取公钥

使用 cat 命令，或者直接使用记事本打开文件进行复制：

```bash
cat ~/.ssh/id_ed25519.pub
```

复制公钥内容后，将其上传到远程存储库中，一般在个人账号设置中会有 ssh 设置栏。

## 4.测试 ssh 连接

使用`ssh -T`命令进行测试，其后加在远程存储库的用户名。

```bash
ssh -T git@github.com
```

正确响应：

```bash
Hi your_username! You've successfully authenticated, but GitHub does not provide shell access.
```

# Git config 信息配置

Git 的配置信息分为三个级别，分别为：

- `--local`：仓库级别
- `--global`：用户级别
- `--syustem`：系统级别

## 1. 设置全局用户信息

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

## 2. 常用全局配置

```bash
# 设置默认文本编辑器（VSCode为例）
git config --global core.editor "code --wait"

# 设置换行符处理（Windows推荐）
git config --global core.autocrlf true

# 设置换行符处理（Linux/Mac推荐）
git config --global core.autocrlf input

# 启用彩色输出
git config --global color.ui true

# 设置默认分支名称（新版本Git默认是main）
git config --global init.defaultBranch main
```

## 3. 查看配置信息

```bash
# 查看所有配置
git config --list

# 查看全局配置
git config --global --list

# 查看特定配置项
git config user.name
git config user.email
```

## 4. 仓库特定配置

如果想将某个特定仓库设置不同的配置（比如将工作邮箱和个人邮箱分开）：

```bash
cd /path/to/repo
git config user.name "工作用户名"
git config user.email "工作邮箱"
```

## 5. 配置别名

配置别名相当于给 git 命令创建“快捷方式”，可以提高工作效率，比如：

- 把  `git checkout`  简化为  `git co`
- 把  `git branch`  简化为  `git br`
- 把  `git commit`  简化为  `git ci`

配置命令格式：

```bash
git config --global alias.新名称 '原命令'
```

常用别名：

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

### oh-my-zsh git plugin

如果你使用[oh-my-zsh](https://ohmyz.sh/)，zsh 中会支持一套 git 别名，详细信息可以在这里查看：[git plugin](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git)
列举一部分常用的：

| Alias    | Command                                   |
| -------- | ----------------------------------------- |
| `g`      | `git`                                     |
| `gaa`    | `git add --all`                           |
| `gcmsg`  | `git commit --message`                    |
| `ggpush` | `git push origin "$(git_current_branch)"` |
| `ggpull` | `git pull origin $(current_branch)`       |
| `gcb`    | `git checkout -b`                         |
| `gf`     | `git fetch`                               |
| `gfo`    | `git fetch origin`                        |
| `grba`   | `git rebase --abort`                      |
| `grbc`   | `git rebase --continue`                   |
| `grbs`   | `git rebase --skip`                       |
