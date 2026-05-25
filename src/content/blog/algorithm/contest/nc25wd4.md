---
title: "🎈2025牛客暑寒假多校训练营Day4"
description: "2025 牛客寒假多校训练营 Day4 的补题记录，整理平衡字符串、回文拼接和龙息等题目的思路。"
date: "2025-03-02T18:46:04+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - 牛客寒假营
  - 补题记录
categories:
  - 算法
series:
  - 2025 牛客寒假营
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A

### 题意

#### 数据范围

### 思路

### 代码

## B Tokitsukaze and Balance String (easy)

### 题意

定义字符串是平衡的：字符串中`01`的连续子串的数量和`10`的连续子串的数量相同。

定义字符串`s`的`val(s)`：

- 将字符串`s`的某位置`i`的字符倒置（`1`变成`0`，`0`变成`1`）后，字符串是平衡的，这样的位置的总数

现在有一个由`1`、`0`和`?`组成的字符串，`?`可以任意换成`1`或`0`，求所有的填写完成的字符串的`val(s)`的总和，模数是$10^9+7$。

#### 数据范围

- $1\leq T\leq 10^4$
- $1\leq n\leq 10$
- 保证单个测试文件的$2^n$之和不超过$10^5$

### 思路

Easy版本的数据范围较小，直接dfs统计即可。

### 代码

```cpp
ll val(string t) {
  ll n = t.size();
  ll ret = 0ll;
  for (ll pi = 0; pi < n; pi++) {
    t[pi] = '1' - t[pi] + '0';
    ll cnt1 = 0, cnt2 = 0;
    for (ll i = 1; i < n; i++) {
      if (t[i - 1] == '0' && t[i] == '1')
        cnt1++;
      if (t[i - 1] == '1' && t[i] == '0')
        cnt2++;
    }
    ret += (cnt1 == cnt2);
    t[pi] = '1' - t[pi] + '0';
  }
  return ret;
}

ll ans = 0ll;
void dfs(string s, ll p) {
  if (s.find('?') == -1) {
    ans += val(s);
    return;
  }
  if (s[p] != '?') {
    dfs(s, p + 1);
    return;
  }
  s[p] = '1';
  dfs(s, p + 1);
  s[p] = '0';
  dfs(s, p + 1);
  return;
}

void solve() {
  ll n;
  string s;
  cin >> n >> s;
  ans = 0ll;
  dfs(s, 0);
  cout << ans << '\n';
}
```

## C

### 题意

#### 数据范围

### 思路

### 代码

## D Tokitsukaze and Concatenate‌ Palindrome

### 题意

有两个字符串`a`和`b`。

第一步：对他们分别进行重新排列（也可以保持原状）；

第二步：可以进行若干次替换；

第三步：将`a`和`b`链接成一个新字符串`s`。

求至少进行多少次第二步的替换，可以让`s`是一个回文串。

#### 数据范围

- $1\leq n,m\leq 2\times 10^5$

### 思路

如果`a`和`b`有共同拥有的字符，那么在回文串中要尽量将这些字符用作对称的位置，在组合串`s`的中线位置，尽量放满`a`或`b`中较长的串的剩余部分中的数量大于 1 的字符，剩余的不对称的部分就是不得不替换的字符。

### 代码

```cpp
void solve() {
  ll n, m;
  cin >> n >> m;
  string a, b;
  cin >> a >> b;
  if (n < m) {
    swap(n, m);
    swap(a, b);
  }
  vector<ll> v1(26, 0), v2(26, 0);
  for (auto c : a) {
    v1[c - 'a']++;
  }
  for (auto c : b) {
    v2[c - 'a']++;
  }
  ll tot = 0ll, sum1 = 0ll, sum2 = 0ll;
  for (int i = 0; i < 26; i++) {
    if (v1[i] > v2[i])
      v1[i] -= v2[i], v2[i] = 0;
    else
      v2[i] -= v1[i], v1[i] = 0;
    sum1 += v1[i], sum2 += v2[i];
    tot += v1[i] / 2;
  }
  ll ans = sum2;
  if ((sum1 - sum2) / 2 > tot) {
    ans += (sum1 - sum2) / 2 - tot;
  }
  cout << ans << '\n';
}
```

## E Tokitsukaze and Dragon's Breath

### 题意

在$n\times m$的表格中，每个位置$(i,j)$有一个数字$a_{i,j}$代表此地的怪物数量，当龙的位置在$(x,y)$时，火焰会打败坐标$(x,y)$的怪物，并向四个斜角方向（左上 ↖，右上 ↗，右下 ↘，左下 ↙）一直拓展，形成一个`X`形状。

请在地图上选一个作为龙的坐标，并计算可以打败最多怪物的数量。

#### 数据范围

- $1\leq T\leq 1e4$
- $1\leq n,m\leq 1e3$
- $1\leq a_{i,j}\leq 1e9$
- $n\times m\leq 1e6$

### 思路

按题意枚举点，模拟攻击，注意需要记忆化算过的斜线，保证合适的复杂度。

### 代码

```cpp
ll maz[1200][1200];

vector<pll> dxy = {{1, 1}, {-1, 1}, {1, -1}, {-1, -1}};

void solve() {
  ll n, m;
  cin >> n >> m;
  for (ll i = 1; i <= n; i++) {
    for (ll j = 1; j <= m; j++) {
      cin >> maz[i][j];
    }
  }
  map<ll, ll> mpc, mpr;
  auto fire = [&](ll x, ll y) {
    if (mpc.count(x - y) == 0) {
      ll sum = -maz[x][y];
      ll dx = 1, dy = 1;
      ll px = x, py = y;
      while (px >= 1 && px <= n && py >= 1 && py <= m) {
        sum += maz[px][py];
        px += dx, py += dy;
      }
      dx = -1, dy = -1;
      px = x, py = y;
      while (px >= 1 && px <= n && py >= 1 && py <= m) {
        sum += maz[px][py];
        px += dx, py += dy;
      }
      mpc[x - y] = sum;
    }
    if (mpr.count(x + y) == 0) {
      ll sum = -maz[x][y];
      ll dx = 1, dy = -1;
      ll px = x, py = y;
      while (px >= 1 && px <= n && py >= 1 && py <= m) {
        sum += maz[px][py];
        px += dx, py += dy;
      }
      dx = -1, dy = 1;
      px = x, py = y;
      while (px >= 1 && px <= n && py >= 1 && py <= m) {
        sum += maz[px][py];
        px += dx, py += dy;
      }
      mpr[x + y] = sum;
    }
    return mpc[x - y] + mpr[x + y] - maz[x][y];
  };
  ll ans = 0ll;
  for (ll x = 1; x <= n; x++) {
    for (ll y = 1; y <= m; y++) {
      ll res = fire(x, y);
      ans = max(ans, res);
    }
  }
  cout << ans << '\n';
}
```

## I Tokitsukaze and Pajama Party

### 题意

歌词模式是`u*uwawauwa`，必须有一个`u`开头和一个`uwawauwa`结尾(连续的)，且中间的`*`至少匹配 1 个任意字符，给出一个字符串，求字符串中有多少符合上述模式的子串。

#### 数据范围

- $1\leq n\leq 1e5$

### 思路

寻找字符串中所有`uwawauwa`的位置，枚举`u`的位置，统计总数。

### 代码

```cpp
void solve() {
  ll n;
  string s;
  cin >> n >> s;
  ll p = 0, ans = 0;
  vector<ll> pos, v;
  while (s.find("uwawauwa", p) != -1) {
    p = s.find("uwawauwa", p);
    pos.push_back(p);
    p += 1;
  }
  for (ll i = 0; i < s.size(); i++) {
    if (s[i] == 'u') {
      v.push_back(i);
    }
  }
  for (auto i : pos) {
    ll c = lower_bound(v.begin(), v.end(), i - 1) - v.begin();
    ans += c;
  }
  cout << ans << '\n';
}
```

## K Tokitsukaze and Shawarma

### 题意

客人需要$x$个沙威玛，$y$杯可乐，$z$包薯条。

制作 $1$ 个沙威玛需要 $a$ 分钟；让饮料机倒可乐，每一杯可乐需要 $b$ 分钟；让炸锅自动炸薯条，每一包薯条需要 $c$ 分钟。这三件事可以同时进行。

请问客人至少需要等待几分钟。

#### 数据范围

- $1\leq x,y,z,a,b,c\leq 100$

### 思路

三者可以同时进行，取耗时最多的时间。

### 代码

```cpp
void solve() {
  ll x, y, z, a, b, c;
  cin >> x >> y >> z >> a >> b >> c;
  ll ans = max(x * a, y * b);
  ans = max(ans, c * z);
  cout << ans << '\n';
}
```
