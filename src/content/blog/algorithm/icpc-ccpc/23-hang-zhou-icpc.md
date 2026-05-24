---
title: "2023杭州ICPC区域赛"
description: "2023 杭州 ICPC 区域赛补题记录，整理 Snake Move 和 Mysterious Tree 的题意、思路与代码。"
date: "2024-11-23T18:51:44+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## G. Snake Move

### 题意

$n\times m$的网格中有一条长度为$k$的贪吃蛇，贪吃蛇支持上下左右移动 1 格的操作，以及缩短 1 个身体长度的操作。

设$f(i,j)$为从蛇头从初始位置到达网格中点$(i,j)$所需要的最少的操作数，网格中不可到达的格子操作数设为$0$，求解输出：

$$
\sum_{i=1}^{i=n}\sum_{j=1}^{j=m}f(i,j)
$$

### 思路

初始时蛇身压住的格子有一个最早释放的时间，可以通过预处理获得。

当蛇头开始移动时，蛇头经过的格子不会有更早的到达时刻，如果下一步可以到达蛇身压住的格子，绕行不可能优于直接缩短长度的操作数。

正常从蛇头进行 BFS，如果遇到初始时不被蛇身压住的格子则正常加入队列，如果遇到被压住的格子，对释放时间和当前步数取max。

### 代码

```cpp
#include <bits/stdc++.h>

#define x first
#define y second

using namespace std;

typedef double ld;
typedef unsigned long ul;
typedef long long ll;
typedef unsigned long long ull;
typedef pair<ll, ll> pll;

const int maxn = 2e5 + 50;
const ll inf = 0x3f3f3f3f3f3f;
const vector<pll> dxy = {{-1, 0}, {1, 0}, {0, 1}, {0, -1}};

ll n, m, k;
char maz[3090][3090];
ull dis[3090][3090];
bool inq[3090][3090], vis[3090][3090];
map<ll, pll> snake;
map<pll, ll> body;

bool check(pll &p) {
  return p.x >= 1 && p.x <= n && p.y >= 1 && p.y <= m && maz[p.x][p.y] != '#';
};

void bfs(pll st) {
  priority_queue<pair<ll, pll>, vector<pair<ll, pll>>, greater<>> q;
  q.push({0ll, st});
  dis[st.x][st.y] = 0ll;
  inq[st.x][st.y] = true;
  while (!q.empty()) {
    auto [d, p] = q.top();
    q.pop();
    dis[p.x][p.y] = d;
    for (auto [dx, dy] : dxy) {
      pll pi = {p.x + dx, p.y + dy};
      if (!check(pi))
        continue;
      if (inq[pi.x][pi.y])
        continue;

      if (body.count(pi)) {
        ll di = max(d + 1, body[pi]);
        q.push({di, pi});
        inq[pi.x][pi.y] = true;
      } else {
        q.push({d + 1, pi});
        inq[pi.x][pi.y] = true;
      }
    }
  }
}

void solve() {
  cin >> n >> m >> k;

  body.clear();

  pll st;
  for (ll i = k - 1; i >= 0; i--) {
    pll p;
    cin >> p.x >> p.y;
    snake[i] = p;
    if (i == k - 1) {
      st = p;
      body[p] = 0;
    } else {
      body[p] = i + 1;
    }
  }

  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= m; j++) {
      cin >> maz[i][j];
      dis[i][j] = inf;
    }
  }

  bfs(st);

  ull ans = 0;
  for (ll i = 1; i <= n; i++) {
    for (ll j = 1; j <= m; j++) {
      ull d = dis[i][j];
      if (d == inf)
        d = 0;
      ans += d * d;
    }
  }
  cout << fixed << setprecision(0) << ans << '\n';
}

void init() {
}
int main(void) {
  ios::sync_with_stdio(false);
  cin.tie(0);
  init();
  int _t = 1;
  // cin >> _t;
  // cin.get();
  while (_t--)
    solve();

  return 0;
}
```

## J. Mysterious Tree

### 题意

交互题。

有一棵节点数$n\ge 4$的树，树的形状是链状或者星状，每次询问两个点$u$和$v$，会返回$(u,v)$之间是否有边，需要在$\lceil \frac{n}{2} \rceil + 3$的询问次数之内确定树的形状。

### 思路

每次询问2个没有问过的节点$(1,2),(3,4),...$如果到结束都没有问出边，此时节点数是偶数，则说明是链状，否则用三次询问确定节点$n$是否是星状的中心（询问中要有两个点之间是没有边的），若是则为星，否则为链。

问出一条边后，抉择确定这条边的两个点是否是星的中心。

### 代码

```cpp
void solve() {
  ll n;
  cin >> n;

  ll t;
  auto ask = [&](ll p1, ll p2) {
    cout << "? " << p1 << ' ' << p2 << endl;
    cin >> t;
  };
  auto conf = [&](ll x) { cout << "! " << x << endl; };

  bool flag = false;
  ll u = -1, v = -1;
  for (ll i = 1; i + 1 <= n; i += 2) {
    ask(i, i + 1);
    if (t == 1) {
      flag = true;
      u = i, v = i + 1;
      break;
    }
  }

  ll t1, t2, t3;
  if (!flag) {
    if (n & 1) {
      ask(n, 1), t1 = t;
      ask(n, 2), t2 = t;
      ask(n, 3), t3 = t;
      if (t1 && t2 && t3) {
        conf(2);
      } else {
        conf(1);
      }
    } else {
      conf(1);
    }
    return;
  }
  if (u - 1 >= 1) {
    ask(u - 1, u);
    t1 = t;
    if (t1 != 1) {
      ask(u - 1, v);
      t2 = t;
      if (t2 != 1) {
        conf(1);
      } else {
        if (v + 1 <= n)
          ask(v, v + 1);
        else
          ask(u - 2, v);
        t3 = t;
        if (t3 != 1) {
          conf(1);
        } else {
          conf(2);
        }
      }
    } else {
      if (u - 2 >= 1) {
        ask(u - 2, u);
      } else {
        ask(v + 1, u);
      }
      t2 = t;
      if (t2 != 1) {
        conf(1);
      } else {
        conf(2);
      }
    }
  } else {
    ask(v, v + 1);
    t1 = t;
    if (t1 != 1) {
      ask(v + 1, u);
      t2 = t;
      if (t2 != 1) {
        conf(1);
      } else {
        ask(v + 2, u);
        t3 = t;
        if (t3 != 1) {
          conf(1);
        } else {
          conf(2);
        }
      }
    } else {
      ask(v, v + 2);
      t2 = t;
      if (t2 != 1) {
        conf(1);
      } else {
        conf(2);
      }
    }
  }
}
```

## M. V-Diagram

### 题意

在 V 型数组，找一个平均值最大的连续子数组，要求子数组也成 V 型，输出平均值。

### 思路

从最低点（`pi`）分别向左向右找到平均值最大的位置（`lp`，`rp`），选择区间$[lp,pi+1]$、$[pi-1,rp]$、$[lp,rp]$之中平均值最大的一个。

### 代码

```cpp
const int maxn = 3e5 + 50;
ll a[maxn], pre[maxn];

void solve() {
  ll n;
  cin >> n;
  ll lp, rp, pi, mna = inf;
  for (ll i = 1; i <= n; i++) {
    cin >> a[i];
    pre[i] = pre[i - 1] + a[i];
    if (mna > a[i]) {
      pi = lp = rp = i;
      mna = a[i];
    }
  }
  ll sum = 0, len = 0, llp = lp, rrp = rp;
  ld rcur = 0.0, lcur = 0.0;
  while (lp >= 1) {
    sum += a[lp];
    len++;
    if (1.0 * sum / len > lcur) {
      lcur = 1.0 * sum / len;
      llp = lp;
    }
    lp -= 1;
  }
  sum = 0, len = 0;
  while (rp <= n) {
    sum += a[rp];
    len++;
    if (1.0 * sum / len > rcur) {
      rcur = 1.0 * sum / len;
      rrp = rp;
    }
    rp += 1;
  }

  auto getavl = [&](ll r, ll l) {
    return 1.0 * (pre[r] - pre[l - 1]) / (r - l + 1);
  };

  ld ans = max(getavl(rrp, pi - 1), getavl(pi + 1, llp));
  ans = max(ans, getavl(rrp, llp));
  cout << fixed << setprecision(12) << ans << '\n';
}
```
