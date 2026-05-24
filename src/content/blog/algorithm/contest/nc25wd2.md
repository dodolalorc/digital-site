---
title: "🎈2025牛客暑寒假多校训练营Day2"
description: "2025 牛客寒假多校训练营 Day2 的补题记录，涵盖历史之音、蹭饭、字符串内外串和路径题。"
date: "2025-02-06T00:40:31+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A 一起奏响历史之音！

### 题意

中国传统五声调中包含 1、2、3、5、6，判断一个乐谱是否仅由全部或部分五声调铺成。

### 思路

按题意判断即可。

### 代码

```cpp
void solve() {
  bool flag = true;
  set<ll> st = {1, 2, 3, 5, 6};
  ll x;
  while (cin >> x) {
    if (st.find(x) == st.end()) {
      flag = false;
    }
  }
  if (flag) {
    cout << "YES\n";
  } else {
    cout << "NO\n";
  }
}
```

## B 能去你家蹭口饭吃吗

### 题意

给出一个数组$a$，找到一个整数，要求整数尽可能大，但是至少要比数组中一半数量的数小。

#### 数据范围

- $1\leq n\leq 5e5$
- $1\leq a_i\leq 1e6$

### 思路

如果数组长度为奇数，则取中位数-1，即$a[n-n/2]-1$。

如果数组长度为偶数，则取下标更大的中位数-1，即$a[n/2+1]-1$。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
  }
  sort(a + 1, a + 1 + n);
  if (n & 1)
    cout << a[n - n / 2] - 1 << '\n';
  else
    cout << a[n / 2 + 1] - 1 << '\n';
}
```

## D 字符串里串

### 题意

定义字符串$s$的可爱度$k$：最大的满足存在长度为$k$的连续子串$a$和严格不连续子串$b$，使得$a=b$。

给出字符串$s$，求其可爱度。

#### 数据范围

- $3\leq m \leq 2e5$

### 思路

$b$是不连续子串，可以设计$a$和$b$仅最后一位或开头一位的在原串中的位置不同，那么只需要寻找符合条件的数量大于等于 2 的字母，并比较分别去掉两端得到的最长的串的长度。

### 代码

```cpp
void solve() {
  ll n;
  string s;
  cin >> n >> s;
  s = " " + s;
  map<char, vector<ll>> mp;
  for (ll i = 1; i <= n; i++) {
    char c = s[i];
    mp[c].push_back(i);
  }
  ll ans = 0;
  for (auto [c, v] : mp) {
    if (v.size() >= 2) {
      ll m = v.size();
      ans = max(ans, v[m - 2]);
    }
  }
  for (auto [c, v] : mp) {
    if (v.size() >= 2) {
      ll m = v.size();
      ans = max(ans, n - v[1] + 1);
    }
  }
  cout << ans << '\n';
}
```

## C 字符串外串

### 题意

定义字符串$s$的可爱度$k$：最大的满足存在长度为$k$的连续子串$a$和严格不连续子串$b$，使得$a=b$。构造长度为$n$的由小写字母组成的字符串，使其可爱度为$m$，或报告没有这样的合法字符串。

#### 数据范围

- $3\leq m\leq n\leq n\leq 2e5$

### 思路

$a,b$两种字符串至少要有 1 位对应原串的位置不同，当$n=m$时显然无解。

设字符串$t$是$a,b$左端对齐之后公共的部分，长度为$m-1$，小写字母只有 26 个，当$n-m\gt 26$时，不管怎么填后$n-m$的字母，都不可能与让所有在$i\geq m$的范围内的字母只出现一次，出现多次则可爱度会增加。按照这样的思路构造前$m-1$长度的字符串，并保证在后一半的部分中字符$s[m-1]$出现且仅出现一次。

### 代码

```cpp
void solve() {
  ll n, m;
  cin >> n >> m;
  if (n - m < 1) {
    cout << "NO\n";
    return;
  }
  string s;
  if (m == n - 1) {
    for (ll i = 1; i <= n; i++) {
      if (i == n - 1 || i == n) {
        s.push_back('b');
      } else {
        s.push_back('a');
      }
    }
  } else if (n - m <= 26) {
    for (ll i = 0; i < n; i++) {
      s.push_back('a' + i % 26);
    }
    s.back() = s[m - 1];
  } else {
    cout << "NO\n";
    return;
  }
  cout << "YES\n" << s << '\n';
}
```

## E 一起走很长的路！

### 题意

一列多米诺骨牌，质量是$a_i$，有$q$次询问，询问一个区间$[l,r]$，推倒第$l$位的多米诺骨牌，如果$\sum_{i=l}^{i-1}\geq a_i$，则第$a_i$块可以顺利倒下，为了使第$r$块可以顺利倒下，可以进行一种操作：选择某个多米诺骨牌，将其质量+1 或-1，对每个询问返回最少的可以推倒$r$的操作数。

#### 数据范围

- $1\leq n,q\leq 2e5$
- $1\leq a_i\leq 1e9$
- $1\leq l\leq r\leq n$

### 思路

对于一个区间，如果要进行操作时，肯定是将+1 加在第$l$位的牌上。

当$l=1$时，容易直到，想要第$i$块牌倒下，需要$\max(a_i-pre_{i-1},0)$的操作次数，$pre_i$是前$i$项的质量和，故在整个区间上，只需要取$\max(a_i-pre_{i-1}),(l+1\leq i\leq r)$。

在区间$[l,r]$中，如果要推倒第$i$块牌，则需要构造新的以$l$为左端点的$pre$，这个$pre$的值可以由$pre_i-pre_{l-1}$推倒，代入上式，则答案是$\max(a_i-(pre_i-pre_{l-1}))$。用某种数据结构维护区间最大值。

### 代码

```cpp
// ST表
ll dp[maxn][30];
void rmq_st(ll n) {
  for (ll i = 1; i <= n; i++) {
    dp[i][0] = b[i]; // 2^0
  }
  ll m = log(1 * n) / log(2.0);
  for (ll j = 1; j <= m; j++) {
    ll t = n - (1 << j) + 1;
    for (ll i = 1; i <= t; i++) {
      dp[i][j] = max(dp[i][j - 1], dp[i + (1 << (j - 1))][j - 1]);
    }
  }
}
ll rmq_find(ll l, ll r) { // 从l开始,长度为r的区间
  ll k = log(1.0 * (r - l + 1)) / log(2.0);
  return max(dp[l][k], dp[r - (1 << k) + 1][k]);
}

void solve() {
  ll n, q;
  cin >> n >> q;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    pre[i] = pre[i - 1] + a[i];
    b[i] = a[i] - pre[i - 1];
  }
  rmq_st(n);
  while (q--) {
    ll l, r;
    cin >> l >> r;
    if (l == r) {
      cout << "0\n";
      continue;
    }
    // ans=max(a[i]-(pre[i]-pre[l-1]))
    ll t = rmq_find(l + 1, r) + pre[l - 1]; // [l+1,r]需要推倒
    ll ans = max(t, 0ll);
    cout << ans << '\n';
  }
}
```

## F 一起找神秘的数！

### 题意

在区间$[l,r]$中找到两个数$x,y$，使之满足$x+y=(x\ordinarycolon y)+(x \land y)+(x \oplus y)$，求这样的数对的数量。

#### 数据范围

- $1\leq T \leq 2e5$
- $0\leq l\leq r\leq 1e18$

### 思路

打表猜结论，发现只有$x=y$时等式成立。

### 代码

```cpp
void solve() {
  ll l, r;
  cin >> l >> r;
  cout << r - l + 1 << '\n';
}
```

## G 一起铸最好的剑！

### 题意

在$m$的幂次中找到最接近$n$的数。

#### 数据范围

- $1\leq T \leq 1e5$
- $1\leq n,m\leq 1e9$

### 思路

模拟。

### 代码

```cpp
void solve() {
  ll n, m;
  cin >> n >> m;
  if (m == 1) {
    cout << "1\n";
    return;
  }
  p[0] = 1, p[1] = m;
  ll pi = 1;
  ll mx = abs(p[pi] - n);
  ll i = 1;
  for (; p[i] <= n; i++) {
    if (abs(p[i] - n) < mx) {
      pi = i;
      mx = abs(p[i] - n);
    }
    p[i + 1] = p[i] * m;
  }
  if (abs(p[i] - n) < mx) {
    pi = i;
    mx = abs(p[i] - n);
  }
  cout << pi << '\n';
}
```

## H 一起画很大的圆！

### 题意

在矩形的边界上找三个不共线的点，使得过这三个点确定的圆的面积最大。

#### 数据范围

- $-1e6\leq a,b,c,d\leq 1e6$

### 思路

合适的点的候选在矩形的四个直角附近一个单位长度的点中选，暴力枚举三个点，并判断取半径最大的圆。

### 代码

```cpp
ld getcir2(pll p1, pll p2, pll p3) {
  auto [x1, y1] = p1;
  auto [x2, y2] = p2;
  auto [x3, y3] = p3;
  ld r;
  ld a = x1 - x2, b = y1 - y2, c = x1 - x3, d = y1 - y3;
  ld e = ((x1 * x1 - x2 * x2) + (y1 * y1 - y2 * y2)) / 2.0;
  ld f = ((x1 * x1 - x3 * x3) + (y1 * y1 - y3 * y3)) / 2.0;
  ld det = b * c - a * d;
  if (fabs(det) < 1e-5) {
    r = -1;
    return r;
  }
  ld x0 = -(d * e - b * f) / det;
  ld y0 = -(a * f - c * e) / det;
  r = hypot(x1 - x0, y1 - y0);
  return r;
}

void solve() {
  ll a, b, c, d;
  cin >> a >> b >> c >> d;
  vector<pll> v = {
      {a, c}, {a + 1, c}, {a, c + 1}, {a, d}, {a + 1, d}, {a, d - 1},
      {b, c}, {b - 1, c}, {b, c + 1}, {b, d}, {b - 1, d}, {b, d - 1},
  };
  pll p1 = {a, c}, p2 = {a + 1, c}, p3 = {a, c + 1};
  ld r = getcir2(p1, p2, p3);
  for (ll i = 0; i < (ll)v.size(); i++) {
    for (ll j = 0; j < (ll)v.size(); j++) {
      for (ll k = 0; k < (ll)v.size(); k++) {
        ld ri = getcir2(v[i], v[j], v[k]);
        if (ri != -1 && r < ri) {
          r = ri;
          p1 = v[i], p2 = v[j], p3 = v[k];
        }
      }
    }
  }
  cout << p1.first << ' ' << p1.second << '\n';
  cout << p2.first << ' ' << p2.second << '\n';
  cout << p3.first << ' ' << p3.second << '\n';
}

```

## I

### 题意

#### 数据范围

### 思路

### 代码

## J 数据时间？

### 题意

有$n$个数据，每条数据由`user_id`、`login_date`、`login_time`组成，表示员工号，登录日期和登录时间。员工号是不超过$1e20$的整数，登录日期是一个`YYYY-MM-DD`模式的日期，登录时间是`hh:mm:ss`模式的时间。

现在查询`h`年`m`月的员工在通勤时间（`07:00:00-09:00:00`和`18:00:00-20:00:00`）、午休时间（`11:00:00-13:00:00`）和临睡时间（`22:00:00-01:00:00`）的登录人次情况，同一个人在同一个时间段的多次登录算作一人次。时间段均包含边界。

#### 数据范围

- $1\leq n\leq 1e5$
- $2000\leq h\leq 2030;1\leq m\leq 12$
- $1\leq user_{id}\leq 10^{20}$
- 日期和时间的格式如题意所述。

### 思路

按题意模拟。

### 代码

```cpp
void solve() {
  ll n, h, m;
  cin >> n >> h >> m;
  map<string, vector<pair<string, string>>> mp;
  map<string, bool> mp1, mp2, mp3;
  for (ll i = 1; i <= n; i++) {
    string id, t;
    ll dy, dm, dd;
    char c;
    cin >> id >> dy >> c >> dm >> c >> dd >> t;
    if (dy == h && dm == m) {
      string s = t;
      ll st = ((s[0] - '0') * 10 + (s[1] - '0')) * 3600 +
              ((s[3] - '0') * 10 + (s[4] - '0')) * 60 + (s[6] - '0') * 10 +
              (s[7] - '0');
      if ((st >= 7 * 3600 && st <= 9 * 3600)||(st >= 18 * 3600 && st <= 20 * 3600)) {
        mp1[id] = true;
      } else if (st >= 11 * 3600 && st <= 13 * 3600) {
        mp2[id] = true;
      } else if ((st >= 22 * 3600 && st <= 24 * 3600) ||
                 (st >= 0 * 3600 && st <= 1 * 3600)) {
        mp3[id] = true;
      }
    }
  }
  cout << mp1.size() << ' ' << mp2.size() << ' ' << mp3.size() << '\n';
}
```

## K 可以分开吗？

### 题意

有一块$n\times m$的方块组成的矩阵，其中有一些蓝色方块，其余为灰色方块，定义两块方块的连通的：只有当两块方块在四连通方向有共边。

当一个蓝色极大连通块可以脱离矩阵时，其任何蓝色方块不与任何灰色方块有共边。现在先在矩阵中通过移除灰色方块，取出一个蓝色极大连通块，求最少的操作次数。

#### 数据范围

- $1\leq n,m\leq 500$

### 思路

并查集。

遍历所有的蓝色方块，并查集维护每个蓝色方块寻找它属于的蓝色极大连通块，再通过遍历这些连通块的每个小方块的周围四格，统计需要敲掉的灰色方块的数量。

### 代码

```cpp
ll n, m;
ll a[maxn], b[maxn];
ll fa[maxn];
char maz[600][600];

ll find(ll x) {
  if (fa[x] == x) {
    return x;
  }
  return fa[x] = find(fa[x]);
}
void merge(ll u, ll v) {
  ll fu = find(u), fv = find(v);
  if (fu == fv) {
    return;
  }
  fa[fu] = fv;
}
vector<pll> dxy = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

void solve() {
  cin >> n >> m;

  for (ll i = 0; i <= (n + 5) * (m + 5); i++) {
    fa[i] = i;
  }

  vector<pll> v;
  for (ll i = 1; i <= n; i++) {
    for (ll j = 1; j <= m; j++) {
      cin >> maz[i][j];
      if (maz[i][j] == '1') {
        v.push_back({i, j});
      }
    }
  }

  // 并查集
  for (auto [x, y] : v) {
    for (auto [dx, dy] : dxy) {
      ll px = dx + x, py = dy + y;
      if (maz[px][py] == '1') {
        merge((px - 1) * m + py, (x - 1) * m + y);
      }
    }
  }
  map<ll, vector<pll>> mp;
  for (auto i : v) {
    ll x = (i.first - 1) * m + i.second;
    ll fx = find(x);
    mp[fx].push_back(i);
  }

  ll res = n * m - v.size();
  for (auto [i, vi] : mp) {
    set<pll> st;
    for (auto [x, y] : vi) {
      for (auto [dx, dy] : dxy) {
        ll px = dx + x, py = dy + y;
        if (px < 1 || px > n || py < 1 || py > m)
          continue;
        if (maz[px][py] == '0') {
          st.insert({px, py});
        }
      }
    }
    res = min(res, (ll)st.size());
  }
  cout << res << '\n';
}
```

## L

### 题意

#### 数据范围

### 思路

### 代码

## M 那是我们的影子

### 题意

在$3\times n$的矩阵中，每个格子要么是$1\sim 9$的数字，要么是`?`。求将所有的`?`填入$1\sim 9$的数字，任意$3\times 3$的九宫格中的数字都不重复，求合法的填写方式的数量，答案对$1e9+7$取模。

#### 数据范围

- $3\leq n\leq 1e5$

### 思路

易知，所有$i\mod 3$相同的列的数字组成都是一样的。

几种无合法解的情况：

1. 某一列有重复的数字
2. 某个$i\mod 3$的组中数字的种数多于 3 种

排除不合法的情况后，进行排列组合，将所有九宫格的数字位置情况汇总成一个标准九宫格后，里面有一些位置依然是`?`，数字不确定，这些不确定的$k$个位置对应$k$个没有出现过的数字，将其分成$3$组，分别对应每列的空缺位，这样的组合方法有$\binom{k}{col_0}\times \binom{k-col_0}{col_1}\times \binom{k-col_0-col_1}{col_2}$种。

完成上面这一步之后，相当于九宫格的每列对应的数集合是确定的。接下来遍历每一列，乘上在空缺位上的全排列数。

### 代码

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef double ld;
typedef unsigned long ul;
typedef long long ll;
typedef unsigned long long ull;
typedef pair<ll, ll> pll;

const ll maxn = 2e6 + 50;
const ll inf = 0x3f3f3f3f3f;
const ll mo998 = 998244353;
const ll mo1e9 = 1000000007;

ll qpow(ll a, ll b) {
  ll ret = 1;
  while (b) {
    if (b & 1)
      ret = (ret * a) % mo1e9;
    a = a * a % mo1e9;
    b >>= 1;
  }
  return ret;
}
ll inv(ll x) { return qpow(x, mo1e9 - 2); }

// 逆元求组合数
ll fz[maxn], fm[maxn];
ll C(ll n, ll m) {
  if (n < m)
    return 0ll;
  if (n == m)
    return 1ll;
  return fz[n] * fm[m] % mo1e9 * fm[n - m] % mo1e9;
}
ll A(ll x, ll y) { return fz[x] * C(x, y) % mo1e9; }

ll maz[5][maxn];

void solve() {
  ll n;
  cin >> n;
  vector<string> s(4);
  cin >> s[1] >> s[2] >> s[3];

  // 第0,3,6...相同，i%3相同的数字组成一模一样
  vector<set<ll>> col(5, set<ll>()); // 第0/1/2列的数字
  vector<ll> q(n + 10, 0ll);         // 每列的?数量

  for (ll i = 0; i < n; i++) {
    set<ll> tmp;
    for (ll t = 1; t <= 3; t++) {
      char c = s[t][i];
      if (c != '?') {
        maz[t][i] = c - '0';
        if (tmp.count(maz[t][i])) { // 列有重复
          cout << "0\n";
          return;
        }
        tmp.insert(maz[t][i]);
        col[i % 3].insert(maz[t][i]);
        if (col[i % 3].size() > 3) { // 种数不合法
          cout << "0\n";
          return;
        }
      } else {
        maz[t][i] = -1;
        q[i]++;
      }
    }
  }

  set<ll> usd;
  for (ll i = 0; i < 3; i++) {
    for (auto j : col[i]) {
      usd.insert(j);
    }
  }
  vector<ll> v = {
      3 - (ll)col[0].size(),
      3 - (ll)col[1].size(),
      3 - (ll)col[2].size(),
  };
  ll tot = v[0] + v[1] + v[2];
  if (tot + usd.size() != 9) {
    cout << "0\n";
    return;
  }

  ll ans = 1ll * C(tot, v[0]) * C(tot - v[0], v[1]) % mo1e9;

  for (ll i = 0; i < n; i++) {
    ll k = q[i];
    ans = ans * A(k, k) % mo1e9;
  }

  cout << ans << '\n';
}

void init() {
  ll w = maxn - 10;
  fz[0] = fm[0] = 1;
  for (ll i = 1; i <= w; i++) {
    fz[i] = fz[i - 1] * i % mo1e9;
  }
  fm[w] = inv(fz[w]);
  for (ll i = w - 1; i >= 1; i--) {
    fm[i] = fm[i + 1] * (i + 1) % mo1e9;
  }
}

int main(void) {
  ios::sync_with_stdio(false);
  cin.tie(0);
  ll _t = 1;
  cin >> _t;
  cin.get();
  init();
  while (_t--)
    solve();

  return 0;
}
```
