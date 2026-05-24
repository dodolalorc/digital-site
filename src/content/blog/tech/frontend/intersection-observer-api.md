---
title: "Intersection Observer API 监听是否进入了可视区域"
description: "Intersection Observer API 学习笔记，介绍观察器配置、回调机制、懒加载和元素入场动画等用法。"
date: "2025-09-17T17:53:56+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - 浏览器API
  - IntersectionObserver
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# API 介绍

Intersection Observer API 提供了一种**异步**观察目标元素与祖先元素或顶级文档视口（viewport）**交叉状态**（即“相交”）的方法。简单来说，它可以非常高效地**监听一个元素是否进入了可视区域**。

在它出现之前，我们通常通过监听  `scroll`  事件，然后频繁调用  `Element.getBoundingClientRect()`  来计算目标元素的位置来实现这个功能。这种方式是**同步**的，并且运行在主线程上，性能开销非常大，很容易造成页面卡顿。

Intersection Observer API 将这些工作交给浏览器原生处理，性能高效且使用简便。

## 使用场景

主要为了解决以下场景的性能和实现复杂度问题：

1. **图片或内容的懒加载**：当页面滚动到相应区域，才加载真实的图片或内容。
2. **无限滚动**：在用户滚动接近底部时，自动加载更多内容，无需翻页。
3. **曝光统计**：统计广告或某个内容是否被用户看到。
4. **启动动画**：当用户滚动到某个区域时，再播放动画，避免一开始就全部播放。

## 使用方法

### 创建观察器

```js
new IntersectionObserver(callback, options);
```

- **callback**： 当被观察元素的交叉状态发生变化时执行的回调函数。
- **options**： 可选配置参数，用于定制观察器的行为。

### Options 配置对象

```js
let options = {
  root: null, // 指定根元素，默认为浏览器视口
  rootMargin: "0px", // 根元素的扩缩边距，类似于 CSS 的 margin
  threshold: 0, // 交叉比例的阈值，可以是数组 [0, 0.25, 0.5, 0.75, 1]
};
```

- **root**： 用作检查目标可见性的视口元素，必须是目标元素的祖先。如果为  `null`  或未指定，则默认为浏览器视口。
- **rootMargin**： 在计算交叉点时，对根元素的边界进行收缩或扩张。可以设置像  `‘10px 20px 30px 40px’`  这样的值，让目标元素提前或延迟进入“相交状态”。
- **threshold**： 决定了什么时候触发回调。它是一个数值（或数组），表示目标元素与根元素相交的比例达到多少时触发回调。例如，`0`  表示目标元素刚进入根元素可见区域就触发，`1`  表示完全进入时才触发。

### 回调函数

当元素的可见性达到阈值时，回调函数就会被调用。回调接收一个  `entries`  参数（IntersectionObserverEntry 对象的数组）和观察器本身。

**IntersectionObserverEntry**  对象提供了多个有用属性来描述交叉状态：

- `entry.boundingClientRect`： 目标元素的矩形区域信息。
- `entry.intersectionRatio`： 目标元素与根元素的相交比例。
- `entry.intersectionRect`： 描述根元素和目标元素的相交区域。
- `entry.isIntersecting`： 一个布尔值，如果目标元素与根元素相交，则为  `true`。
- `entry.target`： 被观察的目标元素本身。
- `entry.time`： 交叉状态发生变化的时间戳。

### 开始观察与停止观察

- `observer.observe(targetElement)`： 开始观察一个目标元素。
- `observer.unobserve(targetElement)`： 停止观察一个特定的目标元素。
- `observer.disconnect()`： 停止观察所有目标元素。

## 使用示例

### 图片懒加载

```html
<img data-src="real-image.jpg" alt="Lazy Image" class="lazy-load" />

<script>
  // 1. 创建观察器
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        // 2. 如果元素进入视口
        if (entry.isIntersecting) {
          const img = entry.target;
          // 3. 将 data-src 的值赋给 src，开始加载图片
          img.src = img.dataset.src;
          img.classList.remove("lazy-load");
          // 4. 图片加载完成后，停止观察
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "0px 0px 100px 0px", // 在视口底部还有 100px 时就开始加载
    },
  );

  // 5. 找到所有需要懒加载的图片，并开始观察
  document.querySelectorAll("img.lazy-load").forEach((img) => {
    observer.observe(img);
  });
</script>
```

### 元素进入视口时添加动画类

```html
<div class="fade-in-section">我会在出现时淡入</div>

<style>
  .fade-in-section {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.6s ease-out,
      transform 0.6s ease-out;
  }
  .fade-in-section.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>

<script>
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 使用 isIntersecting 判断
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // 如果动画只需要播放一次，可以在这里取消观察
          // observer.unobserve(entry.target);
        } else {
          // 如果想在元素离开视口时取消动画，可以移除类
          // entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      threshold: 0.1, // 元素有 10% 可见时就触发
    },
  );

  document.querySelectorAll(".fade-in-section").forEach((section) => {
    observer.observe(section);
  });
</script>
```

## 优点与注意事项

### 优点：

- **高性能**：异步执行，不阻塞主线程。
- **使用简单**：API 清晰，几行代码就能实现复杂功能。
- **功能强大**：通过  `root`, `rootMargin`, `threshold`  可以精确控制触发时机。

### 注意事项：

- **兼容性**：现代浏览器支持良好，但对于旧浏览器（如 IE）需要 polyfill（如  `w3c/IntersectionObserver`）。
- **异步执行**：回调函数中的代码是异步执行的，不要在此执行耗时操作。
- **首次调用**：观察器创建后，默认会在第一时间用初始的交叉状态调用一次回调函数。

## 总结

Intersection Observer API 是一个强大且高效的现代浏览器 API，它完美地解决了基于滚动监听的传统方案所带来的性能问题。对于实现懒加载、无限滚动、曝光追踪和滚动动画等常见需求，它现在是**首选的标准方案**。
