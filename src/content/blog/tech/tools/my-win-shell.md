---
title: "我的 oh-my-posh 上都有哪些配置"
description: "Windows 终端配置笔记，整理 PowerShell 模块命令、Oh My Posh 配置以及常用 Git 别名函数。"
date: "2025-08-23T02:05:47+08:00"
draft: false
showHeroImage: false
tags:
  - 开发工具
  - Windows
  - 终端配置
  - oh-my-posh
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# What

在 Windows 上使用的是 WSL2(fish)+power shell 组合，使用的是 [oh-my-posh](https://ohmyposh.dev/)。

可以通过这个命令得知当前的 shell 是什么：

如果这个命令有输出，代表在 power shell 中，这会返回一些 power shell 的详细信息：

```powershell
$PSVersionTable.PSVersion
```

这个命令在 bash、zsh、fish 等中有效：

```bash
echo $SHELL
```

PowerShell 有一个或多个配置文件（Profile），查看当前使用的配置文件：

```powershell
$PROFILE.CurrentUserCurrentHost
```

# 一些 Power Shell 中的 Module 命令

> PS：用管理员身份打开终端。

## 查看当前安装的 Module

```powershell
Get-InstalledModule
```

## 安装 Module

```powershell
Install-Module <Module-Name>
```

## 卸载 Module

```powershell
Uninstall-Module <Module-Name>
```

## 查看可用模块

```powershell
# 查看所有可用模块
Get-Module -ListAvailable

# 查看特定模块
Get-Module -ListAvailable -Name <Module-Name>

# 使用通配符搜索
Get-Module -ListAvailable *git*
```

# 必备模块

## Oh My Posh

提供美观的提示符和主题（包括 Git 状态信息）。

安装方式较多，可以在官方文档中查看安装方法：[oh-my-posh](https://ohmyposh.dev/docs/installation/windows)

## 自定义 git 别名和函数

可以在这里查看 #oh-my-zsh 的 Git 别名：[ohmyzsh-git](https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/git/README.md)

将需要用的别名内容向下方这样写在 Power Shell 的 Profile 中，可以使用命令：

```powershell
$PROFILE.CurrentUserCurrentHost
```

查看 Profile 文件的位置。

整理的内容可以参考：

```ps
# ==================== 使用函数定义 Git 命令 ====================
function g { git $args }
function gst { git status $args }
function gd { git diff $args }
function gco { git checkout $args }
function gl { git pull $args }
function gp { git push $args }
function ga { git add $args }
function gaa { git add --all $args }
function gc { git commit -v $args }
function gcmsg { git commit -m $args }
function gcam { git commit -a -m $args }
function gcob { git checkout -b $args }
function gb { git branch $args }
function gba { git branch -a $args }
function glg { git log --stat --color $args }
function glgg { git log --graph --decorate --oneline $args }
function glo { git log --oneline --decorate --color $args }
function grb { git rebase $args }
function grba { git rebase --abort $args }
function grbc { git rebase --continue $args }
function grbs { git rebase --skip $args }
function gpr { git pull --rebase $args }
function gpf { git push --force $args }
function git_current_branch { git rev-parse --abbrev-ref HEAD }
function ggpush { git push origin "$(git_current_branch)" }
function ggpull { git pull origin "$(git_current_branch)" }

# 快速提交所有更改并推送
function gap() {
    git add .
    git commit -m "$args"
    git push
}

# (可选) 如果你想念 'll' 命令
function ll { Get-ChildItem -Force | Format-Wide -AutoSize }
```

直接将整理好的内容粘贴在文件尾部，并保存文件，就能在新打开的终端在使用这些命令了。
