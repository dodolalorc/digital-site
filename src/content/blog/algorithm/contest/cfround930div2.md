---
title: "💭Codeforces Round 930(div2)"
description: "Codeforces Round 930 Div.2 的补题记录，记录 Shuffle Party、Binary Path 和 Bitwise Operation Wizard 的解题过程。"
date: "2024-03-13T12:26:38+08:00"
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

# A-Shuffle Party

## 题意

对一个数组，起初是$a_i=i$

对操作`swap(k)`：

设$d$是不等于$k$本身的$k$的最大除数，然后交换元素$a_d$和$a_k$。

按顺序对每一个$i=2,3,..,n$进行$swap(i)$之后，找出$1$在数组中的位置。

#### 数据范围

$t(1\leq t\leq 10^4)$

$n(1\leq n\leq 10^9)$​

## 思路

简单模拟之后可以发现，$a_1=1$最后会挪到不大于$n$的最大2的次幂处。

## 参考代码

```cpp
void solve() {
    vector<ll>p;
    ll x = 1;
    while (x <= 1e9) {
        p.push_back(x);
        x *= 2;
    }
    int t;cin >> t;
    while(t--){
        ll n;cin >> n;
        ll ans = upper_bound(p.begin(), p.end(), n) - p.begin();
        cout << p[ans - 1] << endl;
    }
}
```

# B-Binary Path

## 题意

一个$2\times n$网格，网格充满$0,1$，找一条从$(1,1)$走到$(2,n)$的路径，要求找到字典序最小的路径并找到这个最小路径的路径数。

#### 数据范围

$t(1\leq t\leq 10^4)$

$n(2\leq n\leq 2\times 10^5)$​

## 思路

路径的组成是第一行的前部分+第二行的后部分，长度是$n+1$。对从第一行到第二行的转折的位置进行枚举，假设往后一位可以获得字典序更小的则重新计数，若相同则累计路径数，若不同则代表没有更好的路径。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<string>s(2);
    cin >> s[0] >> s[1];
    string st = s[0] + s[1];
    ll cnt = 1;
    ll ix = 2;
    for (int i = 2;i + n - 2 < 2 * n - 1;i++) {
        ll j = i + n - 2;//[i,j]
        if (st[i - 1] == '0' && st[j] == '1') {
            cnt = 1;
            ix = i;
        }
        else if (st[i - 1] == st[j]) {
            cnt++;
        }
        else {
            break;
        }
    }

    string res = st.substr(0, ix) + st.substr(ix + n - 1);
    string res1 = s[0][0] + s[1];
    if (res1 < res)res = res1;

    cout << res << '\n';
    cout << cnt << '\n';
}
```

# C-Bitwise Operation Wizard

## 题意

交互题。

对一个神秘序列$p_0,p_1,...,p_{n-1}$（是$\{0,1,...,n-1\}$的排列组合）。我们通过询问需要获得$p_i\oplus p_j$最大的一个$(i,j)$对。

每次询问任意索引$(a,b,c,d)$评审团计算$x=(p_a|p_b)$和$y=(p_c|p_d)$，并告知是$x\lt y,x\gt y$还是$x=y$。最多使用$3n$个查询。

#### 数据范围

$t(1\leq t\leq 1000)$

$n(2\leq n\leq 10^4)$​

## 思路

先两两比较找到最大的数，再找到与最大的数异或的结果最大的另一个数。

## 参考代码

```cpp
char r;
char ask(int a, int b, int c, int d) {
    cout << "? " << a << ' ' << b << ' ' << c << ' ' << d << endl;
    cin >> r;
    return r;
}

void solve() {
    int n;cin >> n;
    int pm = 0;
    // 找n-1
    for (int i = 1;i < n;i++) {
        if (ask(pm, pm, i, i) == '<') {
            pm = i;
        }
    }
    // 另一个数pn：与pm取或大于pm的最小值
    int pn = 0;
    for (int i = 1;i < n;i++) {
        ask(pm, i, pm, pn);
        if (r == '>') {
            pn = i;
        }
        else if (r == '=' && ask(i, i, pn, pn) == '<') {
            pn = i;
        }
    }
    cout << "! " << pm << " " << pn << endl;
}
```
