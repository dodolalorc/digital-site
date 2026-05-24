---
title: "🫟2024牛客暑假多校训练营Day8||补题"
description: "2024 牛客暑假多校训练营 Day8 的补题记录，整理 Haitang and Game 与 Haitang and Ava 的思路和代码。"
date: "2024-08-09T00:26:32+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-Haitang and Game

### 题意

给出一个数组，两人轮流，每次选择数组中的两个数，若这两个数的$gcd$不在当前的数组里，就将这两个数的$gcd$加入到数组中，不能再加数的一方输。

#### 数据范围

- $1\leq t\leq 100$
- $1\leq n\leq 10^5$
- $1\leq a_i\leq 10^5$

### 思路

整个数组的最终含有哪些数是确定的，枚举$1\sim a_{max}$的每个数，记为$x$，查看数组中大于$x$的整数倍的数，若这些倍数的$gcd$恰好等于$x$，则$x$会出现在最终的数组中。

### 代码

```cpp
void solve() {
    int n;cin >> n;
    vector<int>a(n);
    vector<bool>vis(100005, false);
    int mx = -1;
    for (int i = 0;i < n;i++) {
        cin >> a[i];
        vis[a[i]] = true;
        if (mx != -1)mx = max(mx, a[i]);
        else mx = a[i];
    }
    if (n == 1) {
        cout << "Haitang\n";return;
    }
    int ans = 0;
    for (int i = 1;i <= mx;i++) {
        if (vis[i])continue;
        vector<int>g;
        for (int j = 2 * i;j <= mx;j += i) {
            if (vis[j])g.push_back(j);
        }
        if (g.size() >= 2) {
            int k = gcd(g[0], g[1]);
            for (int j = 2;j < g.size();j++) {
                k = gcd(k, g[j]);
            }
            if (k == i) {
                ans++;
                vis[i] = true;
            }
        }
    }
    if (ans % 2) {
        cout << "dXqwq\n";
    }
    else {
        cout << "Haitang\n";
    }
}
```

## K-Haitang and Ava

### 题意

符合以下条件的字符串的合法的：

- 空串是合法的。
- 在合法串$S$的前面或后面加$ava$​形成的字符串是合法的。
- 在合法串$S$的前面或后面加$avava$​形成的字符串是合法的。

给你一个字符串，判断它是否合法。

#### 数据范围

- $1\leq T\leq 1.7\times 10^5$
- $3\leq |S| \leq 5\times 10^5$

### 思路

逐步删去前缀或后缀，若最后能删成空串，则为合法串。

### 代码

```cpp
void solve() {
    string s;cin >> s;
    int l = 0, r = s.size() - 1;
    while (l <= r) {
        string t;
        if (r - l + 1 >= 5) {
            t = s.substr(l, 5);
            if (t == "avava") {
                l += 5;continue;
            }
            t = s.substr(r - 4, 5);
            if (t == "avava") {
                r -= 5;continue;
            }
        }
        if (r - l + 1 >= 3) {
            t = s.substr(l, 3);
            if (t == "ava") {
                l += 3;continue;
            }
            t = s.substr(r - 2, 3);
            if (t == "ava") {
                r -= 3;continue;
            }
        }
        break;
    }
    if (l > r) {
        cout << "Yes\n";
    }
    else {
        cout << "No\n";
    }
}
```
