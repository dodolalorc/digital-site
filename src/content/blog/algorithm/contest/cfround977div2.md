---
title: "💭Codeforces Round 977 (Div. 2, based on COMPFEST 16 - Final Round)"
description: "Codeforces Round 977 Div.2 的补题记录，包含 Meaning Mean、Maximize Mex 和调整演示顺序等题目的解法笔记。"
date: "2024-10-25T14:57:19+08:00"
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

# A. Meaning Mean

## 题意

可以选择 2 个不同的索引$i,j$，将数组中这两个索引对应的数删除，然后将$\lfloor \frac{a_i+a_j}{2} \rfloor$添加到数组的最后。可知到最后只会剩下一个数，最大化最后剩余的这个数$x$，并输出。

#### 数据范围

- $2\leq n \leq 50$
- $1\leq a_i\leq 10^9$

## 思路

考虑三个数$a\lt b\lt c$时，按照各种顺序合并的情况下，$\lfloor \frac{\lfloor \frac{a+b}{2} \rfloor+c}{2}\rfloor$是最好的操作。

## 参考代码

```cpp
ll a[maxn];

void solve() {
  int n;
  cin >> n;
  for (int i = 1; i <= n; i++) {
    cin >> a[i];
  }
  sort(a + 1, a + 1 + n);
  ll tot = a[1];
  for (int i = 2; i <= n; i++) {
    ll x = a[i];
    tot = (tot + x) / 2;
  }
  cout << tot << '\n';
}
```

# B. Maximize Mex

## 题意

对一个给定的数组$a$和给定的数$x$，可以进行如下操作：

- 选择一个索引，$a_i:=a_i + x$。

可以执行这个操作任意次，询问这个数组最大的$MEX$值是多少。

#### 数据范围

- $1\leq t\leq 5000$
- $1\leq n\leq 2\times 10^5$
- $0\leq x\leq 10^9$

## 思路

赛后再交发现 T 了...剪枝优化了一下。

首先容易观察到，$a_i:=a_i + x$的操作不会改变$a_i$所属的模$x$的同余系，在把$a$按照模$x$的值进行分组之后，对每个组，check 对应集合中是否能满足$[1, n-1]$的范围内的$a_i$都存在，遍历时，计数$a_i=k\times x + (a_i \mod x)$的$k$的数量，如果$k$从$0$到$\lfloor \frac{n-1}{x}\rfloor + ((n-1) \mod x >= a_i \mod x)$每一位都满足$\sum_0^{k_i} cnt[k_i] \gt k_i$，则说明同余集合中到$ki\times x+a_i\mod x$的值都是可以满足的。

最后检测一下$vis$数组，寻找$mex$。

## 参考代码

```cpp
ll a[maxn];
bool vis[maxn];
void solve() {
  ll n, x;
  cin >> n >> x;
  for (int i = 0; i <= n; i++) {
    vis[i] = false;
  }
  map<ll, vector<ll>> mp;
  for (int i = 1; i <= n; i++) {
    cin >> a[i];
    mp[a[i] % x].push_back(a[i]);
  }

  for (auto &[i, v] : mp) {
    sort(v.begin(), v.end());
    ll tot = (n - 1) / x;
    if ((n - 1) % x >= i)
      tot += 1;

    vector<ll> cnt(tot, 0);
    for (auto j : v) {
      if ((j - i) / x < tot) {
        cnt[(j - i) / x]++;
      } else {
        break;
      }
    }
    ll sum = 0ll;
    for (int j = 0; j < tot; j++) {
      sum += cnt[j];
      if (sum <= j) {
        break;
      }
      vis[j * x + i] = true;
    }
  }

  for (int i = 0; i <= n; i++) {
    if (!vis[i]) {
      cout << i << '\n';
      return;
    }
  }
}
```

# C. Adjust The Presentation (Easy Version && Hard Version)

## 题意

$n$个人排成一队，依次播放$m$张幻灯片，当一个人播放过幻灯片之后，可以重新将他插入任意的位置，或者留在队首播放下一张幻灯片。每张幻灯片都有一个最佳播放者，如果所有的幻灯片都由其最佳播放者播放，则整个播放是完美的，输出`YA`，否则输出`TIDAK`。询问是否可以通过调整，使得所有的幻灯片都完美播放。

同时支持$q$次修改幻灯片的最佳播放者，询问每次修改之后的播放效果，输出`YA`或`TIDAK`。

#### 数据范围

- $1 \leq t\leq 10^4$
- $1\leq n,m \leq 2\times 10^5$
- $0\leq q\leq 2\times 10^5$
- $1\leq a_i,b_i\leq n$
- $1\leq s_i\leq m,1\leq t_i\leq n$

## 思路

幻灯片$i$是否能被最佳播放者播放，只需要保证其播放者$s_i$在播放$i$时或之前出现，也就是说，如果数组$b$中每个编号最先出现的次序排序后，若恰好是$a$的前缀，则是可以满足的。

差分数组计数$a$数组中第$i$个数$a[i]$在$b$中最先出现次序排序后的次序是否大于等于前一个数，即是否上升。利用$set$更新$b$中每个编号最先出现的位置。

每次$b_{s_i}:=t_i$操作后，更新检查编号$b[s_i]$前后编号的新次序是否合法（与$a$中$b[s_i]$的前一位置的编号的最早位置相比是否上升），编号$t_i$前后是否合法，更新$diff$数组和$sum$值。

```cpp
ll a[maxn], b[maxn], pos[maxn], diff[maxn];
vector<set<ll>> st;

void YorT(bool f) { f ? cout << "YA\n" : cout << "TIDAK\n"; }

void solve() {
  int n, m, q;
  cin >> n >> m >> q;

  st.assign(n + 1, set<ll>());

  for (int i = 1; i <= n; i++) {
    cin >> a[i];
    pos[a[i]] = i;
    st[i].insert(m + 1);
    diff[i] = 0;
  }
  for (int i = 1; i <= m; i++) {
    cin >> b[i];
    st[b[i]].insert(i);
  }

  auto check = [&](int s) { // 检查a[s-1] -> a[s]的合法情况,是否上升
    if (s == 1 || s > n)
      return 0;
    int res = 0;
    if (diff[s] && !(*st[a[s - 1]].begin() <= *st[a[s]].begin())) {
      diff[s] = 0;
      res = -1;
    } else if (!diff[s] && *st[a[s - 1]].begin() <= *st[a[s]].begin()) {
      diff[s] = 1;
      res = 1;
    }
    return res;
  };

  ll sum = 0ll;
  for (int i = 2; i <= n; i++) {
    sum += check(i);
  }

  YorT(sum == n - 1);

  while (q--) {
    int s, t;
    cin >> s >> t;
    st[b[s]].erase(s);
    st[t].insert(s);
    sum += check(pos[b[s]]) + check(pos[b[s]] + 1) + check(pos[t]) +
           check(pos[t] + 1);
    b[s] = t;
    YorT(sum == n - 1);
  }
}
```

# D. Boss, Thirsty

# E1. Digital Village (Easy Version) && (Hard Version)

## 题意

居民房屋构成一个无向图，包含$n$个点$m$条边，其中$p$户需要网络服务，可以在任意的房屋中安置交换机，房屋$s_i$与交换机所在房屋$s_j$之间的延迟是$s_i$到$s_j$的简单路径上最大的延迟。可以任意选择放置交换机的位置，询问在逐渐增加交换机的过程中，所有需要网络服务的居民的最小总延迟。

#### 数据范围

- $1\leq t \leq 2000$
- $2\leq n,\leq 5000$
- $n-1\leq m \leq 5000$
- $1\leq p \leq n$
- $1\leq s\leq n$
- $1\leq u_i\lt w_i\leq n;1\leq w_i\leq 10^9$

## 思路

## 参考代码
