---
title: "2024吉林省赛补题记录"
description: "2024 吉林省赛补题记录，包含 The Easiest Problem、Recharge、Platform Game 和 Parallel Lines 的解法整理。"
date: "2024-07-05T14:30:27+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

GYM地址：[2024吉林省赛](https://codeforces.com/gym/105170)

题目顺序按照从易到难排序。

## I. The Easiest Problem

### 题意

数一数

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

void solve() {
    string s = "Scan the QR code to sign in now.";
    ll cnt = 0;
    for (auto c : s) {
        if (c <= 'z' && c >= 'a')cnt++;
    }
    cout << cnt << endl;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int _ = 1;
    // cin >> _;cin.get();
    while(_--)
        solve();

    return 0;
}
```

## L. Recharge

### 题意

有$x$次获得$1$格能量的机会，$y$次获得$2$格能量的机会，充满一个电池需要$k$格能量，溢出的能量会被浪费，问最多能充满多少电池。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

void solve() {
    ll k, x, y;cin >> k >> x >> y;
    if (k == 1) { cout << x + y << "\n";return; }
    ll ans = 0;
    if (k & 1) {
        ll yi = k / 2;
        if (x <= y / yi) {
            ans += x;
            y -= x * yi;
            x = 0;
            ans += y / (yi + 1);
        }
        else {
            ans += y / yi;
            x -= (y / yi);
            y -= (y / yi) * yi;
            if (y * 2 + x >= k) {
                ans += 1;x -= (k - 2 * y);y = 0;
            }
            ans += x / k;
        }
    }
    else {
        ll tot = x + 2 * y;
        ans = tot / k;
    }
    cout << ans << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int _ = 1;
    cin >> _;cin.get();
    while(_--)
        solve();

    return 0;
}
```

## G. Platform Game

### 题意

在二维平面中有$n$个平台，每个平台有一个高度$h_i$，以及一个左端点$l_i$和右端点$r_i$。机器人从$(x,y)$出发，保持向右前进，如果遇到平台端点则会垂直下落，问机器人最终的落点。

### 思路

排序题，按照高度从高到低、左端点从小到大排序，遍历平台，如果机器人在平台上则更新机器人的位置。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

struct PLAT {
    ll l, r, y;
    operator<(const PLAT& P)const {
        if (y == P.y)return l < P.l;
        return y > P.y;
    }
};

void solve() {
    ll n;cin >> n;
    vector<PLAT>plats;
    for (ll i = 0;i < n;i++) {
        ll l, r, y;cin >> l >> r >> y;
        plats.push_back({ l,r,y });
    }
    sort(plats.begin(), plats.end());
    ll sx, sy;cin >> sx >> sy;
    for (auto p : plats) {
        if (p.l < sx && p.r >= sx && p.y < sy) {
            sy = p.y;
            sx = p.r;
        }
    }
    cout << sx << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int _ = 1;
    cin >> _;cin.get();
    while(_--)
        solve();

    return 0;
}
```

## D. Parallel Lines

### 题意

二维平面上有$k$条平行线，这些直线上有$n$个点，已知每条直线上至少有$2$个点。现在给出$n$个点，找出这$k$条平行线（用点表示）。

### 数据范围

$2 \leq n \leq 10^4$

$1 \leq k \leq \min(50, \frac{n}{2})$

### 思路

注意$k$的范围，$k$最多为$50$，可以枚举$k$来选择平行线的斜率，对于$k$条平行线，当我选择了$k+1$个点时，这$k+1$个点中必然至少有两个点之间的斜率是$k$条平行线的斜率。

确定斜率$k_i$之后，我们分别计算过每个点斜率为$k_i$的直线在$y$轴上的截距，并计数相同截距的点的数目，注意垂直于$x$轴的情况。

只有同时符产生截距数目恰好为$k$，且每个截距的点数目至少为$2$时，我们才找到了所要的$k$条平行线。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;

struct Point {
    ll x, y;
};

void solve() {
    ll n, k;cin >> n >> k;
    vector<Point>points(n);
    map<ll, vector<ll>>rx;
    for (ll i = 0;i < n;i++) {
        cin >> points[i].x >> points[i].y;
        rx[points[i].x].push_back(i + 1);
    }
    if (rx.size() == k) {
        bool f = true;
        for (auto i : rx) {
            if (i.second.size() < 2) { f = false;break; }
        }
        if (f) {
            for (auto i : rx) {
                cout << i.second.size() << " ";
                for (auto j : i.second) {
                    cout << j << " ";
                }
                cout << "\n";
            }
            return;
        }
    }
    ll b = 1000000;
    map<ll, bool>mpk;
    for (ll i = 0;i < k + 1;i++) {
        for (ll j = i + 1;j < k + 1;j++) {
            ll px = points[i].x, py = points[i].y, qx = points[j].x, qy = points[j].y;
            if (px == qx) {
                continue;
            }
            ld ki = 1.0 * (py - qy) / (px - qx);
            ll kk = (ll)(ki * b);
            if (mpk.count(kk) == 0)mpk[kk] = true;
        }
    }
    for (auto kk : mpk) {
        ld ki = 1.0 * kk.first / b;
        map<ll, vector<ll>>cnt;
        for (ll i = 0;i < n;i++) {
            ll x = points[i].x, y = points[i].y;
            ld bi = y - ki * x;
            ll bb = (ll)(bi * b);
            cnt[bb].push_back(i + 1);
            if (cnt.size() > k)break;
        }
        if (cnt.size() == k) {
            bool f = true;
            for (auto i : cnt) {
                if (i.second.size() < 2) { f = false;break; }
            }
            if (!f)continue;
            for (auto i : cnt) {
                cout << i.second.size() << " ";
                for (auto j : i.second) {
                    cout << j << " ";
                }
                cout << "\n";
            }
            return;
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int _ = 1;
    // cin >> _;cin.get();
    while (_--)
        solve();

    return 0;
}
```

## E. Connected Components

### 题意

有$n$个王国，编号从$1$到$n$，每个王国有两个属性值$a_i$和$b_i$，如果两个王国的属性值满足$a_i - a_j \leq i - j \leq b_i - b_j$或$a_j - a_i \leq j - i \leq b_j - b_i$，则这两个王国是相连的。问有多少个连通块。

### 数据范围

$1 \leq n \leq 10^6$

### 思路
