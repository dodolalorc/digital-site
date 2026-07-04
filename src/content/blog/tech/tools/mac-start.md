---
title: "mac 开荒手册"
description: "基础开发环境配置"
date: 2025-08-05
draft: false
showHeroImage: false
tags:
  - Mac
  - Git
  - HomeBrew
  - Item2
  - zsh
  - oh-my-zsh
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

# HomeBrew

`HomeBrew`是一款包管理工具，支持 Mac OS 和 Linux 系统，首先安装好 HomeBrew 可以方便我们获取其他所需要的软件。

官网访问：[Homebrew](https://brew.sh/)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 换源

如果官网的安装脚本总是失败，可以尝试换源（以清华源为例）：

```bash
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
export HOMEBREW_API_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/bottles"

/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
```

更多选择可以在这里查询：[镜像助手](https://brew.idayer.com/guide/change-source/)

## 更新

```bash
brew update
```

# oh-my-zsh

oh-my-zsh 是 zsh 的拓展工具集，安装 oh-my-zsh 的前提条件是安装使用 zsh。

## zsh

查询`zsh`版本：`zsh --version`

列出可用终端：

```bash
cat /etc/shells
```

当前使用的终端：

```bash
echo $SHELL
```

将默认终端设置成`zsh`，调整后需要重启生效：

```bash
chsh -s /bin/zsh
```

## 安装 oh-my-zsh

官网：[oh-my-zsh](https://ohmyz.sh/#install)，提供了`curl`和`wget`两种方式：

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

## 设置主题

安装成功后，打开配置文件，设置主题：

```bash
# 记事本打开
open ~/.zshrc
# vim打开
vim ~/.zshrc
```

显示内容：

```bash showLineNumbers warp {11}
# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH

# Path to your Oh My Zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time Oh My Zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

......
```

其中`ZSH_THEME="robbyrussell"`是主题参数的，可以在：[ohmyzsh/ohmyzsh/wiki/Themes](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)查看所有主题的效果，将选择使用的主题的名称填入这个参数即可。

### 字符支持

有一些主题依赖额外的字符，从 GitHub 下载并安装：

```bash
git clone https://github.com/powerline/fonts.git --depth=1

cd fonts
./install.sh

cd ..
rm -rf fonts
```

## oh-my-zsh 插件

除了漂亮的主题，oh-my-zsh 还拥有丰富的插件系统：[ohmyzsh/ohmyzsh/wiki/plugins](https://github.com/ohmyzsh/ohmyzsh/wiki/plugins)

还是打开`~/.zshrc`，其中有这样的内容：

```bash showLineNumbers warp {9}
# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)
```

默认在安装时已经配备了 git 的别名插件，其中常用的别名可以在这篇中查看：[git 配置别名](/04-tools/git_settings#5-配置别名)。

在插件系统中挑选喜欢的插件，推荐的插件有：

### 命令行高亮、补全

来源：[Oh my ZSH with zsh-autosuggestions zsh-syntax-highlighting zsh-fast-syntax-highlighting and zsh-autocomplete.md](https://gist.github.com/n1snt/454b879b8f0b7995740ae04c5fb5b7df)

安装如下插件：

- autosuggesions plugin
  - `git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions`
- zsh-syntax-highlighting plugin
  - `git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting`
- zsh-fast-syntax-highlighting plugin
  - `git clone https://github.com/zdharma-continuum/fast-syntax-highlighting.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/fast-syntax-highlighting`
- zsh-autocomplete plugin
  - `git clone --depth 1 -- https://github.com/marlonrichert/zsh-autocomplete.git $ZSH_CUSTOM/plugins/zsh-autocomplete`

在配置文件中使用：

```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting fast-syntax-highlighting zsh-autocomplete)
```

> 不过实际使用的时候个人还是喜欢去掉`zsh-autosuggestions`，只使用补全
### 其他推荐

- [z](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/z)：记录历史路径，提供快速跳转。使用`z`、`z p`。
- [copypath](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/copypath)：复制当前的路径到剪切板。使用：`copypath <文件或目录>`，不加参数就是复制当前路径，相比`pwd`再光标选中更快捷。
- [copyfile](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/copyfile)：复制文件内容到剪切板。使用：`copyfile filename.txt`，即可将文件的内容复制，省略打开文件的后全选复制的步骤。

# iTerm2

## 安装

```bash
brew install --cask iterm2
```

## 设置主题

1. `command ,`唤出 settings 菜单。
2. `Profiles`->`colors`->`color Presets`下选择颜色和主题、进行微调。
3. 更多颜色主题：[Iterm2-color-schemes](https://iterm2colorschemes.com/)
4. 挑选喜欢的主题后，下载对应的文件。
5. 在第 2 步的`color Presets`下选择`import`，选择下载的主题文件，后缀`.itermcolors`。
6. 再次打开`color Presets`就会发现主题已经加载，点击使用即可。

ddl 喜欢的主题：[tokyonight](https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/schemes/tokyonight.itermcolors)

最后将 item2 保留在程序坞上方便使用即可～

# Xcode-select 安装命令行工具

在安装 Homebrew 时，也会附带下载 Xcode 命令行工具，如果没有安装 Xcode 命令行工具，可以运行：

```bash
xcode-select --install
```

这是一个轻量级的工具包，包含开发所需的基础命令行工具，但不需要安装完整的 Xcode（节省空间，约 1-2GB）

> [!abstract]- 部分列举
>
> - 核心编译工具
>   - `clangd`：xcode 默认编译器
>   - `swift`和`swiftc`：swift 语言编译器
>   - `ld`（链接器）和`ar`（静态库打包工具）
>   - `make`和`cmake`：项目构建工具
> - 调试与分析工具
>   - `lldb`：xcode 调试器的命令行版本
> - 版本控制工具
>   - **`git`**：代码版本管理工具（macOS 自带  `git`  但版本较旧，CLT 会更新到最新版）。
>   - **`svn`**：Subversion 版本控制工具。
> - 文档工具
>   - `header` 文件：C/C++ 标准库、系统框架的头文件（如  `stdio.h`、`Foundation.framework`）
>   - `man`文档：命令行工具的手册页（如  `man clang`）。
> - 其他实用工具
>   - `xcrun`：Xcode 工具链的调度命令（用于调用其他工具）。
>   - `sdkmanager`：管理 SDK 路径（如  `xcrun --show-sdk-path`）。
>   - `pkgutil`：软件包管理工具。

或许你也对[💻 常用 xcode 使用命令](/04-tools/xcode_commands)感兴趣。

# Git 环境设置

Mac 系统自带了 Git，或者在安装 XCode 时，也已经安装了 Git。

可以参考此文章获得更详细的配置：[🔑Git 环境配置和 SSH 公钥设置](/04-tools/git_settings)

# Mac 上给 VS code 设置命令行打开目录

[VS code 官网](https://code.visualstudio.com/)

1. 打开 VS code，`shift + command + p`调出命令面板
2. 输入`shell Command`，选择`在PATH中安装code命令`
3. 点击弹出框，确认操作