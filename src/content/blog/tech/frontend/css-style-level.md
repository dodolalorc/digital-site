---
title: "CSS 选择器优先级和覆盖样式"
description: "CSS 优先级笔记，整理选择器权重计算、比较规则以及 !important 和深度选择器的覆盖策略。"
date: "2025-10-03T02:34:28+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - CSS
  - 选择器优先级
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# CSS 选择器优先级计算规则

CSS 选择器优先级通过权重系统计算，权重由四个组成部分（a, b, c, d）表示：

## 优先级权重组成

- **a**: 是否使用内联样式（1 或 0）
- **b**: ID 选择器的数量
- **c**: 类选择器、属性选择器和伪类的数量
- **d**: 元素选择器和伪元素的数量

## 优先级比较规则

1. **从左到右比较**：先比较 a，如果相等再比较 b，以此类推
2. **数值越大优先级越高**：如 1-0-0 > 0-2-0-0
3. **相同权重后定义生效**：如果权重完全相同，后定义的样式覆盖先定义的

## 优先级等级（从高到低）

1. **!important 声明**（不属于选择器权重，但影响优先级）
2. **内联样式**（权重：1-0-0-0）
3. **ID 选择器**（权重：0-1-0-0）
4. **类/属性/伪类选择器**（权重：0-0-1-0）
5. **元素/伪元素选择器**（权重：0-0-0-1）
6. **通配符/继承样式**（权重：0-0-0-0）

## 权重计算示例

```css
/* 权重: 0-0-0-1 */
p { color: black; }

/* 权重: 0-0-1-0 */
.text { color: blue; }

/* 权重: 0-0-1-1 */
p.text { color: green; }

/* 权重: 0-1-0-0 */
#header { color: red; }

/* 权重: 0-1-1-1 */
#header p.text { color: purple; }

/* 权重: 1-0-0-0 (内联样式) */
<p style="color: orange;">内容</p>
```

# 强制覆盖样式的方法和优先级

## `!important` - 属性级优先级提升

使用：

```css
/* 提升单个属性的优先级 */
.text {
  color: red !important; /* 强制覆盖其他color声明 */
  font-size: 16px; /* 正常优先级 */
}
```

### 使用场景

```css
/* 1. 覆盖第三方库样式 */
.third-party-component {
  margin: 0 !important;
}

/* 2. 工具类/工具样式 */
.hidden {
  display: none !important;
}

.text-center {
  text-align: center !important;
}

/* 3. 重置浏览器默认样式 */
button {
  border: none !important;
  background: none !important;
}
```

### 特点

- **全局生效**：影响整个文档中匹配的元素
- **属性级别**：只作用于添加了`!important`的特定属性
- **难以覆盖**：要覆盖`!important`需要更高权重或另一个`!important`

## `/deep/`  或  `::vue-deep` - 选择器级作用域穿透

使用：

```css
/_ Vue.js 中的样式穿透 _/
.parent-component ::v-deep .child-element {
color: red; /_ 穿透到子组件 _/
}

/_ 原生 CSS（已废弃，但了解原理） _/
parent-component /deep/ child-element {
color: red;
}
```

### 使用场景

```css
/_ 1. 修改子组件样式（Vue/React 等组件化框架） _/
.my-page ::v-deep .ant-btn {
  background-color: #1890ff;
}

/_ 2. 覆盖 UI 库组件内部样式 _/
.el-dialog ::v-deep .el-dialog\_\_body {
  padding: 20px;
}

/_ 3. 在 scoped 样式中穿透到子组件 _/
<style scoped>
.container ::v-deep .child-component {
  margin: 10px;
}
</style>
```

### 特点

- **作用域穿透**：突破组件样式隔离
- **选择器级别**：改变选择器的匹配范围
- **框架特定**：主要在 Vue 等组件化框架中使用

## `!important`和`::v-deep`使用对比

### 使用  `!important`  的情况

1. **工具类/辅助类**：`.hidden`, `.text-center`等
2. **重置样式**：覆盖浏览器或框架默认样式
3. **紧急修复**：临时解决生产环境问题

### 使用  `::v-deep`  的情况

1. **组件库定制**：修改第三方组件内部样式
2. **布局组件**：父组件控制子组件样式
3. **主题系统**：实现主题穿透

### 通用原则

1. **优先考虑选择器权重**而非`!important`
2. **限制`::v-deep`的使用范围**，避免样式污染
3. **使用 CSS 自定义属性**（CSS 变量）作为替代方案

`!important`解决的是"优先级"问题，而`::vue-deep`解决的是"作用域"问题。根据具体需求选择合适的工具。
