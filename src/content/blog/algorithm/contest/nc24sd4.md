---
title: "🫟2024牛客暑假多校训练营Day4||补题"
description: "2024 牛客暑假多校训练营 Day4 的补题记录，整理 LCT、Sort4、Good Tree 和 Horse Drinks Water 等题目。"
date: "2024-07-31T15:55:48+08:00"
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

## A-LCT

### 题意

给定一棵有根树，每次询问前$i$条边组成的森林中，第$c_i$个点为根的树的深度。

#### 数据范围

- $2\leq n\leq 10^6$
- $1\leq a_i,b_i,c_i\leq n,a_i\neq b_i$

### 思路

带权并查集，维护每个节点在当前所属树的层数，维护所有以该节点为根节点的树的深度。

### 代码

```cpp
int deep[maxn], fa[maxn], dis[maxn];
int findfa(int x) {
    if (x == fa[x])return x;
    int fx = findfa(fa[x]);
    // 更新deep,旧根:fa[x],新根:fx
    deep[x] += deep[fa[x]];
    return fa[x] = fx;
}

void merge(int u, int v) {
    int fu = findfa(u);
    fa[v] = fu;
    deep[v] = deep[u] + 1;
    dis[fu] = max(dis[fu], dis[v] + deep[v]);
}

void solve() {
    int n;cin >> n;
    for (int i = 1;i <= n;i++) {
        fa[i] = i;
        deep[i] = 0;
        dis[i] = 0;
    }
    for (int i = 1;i <= n - 1;i++) {
        int u, v, c;cin >> u >> v >> c;
        merge(u, v);
        cout << dis[c] << " ";
    }
    cout << "\n";
}
```

## C-Sort4

### 题意

给出一个排列，每次选择四个位置交换其中的元素，求将该排列排序成上升序列的最小操作次数。

#### 数据范围

- $1\leq t\leq 10^5$
- $1\leq n\leq 10^6$

### 思路

令$p_i$是排序之后数$a_i$的位置，每个$(p_i,a_i)$对应了一个关系。易知这样的关系会形成若干个环，如果环的长度是$3$或$4$，则一次交换可以让这个环上的数字都归位，如果是大于$4$的环，每次在这个环上进行一次操作可以让环的长度减少$3$，如果是两个长度为$2$的环，则一次操作可以让两个长度为$2$的环归位。

### 代码

```cpp
int p[maxn], fa[maxn], len[maxn];

int findfa(int x) {
    if (x == fa[x])return x;
    int fx = findfa(fa[x]);
    len[fa[x]] = len[fx];
    return fa[x] = fx;
}

void merge(int x, int y) {
    int fx = findfa(x), fy = findfa(y);
    if (fx == fy)return;
    fa[fx] = fy;
    len[fy] += len[fx];
}

void solve() {
    int n;cin >> n;
    for (int i = 1;i <= n;i++) {
        len[i] = 1;fa[i] = i;
    }
    for (int i = 1;i <= n;i++) {
        cin >> p[i];
        merge(i, p[i]);
    }
    map<int, int>mp;
    for (int i = 1;i <= n;i++) {
        int fx = findfa(i);
        if (mp.count(fx))continue;
        mp[fx] = len[fx];
    }
    int ans = 0, cnt2 = 0;
    for (auto [i, s] : mp) {
        if (s == 1)continue;
        else if (s == 3 || s == 4)ans++;
        else if (s > 4) {
            int t = s / 3;
            ans += t;
            if (s % 3 == 2) {
                cnt2++;
            }
        }
        else cnt2++;
    }
    ans += (cnt2 + 1) / 2;
    cout << ans << "\n";
}
```

## F-Good Tree

### 题意

一棵树，树上的边权都是$1$，定义$f(u)=\sum_v dis(u,v)$，给出一个$x$，寻找一个满足存在两个点$u,v$使得$f(u)-f(v)=x$成立的最少节点子树，输出节点数。

#### 数据范围

- $1\leq t\leq 10^5$
- $1\leq x \leq 10^{18}$

### 思路

$f(u)$为点$u$到各个其他节点的距离之和，只有$u\rightarrow v$一条路径的时候，$f(u)=f(v)=dia(u,v)$，若要增加$f(u)$和$f(v)$之间的差值，每在$v$上增加一个在$v$的子树中的节点，$f(u)-f(v)$的值就会增加一倍$dis(u,v)$。

当有奇数个点，$2\times k +1$个点，另$dis(u,v)=k$，剩余$k$个点都是$v$的子树中的节点，$f(u)-f(v)$最大是$k^2$。

当有偶数个点，$2\times k+2$，同理，$f(u)-f(v)$的最大值是$k(k+1)$。

下一个奇数是$(k+1)^2$，再下一个偶数的是$(k+1)(k+2)$...

故对于一个确定的$x$，我们需要确定落在哪个$(k^2,(k+1)^2]$区间，然后再确定是在区间$(k^2,k(k+1)]$还是$(k(k+1),(k+1)^2]$，也就是点数应该至少是大于$2\times k+1$还是$2\times k+2$。

在区间$(k(k+1),(k+1)^2)$中，一定可以构造出$2\times k+3$的方法；

在区间$(k^2,k(k+1)]$中，如果$k$为奇数，可以构造出$2\times k+3$，如果$k$为偶数，可以构造出$2\times k+2$。

### 代码

```cpp
void solve() {
    ll x;cin >> x;
    ll k = sqrtl(x); // 注意开方long long
    if (k * k == x) {
        cout << 2 * k + 1 << "\n";
    }
    else if (k * (k + 1) < x) {
        cout << 2 * k + 3 << "\n";
    }
    else if ((x - k * k) % 2ll != k % 2ll) {
        cout << 2 * k + 3 << "\n";
    }
    else {
        cout << 2 * k + 2 << "\n";
    }
}
```

## G-Horse Drinks Water

### 题意

将军饮马问题。在平面坐标轴中，只有$x\text{、} y$轴的飞负半轴是水源，给出马儿的坐标和营地的坐标，求最短距离。

#### 数据范围

- $1\leq t\leq 10^5$
- $0\leq x_G,y_G,x_T,u_T\leq 10^9$

### 思路

将坐标按坐标轴对称，求距离。

### 代码

```cpp
ld dist(ld r, ld c) {
    return sqrt(r * r + c * c);
}

void solve() {
    ll x1, y1, x2, y2;
    cin >> x1 >> y1 >> x2 >> y2;
    ld ans1 = dist(1.0 * abs(y1 - y2), 1.0 * (abs(x1) + abs(x2)));
    ld ans2 = dist(1.0 * (abs(y1) + abs(y2)), 1.0 * abs(x1 - x2));
    ld ans = min(ans1, ans2);
    printf("%.12lf\n", ans);
}
```

## H-Yet Another Origami Problem

### 题意

可以选择任意坐标$p$，进行如下二选一操作：

1. 若符合$a_i\leq a_p$，可以重新赋值$a_i\leftarrow a_i + 2(a_p-a_i)$。
2. 若符合$a_i\geq a_p$，可以重新赋值$a_i \leftarrow a_i-a(a_i-a_p)$

可以进行上述操作若干次，求问可以将$a$数组的范围收敛到多小。

#### 数据范围

- $1\leq t\leq 5\times 10^5$
- $1\leq n\leq 10^5$
- $0\leq a_i\leq 10^{16}$

### 思路

上面的操作可以进行无数次，通过模拟可以意识到，这是一个类似折纸的操作，是将某个数沿着某条线折叠到另一边的操作。注意到每次操作不是必须要对每个$a_i$进行这样的翻折的，例如当$a_i\lt a_p$时选择操作2，可以避免$a_i$的翻折。

通过翻折让数组的范围收束到最小。假设当前只有3个各不相同的数，这三个数从小到大排列之后是$\{a,b,c\}$，那么在数轴上形成了距离$x=b-a$和$y=c-b$，对于这三个数来说，通过折叠，假设是$a$沿着$b$向$c$折叠，将$x$变为$x\bmod y$（不断沿着$y$的两边折叠，直到落在$b\text{、} c$之间），若此时$x\neq 0$，则$y$也可以通过一样的方法收束到小于$x$的某个长度。故获得的最小的范围应该是$x\text{、}y$的$gcd$。

同样的思想可以拓展到多个数的时候。

### 代码

```cpp
ll a[maxn];
void solve() {
    int n;cin >> n;
    for (int i = 0;i < n;i++) { cin >> a[i]; }
    sort(a, a + n);
    if (n == 1) {
        cout << 0 << "\n";
        return;
    }
    if (n == 2) {
        cout << a[1] - a[0] << "\n";
        return;
    }
    ll ans = a[1] - a[0];
    for (int i = 2;i < n;i++) {
        ans = gcd(ans, a[i] - a[i - 1]);
    }
    cout << ans << "\n";
}
```

## I-Friends

### 题意

$n$个人从左到右排成一排，编号从$1$到$n-1$，这$n$个人之间有$m$对好朋友，求有多少个区间$[l,r]$中每两对都是好朋友。

#### 数据范围

- $1\leq n,m \leq 10^6$

### 思路

假设已有一个区间$[l,r]$符合要求，且$r$是以$l$为左端点的时候最远的符合要求的右端点。那么显然有：

当加入$r+1$时，$r+1$号与$[l,r]$中的至少一个人不是好友关系。同时，区间$[l+1,r]$是一个友好区间，于是在移动左端点时，右端点只需要从上一个左端点的最远右端点开始检查即可。

### 代码

```cpp
void solve() {
    int n, m;cin >> n >> m;
    vector<map<int, bool>>links(n + 1);
    for (int i = 0;i < m;i++) {
        int u, v;cin >> u >> v;
        links[u][v] = true;
        links[v][u] = true;
    }
    int ans = 0;
    int prer = 1;
    for (int i = 1;i <= n;i++) {
        int j = prer;
        while (j <= n) {
            // check
            bool f = true;
            for (int k = i;k < j;k++) {
                if (links[j].count(k))continue;
                f = false;
                break;
            }
            if (!f)break;
            j++;
        }
        ans += j - i;
        prer = j - 1;
    }

    cout << ans << "\n";
}
```
