---
title: "🎉2024牛客寒假营2||补题"
description: "2024 牛客寒假营第 2 场补题记录，围绕 Tokitsukaze 系列题整理构造、消除和最短路思路。"
date: "2024-02-09T14:46:52+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-Tokitsukaze and Bracelet

### 题意

根据手环的三个属性值判断手环的等级。

1. 对攻击百分比来说，+0为100%，+1为150%，+2为200%
2. 对体力和精神来说，+0在$\{29,30,31,32\}$里选择，+1在$\{34,36,38,40\}$里选择，+2固定为45

#### 数据范围

$n(1≤n≤100)$

$a_i,b_i,c_i(a_i∈\{100,150,200\};b_i,ci∈\{29,30,31,32,34,36,38,40,45\})$

### 思路

模拟即可

### 参考代码

```cpp
void solve() {
    int lv1[3] = { 100,150,200 };
    int lv2[9] = { 29,30,31,32,34,36,38,40,45 };
    int a, b, c;cin >> a >> b >> c;
    int ans = 0;
    for (int i = 0;i < 3;i++) {
        if (a == lv1[i]) { ans += i; break; }
    }
    for (int i = 0;i < 9;i++) {
        if (b == lv2[i]) {
            if (i < 4)ans += 0;
            else if (i < 8)ans += 1;
            else ans += 2;
            break;
        }
    }
    for (int i = 0;i < 9;i++) {
        if (c == lv2[i]) {
            if (i < 4)ans += 0;
            else if (i < 8)ans += 1;
            else ans += 2;
            break;
        }
    }
    cout << ans << endl;
}
```

## B-Tokitsukaze and Cats

### 题意

关猫，每个猫被限制在一个单元格内就算被关住了，如图：

![img](https://uploadfiles.nowcoder.com/images/20240125/0_1706174328838/823145AC6726F7B332C8177582B6DA53)

给猫的坐标，询问至少需要多少片防猫网能把他们全都关住。

#### 数据范围

$n, m, k (1≤n,m≤300;1≤k≤n⋅m)$

$x_i, y_i (1≤xi≤n; 1≤yi≤m)$

### 思路

遍历坐标点判断它上下左右是否有隔板，如果没有则补充。

### 参考代码

```cpp
void solve() {
    int n, m, k;cin >> n >> m >> k;
    map<pair<int, int>, bool>cats;
    int ans = 0;
    while (k--) {
        int x, y;cin >> x >> y;
        cats[{ x, y }] = true;
        pair<int, int>pu = { x - 1,y }, pd = { x + 1,y }, pl = { x,y - 1 }, pr = { x,y + 1 };
        int cnt = 4;
        if (cats.count(pu) != 0)cnt -= 1;
        if (cats.count(pd) != 0)cnt -= 1;
        if (cats.count(pl) != 0)cnt -= 1;
        if (cats.count(pr) != 0)cnt -= 1;
        ans += cnt;
    }
    cout << ans << endl;
}
```

## E&F-Tokitsukaze and Eliminate

### 题意

有一排n个宝石，第i个的颜色是$col_i$，可以进行如下的操作：

选一种颜色x，将颜色为x的最右边的那颗宝石及其右边的所有宝石全部消除。

#### 数据范围

$T(1\leq T\leq 2 * 10^5)$

$n(1\leq n\leq 2 * 10^5)$

easy：$1\leq col_i\leq min(n,2)$

hard：$1\leq col_i\leq n$

### 思路

贪心，从右边枚举，当找到最后一种达到两次出现的颜色后，进行一次对该颜色的操作，直到所有宝石都被消除。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<int>col(n + 1);
    set<int>cls;
    for (int i = 1;i <= n;i++) {
        cin >> col[i];
        cls.insert(col[i]);
    }
    int tn = cls.size();    // 颜色种数
    map<int, int>clrs;
    map<int, int>colors;
    int ans = 0;
    int cnt = 0;
    int pi = n;
    while (tn != 0) {
        for (int i = n;i > 0;i--) {
            colors[col[i]]++;
            if (colors[col[i]] == 1) {
                cnt++;  // 达到两次及以上的颜色数
                if (cnt == tn) {
                    ans++;
                    cnt = 0;
                    colors = clrs;
                    pi = i - 1;
                }
            }
        }
        tn = colors.size();
        colors = clrs;
        n = pi;cnt = 0;
    }
    cout << ans << endl;
}
```

## I-Tokitsukaze and Short Path (plus)

### 题意

有一个$n$个顶点的完全图$G$，顶点编号是$1$到$n$，编号为$i$的顶点值是$a_i$，边权的计算方式如下：

$$
w_{u,v}=
\begin{cases}
0& \text{u=v}\\
|a_u+a_v|+|a_u-a_v|& \text{u ≠ v}
\end{cases}
$$

$dist(i,j)$定义为以$i$为起点到$j$的最短路。

求：

$$
\sum_{i=1}^{n}\sum_{j=1}^{n}dist(i,j)
$$

#### 数据范围

$T(1\leq T\leq 2\times 10^5)$

$n(1\leq n\leq 2\times 10^5)$

$a_i(1\leq a_i\leq 2\times 10^5)$

### 思路

$$
|a_i+a_j|+|a_i-a_j|=
\begin{cases}
&a_i+a_j+a_i-a_j&=2\times a_i&\quad a_i\ge a_j \\
&a_i+a_j+a_j-a_i&=2\times a_j&\quad a_i\lt a_j
\end{cases}
$$

对$a$进行排序，计算每个数对总和的贡献，也就是比某数小的数的个数。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    for (int i = 0;i < n;i++) {
        cin >> a[i];
    }
    sort(a.begin(), a.end());
    ll ans = 0;
    for (int i = 0;i < n;i++) {
        ans += a[i] * i;
    }
    cout << 4 * ans << '\n';
}
```

## J-Tokitsukaze and Short Path (minus)

### 题意

有一个$n$个顶点的完全图$G$，顶点编号是$1$到$n$，编号为$i$的顶点值是$a_i$，边权的计算方式如下：

$$
w_{u,v}=
\begin{cases}
0& \text{u=v}\\
|a_u+a_v|-|a_u-a_v|& \text{u ≠ v}
\end{cases}
$$

$dist(i,j)$定义为以$i$为起点到$j$的最短路。

求：

$$
\sum_{i=1}^{n}\sum_{j=1}^{n}dist(i,j)
$$

#### 数据范围

$T(1\leq T\leq 2\times 10^5)$

$n(1\leq n\leq 2\times 10^5)$

$a_i(1\leq a_i\leq 2\times 10^5)$

### 思路

$$
|a_i+a_j|-|a_i-a_j|=
\begin{cases}
&a_i+a_j-a_i+a_j&=2\times a_j&\quad a_i\ge a_j \\
&a_i+a_j-a_j+a_i&=2\times a_i&\quad a_i\lt a_j
\end{cases}
$$

如果$u$到$v$的直接路径的长度大于$dist(u,w)+dist(v,w)$，则取后者，假设$dist(u,v)=2\times a_v$，则有$dist(u,w)+dist(v,w)=2\times a_v+2\times a_v=4\times a_v$，则只有当$2\times a_w$的值小于$a_v$时取后者找到数组中的最小值。

对$a$​进行排序，计算每个数对总和的贡献次数，也就是比某数或2×最小$a_i$大的数的个数。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    ll mn = 1e18;
    for (int i = 0;i < n;i++) {
        cin >> a[i];
        mn = min(mn, a[i]);
    }
    sort(a.begin(), a.end());
    ll ans = 0;
    for (int i = 0;i < n;i++) {
        ans += min(mn * 2, a[i]) * (n - i - 1);
    }
    cout << 4 * ans << '\n';
}
```
