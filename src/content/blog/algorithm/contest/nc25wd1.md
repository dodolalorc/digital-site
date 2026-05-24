---
title: "🎈2025牛客暑寒假多校训练营Day1（完結）"
description: "2025 牛客寒假多校训练营 Day1 的完结补题记录，整理多题的题意、思路和不同实现方案。"
date: "2025-01-23T12:58:36+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - 牛客寒假营
  - 补题记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A 茕茕孑立之影

### 题意

找一个不超过$1e18$的数$x$，使得$x$既不是任何$a_i$的倍数，也不是任何$a_i$的因数。若没有输出$-1$。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq a_i\leq 1e9$

### 思路

观察到，如果数组中有$1$则不存在这样的数。

$1\leq a_i\leq 1e9$，而$1\leq x\leq 1e18$，有解时任意数=输出一个大于$1e9$的质数即可。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
  }
  sort(a + 1, a + 1 + n);
  if (a[1] == 1) {
    cout << "-1\n";
  } else {
    cout << "100000007\n";
  }
}
```

## B 一气贯通之刃

### 题意

给一棵树，寻找一条简单路径，使之遍历树上所有的顶点，输出起点和终点。如果没有这样的解则输出$-1$。

_简单路径是指这样一条路径，其经过的顶点和边互不相同。_

#### 数据范围

- $2\leq n\leq 1e5$
- $1\leq u_i,v_i\leq n,u_i\neq v_i$

### 思路

只有整个树是一条链时，从一个叶子节点到另一个叶子节点，才能有符合要求的简单路径。

### 代码

```cpp
ll deg[maxn];
void solve() {
  ll n;
  cin >> n;
  for (ll i = 1; i <= n - 1; i++) {
    ll u, v;
    cin >> u >> v;
    deg[u]++, deg[v]++;
  }
  vector<ll> v;
  for (ll i = 1; i <= n; i++) {
    if (deg[i] == 1) {
      v.push_back(i);
    }
  }
  if (v.size() != 2) {
    cout << "-1\n";
  } else {
    cout << v[0] << ' ' << v[1] << '\n';
  }
}
```

## C 兢兢业业之移

### 题意

有一个$n\times n$的 01 矩阵，$n$是偶数，其中有刚好$\frac{n^2}{4}$个`1`，请将这些 1 全部移动到矩阵左上角的位置，即$1\leq i\leq \frac{n}{2},q\leq j\leq \frac{n}{2}$的位置，规定移动只能与共边的方格交换，交换次数不超过$\frac{n^3}{2}$。

#### 数据范围

- $2\leq n\leq 100$

### 思路

考虑一条移动路径将 1 移动到左上角某个 0 的位置，如果这个路径上有其他的 1，显然移动路径中间的 1 到同样的目标 0 位置的次数是更小的。

从左上角坐标点进行 bfs，最先碰到的 1 是最近的，还原 bfs 的路径。还原 bfs 的路径可以通过存储 bfs 时拓展的父节点来回溯获得。

或者考虑寻找最短路时，路径只可能是直线或者直角线，假设路径需要“拐弯”才能到达某个 1，那这个“拐弯”的地方肯定是 1。这样的路径的长度正好是曼哈顿距离，$n$比较小，可以遍历所有的 1 来选择举例要填的 0 最近的点。还原路径的时候按照先纵向再横向或者先横向再纵向都可以。

### 代码 1：曼哈顿距离

```cpp
ll n;
map<pll, bool> vis;
vector<pii> dxy = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
vector<array<ll, 4>> ans;
void solve() {
  cin >> n;
  ans.clear(), vis.clear();
  vector<pll> v;
  for (ll i = 1; i <= n; i++) {
    for (ll j = 1; j <= n; j++) {
      char c;
      cin >> c;
      if (c == '1') {
        v.push_back({i, j});
      }
    }
  }

  auto dis = [&](pll p1, pll p2) {
    return abs(p1.first - p2.first) + abs(p1.second - p2.second);
  };
  for (ll i = 1; i <= n / 2; i++) {
    for (ll j = 1; j <= n / 2; j++) {
      pll pi = {i, j};
      pll p = {10000, 10000};
      for (auto pj : v) {
        if (!vis.count(pj) && dis(pi, pj) < dis(pi, p)) {
          p = pj;
        }
      }
      vis[p] = true;
      auto [x, y] = p;
      while (x > i) {
        ans.push_back({x, y, x - 1, y}), x -= 1;
      }
      while (x < i) {
        ans.push_back({x, y, x + 1, y}), x += 1;
      }
      while (y > j) {
        ans.push_back({x, y, x, y - 1}), y -= 1;
      }
      while (y < j) {
        ans.push_back({x, y, x, y + 1}), y += 1;
      }
    }
  }

  cout << ans.size() << '\n';
  for (auto [q, w, e, r] : ans) {
    cout << q << ' ' << w << ' ' << e << ' ' << r << '\n';
  }
}
```

### 代码 2：宽搜

```cpp
ll n;
char maz[250][250];
vector<pii> dxy = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

bool vis[250][250], inq[250][250];
vector<array<ll, 4>> ans;

pii trace[250][250];

void solve() {
  cin >> n;
  ans.clear();
  vector<pii> v;
  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n; j++) {
      cin >> maz[i][j];
      vis[i][j] = false;
    }
  }
  // bfs
  for (ll i = 1; i <= n / 2; i++) {
    for (ll j = 1; j <= n / 2; j++) {

      for (ll ii = 1; ii <= n; ii++) {
        for (ll jj = 1; jj <= n; jj++) {
          inq[ii][jj] = false;
        }
      }

      bool flag = false;
      pii o = {i, j};
      trace[i][j] = {i, j};

      queue<pii> q;
      q.push({i, j});
      inq[i][j] = true;
      while (!q.empty()) {
        pii pi = q.front();
        q.pop();
        if (maz[pi.first][pi.second] == '1') {
          o = pi;
          flag = true;
          break;
        }
        if (maz[pi.first][pi.second] == '1')
          break;
        for (auto [dx, dy] : dxy) {
          int px = pi.first + dx, py = pi.second + dy;
          if (px < 1 || px > n || py < 1 || py > n)
            continue;
          if (vis[px][py] || inq[px][py])
            continue;

          trace[px][py] = pi;
          if (maz[px][py] == '1') {
            o = {px, py};
            flag = true;
            break;
          }
          inq[px][py] = true;
          q.push({px, py});
        }
        if (flag)
          break;
      }
      // 必然有解的
      maz[o.first][o.second] = '0';
      // 路径还原
      while (o.first != i || o.second != j) {
        pii i = trace[o.first][o.second];
        ans.push_back({o.first, o.second, i.first, i.second});
        o = i;
      }
      maz[o.first][o.second] = '1';
      vis[i][j] = true;
    }
  }

  cout << ans.size() << '\n';
  for (auto [q, w, e, r] : ans) {
    cout << q << ' ' << w << ' ' << e << ' ' << r << '\n';
  }
}
```

## D 双生双宿之决

### 题意

双生数组定义：数组大小为偶数，有且只有 2 种数，这两种数的数量相同。

判断一个数组是不是双生数组。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq a_i\leq 1e9$

### 思路

按性质判断即可。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  map<ll, ll> mp;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    mp[a[i]]++;
  }
  if (mp.size() != 2) {
    cout << "No\n";
    return;
  }
  vector<pll> v(mp.begin(), mp.end());
  if (v[0].second == v[1].second) {
    cout << "Yes\n";
  } else {
    cout << "No\n";
  }
}
```

## E 双生双宿之错

### 题意

将一个数组变成双生数组，可以进行的操作是将某个数+1 或-1，求最小操作次数。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq a_i\leq 1e9$

### 思路

首先想到，将数组分为小的一半和大的一半，这两半各找一个数作为双生数组中的标准数。

这个数是中位数：

考虑当前的中位数是$x$，代表有至少一半的数小于等于$x$，也有至少一半的数大于等于$x$，如果将$x$变成$x+1$，假设原来的花费是$y$，有$c$的数小于等于$x$。那么现在的花费是$y' = y+c-(n-c)$，由于$c\ge n/2$，故$y'\gt y$，$x-1$的情况也是同理。

特别的，当两边的中位数是同一个数的时候，需要对某一边进行+1 或-1，取 min。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
  }
  sort(a + 1, a + 1 + n);
  auto check = [&](ll x, ll l, ll r) {
    ll tot = 0;
    for (ll i = l; i <= r; i++) {
      tot += abs(x - a[i]);
    }
    return tot;
  };
  // 左右两半各找一个中位数
  ll x = a[(1 + n / 2) / 2];
  ll y = a[(n / 2 + 1 + n) / 2];
  ll ansx = check(x, 1, n / 2), ansy = check(y, n / 2 + 1, n);
  ll ans = ansx + ansy;
  if (x == y) {
    ans = inf;
    ans = min(ans, check(x + 1, 1, n / 2) + ansy);
    ans = min(ans, ansx + check(y + 1, n / 2 + 1, n));
    ans = min(ans, check(x - 1, 1, n / 2) + ansy);
    ans = min(ans, ansx + check(y - 1, n / 2 + 1, n));
  }
  cout << ans << '\n';
}
```

## F 双生双宿之探

### 题意

计算一个数组中有多少连续子数组是双生数组。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq a_i\leq 1e9$

### 思路

根据双生数组的特点，选出所有仅包含两种数的区间，在这个确定的最大的仅包含两种数的区间内计算区间中有多少个双生数组，由于仅包含两种数，可以将某种数记为 1，另一种记为-1，计算该段区间的前缀和，前缀和相同的两个端点之间的区间是双生数组。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
  }
  ll ans = 0;
  ll l = 1, r = 1;
  set<ll> st;
  st.insert(a[l]);
  while (r <= n) {
    // 仅包含两种元素的最远的r
    while (r + 1 <= n && (st.size() < 2 || st.find(a[r + 1]) != st.end())) {
      st.insert(a[++r]);
    }
    if (st.size() == 2) {
      // 计算区间内区间和是0的数量
      ll x1 = *st.begin();
      pre[l - 1] = 0;
      map<ll, ll> mp;
      mp[0]++;
      for (ll i = l; i <= r; i++) {
        if (a[i] == x1)
          pre[i] = pre[i - 1] + 1;
        else
          pre[i] = pre[i - 1] - 1;
        mp[pre[i]]++;
      }
      for (auto i : mp) {
        ans += (i.second - 1) * i.second / 2;
      }
    } else {
      break;
    }
    // 去掉一种数
    while (l - 1 <= r) {
      if (pre[r] - pre[l - 1] == r - l + 1 ||
          pre[l - 1] - pre[r] == r - l + 1) {
        break;
      }
      l++;
    }
    st.clear();
    st.insert(a[l]);
  }
  cout << ans << '\n';
}
```

## G 井然有序之衡

### 题意

将数组变成一个排列，可以进行的操作是将某个数+1，同时将另一个数-1，询问最小操作次数，若不能实现则输出`-1`。

#### 数据范围

- $1\leq n\leq 1e5$
- $-1e9\leq a_i\leq 1e9$

### 思路

排列中的数是 1~n，如果进行操作，一定是将大数减去的 1 加到小数上，让两个数都趋向要变成的数。从 n 开始枚举到 1，如果当前的排列数$i$在数组中不存在，则选一个大于$i$的数，将它减去的数统计到答案中，过程中判断可行性。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  ll tot = 0;
  multiset<ll, greater<>> st;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    tot += a[i];
    st.insert(a[i]);
  }
  if (tot != (1 + n) * n / 2) {
    cout << "-1\n";
    return;
  }
  ll ans = 0ll, x = n;
  while (!st.empty() && x >= 1) {
    if (st.find(x) != st.end()) {
      st.erase(st.find(x));
      x--;
      continue;
    }
    if (*st.begin() < x)
      break;
    ans += *st.begin() - x;
    x--;
    st.erase(st.begin());
  }
  cout << ans << '\n';
}
```

## H 井然有序之窗

### 题意

构造一个长度为 n 的排列，要求每个数$i$都符合在$[l_i,r_i]$范围内，如果不存在这样的排列，则输出-1，否则输出构造的排列。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq l_i\leq r_i\leq n$

### 思路

按照 1~n 的顺序构造排列，每次从**可以使用的区间**中取**右端点最近**的区间。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  vector<pair<pll, ll>> v;
  for (ll i = 1; i <= n; i++) {
    pll p;
    cin >> p.first >> p.second;
    v.push_back({p, i});
  }
  // 关键字顺序l,r,id
  sort(v.begin(), v.end());
  multiset<pair<ll, pair<pll, ll>>> st; // 右端点r小的排在前面
  ll pi = 0;
  for (ll x = 1; x <= n; x++) {
    for (; pi < (ll)v.size(); pi++) {
      pll p = v[pi].first;
      if (p.first <= x && p.second >= x) {
        st.insert({p.second, v[pi]});
        continue;
      }
      break;
    }
    if (st.empty()) {
      cout << "-1\n";
      return;
    }
    a[st.begin()->second.second] = x;
    st.erase(st.begin());
    while (!st.empty() && st.begin()->first == x) {
      st.erase(st.begin());
    }
  }
  for (ll i = 1; i <= n; i++) {
    cout << a[i] << " \n"[i == n];
  }
}
```

## I 井然有序之桠

### 题意

给出排列$a$，构造另一个排列$b$，使得$\sum_{i=1}^{n} gcd(a_i,b_i)=k$。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq a_i\leq n$

### 思路

构造排列使$\sum gcd(a_i,i)=k$，易知$k$的合法上界是$\frac{(n+1)\times n}{2}$，下届是$n$。从大到小遍历，找到某个端点，将数组分为$[1,r]$和$[r+1,n]$两组，右侧区间均取$a_i=i$，这个区间可以为空，找到最小的$r-1+r\leq k'$成立的端点$r$，遍历的过程中$k$减去端点划过的值。

分类讨论，记$x=k-(r-1)$。如果$x$为偶数，则取$a_x=x$，剩余的$1,...,x-1,x+1,...r$从大到小两两一组交换，实现除了$a_x=x$的其他小组都是 1。

如果$x$为奇数，如果$r$为偶数，会出现$gcd(x-1,x+1)$，这个值是$2$，不符合要求，这时取$a_2=2$和$a_{x-1}=x-1$，可以实现与$a_x=x$一样的构造效果，注意判断$x=2$的情况。
特殊的，当$x=3$时，可以构造$a_2=4$和$a_4=2$，这时$gcd(a_2,4)+gcd(a_4,2)=4=3+1$可行。

### 代码

```cpp
void solve() {
  ll n, k;
  cin >> n >> k;
  set<ll> st;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    b[i] = a[i], c[a[i]] = i;
    st.insert(i);
  }
  if (k < n) {
    cout << "-1\n";
    return;
  }
  ll s = 0ll, r = n;
  while (r >= 1) {
    if (k < r - 1 + r)
      break;
    st.erase(r);
    k -= r;
    r--;
  }
  if (k == 0) {
    for (ll i = 1; i <= n; i++) {
      cout << b[i] << ' ';
    }
    cout << '\n';
    return;
  }
  // [r+1~n]都对应ai=i
  ll x = k - (r - 1);
  // 把a[1~r]构造成r-1+x
  if (x & 1) {
    if (r & 1) {
      st.erase(x);
    } else if (x - 1 > 2) {
      st.erase(x - 1), st.erase(2);
    } else if (x == 3 && r >= 4) {
      b[c[2]] = 4, b[c[4]] = 2;
      st.erase(2), st.erase(4);
    } else if (x != 1) {
      cout << "-1\n";
      return;
    }
  } else {
    st.erase(x);
  }
  vector<ll> v(st.begin(), st.end());
  for (ll i = v.size() - 1; i - 1 >= 0; i -= 2) {
    swap(b[c[v[i]]], b[c[v[i - 1]]]);
  }

  for (ll i = 1; i <= n; i++) {
    cout << b[i] << ' ';
  }
  cout << '\n';
}

```

## J 硝基甲苯之袭

### 题意

在数组中选两个元素$a_i,a_j,(i\neq j)$，求满足$a_i \oplus a_j = gcd(a_i,a_j)$的$i,j$对数量。

#### 数据范围

- $1\leq n\leq 2e5$
- $1\leq a_i\leq 2e5$

### 思路

$x\oplus y = g$，则有$y=x\oplus g$，对每个$a_i$，枚举$g$，若有符合$g == gcd(x,x\oplus g)$的则计入答案，答案要去掉一半重复计数的。

### 代码

```cpp
ll a[maxn];
// 记录每个数的因数
vector<ll> MP[maxn];

void solve() {
  ll n;
  cin >> n;
  map<ll, ll> mp;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    mp[a[i]]++;
  }
  ll ans = 0ll;
  for (ll i = 1; i <= n; i++) {
    ll x = a[i];
    for (ll g : MP[x]) {
      // 枚举x的因数, x^y=g -> y=x^g, g=gcd(x,x^g)
      if (mp.count(x ^ g) && g == gcd(x, x ^ g)) {
        ans += mp[x ^ g];
      }
    }
  }
  cout << ans / 2 << '\n';
}

void init() {
  for (ll i = 1; i < maxn; i++) {
    for (ll j = i; j < maxn; j += i) {
      MP[j].push_back(i);
    }
  }
}
```

## K 硝基甲苯之魇

### 题意

求一个数组中，有多少个区间$[l,r](l\lt r)$满足区间内元素的最大公约数恰好等于它们的异或和。

#### 数据范围

- $1\leq n\leq 2e5$
- $1\leq a_i\leq 1e9$

### 思路

对于一个固定的区间$[l,r]$，其最大公约数可以用某种数据结构维护（线段树/ST 表/...），实现复杂度为$O(logn)$的查询。

区间异或和可以利用前缀异或实现，根据异或的性质$A \oplus 0 = A$、$A\oplus A=0$，对于数组的前缀异或($pre[i]=pre[i-1]\oplus a[i]$)，有$a_l\oplus a_{l+1}\oplus \dots \oplus a_r=pre[r]\oplus pre[l-1]$，提供$O(1)$的查询。

固定右端点$r$，当$l$逐渐减少，其区间$gcd$会逐渐变小，且变化的次数是 log 级别的，通过在数据结构上二分，找出这些变化的端点，并统计在这个区间中异或和是对应的 gcd 的数量的左端点，统计数量。这个异或的数量可以通过在求前缀异或数组时预处理获得，用 map 存一下每个前缀异或值出现的位置数组，查询时，二分统计$[l_l,l_r]$中$xor$为$g\oplus pre[r]$的数量。

![image.png](https://img.dodolalorc.cn/i/2025/02/04/67a22d3552904.png)

### 代码

```cpp
ll a[maxn], pre[maxn];
// ST表
ll dp[maxn][30];
void rmq_st(ll n) {
  for (ll i = 1; i <= n; i++) {
    dp[i][0] = a[i]; // 2^0
  }
  ll m = log(1 * n) / log(2.0);
  for (ll j = 1; j <= m; j++) {
    ll t = n - (1 << j) + 1;
    for (ll i = 1; i <= t; i++) {
      dp[i][j] = gcd(dp[i][j - 1], dp[i + (1 << (j - 1))][j - 1]);
    }
  }
}
ll rmq_find(ll l, ll r) { // 从l开始,长度为r的区间
  ll k = log(1.0 * (r - l + 1)) / log(2.0);
  return gcd(dp[l][k], dp[r - (1 << k) + 1][k]);
}

void solve() {
  ll n;
  cin >> n;
  map<ll, vector<ll>> mp;
  mp[0].push_back(0);
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    pre[i] = pre[i - 1] ^ a[i];
    mp[pre[i]].push_back(i);
  }
  rmq_st(n);
  ll ans = 0;
  for (ll R = 2; R <= n; R++) {
    // 枚举右端点
    ll L = R - 1;
    while (L >= 1) {
      ll g = rmq_find(L, R);
      ll xl = 1, xr = L;
      while (xl < xr) {
        ll mid = (xl + xr) / 2;
        if (rmq_find(mid, R) == g) {
          xr = mid;
        } else {
          xl = mid + 1;
        }
      }
      // [xl,L]是符合rmq_find(i,R)=g的区间
      ll x = g ^ pre[R];
      if (mp.count(x)) {
        auto &v = mp[x];
        ans += lower_bound(v.begin(), v.end(), L) -
               lower_bound(v.begin(), v.end(), xl - 1);
      }
      L = xl - 1;
    }
  }

  cout << ans << '\n';
}
```

## L 一念神魔之耀

### 题意

有$l$盏灯，初始状态用一个字符串表示，`0`表示关闭，`1`表示开启，每一轮操作可以操作连续的$x$个或$y$个灯，将其状态反转，询问是否存在一种操作方式让所有的灯状态相同，如果没有输出-1。

#### 数据范围

- $1\leq T\leq 500$
- $1\le l\leq 500$
- $1\leq x,y\leq \frac{l}{3}$
- 操作轮数$n\leq l^2$

### 思路

假设$x=y$，将灯的状态调整成全 1，可以遍历每个 0，以这些 0 为左端点反转一个长度$x$，当某个 0 的右侧空间不足一个长度$x$时显然无解。

$x\neq y,x\gt y$时，如果可以反转长度$x$，则在$x$上再反转一个$y$，可以得到仅反转$x-y$的效果，以此类推，直到最短的长度，这个过程也是辗转相除法的过程，最短的长度是$g=gcd(x,y)$。

尝试按照长度$g$反转所有 0 的位置，反转$s[i]='0',[i,i+x-1]$中的$g$长度的部分，则需要将剩余的$[i+g,i+x-1]$的部分恢复，不定方程$ax+bx=g$一定有解，当需要恢复的区间$[l,r]$长度大于等于$y$时进行一次长度为$y$的操作，如果不足$y$则考虑边界后哦向左或者向右拓展长度为$x$，并在接下来的操作中恢复。

### 代码

```cpp
void solve() {
  ll n, x, y;
  string s;
  cin >> n >> x >> y >> s;
  ll g = gcd(x, y);
  s = "1" + s;
  vector<array<ll, 2>> ans;
  auto rev = [&](ll l, ll r) {
    for (ll i = l; i <= r; i++) {
      s[i] = '1' - s[i] + '0';
    }
    ans.push_back({l, r});
  };
  ll p = 1;
  while (p + g - 1 <= n) { // 少于g的长度无法改变
    if (s[p] == '1') {
      p++;
      continue;
    }

    // 反转接下来的g个长度子串
    ll l, r;              // 需要反转回去的部分
    if (p + x - 1 <= n) { // 反转[p,p+g-1]部分的子串
      rev(p, p + x - 1);
      l = p + g, r = p + x - 1;
    } else {
      rev(p + g - x, p + g - 1);
      l = p + g - x, r = p - 1;
    }

    while (l <= r) {
      if (r - l + 1 >= y) {
        rev(l, l + y - 1);
        l += y;
      } else if (r + x <= n) { // 向右拓展
        rev(r + 1, r + x);
        r += x;
      } else { // 向左拓展
        rev(l - x, l - 1);
        l -= x;
      }
    }
    p++;
  }

  if (s.find('0') != -1) {
    cout << "-1\n";
    return;
  }

  cout << ans.size() << '\n';
  for (auto [l, r] : ans) {
    cout << l << ' ' << r << '\n';
  }
}
```

## M 数值膨胀之美

### 题意

定义一个数组的极差是数组的最大值和最小值的差，现在有一个数组，恰好进行一次下述操作：选择一个非空区间，将区间中的数都乘以 2。求这个数组最小的极差。

#### 数据范围

- $1\leq n\leq 1e5$
- $1\leq a_i\leq 1e9$

### 思路

极差是最大值减去最小值，将最大值翻倍肯定会增大极差，考虑将最小值乘 2 才能得到更小的极差，依次枚举翻倍最小值、次小值，若当前的区间是连续的，与上一个合法区间取更小的极差，维护数组的极差。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;
  vector<array<ll, 2>> v;
  multiset<ll> mst; // 维护极差
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    mst.insert(a[i]);
    v.push_back({a[i], i});
  }
  sort(v.begin(), v.end());
  ll ans = inf;
  set<ll> st; // 维护已经翻倍的点
  for (auto [x, i] : v) {
    st.insert(i);
    mst.erase(mst.find(x)), mst.insert(x * 2);
    if (*prev(st.end()) - *st.begin() + 1 == (ll)st.size()) { // 区间连续
      ans = min(ans, *prev(mst.end()) - *mst.begin());        // 更新答案
    }
  }

  cout << ans << '\n';
}
```
