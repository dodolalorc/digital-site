---
title: "Electron 构建记录 | 一条龙服务script"
description: "Electron 构建环境记录，整理 Chromium 开发工具、Electron build-tools 初始化和构建脚本流程。"
date: "2025-04-25T13:27:50+08:00"
draft: false
showHeroImage: false
tags:
  - Electron
  - 桌面应用
  - 构建部署
  - 脚本
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> System：Windows 11
> Python：Python 3.13.3
> node：v22.14.0
> npm：10.9.2
> yarn：1.22.22
> 足够的磁盘空间和流量：源代码一套（chromium+electron）大约 70G，预留构建内核的内存空间，一共保留 200G 比较好

## 初始化环境

`Electron`  是嵌入  [Chromium](https://www.chromium.org/)  和  [Node.js](https://nodejs.org/)  到 二进制进行开发，所以在构建`Electron`时显然也要准备这两者的开发环境。

### Chromium 开发工具

参考[Chromium 此页](https://chromium.googlesource.com/chromium/tools/depot_tools.git)拉取`depot_tools`。

拉取完毕之后，将`depot_tools`的路径加入到系统变量`path`中，并将变量位置上移到至少`git`变量之前。

`depot_tools`需要本机安装了`Git for Windows`，以及`python 3.8`。

#### 识别不到安装的`git`

报错信息：

```bash
$ gclient --version
Updating depot_tools...
WARNING:root:depot_tools will stop bundling Git for Windows on 2025-01-27.
To prepare for this change, please install Git directly. See
https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md#Install-git

Having issues and not ready for depot_tools to stop bundling
Git for Windows? File a bug at:
https://issues.chromium.org/issues/new?component=1456702&template=2045785

ERROR:root:Failed to bootstrap depot_tools.
Git was not found in PATH. Have you installed it?
```

本机使用[Scoop](https://scoop.sh/)安装大部分的软件，难过的是通过这样下载的`git`由于`PATH`是通过 scoop 的垫片`Shims`技术管理的，无法被`depot_tools`工具识别。

一种方法是卸载本机当前的`git`后在[git](https://git-scm.com/downloads)重新下载一遍，重新添加`PATH`，另一种方法是将 git 路径单独加进去，之后`gclient`。

1. 右键"此电脑" → "属性" → "高级系统设置"
2. 点击"环境变量"
3. 在"系统变量"中找到"Path"，点击"编辑"
4. 添加 Git 的 bin 目录路径

### Electron build-tools

本篇使用的脚本是[Electron build-tools](https://github.com/electron/build-tools)，傻瓜一站式拉取不用管任何版本或分支。

> 注意需要安装好 yarn 等工具：`npm i -g yarn`

按照 readme 的提示安装：

```bash
npm i -g @electron/build-tools
```

在本机找好存放源码的位置后，进行：

```bash
e init --root=~/electron --bootstrap testing
```

`--root=~/electron`是拉取的时候想要存源码的位置，如果留空则在当前路径下，建议选择合适的磁盘。

#### 识别不到命令

在`e init ...`命令执行到一半，发现中断在某处，重新进行`e sync -f`后，出现找不到 npm 命令的反馈。

```bash
$ e sync -f
Checking for build-tools updates
'npm' 不是内部或外部命令，也不是可运行的程序或批处理文件
'npx' 不是内部或外部命令，也不是可运行的程序或批处理文件
```

进行拉取时，脚本在执行到大约`python script/lib/npx.py yarn@1.15.2 install --frozen-lockfile`的时候发生了报错，称`FileNotFoundError: [WinError 2]`，导致`ERROR gclient sync failed`失败。

仔细阅读日志之后，先在命令行直接执行上述脚本语句，发现运行是正常的，同时想的本机在平时开发使用 python、node.js 均没有出现找不到命令的问题，且实验当时在命令行测试`node -v`、`yarn --version`和`npm -v`都有版本返回，排错查看环境变量`path`也有正确设置。

本机使用了 node.js 版本管理工具`fnm`，继而想到或许需要激活 node 环境，于是先运行了`fnm use v22`，发现继续的拉取依然有问题，想到或许是通过`fnm`设置的临时环境会不被识别，于是选择直接在 [node.js](https://nodejs.org/en) 官网下载一个合适的版本，这样操作之后能成功运行完毕。

不太确定`nvm`会不会也有这样的问题，但是插个眼，解决方法还是比较简单的。

> `update`：Mac 上没有这个问题捏

## 构建

附一张成功拉取的截图(嘻嘻)

![image.png](https://img.dodolalorc.cn/i/2025/04/26/680c5ddac8c6d.png)

在进行`e build`之后，初次构建需要鉴权，点击命令行提示的网址操作一下就好啦~

然后就是继续泡 n 杯咖啡等待构建。

构建成功之后的结果会存在`./src/out/..`目录下，在命令行执行：

```bash
e start
```

可以在命令行看到当前构建出的`Electron`信息，以及弹出的窗口。

![image.png](https://img.dodolalorc.cn/i/2025/04/27/680dd921a3158.png)

根据提示的命令启动本地的 electron demo

![50d9f84772570dea5e3f8dd6c1fd2dd2.png](https://img.dodolalorc.cn/i/2025/04/27/680dd96b91c23.png)

合影 😗
