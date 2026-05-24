---
title: "八股文短代码 Coding 篇"
description: "前端手写代码笔记，整理千分位格式化、深浅拷贝、new、柯里化和 Promise 封装 AJAX 等常见题。"
date: "2025-03-13T14:08:19+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

### 代码：千分位逗号

```javascript
let num = 1234567.89;
let formattedNum = num.toLocaleString("en-US");
console.log(formattedNum); // 输出 "1,234,567.89"
```

### 代码：手写深浅拷贝

浅拷贝只会复制对象的顶层属性和值，如果属性值是**对象**或**数组**，那么它实际上只是**复制了引用**，而不是真正的对象。

而深拷贝则会递归地复制对象的所有层级，确保所有的对象或数组都被真正复制，而不是仅复制引用。

#### 浅拷贝

```javascript
function shallowCopy(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  return Object.assign({}, obj); // Object浅拷贝
}

const original = { a: 1, b: { c: 2 } };
const copied = shallowCopy(original);
console.log(copied);
```

#### 深拷贝

```javascript
function deepCopy(obj, hash = new WeakMap()) {
  // 使用了`WeakMap`来存储已经复制过的对象
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  // 日期
  if (obj instanceof Date) {
    return new Date(obj);
  }
  // 正则
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  let newObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, newObj);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCopy(obj[key], hash); // 递归进行拷贝
    }
  }

  return newObj;
}
```

### 代码：手写 New 方法

```js
function myNew(constructor, ...args) {
  const obj = {};
  obj.__proto__ = constructor.prototype;
  const result = constructor.apply(obj, args);
  // 如果构造函数返回一个对象，则返回，否则返回新创建的对象
  return result instanceof Object ? result : obj;
}

function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function () {
  console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
};

const person = myNew(Person, "Alice", 12);
console.log(person.name);
console.log(person.age);
person.greet();
```

### 代码：手写函数柯里化

```js
function curry(fn) {
  if (typeof fn !== "function") {
    return new Error("Type Error");
  }
  return function curried(...args) {
    if (args.length >= fn.length) {
      // 如果参数数量足够，则执行
      return fn.apply(this, args);
    }
    return function (...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}

function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3));
console.log(curriedSum(1, 2)(3));
```

### 代码：实现 AJAX 请求，使用 Promise 封装 AJAX 请求

```js
function ajaxRequest(url, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if (method == "POST") {
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }

    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.responseText);
      } else {
        reject(new Error(this.statusText));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network Error"));
    };

    if (data) {
      xhr.send(data);
    } else {
      xhr.send();
    }
  });
}

ajaxRequest("https://api.example.com/data", "GET")
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```
