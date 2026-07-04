---
title: "🫟2024牛客暑假多校训练营Day7||补题"
description: "2024 牛客暑假多校训练营 Day7 的补题记录，涵盖怪物战斗、球类模拟和字符串子序列相关题。"
date: "2024-08-09T00:26:24+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - 牛客多校
  - 补题记录
categories:
  - 算法
series:
  - 2024 牛客暑假多校训练营
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## I-Fight Against the Monster

### 题意

使用机器对抗怪兽，一台机器有以下两种功能：

- 战斗：使怪兽血量减少1点，后技巧丧失所有功能
- 创造：需要$m$台机器同时使用，创造出$k$台新机器，每台机器仅能使用一次创造功能。

怪兽初始血量是$h$，血量下降至$0$​时死亡，请计算初始最少需要多少机器才能打败怪兽。

#### 数据范围

- $1\leq t\leq 2\times 10^5$
- $1\leq k\leq m \leq 10^6$
- $0\leq h\leq 10^9$

### 思路

根据机器的功能特点，我们尽可能让每台机器进行创造。若最初有$x$台机器，则进行一次创造之后拥有$x+k(x\ge m)$台机器，其中有$k+x-m$台机器拥有创造能力，最多拥有的机器数目是直到拥有创造能力的机器数目低于$m$时拥有的机器数目。可以发现除了第一次使用$m$台机器进行创造，之后使用$m$台机器进行创造时，可以使用$k$台新制造的机器加上$m-k$台最初拥有的机器进行创造，那么最多拥有的机器数目是：

$$
f(x)=
\begin{cases}
x\quad x\lt m\\
x+k\times (\lfloor (x-m)/(m-k)\rfloor+1)
\end{cases}
$$

二分寻找符合条件的最少的最初机器数即可。

不过队友在赛时提供了一种更加直观不必二分求解的方法：

怪兽每受到$m$点攻击时，可以将这$m$点攻击看成是花费$m-k$台机器，在保证至少能发出一次$m$点攻击时，最初的机器数目要有$m$个，同时，怪物剩余不足$m$点血量时，只能再用额外的机器进行攻击。相关代码也贴在下面了。

### 代码

```cpp
// 二分
ll m, k, h;
ll getmax(ll x) {
    if (x < m)return x;
    return x + k * ((x - m) / (m - k) + 1);
}

void solve() {
    cin >> m >> k >> h;
    if (m == k || h <= m) {
        cout << min(h, m) << "\n";
        return;
    }
    ll l = m, r = h + 1;
    while (l < r) {// [l,r)
        ll x = (l + r) >> 1;
        if (h > getmax(x)) {
            l = x + 1;
        }
        else {
            r = x;
        }
    }
    cout << l << "\n";
}

// 直接求解
void solve(){
    cin >> m >> k >> h;
    ll ans = (h / m) * (m - k);
    if(h / m) ans += max(h % m, k);
    else ans = h;
    cout << ans << "\n";
}
```

## J-Ball

### 题意

坐标轴上有一根木棒，左端点在原点$(0,0)$处，垂直$y$轴放置，右端点在$(l,0)$处，在坐标轴上有一个点$P(x,y)$，询问在木棒上是否有一个点，满足当木棒绕着该点旋转时可以击中点$P$，如有则输出该点坐标，若无输出$-1$。

#### 数据范围

- $1\leq T\leq 10^4$
- $1\leq l\leq 10^5$
- $-10^5\leq x,y \leq 10^5$

### 思路

木棒可以到达的最大范围是以$(0,0)$为旋转中心和以$(l,0)$为旋转中心的旋转范围的并集。

### 代码

```cpp
ld sqr(ld dx, ld dy) {
    return sqrt(dx * dx + dy * dy);
}

ld dist(ll x1, ll y1, ll x2, ll y2) {
    return sqr(1.0 * (x1 - x2), 1.0 * (y1 - y2));
}

void solve() {
    ll l, x, y;cin >> l >> x >> y;
    ld d1 = dist(0, 0, x, y), d2 = dist(l, 0, x, y);
    if (d1 > l && d2 > l) {
        cout << "No\n";return;
    }
    cout << "Yes\n";
    if (d1 <= l) {
        cout << "0.00000000\n";
    }
    else if (d2 <= l) {
        printf("%.8lf\n", 1.0 * l);
    }
}
```

## K-Strings, Subsequences, Reversed Subsequences, Prefixes

### 题意

给出一个字符串$s$和一个字符串$t$，要求在$s$中寻找以$t$为前缀，以$t$的翻转串为后缀的$s$的子串，求这样的本质不同的子串数目。

#### 数据范围

- $1\leq n,m \leq 10^6$
- $s_i,t_i\in [a,z]$

### 思路

前缀和后缀可以直接暴力从$s$最左侧和最右侧枚举，前后缀还要加上有公共重叠部分的数目，之后的问题就是如何计算中间部分的本质不同的子串了。

另中间部分的字符串为$s'$，在$s'$上，设$f[i]$表示到第$i$位时拥有多少个本质不同的子串，将$a[i]$加入时，$a[i]$可以加入在$f[i-1]$时的所有本质不同的子串的后面，这样形成的字符串中，与原来答案重复的是上一个字符$a[i]$加入时拥有的本质不同的字符串数目，所以转移方程是这样：

$$
f[i]=2\times f[i-1]-f[last[a[i]]-1]
$$

在处理前后缀的时候，当前后缀所处的最小区域有相交时，枚举允许重叠的长度时要至少从重叠部分的长度开始进行枚举。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const ll mo998 = 998244353;
const ll mo109 = 1000000007;
const int maxn = 1e5 + 50;

void solve() {
    ll n, m;cin >> n >> m;
    string s, t;cin >> s >> t;
    ll l = 0, r = n - 1;
    ll p0 = 0;
    while (p0 < m && l < n) {
        if (t[p0] == s[l]) {
            p0++;
        }
        l++;
    }
    if (p0 != m) {
        cout << 0 << "\n";
        return;
    }
    p0 = 0;
    ll pos = 0;
    while (p0 < m && r >= 0) {
        if (t[p0] == s[r]) {
            p0++;
            if (r >= l)pos = p0; // 独自能自匹配的长度
        }
        r--;
    }
    if (p0 != m) {
        cout << 0 << "\n";
        return;
    }
    // 处理回文
    ll cnt = 0;
    vector<ll>h1(m + 5), h2(m + 5), p(m + 5);
    ll b = 131;
    t = " " + t;
    p[0] = 1;
    for (int i = 1;i <= m;i++) {
        h1[i] = h1[i - 1] * b + t[i];
        h2[i] = h2[i - 1] * b + t[m - i + 1];
        p[i] = p[i - 1] * b;
    }
    for (int i = 1;i <= m;i++) { // 判断长度为i的前后缀是否相同
        ll hh1 = h1[m] - h1[m - i] * p[i];
        ll hh2 = h2[i] - h2[0] * p[i];
        if (hh1 == hh2)cnt++;
    }

    int len = r - l + 1;
    if (len < 0) {
        ll ans = 0;
        len = m - pos;
        for (ll i = len;i <= m;i++) {
            ll hh1 = h1[m] - h1[m - i] * p[i];
            ll hh2 = h2[i] - h2[0] * p[i];
            if (hh1 == hh2)ans++;
        }
        cout << ans << "\n";
        return;
    }
    string a = s.substr(l, len);
    vector<ll>f(len + 5, 0), las(30, -1);
    a = " " + a;
    f[0] = 1;
    for (ll i = 1;i <= len;i++) {
        int c = a[i] - 'a';
        if (las[c] != -1)
            f[i] = (2 * f[i - 1] % mo109 - f[las[c] - 1] + mo109) % mo109;
        else
            f[i] = 2 * f[i - 1] % mo109;
        las[c] = i;
    }
    cout << f[len] + cnt << "\n";
}

int main() {
    int _ = 1;
    while (_--)
        solve();

    return 0;
}

```
