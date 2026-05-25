---
title: "JavaScript 原型链简述"
description: "JavaScript 原型链笔记，通过示例梳理原型对象、继承关系和原型链结构。"
date: "2025-10-08T22:49:23+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - JavaScript
  - 原型链
categories:
  - 前端
series:
  - JavaScript 基础
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

JavaScript 是一种面向对象语言，是一种基于原型的语言，每个对象拥有一个原型对象。

## 原型链

**原型链**  是 JavaScript 中实现继承的机制。每个对象都有一个指向另一个对象的内部链接，这个被指向的对象就是它的**原型**。当试图访问一个对象的属性时，如果在该对象本身找不到这个属性，那么 JavaScript 引擎就会沿着这个链接到它的原型对象上去找，如果还找不到，就继续去原型的原型上找，直到找到该属性或者到达链条的末端（`null`）为止，如果找不到返回`undefined`。这一系列由原型对象连接起来的链条，就称为**原型链**。

要理解原型链，需要先了解几个核心概念：

- **`prototype`  属性**：
  - 这是**函数**独有的属性。
  - 当你使用  `new`  关键字调用一个构造函数来创建新对象时，这个新对象的内部原型（`[[Prototype]]`）就会被设置为该构造函数的  `prototype`  属性所指向的对象。
  - 简单说：**函数的  `prototype`  属性，是为将来通过它创建的实例对象准备的“蓝图”或“模板”**。
- **`[[Prototype]]`  内部属性**：
  - 这是**每个对象**都有的一个内部属性，指向它的原型对象。
  - 在代码中，我们可以通过  `Object.getPrototypeOf(obj)`  方法来获取它，或者通过非标准但被许多浏览器实现的  `obj.__proto__`  属性来访问。
- **`constructor`  属性**：
  - 默认情况下，函数的  `prototype`  属性是一个对象，这个对象有一个  `constructor`  属性，指回该函数本身。

### 构造一个简单的原型链例子

```js
// 1. 创建一个构造函数
function Person(name) {
  this.name = name;
}

// 2. 在构造函数的 prototype 上添加方法
Person.prototype.sayHello = function () {
  console.log(`Hello, my name is ${this.name}`);
};

// 3. 使用 new 创建实例
const person1 = new Person("Alice");
const person2 = new Person("Bob");

// 4. 调用方法
person1.sayHello(); // Hello, my name is Alice
person2.sayHello(); // Hello, my name is Bob
```

此原型链的关系是：

```plaintext
person1 --> Person.prototype --> Object.prototype --> null
```

- `person1`  本身有  `name`  属性。
- 当调用  `person1.sayHello()`  时，JS 引擎：
  1. 先在  `person1`  对象自身上找  `sayHello`  方法，没找到。
  2. 然后通过  `person1.__proto__`（也就是  `Person.prototype`）去找，找到了！于是执行。
- `Person.prototype`  也是一个对象，它的原型是  `Object.prototype`（这是所有普通对象的默认原型）。
- `Object.prototype`  的原型是  `null`，表示原型链的终点。

### 继承与更长的原型链

我们可以通过让一个构造函数的  `prototype`  指向另一个构造函数的实例，来实现继承，从而延长原型链。

_和上面一段 Person 的代码例子一起看_

```js
// 子构造函数
function Student(name, major) {
  Person.call(this, name); // 继承属性
  this.major = major;
}

// 关键步骤：继承方法
// 将 Student 的 prototype 指向一个 Person 的实例，从而建立原型链链接
Student.prototype = Object.create(Person.prototype);
// 修复 constructor 指针，让它指回 Student
Student.prototype.constructor = Student;

// 子类自己的方法
Student.prototype.sayMajor = function () {
  console.log(`My major is ${this.major}`);
};

const student1 = new Student("Charlie", "Computer Science");
student1.sayHello(); // Hello, my name is Charlie (来自 Person 原型)
student1.sayMajor(); // My major is Computer Science (来自 Student 原型)
```

此时的原型链关系是：

```plaintext
student1 --> Student.prototype (是一个 Person 实例) --> Person.prototype --> Object.prototype --> null
```

- 当调用  `student1.sayHello()`  时，JS 引擎：
  1. 在  `student1`  上找，没找到。
  2. 在  `Student.prototype`  上找，没找到。
  3. 在  `Person.prototype`  上找，找到了！执行。

## 原型对象

一个对象的属性和方法定义在 Object 的构造器函数（`constructor`）上的`prototype`属性上，而非实例对象本身。

当我们定义一个函数对象时，每个函数都有一个特殊的属性，叫原型`prototype`。

可以在控制台查看这个属性的内容：

```js
function myfunc() {}
console.log(myfunc.prototype);
```

![image.png](https://img.dodolalorc.cn/i/2025/10/08/68e6896c953ea.png)

输出的这个就是常说的**原型对象**。

其中的`constructor`是原型对象的一个自有属性，这个属性指向该函数。

和`constructor`并列的是`[[Prototype]]`，这是一个**内部链接**，**所有对象**都有这个属性，这个属性指向它的原型。

`__proto__`属性是对象实例和它的构造器的链接，是从构造函数的`prototype`属性派生的，从这个链接向上溯源原型链，可以在构造器在找到这些属性和方法。

```js
person1.__proto__ === Person.prototype;
Person.__proto__ === Function.prototype;
Person.prototype.__proto__ === Object.prototype;
Object.__proto__ === Function.prototype;
Object.prototype.__proto__ === null;
```

### 一个例子

```js
function Person(name) {
  this.name = name;
}

const person1 = new Person("Alice");

// 原型链关系：
// person1 -> Person.prototype -> Object.prototype -> null

console.log(person1.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true - 终点！
```

**关键点**：原型链是通过  `[[Prototype]]`（即  `__proto__`）链接的，而不是通过  `prototype`  属性。

- `Person.prototype`  是一个**普通对象**
- 普通对象没有  `prototype`  属性，只有  `[[Prototype]]`  链接
- 最终，`Object.prototype.__proto__`  指向  `null`，原型链终止

### 可视化正确的结构

```js
function Person() {}
const person = new Person();

// 结构分析：
console.log(person.__proto__ === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true

// Person.prototype 是一个对象，它的 __proto__ 指向 Object.prototype
console.log(Person.prototype.__proto__ === Object.prototype); // true

// Object.prototype 是终点，它的 __proto__ 是 null
console.log(Object.prototype.__proto__ === null); // true

// 注意：Person 函数本身也有 __proto__，指向 Function.prototype
console.log(Person.__proto__ === Function.prototype); // true
```

### 正确的理解方式

原型链的链接是通过  **`[[Prototype]]`**（即  `__proto__`）建立的，形成这样的链条：

```js
实例对象 --(__proto__)--> 构造函数的prototype --(__proto__)--> 父级prototype --(__proto__)--> ... --> Object.prototype --(__proto__)--> null
```

## 总结

| 概念                | 说明                                                       | 访问方式                                          |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| **原型链**          | 对象之间通过原型连接起来的继承链条。                       | -                                                 |
| **`prototype`**     | **函数**的属性，指向一个对象，该对象将成为未来实例的原型。 | `Func.prototype`                                  |
| **`[[Prototype]]`** | **对象**的内部属性，指向它的原型。                         | `Object.getPrototypeOf(obj)`  或  `obj.__proto__` |
| **`constructor`**   | 原型对象上的属性，指回创建它的构造函数。                   | `obj.constructor`                                 |
