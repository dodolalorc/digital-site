---
title: "MutationObserver学习+实践"
description: "MutationObserver 学习与实践记录，分析页面加载监听的局限，并用观察 DOM 变化实现主题效果。"
date: "2024-07-04T16:31:24+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - 浏览器API
  - MutationObserver
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> 一篇学习 MutationObserver 的文章

## 背景

今天调整新主题的时候，在重新设计友链样式的时候想保留原本的随机背景颜色，之前数量少的时候似乎不太明显，现在本地测试发觉加载太慢了。于是上网寻找解决思路，找到了 MutationObserver 这个 API，于是就学习了一下//此处记录一下学习过程。

## 需求分析

我有不知数量的div元素，每个div元素都有一个class名为`friend-link-div`，我需要在每个单个的div元素被加载完成的同时，对它设置一个随机的背景颜色。而不是等待整个页面或窗口加载完毕

## 想法分析

### `window.onload`和`'DOMContentLoaded'`的问题

原本的实现代码：

```js
window.onload = function () {
  const randomHex = () =>
    `rgba(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, 0.5)`;
  var friendArr = document.getElementsByClassName("friend-div"),
    temp = [];
  for (var i = 0; i < friendArr.length; i++) {
    friendArr[i].style.background = randomHex();
  }
};
```

原本的思路就是简单的在页面加载完成后，获取所有的友链元素，然后给每个元素设置一个随机的背景颜色。但是这样的实现方式有一个问题，就是当友链数量较多的时候，会导致页面加载变慢，因为每次都要重新计算随机颜色，并且在等待本页面加载的时候，友链的背景颜色是白色的，这样会导致页面的视觉体验不好。

在网上询问得到的另一个思路是用`document.addEventListener('DOMContentLoaded', function() {})`，但是这个方法也是等待整个页面加载完毕后才会执行，观察发现还是挺慢的...所以也不适合。

### 仅利用CSS实现随机色彩的思路

还有一个仅利用CSS实现随机色彩的思路，该思路是在CSS中定义一个颜色数组，然后通过`nth-child`选择器来实现，但是这样的实现方式有一个问题，就是颜色的数量是固定的，而且颜色的选择是有规律的，不是真正的随机颜色。

不过还是展示一下如何伪随机实现：

```css
  .friend-link-div:nth-child(1) {
    background: #f00;
  }
  .friend-link-div:nth-child(2) {
    background: #0f0;
  }
  .friend-link-div:nth-child(3) {
    background: #00f;
  }
  .friend-link-div:nth-child(4) {
    background: #ff0;
  }
  ...
```

搭配scss的话可以这样写：

```scss
$colors: #f00, #0f0, #00f, #ff0, #f0f, #0ff, #000, #fff;
@for $i from 1 through length($colors) {
  .friend-link-div:nth-child(#{$i}) {
    background: nth($colors, $i);
  }
}
```

于是放弃`window.onload`和`'DOMContentLoaded'`，以及CSS的伪随机实现方法。改用 `MutationObserver` 来实现。

## 解决思路

使用`MutationObserver API`来观察DOM的变化，并在新的盒子被添加到DOM中时应用背景色更改。这样，每当有新的盒子被添加到页面上时，你就可以立即更改它的背景，而不需要等待其他内容加载完成。

### 代码

```js
// 定义一个生成随机背景色的函数
const randomHex = () =>
  `rgba(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, 0.5)`;

// 遍历所有已经存在的盒子，为每个盒子设置随机背景色
document.querySelectorAll(".friend-link-div").forEach((div) => {
  div.style.background = randomHex();
});

// 定义一个回调函数，用于处理每当DOM树中添加新节点时的操作
const callback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // 检查是否为目标盒子节点
        if (node.nodeType === 1 && node.classList.contains("friend-link-div")) {
          // 更改背景色
          node.style.background = randomHex();
        }
      });
    }
  }
};

// 创建MutationObserver实例
const observer = new MutationObserver(callback);

// 配置观察选项：观察子节点的添加
const config = { childList: true, subtree: true };

// 选择要观察变化的DOM节点（在这个例子中，是body，但你可以根据需要更改）
const targetNode = document.body;

// 启动观察
observer.observe(targetNode, config);
```

### 关于用于hugo主题的一些Tips

有的时候DOM初始化时已经存在一些盒子，因此我们需要在初始化时为这些盒子设置随机背景色。然后，我们创建一个`MutationObserver`实例，并配置它以观察DOM树中的子节点添加。最后，我们选择要观察变化的DOM节点（在这个例子中是`body`，但你可以根据需要更改），并启动观察。

假如直接将js插入到`friend.html`中，打开控制台会发现该段js被渲染了好多次，这是因为hugo的模板渲染机制导致的，所以我们需要将js放在整个大页面的js中，这样就不会出现重复渲染的问题了。

一个合适的地方是在`layouts/partials/footer.html`中，这样就可以保证在整个页面加载完毯后再执行这段js。

不过直接放在`footer.html`中也会有一个问题，就是我们只需要在友链页面加载这段js，而不是每个页面都加载，所以我们可以在`footer.html`中加入一个判断条件，判断当前页面是否是友链页面，如果是则加载这段js。

可以在`content/links.md`中加入一个`isLink`字段，然后在`footer.html`中判断是否为友链页面，如果是则加载这段js。

```html
{{ if .Params.isLink }}
<script>
  // 代码
</script>
{{ end }}
```

假如不想每次都把新增的js直接写在`footer.html`等地方中，可以在`static/js/`文件夹下新建一个js文件，然后在`footer.html`中引入这个js文件。

```html
{{ if .Params.isLink }}
<script src="/js/_extended/friend-link.js"></script>
{{ end }}
```

另注：githubPage是jekyll模板似乎不能识别下划线开头的文件，所以有需要的话可以把`_extended`改成其他名字。

完成！现在，每当新的`friend-link-div`盒子被添加到DOM中时，它的背景颜色将立即更改为随机颜色。
可以在本站的友链页面查看效果：[友链](/links/)
