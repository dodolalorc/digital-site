---
title: "Margin 折叠"
description: "CSS Margin 折叠笔记，说明折叠产生原因、常见场景、负 margin 规则和阻止折叠的方法。"
date: "2025-10-03T04:31:02+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - CSS
  - 盒模型
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## 一句话概括

当两个或多个垂直相邻的块级元素的 margin 相遇时，它们会合并（折叠）成一个 margin。这个合并后的 margin 的大小等于发生折叠的 margin 中的最大值。

这个行为**只发生在垂直方向**（即上下），水平方向的 margin 永远不会折叠。

> [!tip]+ 什么是块级元素
> 块级元素是 HTML 中默认显示样式为  `display: block`  或  `display: list-item`  的元素。它们最核心的特征是**在页面流中会独占一行**，就像一个“块”一样，后续元素会自动换行显示。
>
> - 可以通过  `width`  和  `height`  属性来设置它的宽度和高度。即使没有设置，它的默认宽度也是其父级容器的  **100%**。
> - 通常块级元素可以包含内联元素和其他块级元素（但有一些例外，如  `<p>`  标签内不能包含其他块级元素）。
>
> **与内联元素的对比**
> 为了更好地理解块级元素，我们把它和它的“对立面”——**内联元素**  进行对比。
>
> | 特性         | 块级元素                                     | 内联元素                                                              |
> | ------------ | -------------------------------------------- | --------------------------------------------------------------------- |
> | **布局方式** | 独占一行，前后都是换行                       | 与其他内联元素在同一行内排列                                          |
> | **设置宽高** | **可以**设置  `width`  和  `height`          | **不可以**，其大小由内容撑开                                          |
> | **设置边距** | 上下左右  `margin`  和  `padding` **都有效** | 左右  `margin`  和  `padding`  有效，**上下无效**（不会推开其他元素） |
> | **默认宽度** | 父元素宽度的 100%                            | 内容的宽度                                                            |
> | **包含关系** | 可包含内联元素和其他块级元素                 | 通常只能包含数据和其他内联元素                                        |
>
> 一个元素的“块级”或“内联”特性是由 CSS 的 display 属性决定的。我们可以通过 CSS 改变任何元素的默认显示类型。
> `display: block;`：将元素设置为块级元素。
> `display: inline;`：将元素设置为内联元素。
> `display: inline-block;`：混合模式。元素像内联元素一样可以排列在同一行，但又可以像块级元素一样设置宽高和上下边距。这是一个非常常用的属性。

### 为什么会存在 Margin 折叠

这个设计源于早期印刷排版。在排版文字段落时，通常希望段落之间的间距是统一的，而不是第一个段落的上边距加上第二个段落的下边距。CSS 沿用了这一设计，使得在连续的文字流内容（如多个 `<p>` 标签）中，视觉间距看起来更自然。

## 发生 Margin 折叠的基本情况

### 相邻的兄弟元素

这是最常见的情况。两个上下相邻的块级元素，下面元素的上边距和上面元素的下边距会发生折叠。

HTML：

```html
<div class="box box1">Box 1</div>
<div class="box box2">Box 2</div>
```

CSS:

```css
.box {
  width: 200px;
  height: 100px;
}
.box1 {
  margin-bottom: 50px;
  background: lightcoral;
}
.box2 {
  margin-top: 30px;
  background: lightblue;
}
```

结果：两个 `<div>` 之间的垂直距离不是 50px + 30px = 80px，而是 max(50px, 30px) = 50px。

| Box1                                                                   | Box2                                                                   |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![image.png](https://img.dodolalorc.cn/i/2025/10/03/68dee30be12da.png) | ![image.png](https://img.dodolalorc.cn/i/2025/10/03/68dee31a76b75.png) |

### 父元素和第一个/最后一个子元素

当父元素没有有效的边框（border）、内边距（padding）、内联内容（inline content）或清除浮动（clear）来分隔时，父元素的上边距和其第一个子元素的上边距会发生折叠（同样，下边距和最后一个子元素的下边距也会折叠）。

HTML:

```html
<div class="parent">
  <div class="child">Child</div>
</div>
```

CSS：

```css
.parent {
  margin-top: 50px;
  background: lightgray;
  /* 没有 padding, border */
}
.child {
  margin-top: 30px;
  height: 50px;
  background: lightgreen;
}
```

结果：父元素 `.parent` 的顶部会与浏览器窗口顶部（或上一个元素）产生 max(50px, 30px) = 50px 的间距。看起来就像是父元素和子元素“粘”在了一起，共享了同一个上边距。

![image.png](https://img.dodolalorc.cn/i/2025/10/03/68dee400357ec.png)

> [!tip]+ 如何阻止这种情况？
> 给父元素添加以下任一属性即可“创建新的块级格式化上下文”或设置隔离：
>
> - `border-top: 1px solid transparent;` （即使是 0 宽的 border 也有效）
> - `padding-top: 1px;`
> - `overflow: auto;`  或  `overflow: hidden;` （最常用的方法之一）
> - `display: flow-root;` （现代且专为此目的设计的方法）
> - `flex` / `grid`  布局也会创建新的格式化上下文。

### 空的块级元素

如果一个块级元素中没有任何内容、边框、内边距或高度，那么它自身的上边距和下边距会发生折叠。

HTML：

```html
<div class="empty-box"></div>
<p>后面的段落</p>
```

CSS:

```css
.empty-box {
  margin-top: 50px;
  margin-bottom: 30px;
  /* 没有 height, border, padding */
}
p {
  margin-top: 20px;
}
```

结果：这个空的 `.empty-box` 元素所产生的垂直间距是 max(50px, 30px, 20px) = 50px。这个空元素本身在页面上不占据任何视觉高度，但它产生的 margin 却影响了布局。

![image.png](https://img.dodolalorc.cn/i/2025/10/03/68dee5008a9e8.png)

## 负 Margin 的折叠规则

- 如果都是正数，取最大值。
- 如果都是负数，取绝对值最大的那个（即最小值）。
- 如果有正有负，则用正数的最大值加上负数的最小值（即绝对值最大的负数）。
- 例如：`20px`  和  `-15px`  折叠后是  `20px + (-15px) = 5px`。
- 例如：`-10px`  和  `-20px`  折叠后是  `min(-10px, -20px) = -20px`。

## 如何阻止折叠？

- 对于父子折叠，最常用的是给父元素设置  `overflow: hidden;`、`padding`  或  `border`。
- 使用  `display: flow-root;`  是现代的、语义化的方法。
- 使用 Flexbox 或 Grid 布局，它们的子项 margin 不会与容器发生折叠。
- 对于相邻元素，虽然不常见，但可以将其中的一个设为非块级元素（如  `inline-block`），或者用  `padding`  来替代 margin。
