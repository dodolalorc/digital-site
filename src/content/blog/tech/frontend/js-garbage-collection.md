---
title: "JavaScript 垃圾回收机制简述"
description: "JavaScript 垃圾回收笔记，介绍标记清除算法、优化概念以及避免内存泄漏的常见做法。"
date: "2025-10-08T22:52:14+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

JavaScript 是一种**具有自动垃圾回收**的语言。这意味着开发者通常不需要手动管理内存，JavaScript 引擎（如 V8）会自动找出不再使用的变量并释放它们占用的内存。

垃圾回收的核心思想是：**确定哪些“对象”已经“不可达”，然后释放它们。**

## 关键算法：标记-清除

现代浏览器（尤其是 Chrome 的 V8 引擎）主要使用**标记-清除**算法，并辅以其他优化。

### 步骤

#### 步骤 1: 标记

垃圾回收器会从一组称为  **"根"**  的对象开始。

- **根对象包括：**
  - 全局对象（在浏览器中是  `window`，在 Node.js 中是  `global`）
  - 当前函数调用链中的局部变量和参数（存储在调用栈上）

然后，垃圾回收器会从这些根对象出发，遍历所有能从根对象**直接或间接访问到的对象**，并将这些对象标记为  **“可达的”**。

#### 步骤 2: 清除

在标记阶段完成后，所有没有被标记为“可达”的对象，就被认为是  **“不可达的”** ，即应用程序不再需要它们了。垃圾回收器会将这些不可达对象所占用的内存回收。

#### 一个简单的例子

```js
let person = {
  name: "Alice",
};

// 对象 { name: 'Alice' } 被变量 `person` 引用，因此是“可达的”。

person = null;
// 现在，`person` 不再引用那个对象。
// 对象 { name: 'Alice' } 变得“不可达”。
// 在下次垃圾回收运行时，这个对象的内存将被回收。
```

### 辅助概念与优化

#### 1. 引用计数（一种已被淘汰的原始算法）

虽然现代浏览器不再主要使用它，但了解它有助于理解。

- **原理：**  跟踪每个对象被引用的次数。当一个对象的引用计数变为 0 时，就立即回收它。
- **致命缺陷：** **循环引用**。

```javascript
function problem() {
  let objA = {};
  let objB = {};

  objA.someProperty = objB; // objB 被 objA 引用 (计数=2)
  objB.anotherProperty = objA; // objA 被 objB 引用 (计数=2)

  // 当函数执行完毕，objA 和 objB 离开了作用域，它们的引用各减1。
  // 但它们彼此之间仍然相互引用，所以计数不为0。
  // 在引用计数算法下，这两个对象永远不会被回收，导致内存泄漏。
}
```

在**标记-清除**算法中，由于函数执行后  `objA`  和  `objB`  都从根对象（调用栈）上无法到达，所以即使它们相互引用，仍然会被正确识别为垃圾并回收。

#### 2. 分代收集

这是现代垃圾回收器的一个核心优化策略。它将堆内存中的对象分为两个（或更多）“代”：

- **新生代：**  存放生存时间短的对象（如函数内的局部变量）。
  - 大多数对象在这里诞生并很快死亡。
  - 垃圾回收发生得非常频繁，速度也很快。这个过程称为  **Scavenge**（通常使用 Cheney 算法，将存活对象从一个区域复制到另一个区域）。
- **老生代：**  存放生存时间长的对象（如全局对象、从新生代晋升过来的对象）。
  - 如果一个对象在新生代经历了几次垃圾回收后仍然存活，它就会被**晋升**到老生代。
  - 老生代的垃圾回收不那么频繁，但执行起来更耗时，通常使用**标记-清除**或**标记-整理**算法。

#### 3. 增量收集与闲时收集

为了不让垃圾回收过程（尤其是老生代的回收）导致页面卡顿或脚本执行暂停（“全停顿”），引擎采用了以下策略：

- **增量收集：**  将完整的垃圾回收工作分解为多个小任务，穿插在 JavaScript 主线程的执行中。
- **闲时收集：**  尽量在 CPU 空闲时运行垃圾回收任务。

## 如何帮助垃圾回收（避免内存泄漏）

尽管垃圾回收是自动的，但编写不当的代码仍然会导致内存泄漏。

### 意外的全局变量

```js
function foo() {
  bar = "这是一个全局变量"; // 没有用 var/let/const 声明！
  this.accidentalGlobal = "oops"; // 在非严格模式下，this 指向 window
}
foo();
// 变量 `bar` 和 `accidentalGlobal` 会一直存在，直到页面关闭。
```

#### 对策：杜绝未经声明的变量和不当的`this`引用

**具体措施：**

- **使用严格模式：**  在脚本或函数开头添加  `"use strict";`。在严格模式下，给未声明的变量赋值会抛出错误，而不是创建全局变量。
- **始终使用变量声明关键字：**  总是使用  `let`、`const`  或  `var`  来声明变量。

```js
"use strict"; // 开启严格模式

function foo() {
  let bar = "这是一个局部变量"; // 使用 let 声明
  // 在严格模式下，这里的 this 是 undefined，赋值会报错
  // this.accidentalGlobal = "oops";
}
foo();
// 函数外部无法访问 bar，函数执行完毕即可被回收
```

### 被遗忘的定时器或回调函数

```js
let someData = getHugeData();
setInterval(() => {
  let node = document.getElementById("Node");
  if (node) {
    // 这个闭包一直引用着 someData
    node.innerHTML = JSON.stringify(someData);
  }
}, 1000);
// 即使不再需要 `someData`，定时器不清除，它也无法被回收。
```

#### 对策：清理被遗忘的定时器和回调函数

**核心原则：**  在不需要时，主动清理所有会长期存在的引用。

**具体措施：**

- **保存定时器 ID 并及时清除：**  使用  `clearInterval`  或  `clearTimeout`  来清除不再需要的定时器。
- **在组件卸载等生命周期中清理：**  在现代前端框架（如 React、Vue）中，在组件的卸载生命周期钩子中执行清理操作是至关重要的。

```js
let someData = getHugeData();
let timerId = setInterval(() => {
  let node = document.getElementById("Node");
  if (node) {
    node.innerHTML = JSON.stringify(someData);
  } else {
    // 如果节点已经不存在，清除定时器
    clearInterval(timerId);
    someData = null; // 显式断开对大数据的引用
  }
}, 1000);

// 当确定不再需要这个定时器时（例如，用户离开页面或关闭功能模块）
// clearInterval(timerId);
```

对于事件监听器也同样适用：

```js
function handleClick() {
  /* ... */
}
element.addEventListener("click", handleClick);

// 在不需要时，一定要移除
// element.removeEventListener('click', handleClick);
```

### 脱离 DOM 的引用

```js
let elements = {
  button: document.getElementById("myButton"),
};

// 后来从DOM树中移除了这个按钮
document.body.removeChild(document.getElementById("myButton"));

// 只要 `elements.button` 这个引用还存在，这个按钮对应的DOM对象在内存中就无法被回收。
```

#### 对策：管理脱离 DOM 的引用

**核心原则：**  当 DOM 元素被移除后，应该同时释放所有对它的 JavaScript 引用。

**具体措施：**

- **使用弱引用：**  如果确实需要跟踪 DOM 元素但又不想阻止其被回收，可以使用  `WeakMap`  或  `WeakSet`。它们持有的是“弱引用”，不会阻止垃圾回收。
- **手动置空：**  在移除 DOM 元素后，手动将存储其引用的变量设置为  `null`。

```js
// 使用 WeakMap 来存储与DOM元素相关的数据
let elementData = new WeakMap(); // WeakMap 的键是弱引用的

let button = document.getElementById("myButton");
elementData.set(button, { clickCount: 0 });

// 后来从DOM树中移除了这个按钮
document.body.removeChild(button);
button = null; // 释放对按钮的强引用

// 此时，button 对应的DOM对象没有强引用了，即使它在 WeakMap 中，也会被GC回收
// 之后，它对应的值 { clickCount: 0 } 也会因为键对象被回收而从 WeakMap 中自动移除
```

### 闭包使用不当

```js
function outer() {
  let bigData = new Array(1000000).fill("*");
  return function inner() {
    // 即使 outer 执行完毕，只要 inner 函数存在，bigData 就不会被回收
    console.log("hi");
  };
}
let holdClosure = outer(); // bigData 被 inner 函数闭包引用
// 如果不再需要 holdClosure，记得将其设置为 null
// holdClosure = null;
```

#### 对策：谨慎使用闭包

**具体措施：**

- **避免在闭包中捕获不必要的大对象：**  设计函数时，考虑是否需要将整个大对象保存在闭包中。有时可以只传递需要的属性。
- **主动释放：**  如果闭包函数只在特定阶段有用，在使用完毕后，将其引用设置为  `null`。

```js
function outer() {
  let bigData = new Array(1000000).fill("*");
  return function inner() {
    console.log("hi");
    // 如果 inner 函数不需要访问 bigData，就不要在 outer 中定义 bigData
    // 如果确实需要，考虑只传递 bigData 的一部分必要数据
  };
}

let holdClosure = outer();

// ... 使用 holdClosure ...

// 当确定不再需要这个闭包功能时
holdClosure = null;
// 现在，inner 函数变得不可达，与之关联的闭包作用域（包含 bigData）也会一并被回收
```
