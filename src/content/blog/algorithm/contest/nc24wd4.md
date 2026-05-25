---
title: "🎉2024牛客寒假营4||补题"
description: "2024 牛客寒假营第 4 场补题记录，涵盖柠檬可乐、左右互博、冬眠和守恒等题目的分析。"
date: "2024-02-26T19:54:28+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - 牛客寒假营
  - 补题记录
categories:
  - 算法
series:
  - 2024 牛客寒假营
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-柠檬可乐

### 题意

输入$a,b,k$，判断$a\ge k\times b$是否成立

#### 数据范围

$a,b,k(1\leq a,b,k\leq 100)$

### 思路

简单判断

### 参考代码

```cpp
void solve() {
    int a, b, k;cin >> a >> b >> k;
    if (a >= k * b)cout << "good\n";
    else cout << "bad\n";
}
```

## B-左右互博

### 题意

有$n$堆石子，每次选择某堆石子，选一个整数$y(2\leq y\leq x)$，将石子分为$\lfloor \frac{x}{y} \rfloor$和$x-\lfloor \frac{x}{y} \rfloor$，直到某人不能操作时结束，不能操作者输。

#### 数据范围

$n,a_i(1\leq n,a_i \leq 2\times 10^5)$

### 思路

相当于每次至少分出1个石子出来，计算将所有石头分出1颗一份的操作数，判断拿到最后一颗石子的是谁即可。

### 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    vector<ll>a(n);
    ll sum = 0;
    for (int i = 0;i < n;i++){
        cin >> a[i];
        sum += a[i] - 1;
    }
    if (sum % 2) {
        cout << "gui\n";
    }
    else cout << "sweet\n";
}
```

## C-冬眠

### 题意

给一个$n\times m$的字符矩阵，每天有$q$次行循环移动或列循环移动，共执行$p$次，最后询问第$x$行$y$​列是什么字符。

$op=1$表示行循环移动

$op=2$表示列循环移动

#### 数据范围

$1\leq n,m,p,q\leq 100$

### 思路

记录循环移动顺序，然后将$(x,y)$的字符逆顺序模拟即可。

### 参考代码

```cpp
void solve() {
    int n, m, x, y;
    cin >> n >> m >> x >> y;
    x -= 1, y -= 1;
    vector<string>rec(n);
    for (int i = 0;i < n;i++) {
        cin >> rec[i];
    }
    int p, q;cin >> p >> q;
    vector<pair<int, int>>opz;
    for (int i = 0;i < q;i++) {
        int z, op;cin >> op >> z;
        opz.push_back({ op,z });
    }
    for (int i = 0;i < p;i++) {
        for (int j = q - 1;j >= 0;j--) {
            int op = opz[j].first, z = opz[j].second;
            if (op == 1 && x == z - 1) {
                y -= 1;
                y = (y + m) % m;
            }
            else if (op == 2 && y == z - 1) {
                x -= 1;
                x = (x + n) % n;
            }
            // cout << x << " " << y << '\n';
        }
    }
    cout << rec[x][y] << '\n';
}
```

## D-守恒

### 题意

有一个长度为$n$的数组，每次操作可以对数组$a$中的两个元素其中一个加1，另一个减1，要求每次操作后各元素任然是正整数，求操作结束后整个数组的最大公约数有多少种不同的值？

#### 数据范围

$1\leq n,a_i\leq 2\times 10^5$

### 思路

特判$n=1$的时候（答案为1）

$n\ge 2$时，枚举最大公约数，计数合适的数的数量即可。

### 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    vector<ll>a(n);
    ll sum = 0ll;
    for (int i = 0;i < n;i++) {
        cin >> a[i];sum += a[i];
    }
    if (n == 1) {
        cout << 1 << '\n';return;
    }

    set<ll>res;
    ll f = sum / n;
    for (ll k = 1;k * k <= sum;k++) {
        if (sum % k == 0) {
            ll x = sum / k;
            if (x >= n && k <= f) {
                res.insert(k);
            }
            if (k * k != sum && k >= n && sum / k <= f) {
                res.insert(sum / k);
            }
        }
    }
    cout << res.size() << '\n';
}
```
