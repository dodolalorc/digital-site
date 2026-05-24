---
title: "💭Codeforces Round 990 (Div. 2)"
description: "Codeforces Round 990 Div.2 的补题记录，记录拼图、字符替换和列交换路径题的分析与实现。"
date: "2024-12-05T19:27:40+08:00"
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

## A. Alyona and a Square Jigsaw Puzzle

### 题意

`Alyona`按照顺时针围绕第一个拼图放置拼图，`Alyona`每天会按顺序放置一定数量的拼图，如果一天结束时拼图的组装部分没有任何已开始但未完成的层，`Alyona`会感到开心。给出每天放置拼图的数量，询问`Alyona`感到快乐的天数。

#### 数据范围

- $1\leq t\leq 500$
- $1\leq n\leq 100$
- $1\leq a_i\leq 100,a_1=1$

### 思路

检查每天完成添加拼图时的总拼图数是否恰好是一个奇数的平方数，若是则该天会感到快乐。

### 代码

```cpp
void solve() {
  cin >> n;
  ll tot = 0, ans = 0;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    tot += a[i];
    ld t = sqrtl(tot);
    if ((ll)t & 1 && t == (ll)t) {
      ans++;
    }
  }
  cout << ans << '\n';
}
```

## B. Replace Character

### 题意

在一个长度为$n$的字符串中，执行**一次**这样的操作：

- 选择两个索引$i,j(1\leq i,j\leq n)$，可以选择$i = j$。
- 进行赋值$s_i:=s_j$。

要求输出在进行该操作之后，字典序最小的那个字符串。

#### 数据范围

- $1\leq t\leq 500$
- $1\leq n\leq 10$

### 思路

将其中一个数量最少的字母改成数量最多的字母，不过这个题数据范围很小，也可以直接暴力。

### 代码

```cpp
void solve() {
  cin >> n;
  string s;
  cin >> s;
  map<char, ll> mp;
  for (auto c : s) {
    mp[c]++;
  }
  vector<pll> v;
  for (auto i : mp) {
    v.push_back({i.second, i.first - 'a'});
  }
  sort(v.begin(), v.end(), greater<>());
  v[0].first += 1, mp[v[0].second + 'a']++;
  char cc = v[0].second + 'a';
  v[v.size() - 1].first -= 1, mp[v[v.size() - 1].second + 'a']--;
  string ans;
  for (auto i : s) {
    if (mp[i]) {
      ans.push_back(i);
      mp[i]--;
    } else {
      ans.push_back(cc);
    }
  }
  cout << ans << '\n';
}
```

## C. Swap Columns and Find a Path

### 题意

在一个$2\times n$的矩阵中，从$(1,1)$走到$(2,n)$点，只能向右和向下走，每个位置上有一个$a_{i,j}$的分数，需要最大化路径上的总分。可以支持任意次这样的操作：

- 选择两列$i,j$，将列$i$和列$j$进行交换，即$swap(a_{1,i},a_{1,j})$和$swap(a_{2,i},a_{2,j})$.

请执行最大化路径上的数之和，并输出这个总和。

#### 数据范围

- $1\leq t\leq 5000$
- $1\leq n\leq 5000$
- $-10^5\leq a_{i,j}\leq 10^5$

### 思路

观察可知，选择的路径长度固定是$n+1$，由于只能向右或者向下走，实际的路径的形状一定是在第一行取前一段，再再第二行取后一段，对每列进行排序后贪心的选择最大的一组合法的数即可。

书写的时候判断转折的一列时，也可以反向先算出$2\times n$个数的总和，再贪心的减掉$n-1$个较小的数，注意只有转折的地方一列的两个数都能取到，而其他位置的数只能取一个值。

### 代码

```cpp
ll n, m;
ll a[5][maxn], pre[5][maxn], b[maxn];
bool vis[maxn];

void solve() {
  ll n;
  cin >> n;
  vector<pll> v1, v2;
  for (ll k = 1; k <= 2; k++) {
    for (ll i = 1; i <= n; i++) {
      cin >> a[k][i];
      vis[i] = false;
      if (k == 1) {
        v1.push_back({a[k][i], i});
      } else {
        v2.push_back({a[k][i], i});
      }
    }
  }
  sort(v1.begin(), v1.end(), greater<>());
  sort(v2.begin(), v2.end(), greater<>());
  ll ans = 0, cnt = 0;
  for (ll k = 1; k <= 2; k++) {
    for (ll i = 1; i <= n; i++) {
      ans += a[k][i];
    }
  }
  ll p1 = n - 1, p2 = n - 1;
  while (cnt < n - 1) {
    while (p1 >= 0 && vis[v1[p1].second]) {
      p1--;
    }
    while (p2 >= 0 && vis[v2[p2].second]) {
      p2--;
    }
    if (p1 != -1 && p2 != -1) {
      if (v1[p1].first < v2[p2].first) {
        ans -= v1[p1].first;
        vis[v1[p1].second] = true;
        p1--;
      } else {
        ans -= v2[p2].first;
        vis[v2[p2].second] = true;
        p2--;
      }
      cnt++;
    } else if (p1 != -1) {
      ans -= v1[p1].first;
      vis[v1[p1].second] = true;
      p1--;
      cnt++;
    } else if (p2 != -1) {
      ans -= v2[p2].first;
      vis[v2[p2].second] = true;
      p2--;
      cnt++;
    } else {
      break;
    }
  }
  cout << ans << '\n';
}
```

## D. Move Back at a Cost

### 题意

给出一个长度为$n$的数组$a$，可以执行如下操作：

- 选择一个索引$i$，将$a_i+1$添加到数组的末尾，并删去$a_i$。

可以执行这样的操作任意次，请输出字典序最小的操作之后的数组$a$。

#### 数据范围

- $1\leq t\leq 10^4$
- $1\leq n\leq 10^5$
- $1\leq a_i\leq 10^9$

### 思路

尽量保留原数组中从小到达排列的数，将其中不符合单调性的点挪到数组的后面，不要让这些将挪到数组后面的数再次挪动。

维护一个全局的`multiset`，记录所有需要挪动的数字，将这些数+1 后依次添加到原来数组生成的有序序列的后面。

### 代码

```cpp

void solve() {
  ll n;
  cin >> n;
  multiset<ll> st;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    st.insert(a[i]);
  }
  ll p = 1;
  multiset<ll> v;
  vector<ll> ans;
  while (p <= n && !st.empty()) {
    while (p <= n && a[p] != *st.begin()) {
      v.insert(a[p]);
      st.erase(st.find(a[p]));
      p++;
    }
    if (p > n)
      break;
    ans.push_back(a[p]);
    st.erase(st.find(a[p]));
    p++;
  }
  while (!v.empty() && ans.back() > *v.begin() + 1) {
    v.insert(ans.back());
    ans.pop_back();
  }
  for (auto i : v) {
    ans.push_back(i + 1);
  }
  for (auto i : ans) {
    cout << i << ' ';
  }
  cout << '\n';
}
```
