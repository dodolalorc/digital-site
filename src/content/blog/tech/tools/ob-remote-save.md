---
title: "obsidian远程同步方案"
description: "Obsidian 远程同步方案记录，整理 infiniCloud 与 Obsidian 的连接配置和进一步同步设置。"
date: "2026-05-12T15:56:01+08:00"
draft: false
showHeroImage: false
tags:
  - 开发工具
  - Obsidian
  - 同步方案
  - Git
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# infiniCloud

首先在 infini 注册一个账号：[InfiniCLOUD](https://infini-cloud.net/en/index.html)

一个账号的免费存储空间是 20GB，可以填个邀请码多加 5GB 的存储（ddl 的邀请码：59RG5）

注册后进入`My Page`，在 Apps Connection 中获取 dav、用户名、密钥

![136296f1a26578f62a6d79df583f29ee.png](https://dodola-images-1324351636.cos.ap-guangzhou.myqcloud.com/136296f1a26578f62a6d79df583f29ee.png)

# obsidian

回到 obsidian，在社区中下载这个插件：`Remotely Save`

![69b2896503d8d8bcde9ba46745f20231.png](https://dodola-images-1324351636.cos.ap-guangzhou.myqcloud.com/69b2896503d8d8bcde9ba46745f20231.png)

之后在插件中配置上述在 infinicloud 中获得的信息：

![77be596e121488d91244719491a20d87.png](https://dodola-images-1324351636.cos.ap-guangzhou.myqcloud.com/77be596e121488d91244719491a20d87.png)

至此已经可以正常使用了，配置成功后，在 obsidian 的左侧会有一个![image.png](https://dodola-images-1324351636.cos.ap-guangzhou.myqcloud.com/20260512161550640.png)图标

## 进一步的配置

可以在 Remotely save 的插件配置中添加同步文件的正则表达式等

![image.png](https://dodola-images-1324351636.cos.ap-guangzhou.myqcloud.com/20260512161748188.png)

还有多设备同步时的覆写方案。

这个远程同步是覆写逻辑，可以支持增量的方式等等，不会像 git 一样拥有太多版本，如果 async 需要面对更加复杂的场景，还是建议使用 git 啦~
