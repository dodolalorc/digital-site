---
title: "🎉2024牛客寒假营6||补题"
description: "2024 牛客寒假营第 6 场补题记录，记录宇宙终结、爱恨纠葛、心绪解剖和友谊套路等题解。"
date: "2024-02-26T19:54:36+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-宇宙的终结

### 题意

在$[l,r]$中寻找某个恰好是三个不同素数的乘积的数，并输出任意一个合法答案即可。

#### 数据范围

$1\leq l\leq r \leq 100$

### 思路

数据小，模拟即可

### 参考代码

```cpp
void solve() {
    vector<bool>isprime(101, true);    // 判断素数
    isprime[0] = isprime[1] = false;
    for (int i = 2;i <= 100;i++) {
        if (isprime[i]) {
            for (int j = i + i;j <= 100;j += i) {
                isprime[j] = false;
            }
        }
    }

    int l, r;
    cin >> l >> r;
    for (int i = 2;i <= r;i++) {
        for (int j = 2;j <= r;j++) {
            for (int k = 2;k <= r;k++) {
                if (isprime[i] && isprime[j] && isprime[k] && i != j && j != k && i != k) {
                    if (i * j * k >= l && i * j * k <= r) {
                        cout << i * j * k;return;
                    }
                }
            }
        }
    }
    cout << -1;
}
```

## B-爱恨的纠葛

### 题意

定义两个等长数组的亲密值：$|a_i-b_i|(1\leq i\leq n)$的最小值。给定2个数组，可以任意排列$a$数组的元素顺序，输出一个亲密度最小的方案（数组$a$的操作结果）。

#### 数据范围

$1\leq n\leq 10^5$

$1\leq a,b \leq 10^9$

### 思路

将$a,b$数组的数据放入 一个数组中，进行排序，从第一位开始遍历，如果某两个相邻的数一个来自于$a$数组，一个来自于$b$数组，更新最小的差的绝对值，将$a$数组中的这两个相匹配的位置进行互换后输出$a$

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n), b(n);
    vector<pair<ll, pair<int,int>>>c;
    for (int i = 0;i < n;i++) {
        cin >> a[i];
        c.push_back({ a[i],{0,i} });
    }
    for (int i = 0;i < n;i++) {
        cin >> b[i];
        c.push_back({ b[i],{1,i} });
    }
    sort(c.begin(), c.end());
    ll ans = 1e9 + 20;
    int pa = 0, pb = 0;
    for (int i = 1;i < 2 * n;i++) {
        if (c[i].second.first != c[i - 1].second.first) {
            if (c[i].first - c[i - 1].first < ans) {
                ans = c[i].first - c[i - 1].first;
                if(c[i].second.first == 0) {
                    pa = c[i].second.second;
                    pb = c[i - 1].second.second;
                } else {
                    pa = c[i - 1].second.second;
                    pb = c[i].second.second;
                }
            }
        }
    }
    ll tp = a[pa];a[pa] = a[pb];a[pb] = tp;
    for (int i = 0;i < n;i++) {
        cout << a[i] << ' ';
    }
}
```

## C-心绪的解剖

### 题意

将$n$分解为三个斐波那契数列之和。

#### 数据范围

$1\leq q \leq 10^5$

$1\leq n\leq 10^9$

### 思路

斐波那契数列到$F_{45}$是大于$10^{10}$的，联系到斐波那契数列的单调性，每次二分出不大于$n$的一位$F_x$，再在$n$中减去这个$F_x$直到$n$为0，如果三次二分后无法使得$n=0$则无解。

### 参考代码

```cpp
void solve() {
    ll q;cin >> q;
    vector<ll>f(45, 0);
    f[0] = 0;f[1] = 1;
    for (int i = 2;i < 45;i++) {
        f[i] = f[i - 1] + f[i - 2];
    }

    while (q--) {
        ll n;cin >> n;
        int p1 = upper_bound(f.begin(), f.end(), n) - f.begin();
        p1--;
        n -= f[p1];
        ll f1 = f[p1];
        if (n == 0) {
            cout << f1 << " 0 0\n";continue;
        }
        int p2 = upper_bound(f.begin(), f.end(), n) - f.begin();
        p2--;
        n -= f[p2];
        ll f2 = f[p2];
        if (n == 0) {
            cout << f1 << ' ' << f2 << " 0\n";continue;
        }
        int p3 = upper_bound(f.begin(), f.end(), n) - f.begin();
        p3--;
        n -= f[p3];
        ll f3 = f[p3];
        if (n == 0)
            cout << f1 << ' ' << f2 << ' ' << f3 << '\n';
        else
            cout << "-1\n";
    }
}
```

## D-友谊的套路

### 题意

一场$BO5$的游戏（五局三胜），已知某队伍获胜的概率是$p$，询问出现二追三的概率是多少？（二追三：先输两局，然后赢三局）

#### 数据范围

$0\lt p\lt 1$

### 思路

赢赢输输输or输输赢赢赢

### 参考代码

```cpp
void solve() {
    double p;cin >> p;
    double ans = 0.0;
    double q = 1 - p;
    ans += p * p * q * q * q + q * q * p * p * p;
    printf("%.6f", ans);
}
```

## E-未来的预言

### 题意

BO机制：$BOx$代表$x$局先胜$x/2+1$次为赢，$x$为奇数。

给出一个字符串，表示两队的获胜情况。R代表红队获胜，P代表紫队获胜。

判断哪队获得了胜利，或是还没有决出结果，以及结束时的局数。

#### 数据范围

$1\leq x\leq 10^5$

### 思路

遍历统计，先赢到$x/2$次的获胜。

### 参考代码

```cpp
void solve() {
    int n;
    scanf("BO%d", &n);
    n = n / 2 + 1;
    string res;cin >> res;
    int a = 0, b = 0;
    for (int i = 0;i < res.size();i++) {
        if (res[i] == 'R') {
            a++;
        }
        else {
            b++;
        }
        if (a == n) {
            cout << "kou!\n" << i + 1;
            return;
        }
        if (b == n) {
            cout << "yukari!\n" << i + 1;
            return;
        }
    }
    cout << "to be continued.\n";
    cout << res.size();
}
```

## I-时空的交织

### 题意

一个$n$行$m$列的矩阵，每个元素由$a$数组和$b$数组决定，第$i$行第$j$列的元素为$a_i\times b_j$，选出一个子矩阵，使得子矩阵内的元素和尽可能大，输出该子矩阵的元素和。

#### 数据范围

$1\leq n,m\leq 10^5$

$-10^4 \leq a_i,b_i\leq 10^4$

## 思路

对$a\text{、} b$数组分别求最大子段和和最小子段和，最大子矩阵元素和是这四个数分别相乘的积中最大的一个。

### 参考代码

```cpp
void solve() {
    ll n, m;cin >> n >> m;
    vector<ll>a(n), b(m);
    for (int i = 0;i < n;i++)cin >> a[i];
    for (int i = 0;i < m;i++)cin >> b[i];
    vector<ll>pa(n), qa(n);
    pa[0] = qa[0] = a[0];
    ll xa, ya;xa = ya = a[0];
    for (int i = 1;i < n;i++) {
        if(pa[i-1]+a[i]>a[i]){
            pa[i] = pa[i - 1] + a[i];
        }
        else{
            pa[i] = a[i];
        }
        xa = max(xa, pa[i]);

        if (qa[i - 1] + a[i] < a[i]) {
            qa[i] = qa[i - 1] + a[i];
        }
        else{
            qa[i] = a[i];
        }
        ya = min(ya, qa[i]);
    }
    vector<ll>pb(m), qb(m);
    pb[0] = qb[0] = b[0];
    ll xb, yb;xb = yb = b[0];
    for (int i = 1;i < m;i++) {
        if(pb[i-1]+b[i]>b[i]){
            pb[i] = pb[i - 1] + b[i];
        }
        else{
            pb[i] = b[i];
        }
        xb = max(xb, pb[i]);
        if(qb[i-1]+b[i]<b[i]){
            qb[i] = qb[i - 1] + b[i];
        }
        else{
            qb[i] = b[i];
        }
        yb = min(yb, qb[i]);
    }

    cout << max(xa * xb, max(xa * yb, max(ya * yb, ya * xb))) << endl;
}
```
