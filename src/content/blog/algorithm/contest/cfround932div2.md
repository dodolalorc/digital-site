---
title: "💭Codeforces Round 932(div2)"
description: "Codeforces Round 932 Div.2 的补题记录，围绕 MAC 系列题目整理字符串、数组与考试题的解法。"
date: "2024-03-13T12:26:06+08:00"
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

# A-Entertainment in MAC

## 题意

可以对一个字符串进行两种操作：

1. 将字符串反转
2. 将该字符串反转后接在原串的后面。

可以进行任意次上述操作，获得字典序最小的字符串。

#### 数据范围

$t(1\leq t\leq 500)$

$n(2\leq n\leq 10^9)$​

$s(1\le |s|\le 100)$

## 思路

对比反转前后的字符串字典序大小，再决定是操作1还是操作2

## 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    string s;cin >> s;
    string t = s;
    reverse(t.begin(), t.end());
    if (s > t) {
        cout << t << s << endl;
    }
    else {
        cout << s << endl;
    }
}
```

# B-Informatics in MAC

## 题意

$MEX$：不属于该数组的最小非负整数。

对一个数组分成$k$个子段，要求每段的$MEX$都等于相同的数。

找到这样的子段分法，或者报告不存在合法的分法。

#### 数据范围

$t(1\leq t\leq 10^4)$

$n(2\leq n\leq 10^5)$​

$a_i(0\le a_i\lt n)$

## 思路

假设$MEX=2$，则分成$k$段的方式为前$k-1$段只要都出现过$0,1$就进行分段，最后一段保证含$0,1$和达到第$n$个数。

确定$MEX$：遍历数组$a$，找到最小的没有出现过的数（该数不大于$n$），该数即为$MEX$。

## 参考代码

```cpp
// MEX:不属于该数组的最小非负整数

void solve() {
    ll n;cin >> n;
    vector<ll>a(n + 1);
    vector<bool>ck(n + 1, false);
    for (int i = 1;i <= n;i++) {
        ll x;cin >> x;
        a[i] = x;
        ck[x] = true;
    }

    bool f = false;
    int y = -1;
    for (int i = 0;i < n;i++) {
        if (ck[i] == false) {
            y = i;
            f = true;
            break;
        }
    }

    if (!f) {
        cout << -1 << endl;
        return;
    }

    // MEX=y
    // cout << y << endl;
    if (y == 0) {
        cout << n << endl;
        for (int i = 1;i <= n;i++) {
            cout << i << ' ' << i << endl;
        }
        return;
    }

    int p = 1;
    int cnt = 0;
    vector<pair<int, int>>ans;
    vector<bool>hs(y, false);
    vector<bool>hsf(y, false);
    for (int i = 1;i <= n;i++) {
        if (a[i] < y && !hs[a[i]]) {
            hs[a[i]] = true;
            cnt++;
        }
        if (cnt == y) {
            ans.push_back({ p, i });
            p = i + 1;
            cnt = 0;
            // 会不会Tle
            hs = hsf;
        }
    }

    if (ans.size() == 1) {
        cout << -1 << endl;
        return;
    }

    cout << ans.size() << endl;
    for (int i = 0;i < ans.size();i++) {
        if (i != ans.size() - 1)
            cout << ans[i].first << " " << ans[i].second << endl;
        else {
            cout << ans[i].first << " " << n << endl;
        }
    }

}
```

# D-Exam in MAC

## 题意

有一个集合$s$。

找到满足$0\le x\le y\le c$且$x+y$和$y-x$均不包含在集合$s$中的整数对$(x,y)$的个数。

#### 数据范围

$t(1\leq t\leq 2\times 10^4)$

$n(1\leq n\leq 3\times 10^5)$​

$c(1\le c\le 10^9)$

## 思路

容斥。

合格的整数对=满足$x+y\in s$+满足$y-x\in s$-既满足$x+y\in s$又满足$y-x\in s$。

## 参考代码

```cpp
void solve() {
    ll n, c;cin >> n >> c;
    ll tot = (c + 1) * (c + 2) / 2;
    ll cnt0 = 0, cnt1 = 0;
    for (ll i = 0;i < n;i++) {
        ll x;cin >> x;
        tot -= x / 2 + 1;
        tot -= c + 1 - x;
        if (x & 1)cnt1++;
        else cnt0++;
    }
    tot += (cnt0 + 1) * cnt0 / 2 + cnt1 * (cnt1 + 1) / 2;
    cout << tot << endl;
}
```
