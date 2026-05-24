---
title: "💭Educational Codeforces Round 162(div2)"
description: "Educational Codeforces Round 162 Div.2 的补题记录，整理 Moving Chips、Monsters Attack 和 Find B 的题意、思路与参考代码。"
date: "2024-02-29T14:57:07+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - Codeforces
  - 补题记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# A-Moving Chips

## 题意

每个单元格为空闲或有一个芯片，芯片可以向左移动到最近的空闲处（如果存在空闲格）。

现在有一排单元格，求问进行多少次移动，才能使得所有芯片集中在一起（中间没有空格）。

#### 数据范围

$t(1≤t≤1000)$

$n(2≤n≤50)$​

$a_i(a_i∈\{1,0\})$

## 思路

统计数组中第一个1和最后一个1之间的0的数目。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<int>a(n);
    bool f = false;
    int cnt = 0;
    int ans = 0;
    for (int i = 0;i < n;i++) {
        cin >> a[i];
        if (a[i] == 1 && !f) {
            f = true;
        }
        if (f) {
            if (a[i] == 0)
                cnt++;
            else {
                ans += cnt;
                cnt = 0;
            }
        }
    }
    cout << ans << endl;
}
```

# B-Monsters Attack!

## 题意

玩家位于一维坐标0点处，开始游戏后，每一回合玩家可以向任意两个方向发射总共不多于$k$颗子弹，每个子弹可以造成怪物的血量$a_i$下降1点，降为0后怪物将倒下并从坐标上移除。之后，所有怪物超玩家移动一格。如果怪物到达了玩家的位置(即坐标0点)，则游戏失败。

询问是否可能使玩家消灭所有$n$只怪物，不让任何一只怪物靠近玩家。

#### 数据范围

$t(1≤t≤3\times 10^4)$

$n,k(1≤n≤3\times 10^5,1\le k\le 2\times 10^9)$​

$a_i(1\le a_i\le 10^9)$

$x_i(-n\le x_1\lt x_2\lt\dots\lt x_n\le n;x_i≠0)$

## 思路

将所有怪物折合成同一个方向，每次玩家向怪物移动一格，每次都使用完所有的$k$颗子弹。遍历模拟，判断是否能在到达最远坐标之前消灭所有怪物。

## 参考代码

```cpp
struct monster {
    ll a, x;
    bool operator<(const monster& other) {
        return x < other.x;
    }
};

void solve() {
    ll n, k;cin >> n >> k;
    vector<ll>a(n);
    for (int i = 0;i < n;i++)cin >> a[i];
    vector<ll>x(n);
    for(int i = 0;i < n;i++) {
        cin >> x[i];
        if (x[i] < 0)x[i] *= -1;
    }
    vector<monster>monsters;
    for (int i = 0;i < n;i++) {
        monsters.push_back({a[i], x[i]});
    }
    sort(monsters.begin(), monsters.end());
    map<ll, ll>turns;
    for (int i = 0;i < n;i++) {
        ll t = monsters[i].a;
        ll s = monsters[i].x;
        turns[s] += t;
    }
    ll lk = 0;	// 剩余子弹
    ll ix = 0;
    for (auto i = turns.begin();i != turns.end();i++) {
        ll iy = i->first;   // 位置
        ll t = i->second;
        if ((iy - ix) * k + lk < t) {
            cout << "NO\n";return;
        }
        else {
            lk = (iy - ix) * k + lk - t;
            ix = iy;
        }
    }
    cout << "YES\n";
}
```

# C-Find B

## 题意

给一个数组$a$，每次截取一段$[l,r]$的子数组$b$，判断该数组是否可以变化成一个数组$c$，满足：

1. $\sum_{i=1}^m b_i=\sum_{i=1}^m c_i$
2. 任意$i∈[l,r]$，都满足$b_i≠c_i$
3. 任意$c_i\gt 0$​

#### 数据范围

$t(1≤t≤10^4)$

$n,q(1≤n,q≤3\times 10^5)$​

$a_i(1\le a_i\le 10^9)$

$l_i,r_i(1\le l_i\le r_i\le n)$

## 思路

预处理数组$a$。

对于子数组$b$，考虑：将所有不为1的数变成1，将所有的1至少再加1。

这样生成的数组$c$是符合要求的。

如果上述操作可以实现总和不变，则可行。

## 参考代码

```cpp
void solve() {
    ll n, q;cin >> n >> q;
    vector<ll>c(n + 1);c[0] = 0;
    vector<ll>pc(n + 1);pc[0] = 0;
    vector<ll>ct(n + 1);ct[0] = 0;
    for (int i = 1;i <= n;i++) {
        cin >> c[i];
        pc[i] = c[i] + pc[i - 1];
        if (c[i] == 1)ct[i] = ct[i - 1] + 1;
        else ct[i] = ct[i - 1];
    }
    while (q--) {
        ll l, r;cin >> l >> r;
        if (l == r) {
            cout << "NO\n";continue;
        }
        ll sum = pc[r] - pc[l - 1];
        ll lr = r - l + 1;
        lr -= ct[r] - ct[l - 1];    // 非1的个数
        if (sum - lr >= 2 * (ct[r] - ct[l - 1])) {
            cout << "YES\n";
        }
        else cout << "NO\n";
    }
}
```
