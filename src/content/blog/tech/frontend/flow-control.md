---
title: "前端流量控制常用手段"
description: "前端流量控制笔记，整理防抖、节流、请求队列等常见手段的实现方式和注意事项。"
date: "2025-03-17T11:40:19+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - JavaScript
  - 流量控制
  - 性能优化
categories:
  - 前端
series:
  - 前端性能优化
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> [!abstract]+ 问题描述
> 如何解决页面请求接口的大规模并发问题？

在需要处理大规模请求的情境中，做好流量控制可以提升系统稳定性和性能。

## 防抖/节流

### 防抖（Debounce）

在事件触发后，延迟执行函数，若在延迟期间再次出发，则重新计时，如在搜索框输入、调整窗口大小时。

#### 实现

```js
function debounce(fn, wait) {
  let timeout;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(context, args);
    }, wait);
  };
}

const sample = function () {
  console.log("xxx");
};

window.addEventListener("resize", debounce(sample, 300));
```

#### 为什么在  `debounce`  函数中使用  `let`？

在  `debounce`  函数中，`timeout`  变量需要满足以下条件：

1. **块级作用域**：`timeout`  只需要在  `debounce`  函数内部有效，不需要泄漏到外部作用域。
2. **可重新赋值**：每次调用返回的函数时，`timeout`  需要被重新赋值（通过  `clearTimeout`  和  `setTimeout`）。
3. **不需要提升**：`timeout`  不需要在声明前访问，因此不需要  `var`  的提升行为。

`let`  完美符合这些需求：

- 它提供了块级作用域，避免变量泄漏。
- 它允许重新赋值，适合存储定时器 ID。
- 它不会提升，避免了潜在的逻辑错误。

如果使用  `var`：

- `timeout`  会泄漏到外部作用域，可能导致意外行为。
- 虽然可以重新赋值，但作用域规则不如  `let`  清晰。

如果使用  `const`：

- `timeout`  不能被重新赋值，无法满足  `debounce`  的逻辑需求。

> [!tip]+ var、let和const
> **作用域区别**：`var`是函数作用域，`let`和`const`是块级作用域。
>
> **变量升级**：`var`可以升级（初始值是`undefined`），`let`和`const`不能变量升级，是暂时性死区。
>
> _变量提升指的是在代码执行前，js 引擎将变量和函数的声明提示到作用域的顶部，也就是说可以在声明之前使用变量或函数，但赋值操作会保留在原位置。_
>
> Example：变量
>
> ```js
> console.log(a); // 输出: undefined
> var a = 10;
> console.log(a); // 输出: 10
> ```
>
> 实际执行顺序：
>
> ```js
> var a;
> console.log(a); // 输出: undefined
> a = 10;
> console.log(a); // 输出: 10
> ```
>
> Example：函数
>
> ```js
> foo(); // 输出: "Hello"
> function foo() {
>   console.log("Hello");
> }
> ```
>
> 实际执行顺序：
>
> ```js
> function foo() {
>   console.log("Hello");
> }
> foo(); // 输出: "Hello"
> ```
>
> **重新赋值**：`var`和`let`可以重新赋值，`const`不可以。
>
> **适用场景**：
>
> `var`：旧代码、全局变量
>
> `let`：块级作用域、需要重新赋值
>
> `const`：常量、不需要重新赋值

### 节流（Throttle）

在规定时间内，函数只执行一次，多余触发被忽略，适用于滚动事件、按钮点击等情景。

#### 实现

```js
function throttle(fn, limit) {
  let inthrottle;
  return function () {
    let context = this;
    let args = arguments;
    if (!inthrottle) {
      fn.apply(context, args);
      inthrottle = true;
      setTimeout(() => {
        inthrottle = false;
      }, limit);
    }
  };
}

const sample = function () {};

window.addEventListener("scroll", throttle(sample, 2000));
```

### 注意事项

- 这两个函数都返回一个新的函数，这个新函数会包装传入的原始函数，并根据防抖或节流的逻辑来调用它。
- 防抖和节流的区别在于，防抖是在事件触发后等待一段时间再执行，而节流是确保事件触发后的一段时间内只执行一次。
- 这两个函数都可以接受任意数量的参数，并将它们传递给原始函数。

## 请求队列

所用算法：**滑动窗口**

每次只处理长度为`maxConcurrent`的窗口内的事件。

### 实现

```js
class RequestQueue {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent; // 最大并发数
    this.queue = []; // 请求队列
    this.currentlyRunning = 0; // 当前正在运行的请求数
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length > 0 && this.currentlyRunning < this.maxConcurrent) {
      const { request, resolve, reject } = this.queue.shift();
      this.currentlyRunning++;
      request()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.currentlyRunning--;
          this.processQueue();
        });
    }
  }
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`Data from ${url}`);
    }, 1000);
  });
}

const urls = ["url1", "url2", "url3", "url4", "url5"];

const requests = urls.map((url) => () => fetchData(url));
const myRequestQueue = new RequestQueue(2);

Promise.all(requests.map((request) => myRequestQueue.add(request)))
  .then((data) => console.log(data))
  .catch((err) => console.error(err));

// 1s 后输出
// [ 'Data from url1', 'Data from url2', 'Data from url3', 'Data from url4', 'Data from url5' ]
```

## 分页加载

分批加载数据，减少单次请求量，应用于长列表、分页数据。

### 示例

```js
let currentPage = 1;
const pageSize = 20;
let isLoading = false;

function loadMoreData() {
  if (isLoading) {
    return;
  }
  isLoading = true;
  fetch(`/aoi/items?page=${currentPage}&limit=${pageSize}`)
    .then((response) => response.json())
    .then((data) => {
      // 处理数据并更新页面
      const container = document.getElementById("container");
      data.forEach((item) => {
        const div = document.createElement("div");
        div.innerHTML = item.name;
        container.appendChild(div);
      });
      currentPage++;
      isLoading = false;
    })
    .catch((error) => {
      console.error(error);
      isLoading = false;
    });
}

// 监听滚动事件
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight) {
    loadMoreData();
  }
});

// 初始化加载
loadMoreData();
```

## 懒加载（lazy Load）

延迟加载非关键资源，减少初始负载，如图片、视频、长列表。

### 实现

```js
document.addEventListener("DOMContentLoaded", function () {
  const lazyImages = document.querySelectorAll("img.lazy");

  const lazyLoad = function () {
    lazyImages.forEach((img) => {
      if (
        img.getBoundingClientRect().top < window.innerHeight &&
        img.getBoundingClientRect().bottom > 0 &&
        getComputedStyle(img).display !== "none"
      ) {
        img.src = img.dataset.src;
        img.classList.remove("lazy");
      }
    });
  };

  lazyLoad();
  window.addEventListener("scroll", lazyLoad);
});
```

## 请求重试

请求失败后，按策略重试，应用于网络不稳定、服务端错误等情景。

### 实现

```js
function fetchWithRetry(url, options, retries = 3) {
  return fetch(url, options).catch((err) =>
    retries > 0
      ? fetchWithRetry(url, options, retries - 1)
      : Promise.reject(err),
  );
}
```

## 缓存

缓存请求结果，减少重复请求，应用于静态资源、频繁请求的数据。

### 实现

```js
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const response = await fetch(url);
  cache.set(url, response);
  return response;
}
```

## 限流

限制单位时间内的请求次数，应用于 API 调用、资源加载等场景。

### 实现

```js
class RateLimiter {
  constructor(limit, interval) {
    this.limit = limit;
    this.interval = interval;
    this.queue = [];
    this.times = [];
  }

  add(request) {
    this.queue.push(request);
    this.run();
  }

  run() {
    const now = Date.now();
    this.times = this.times.filter((time) => now - time < this.interval);

    if (this.times.length < this.limit && this.queue.length) {
      const request = this.queue.shift();
      this.times.push(now);
      request();
    }

    if (this.queue.length) {
      setTimeout(() => this.run(), this.interval - (now - this.times[0]));
    }
  }
}
```

## 反思

封装请求队列属于前端开发主导的限制请求行为。

防抖、节流属于用户交互层面上的设计。可以查阅[Lodash](https://lodash.com/)的实现思路。

此外还有分页、滚动加载、可视区绘制等措施。

再再此外还可以从服务器端有一些限制流量的措施，缓解高并发压力，如 Nginx 分流等。
