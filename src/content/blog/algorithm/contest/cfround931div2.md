---
title: "💭Codeforces Round 931(div2)"
description: "Codeforces Round 931 Div.2 的补题记录，整理极值构造、硬币问题和交互找矿题的思路与代码。"
date: "2024-03-13T12:26:22+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - Codeforces
  - 补题记录
categories:
  - 算法
series:
  - Codeforces 补题记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# A-Too Min Too Max

## 题意

对一个数组，找到索引$(i,j,k,l)$使得$|a_i-a_j|+|a_j-a_k|+|a_k-a_l|+|a_l-a_i|$最大的值。

#### 数据范围

$t(1≤t≤500)$

$n(4≤n≤100)$​

$a_i(-10^6\le a_i\le 10^6)$

## 思路

选则最大的两个数和最小的两个数，结果为最大-最小+次大-最小+最大-次小+次大-次小。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    for (int i = 0;i < n;i++)
        cin >> a[i];
    sort(a.begin(), a.end());
    cout << a[n - 1] - a[0] + a[n - 2] - a[0] + a[n - 1] - a[1] + a[n - 2] - a[1] << '\n';
}
```

# B-Yet Another Coin Problem

## 题意

有一些5种不同面值的金币，面值有：$1,3,6,10,15$。找到使用金币数目最少的组合方式达到数值为$n$的组合。

#### 数据范围

$t(1≤t≤10^4)$

$n(1≤n≤10^9)$​

## 思路

打表。

## 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    vector<ll>p = { 0,
    1,2,1,2,3,1,2,3,2,1,
    2,2,2,3,1,2,3,2,3,2,
    2,3,3,3,2,3,3,3,4,2
    };
    ll ans = n / 15 + p[n % 15];
    if (n / 15 > 0)
        ans = min(ans, n / 15 - 1 + p[n % 15 + 15]);
    cout << ans << endl;

}
```

# C-Find a Mine

## 题意

交互题。

$n\times m$的地图有两个地雷，每次询问一个坐标点，评审机会返回距离询问点最近的地雷的与询问点的曼哈顿距离。

#### 数据范围

$t(1≤t≤3\times 10^3)$

$n,m (2≤n≤10^8,2\le m\le 10^8)$​

## 思路

第一次询问可以获得一条斜线，斜线上至少有一个地雷。

第二次询问可能可以找到正好一个交点，这个交点可能正好是地雷或者是两个地雷的行列序号的组合。再做第三次询问，得到两个交点至少有一个是地雷。第四次询问即可排除。

## 参考代码

```cpp
bool f = false;

int ask(int x, int y) {
    cout << "? " << x << ' ' << y << endl;
    int res;cin >> res;
    if (res == 0) {
        cout << "! " << x << ' ' << y << endl;
        f = true;
    }

    return res;
}

void solve() {
    int n, m;cin >> n >> m;
    f = false;

    int x1 = ask(1, 1);
    if (f) { return; }

    int x2 = ask(1, m);
    if (f) { return; }

    int x3 = ask(n, 1);
    if (f) { return; }

    int x, y;
    if (x2 + x3 == n + m - 2) {
        // 同一条斜线
        y = (x1 + x3 - n + 1) / 2;
        x = x1 - y;
        x += 1;y += 1;
        cout << "! " << x << ' ' << y << endl;
        return;
    }
    else if ((n + m - x2 - x3) % 2 != 0) {
        // 有一个交点
        if ((x1 + x2 - m + 1) % 2 == 0) {
            x = (x1 + x2 - m + 1) / 2;
            y = x1 - x;
            x += 1;y += 1;
            cout << "! " << x << ' ' << y << endl;
        }
        else {
            y = (x1 + x3 - n + 1) / 2;
            x = x1 - y;
            x += 1;y += 1;
            cout << "! " << x << " " << y << endl;
        }

        return;
    }

    y = (x1 + x3 - n + 1) / 2;
    x = x1 - y;
    x += 1;y += 1;

    if (x < 1 || x > n || y < 1 || y > m) {
        f = true;
    }
    if (!f) {
        int x4 = ask(x, y);
        if (f) { return; }
    }

    x = (x1 + x2 - m + 1) / 2;
    y = x1 - x;
    x += 1;y += 1;
    cout << "! " << x << ' ' << y << endl;
}
```
