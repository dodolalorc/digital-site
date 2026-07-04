---
title: "2024杭电钉耙编程联赛Day1||补题"
description: "2024 杭电钉耙编程联赛 Day1 的补题记录，整理循环位移、星星、位运算和集合并等题目的解法。"
date: "2024-07-19T19:08:39+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - HDU
  - 补题记录
categories:
  - 算法
series:
  - HDU 训练赛补题记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## 1001-循环位移

$(709/3775)$

### 题意

将字符串$S=S_0+S_1+S_2+...+S_{n-1}$循环位移$k$次后得到$S(k)=S_{k\bmod n }+...+S_{n-1}+S+0+...+S_{(k-1)\bmod n}$。

定义$[A]={A(k),k\in N}$。给出$T$组串$A,B$，询问$B$有多少个子串在$[A]$​中。

#### 数据范围

- $|A|\leq |B|$
- $\sum|B|\leq 1048576$

### 思路

#### 思路1：字符串哈希

记字符串$A$的长度是$n$，将字符串$A$转变为首尾相连的样子（$A=A+A.substr(1,n-1)$），并计算其中每个长度为$n$的哈希值，用map存值，再对字符串$B$进行哈希，同样也对长度为$n$的子串计算哈希值，若有符合的则计数。

### 代码

#### 代码1：字符串哈希

```cpp
ll ha[maxn], hb[maxn];
ll pwr[maxn];

void solve() {
    string a, b;cin >> a >> b;
    ll n = a.size();
    a = a.substr(1, n - 1) + a;
    ll la = a.size(), lb = b.size();
    a = " " + a, b = " " + b;
    pwr[0] = 1;
    map<ll, bool>mp;
    for (ll i = 1;i <= la;i++) {
        ha[i] = ha[i - 1] * bas1 + a[i];
        pwr[i] = pwr[i - 1] * bas1;
        if (i - n >= 0) {
            ll x = ha[i] - ha[i - n] * pwr[n];
            mp[x] = true;
        }
    }
    ll ans = 0;
    for (ll i = 1;i <= lb;i++) {
        hb[i] = hb[i - 1] * bas1 + b[i];
        if (i - n >= 0) {
            ll x = hb[i] - hb[i - n] * pwr[n];
            if (mp.count(x)) {
                ans++;
            }
        }
    }
    cout << ans << endl;
}
```

## 1002-星星

$(991/1659)$

### 题意

小$A$有$n$次获得星星的机会，第$i$次有如下5种选择：

- 跳过
- $a_i$的代价获得$1$颗星星
- $b_i$的代价获得$2$颗星星
- $c_i$的代价获得$3$颗星星
- $d_i$的代价获得$4$颗星星

请问若想恰好获得$k$颗星星，所需要的最小代价是多少。

#### 数据范围

- $1\leq n\leq 1000$
- $0\leq k\leq n\times 4$
- $0\lt a_i\leq b_i\leq c_i\leq d_i\leq 10^9$

### 思路

基础的动态规划。记$dp[i]$表示获得$i$颗星星的最小代价。

### 代码

```cpp
ll a[maxn], b[maxn], c[maxn], d[maxn];
ll dp[4 * maxn];

void solve() {
    ll n, k;cin >> n >> k;
    for (ll i = 1;i <= n;i++) {
        cin >> a[i] >> b[i] >> c[i] >> d[i];
    }
    fill(dp, dp + 4 * maxn, inf);
    dp[0] = 0;
    for (ll i = 1;i <= n;i++) {
        ll m = min(k, 4 * i);
        for (ll j = m;j >= 0;j--) {
            if (j + 1 <= m)
                dp[j + 1] = min(dp[j] + a[i], dp[j + 1]);
            if (j + 2 <= m)
                dp[j + 2] = min(dp[j] + b[i], dp[j + 2]);
            if (j + 3 <= m)
                dp[j + 3] = min(dp[j] + c[i], dp[j + 3]);
            if (j + 4 <= m)
                dp[j + 4] = min(dp[j] + d[i], dp[j + 4]);
        }
    }
    cout << dp[k] << "\n";
}
```

## 1008-位运算

$(918/1427)$

### 题意

有多少在范围$[0,2^k)$中的$a,b,c,d$构成的四元组$(a,b,c,d)$满足$a \\& b\oplus c | d=n$。

#### 数据范围

- $1\leq T\leq 10$
- $1\leq k\leq 15,0\leq n\lt 2^k$

### 思路

记$x=a \\& b\oplus c | d$，$x$的每一位只有1和0的可能，而每位上的数字只和$a,b,c,d$对应位是$1$或$0$有关，枚举四个数的$1/0$，统计$x$是$0$的组合和是$1$的组合的数量。再根据$n$的$k$位进行统计即可。

### 代码

```cpp
void solve() {
    ll n, k;cin >> n >> k;
    ll cnt[2];cnt[0] = cnt[1] = 0;
    for (int i = 0;i <= 1;i++) {
        for (int j = 0;j <= 1;j++) {
            for (int k = 0;k <= 1;k++) {
                for (ll l = 0;l <= 1;l++) {
                    ll x = i & j ^ k | l;
                    cnt[x]++;
                }
            }
        }
    }
    vector<int>v;
    ll ans = 1;
    for (ll i = 0;i < k;i++) {
        v.push_back(n & 1);
        ans *= cnt[n & 1];
        n >>= 1;
    }
    cout << ans << "\n";
}
```

## 1012-并

$(241/1229)$

### 题意

给出在二维平面上的$n$个矩形，随机选择$k$个不同的矩形$(k\in [1,n])$，求这$k$个矩形所有覆盖部分的并集的面积的期望。

#### 数据范围

- $1\leq n\leq 2\times 10^3$
- $1\leq x_{i,1}\lt x_{i,2} \leq 10^9$
- $1\leq y_{i,1}\lt y_{i,2} \leq 10^9$

### 思路

将横纵坐标离散化之后可以将这$n$个矩形覆盖的部分分割成不重叠的若干个小矩形，每个小矩形设置权值，代表被原来的$n$个矩形覆盖的次数。设某个小矩形的覆盖次数是$m$，则在选择$k$个矩形时，这个小矩形的贡献是：$\frac{\binom{k}{n}-\binom{k}{n-m}}{\binom{k}{n}}$（全集-选除该矩形以外的部分），预处理离散后的矩形以及被覆盖$m$次的所有矩形的总面积，枚举计数即可。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const int maxn = 2050;
const int mo998 = 998244353;

struct Rec {
    ll x1, y1, x2, y2;
}a[maxn];

ll X[maxn * 2], Y[maxn * 2];

ll fact[maxn], invfact[maxn]; // 阶乘,阶乘逆元

ll qpow(ll a, ll b) {
    ll res = 1;
    while (b) {
        if (b & 1)res = res * a % mo998;
        b >>= 1;
        a = a * a % mo998;
    }
    return res;
}

ll inv(ll x) {
    return qpow(x, mo998 - 2);
}

void init() {
    // 预处理阶乘,阶乘逆元
    fact[0] = invfact[0] = 1ll;
    for (int i = 1;i < maxn;i++) {
        fact[i] = fact[i - 1] * i % mo998;
        invfact[i] = invfact[i - 1] * inv(i) % mo998;
    }
}

ll C(int n, int k) {
    // n选k的方案数
    if (k > n)return 0ll;
    ll res = fact[n] * invfact[k] % mo998 * invfact[n - k] % mo998;
    return res;
}

ll Stot[maxn], rec[2 * maxn][2 * maxn];

void solve() {
    int n;cin >> n;
    for (int i = 1;i <= n;i++) {
        ll x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        a[i] = { x1,y1,x2,y2 };
        X[i] = x1, X[i + n] = x2;
        Y[i] = y1, Y[i + n] = y2;
    }
    sort(X + 1, X + 1 + 2 * n);
    sort(Y + 1, Y + 1 + 2 * n);
    int t1 = unique(X + 1, X + 1 + 2 * n) - X - 1;
    int t2 = unique(Y + 1, Y + 1 + 2 * n) - Y - 1;
    for (int i = 1;i <= n;i++) {
        auto [x1, y1, x2, y2] = a[i];
        x1 = lower_bound(X + 1, X + 1 + t1, x1) - X; // 值x1在X[]中的位置
        x2 = lower_bound(X + 1, X + 1 + t1, x2) - X;
        y1 = lower_bound(Y + 1, Y + 1 + t2, y1) - Y;
        y2 = lower_bound(Y + 1, Y + 1 + t2, y2) - Y;
        // 差分计数
        rec[x1][y1]++, rec[x2][y1]--;
        rec[x1][y2]--, rec[x2][y2]++;
    }
    for (int i = 1;i <= t1;i++) {
        for (int j = 1;j <= t2;j++) {
            rec[i][j] += rec[i - 1][j] + rec[i][j - 1] - rec[i - 1][j - 1];
        }
    }
    for (int i = 1;i < t1;i++) {
        for (int j = 1;j < t2;j++) {
            // 覆盖rec[i][j]次的矩形的面积
            Stot[rec[i][j]] += (X[i + 1] - X[i]) * (Y[j + 1] - Y[j]) % mo998;
            Stot[rec[i][j]] %= mo998;
        }
    }


    for (int k = 1;k <= n;k++) {
        ll ans = 0, Cnk = C(n, k);
        ll iCnk = inv(Cnk);
        for (int i = 1;i <= n;i++) {
            ll Si = Stot[i];
            ans += (Cnk - C(n - i, k) + mo998) % mo998 * iCnk % mo998 * Si % mo998;
            ans %= mo998;
        }
        cout << ans << "\n";
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    init();
    int t = 1;
    // cin >> t;cin.tie(0);
    while (t--)
        solve();

    return 0;
}
```
