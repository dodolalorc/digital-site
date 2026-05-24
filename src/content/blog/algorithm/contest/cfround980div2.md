---
title: "💭Codeforces Round 980 (Div. 2)"
description: "Codeforces Round 980 Div.2 的补题记录，整理利率、买柠檬水、数组拼接和跳跃等题目的思路与代码。"
date: "2024-11-26T14:28:27+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A. Profitable Interest Rate

### 题意

有两种储值方式——无利可图和盈利，“盈利”可以保证盈利，但是有最低储值要求，“无利可图”类型没有利息，但是可以让“盈利”的最低储值降低。在“无利可图”储值$x$元，可以让“盈利”的最低值要求降低$2\times x$元，最低储值不能低于$0$元，两种储值均不能取出。现在`Alice`拥有$a$元，并想使存入“盈利”的金额越多越好，求`Alice`最多存入多少“盈利”类型的金额。

#### 数据范围

- $1\leq t\leq 10^4$
- $1\leq a,b\leq 10^9$

### 思路

假设存入$x$元在“无利可图”，则“盈利”的最低储值降为$b-2\times x$，此时如果`Alice`的剩余金额$a-x$可以达到最低储值，则答案为$a-x$，否则为$0$，最小化$x$即可。

### 参考代码

```cpp
void solve() {
  ll a, b;
  cin >> a >> b;
  ll x = max(0ll, b - a);
  ll ans = max(0ll, a - x);
  cout << ans << '\n';
}
```

## B. Buying Lemonade

### 题意

柠檬水售卖机有$n$个按钮，但是无法辨认每个按钮对应的槽位还剩多少柠檬水，购买者知道每个槽位最初的柠檬水数量，每按下一个按钮，如果该按钮对应的槽位还有柠檬水，则可以售出$1$瓶柠檬水，若槽位为空，则将没有任何东西掉出来。现在需要精确购买$k$瓶柠檬水，保证柠檬水售卖机里有足够的柠檬水，即$\sum_{i=1}^{n} a_i \ge k$。求问最少的可以保证达成任务的点击次数。

#### 数据范围

- $1\leq t\leq 10^4$
- $1\leq n\leq 2\times 10^5$
- $1\leq k\leq 10^9$
- $1\leq a_i\leq 10^9$

$n$之和不超过$2\times 10^5$。

### 思路

基本的贪心购买思路是一直按同一个按钮，直到该槽位为空，考虑到购买$k$瓶至少需要$k$次基本点击，我们需要最小化会浪费的点击次数，即点空槽位的次数。

假设当前每个槽位都至少有$2$瓶柠檬水，我们想最小化点空的次数，最好先把每个按钮都点击$2$次，如果此时的总数足够$k$，我们就计数次数，否则去掉空槽位（通过 1 次点击去除），我们要继续最小化。

二分在每个按钮点击的次数，查询能买到的柠檬水总数，计数最少的次数，即第一个满足总数大于等于$k$的那个次数。

### 参考代码

```cpp
ll a[maxn];

void solve() {
  ll n, k;
  cin >> n >> k;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
  }
  sort(a + 1, a + 1 + n);

  auto get_cnt = [&](ll cnt) {
    ll ret = 0ll, tot = 0ll;
    for (ll i = 1; i <= n; i++) {
      if (a[i] < cnt) {
        if (tot + a[i] < k) {
          ret += a[i] + 1;
          tot += a[i];
        } else {
          ret += k - tot;
          break;
        }
      } else {
        if (tot + cnt < k) {
          ret += cnt;
          tot += cnt;
        } else {
          ret += k - tot;
          break;
        }
      }
    }
    return ret;
  };
  auto get_lemonade = [&](ll cnt) {
    ll tot = 0ll;
    for (ll i = 1; i <= n; i++) {
      if (a[i] < cnt) {
        tot += a[i];
      } else {
        tot += cnt;
      }
    }
    return tot;
  };

  // 可以获得k的第一个次数的下标
  ll l = 1, r = n;
  while (l < r) {
    ll mid = l + (r - l) / 2;
    if (get_lemonade(a[mid]) < k) {
      l = mid + 1;
    } else {
      r = mid;
    }
  }
  ll ans = get_cnt(a[l]);
  cout << ans << '\n';
}
```

## C. Concatenation of Arrays

### 题意

有$n$个二元组，将这些二元组重新排序后让序列的逆序数最小，输出排序后的结果。

#### 数据范围

- $1\leq t\leq 10^4$
- $1\leq n\leq 10^5$
- $1\leq a_{i,j}\leq 10^9$

### 思路

排序，将二元组按照两数之和、第一位数、第二位数的优先级顺序从小到大排序。

### 参考代码

```cpp
void solve() {
  ll n;
  cin >> n;
  vector<pll> v;
  for (ll i = 1; i <= n; i++) {
    pll p;
    cin >> p.first >> p.second;
    v.push_back(p);
  }
  sort(v.begin(), v.end(), [&](pll p1, pll p2) {
    return make_tuple(p1.first + p1.second, p1.first, p1.second) <
           make_tuple(p2.first + p2.second, p2.first, p2.second);
  });
  for (auto i : v) {
    cout << i.first << ' ' << i.second << ' ';
  }
  cout << '\n';
}
```

## D. Skipping

### 题意

问答系统，对第$i$个题，如果选择回答，可以获得$a_i$分数，接下来只能选择序号$j\lt i$且没有操作过的问题。也可以选择跳过，接下来可以选择$j\leq b_i$的未操作过的题目。从$1$号问题开始回答。

### 思路

注意到，当跳到索引$i$时，所有$1\leq k\leq i$的没有回答过的题目，都可以通过依次回答。我们只需要贪心的选择前置和-到达某个位置的最小代价即可。

考虑用一个全局$multiset$维护当前可以使用的代价，从$1$号问题开始，每个问题的$b_i$指向一个到$b_i+1$会“失效”的最小代价，每次移动时去除失效代价，并加入新的最小代价，维护最大得分即可。

维护时可以注意到$b_i\leq i$的跳题没有意义，不如直接向前答题，可以通过判断去除这种移动。

### 参考代码

```cpp
void solve() {
  cin >> n;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    pre[i] = pre[i - 1] + a[i];
  }
  for (ll i = 1; i <= n; i++) {
    cin >> b[i];
  }

  // ll ans = a[1];
  multiset<ll> st;        // 可行代价
  map<ll, vector<ll>> mp; // 存储到达i的所有可行代价
  mp[2].push_back(0);
  st.insert(0);
  ll ans = a[1];
  for (ll i = 1; i <= n; i++) {
    for (auto x : mp[i]) {
      st.erase(st.find(x)); // 删去不再适用的代价
    }

    if (st.empty()) {
      dis[i] = -1; // 没有可用的代价
    } else {
      dis[i] = *st.begin();
    }

    if (dis[i] == -1)
      continue;
    ans = max(ans, pre[i] - dis[i]);

    if (b[i] <= i)
      continue;
    // 可以拓展到点b[i],b[i]+1时刻这些代价都不再适用
    ll d = dis[i] + a[i];
    mp[b[i] + 1].push_back(d);
    st.insert(d);
  }

  cout << ans << '\n';
}
```
