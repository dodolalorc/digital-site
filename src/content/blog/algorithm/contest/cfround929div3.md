---
title: "💭Codeforces Round 929(div3)"
description: "Codeforces Round 929 Div.3 的补题记录，整理 Turtle 系列题目的题意分析、思路推导与参考代码。"
date: "2024-02-29T14:56:16+08:00"
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

# A-Turtle Puzzle: Rearrange and Negate

## 题意

对一个数组执行两个操作：

1. 对数组进行重新排序或保持元素顺序不变
2. 选择连续的一段，对该段中的元素取相反数，也可以不选择任何一段，即保持所有的元素符号不变。

求进行上述操作之后数组的最大和是多少。

#### 数据范围

$t(1\leq t\leq 1000)$

$n(1\leq n\leq 50)$​

$a_i(-100\le a_i\le 100)$

## 思路

遍历数组，对所有的数取非负后相加。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    ll ans = 0ll;
    for (int i = 0;i < n;i++) {
        ll x;cin >> x;
        if (x < 0)ans -= x;
        else ans += x;
    }
    cout << ans << '\n';
}
```

# B-Turtle Math: Fast Three Task

## 题意

有一个数组，可以对数组中的数进行任意次下方两种操作：

1. 将数移除
2. 将该数的数值加1

求至少进行多少次上述操作，可以使数组所有元素之和是3的倍数？

#### 数据范围

$t(1\leq t\leq 10^4)$

$n(1\leq n\leq 10^5)$​

$a_i(1\le a_i\le 10^4)$

## 思路

统计数组$a$中模3为0、1、2的数量和余数总和。记总和为$sum$，余1的数量为$x$，余2的数量为$y$。考虑：

1. 若$sum$模3为0，则不需要操作
2. 若$sum$模3为2，则给任意一个数加1即可，操作1次。
3. 若$sum$模3为1，若有余1的数，则去掉这个数即可，否则进行两次加1操作。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>aa(n);
    ll ans = 0;
    ll x = 0, y = 0;
    for (int i = 0;i < n;i++) {
        cin >> aa[i];
        aa[i] %= 3;
        ans += aa[i];
        if (aa[i] == 1)x++;
        else if (aa[i] == 2)y++;
    }
    if (ans%3 == 0) {
        cout<<0<<'\n';
    }
    else if (ans % 3 == 2) {
        cout << 1 << '\n';
    }
    else {
        if (x > 0)cout << 1 << '\n';
        else cout << 2 << '\n';
    }
}
```

# C-Turtle Fingers: Count the Values of k

## 题意

给3个正整数$a,b,l$，找出满足$l=k\times a^x\times b^y$的$k$的个数，$k,x,y$均为非负整数。

#### 数据范围

$t(1\leq t\leq 10^4)$

$a,b,l(2\le a,b\le 100,1\le l\le 10^6)$

## 思路

$2^{20}\gt 10^6$，可知，$x,y$的范围不超过20。

预处理$a^x$和$b^y$，然后暴力遍历即可。

## 参考代码

```cpp
void solve() {
    ll a, b, l;cin >> a >> b >> l;
    vector<ll>ax, by;
    ax.push_back(1);by.push_back(1);
    for (int i = 1;ax.back() <= l;i++) {
        ax.push_back(ax.back() * a);
    }
    for (int i = 1;by.back() <= l;i++) {
        by.push_back(by.back() * b);
    }
    set<ll>k;
    for (int i = 0;i < ax.size();i++) {
        for (int j = 0;j < by.size();j++) {
            if (l%(ax[i] * by[j]) == 0) {
                k.insert(l/(ax[i] * by[j]));
            }
        }
    }
    cout << k.size() << '\n';
}
```

# D-Turtle Tenacity: Continual Mods

## 题意

给数组$a$重新排序，判断是否存在排序使得$a_1 \text{ }mod\text{ } a_2 \text{ }mod\text{ } a_3\dots a_{n-1}\text{ }mod\text{ }a_n=0$。

#### 数据范围

$t(1\leq t\leq 10^4)$

$n(2\leq n\leq 10^5)$

$a_i(1\le a_i\le 10^9)$

## 思路

思考$x\text{ }mod\text{ }y$

1. 如果$x\lt y$，则结果还是$x$
2. 如果$x=y$​，则结果是0

如果最小的数是唯一的，则一定有解；如果最小的数不唯一，考虑是否有较大的数$z$使得$z\text{ }mod\text{ }x\ne 0$，如果存在，则有更小的唯一最小值，可以有解，否则无解。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    for (int i = 0;i < n;i++) {
        cin >> a[i];
    }
    sort(a.begin(), a.end());
    if (a[0] != a[1]) {
        cout << "YES\n";
        return;
    }
    for (int i = 1;i < n;i++) {
        if (a[i] % a[0] != 0) {
            cout << "YES\n";
            return;
        }
    }
    cout << "NO\n";
}
```

# E-Turtle vs. Rabbit Race: Optimal Trainings

## 题意

训练量$k$是连续一段时间的每天的训练量的总和，每次训练的提高值$u$按照训练次数递减（第1次$u$，第2次$u-1$，第3次$u-2$，...，第$k$次$u-k+1$，，提高值可以是负数），每次给定一个起始日$l$和提高值$u$，寻找一个最佳的结束日$r$，使得训练提高值总和最高，如果有多个$r$的结果提供最高训练值，选$r$较小的那个。

#### 数据范围

$t(1\leq t\leq 10^4)$

$n(1\leq n\leq 10^5)$

$a_i(1\le a_i\le 10^4)$

$q(1\le q\le 10^5)$

$l,u(1\le l\le n,1\le u \le 10^9)$

## 思路

训练提高值总量$S$与训练量$k$之间的关系是$S(k)=u\times k-\frac{k\times (k-1)}{2}$，是一个关于$k$先增后减的函数，最高值在$k=u+0.5$处取到，由于$k$为整数，$S(k)$的最高值应该在$u$和$u+1$处取到。

1. 在对称轴左边，二分查找在$[l,u]$的范围内最靠近$u$的$k$的取值，即小于等于$u$的最后一个$k$值。
2. 在对称轴右边，二分查找$[u+1,n]$的范围内最靠近$u+1$的$k$值，即大于等于$u+1$的第一个$k$值。

$k$值可以通过前缀和进行筛选，$k=pre[r]-pre[l-1]$，则对$pre$数组进行二分查找$u+pre[l-1]$和$u+1+pre[l-1]$即可。

对比这两个值对应的$S(k)$和$r$，以及只在$l$那天训练的效果，择优选择。

## 参考代码

```cpp
ll f(ll u, ll k) {
    return k * u - k * (k - 1) / 2;
}

void solve() {
    int n;cin >> n;
    vector<ll>a(n + 1);
    vector<ll>pre(n + 1);
    pre[0] = 0;a[0] = 0;
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
        pre[i] = pre[i - 1] + a[i];
    }
    int q;cin >> q;
    while (q--) {
        ll l, u;cin >> l >> u;
        ll x = pre[l - 1];
        int ru = upper_bound(pre.begin() + l, pre.end(), x + u) - pre.begin() - 1;
        ll ans = a[l], ansr = l;
        if (ru >= l && ru <= n) {
            if (f(u, pre[ru] - x) > ans) {
                ans = f(u, pre[ru] - x);
                ansr = ru;
            }
        }
        int ru1 = lower_bound(pre.begin() + l, pre.end(), x + u + 1) - pre.begin();
        if (ru1 >= l, ru1 <= n) {
            if (f(u, pre[ru1] - x) > ans) {
                ans = f(u, pre[ru1] - x);
                ansr = ru1;
            }
        }
        cout << ansr << ' ';
    }
    cout << '\n';
}
```
