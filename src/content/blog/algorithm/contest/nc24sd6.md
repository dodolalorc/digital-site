---
title: "🫟2024牛客暑假多校训练营Day6||补题"
description: "2024 牛客暑假多校训练营 Day6 的补题记录，整理 Cake 系列题和 Puzzle: Wagiri 的解法。"
date: "2024-08-05T10:15:52+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-Cake

### 题意

`Oscar`和`Grammy`玩游戏，第一阶段两人轮流在有根树上走，走到叶子停止，经过的边有两种，标`0`边或者标`1`边，记录走下的`01`串。设`01`串的长度是$m$，第二阶段`Oscar`将蛋糕切成$m$份，有些蛋糕可以是空的，按照第一阶段的`01`串顺序依次拿蛋糕（`1`代表`Grammy`拿，`0`代表`Oscar`拿），两人都想获得最多的蛋糕，求最后`Grammy`获得的蛋糕比例。

#### 数据范围

- $1\leq n\leq 2\times 10^5$

### 思路

在第二阶段，`Oscar`分蛋糕的时候，是对当前串寻找一个`0`占比最大的前缀，然后拿走占比一致的蛋糕。

于是，在第一阶段时，首先树上每个节点即代表一个前缀，预处理出每个节点为前缀时`0`的占比，在之后两人轮流取数时，`Oscar`会取选择下一个节点轮流选择后`0`占比最大的节点，`Grammy`会选择`0`占比最小的节点。

### 代码

```cpp
struct edge {
    int s, t, typ;
};

struct status {
    int cnt0, cnt1;
    status(int a, int b) :cnt0(a), cnt1(b) {}
    status operator+(const status& s)const {
        return status(s.cnt0 + cnt0,s.cnt1 + cnt1);
    }
};

vector<vector<edge>>tree;

double dfs(int p, int fr, int who, status now, double mx) {
    // mx为路径中0比例最大的前缀中0的比例
    if (tree[p].size() == 1 && fr) {
        return mx;
    }

    double ans = 1.0 * who;
    for (int i = 0;i < tree[p].size();i++) {
        struct edge e = tree[p][i];
        if (e.t == fr)continue;
        double nxt = dfs(e.t, p, 1 - who, now + status(1 - e.typ, e.typ), max(mx, 1.0 * (now.cnt0 + 1 - e.typ) / (now.cnt0 + now.cnt1 + 1)));
        if (who) { // Grammy选择(当前路径+接下来的路径)中0比例少的
            ans = min(ans, nxt);
        }
        else { // Oscar选择0比例多的
            ans = max(ans, nxt);
        }
    }
    return ans;
}

void solve() {
    int n;cin >> n;

    tree.assign(n + 1, vector<edge>());

    for (int i = 0;i < n - 1;i++) {
        int u, v, t;
        cin >> u >> v >> t;
        tree[u].push_back({ u,v,t });
        tree[v].push_back({ v,u,t });
    }
    double ans = dfs(1, 0, 1, { 0,0 }, 0.0);
    cout << fixed << setprecision(15) << 1.0 - ans << "\n";
}
```

## B-Cake 2

### 题意

对一个正$n$边形，顶点按顺时针标为$0\sim n-1$，在每一个$i$和$(i+k)\bmod n$的顶点之间切一刀，问最终能切出多少块蛋糕。

#### 数据范围

- $1\leq n\leq 10^6$
- $2\leq k\leq n-2$

### 思路

找规律可以发现除了$2\times k=n$时答案为$n$，其他情况都符合$n\times \min(n-k,k) +1$。

### 代码

```cpp
void solve() {
    ll n, k;cin >> n >> k;
    if (n == k * 2) {
        cout << n << "\n";
    }
    else {
        k = min(k, n - k);
        cout << k * n + 1 << "\n";
    }
}
```

## D-Puzzle: Wagiri

### 题意

无向图中有两种边，对原图进行删边，要求删完边之后图仍是联通的，且所有的轮边只在环中出现，所有的切边都不在环，判断是否存在合适的删边操作，若有再输出结果的连接情况。

#### 数据范围

- $1\leq n\leq 10^5$
- $n-1\leq m\leq 2\times 10^5$
- $1\leq u_i,v_i\leq n$
- $t_i\in \\{"Lun","Qie"\\}$

### 思路

将所有的$Lun$边中成环的部分进行缩点，再根据$Qie$边对这些点生成一棵树。

### 代码

```cpp
struct E {
    int id;
    int s, t;
    int typ;
};

vector<vector<E>>edge;
ll deep, top, sum, res = 0;
ll dfn[maxn], low[maxn], color[maxn], vis[maxn], stk[maxn];

vector<E>ans;

void tarjan(int v, int fa) {
    dfn[v] = ++deep;
    low[v] = deep;
    vis[v] = 1;
    stk[++top] = v; // 入栈

    for (int i = 0;i < edge[v].size();i++) {
        auto e = edge[v][i];
        if (e.typ == 0 || e.t == fa) // 忽略Qie边和避免重边环
            continue;
        if (dfn[e.t] == 0) {
            tarjan(e.t, v);
            low[v] = min(low[v], low[e.t]);
        }
        else {
            if (vis[e.t]) {
                low[v] = min(low[v], low[e.t]);
            }
        }
    }

    if (low[v] == dfn[v]) { // 形成强联通分量或仅自己,缩点
        color[v] = ++sum;
        vis[v] = 0;
        while (stk[top] != v) {
            color[stk[top]] = sum;
            vis[stk[top--]] = 0;
        }
        top--;
    }
}

int fa[maxn];
int findfa(int u) {
    if (fa[u] == u)return u;
    return fa[u] = findfa(fa[u]);
}

void solve() {
    int n, m;cin >> n >> m;
    edge.assign(n + 1, vector<E>());
    for (int i = 1;i <= m;i++) {
        int u, v;cin >> u >> v;
        string s;cin >> s;
        int c = (s == "Lun" ? 1 : 0);
        edge[u].push_back({ ++tot,u,v,c });
        edge[v].push_back({ ++tot,v,u,c });
    }

    memset(dfn, 0, sizeof(dfn));

    for (int i = 1;i <= n;i++) {
        if (dfn[i] == 0) {
            tarjan(i, -1);
        }
    }

    // for (int i = 1;i <= n;i++) {
    //     cout << color[i] << " "; // 各个点的颜色
    // }
    // cout << "\n";

    for (int i = 1;i <= n;i++) {
        for (int j = 0;j < edge[i].size();j++) {
            auto e = edge[i][j];
            if (color[e.t] == color[i]) { // s,t相同颜色的轮边直接加入答案
                if (e.typ == 1)
                    ans.push_back(e);
            }
        }
    }

    for (int i = 1;i <= sum;i++)fa[i] = i;
    int cntc = sum;
    for (int i = 1;i <= n;i++) {
        for (int j = 0;j < edge[i].size();j++) {
            auto e = edge[i][j];
            if (e.typ == 1) { // 跳过轮边
                continue;
            }
            if (color[i] != color[e.t]) {
                int f1 = findfa(color[i]);
                int f2 = findfa(color[e.t]);
                if (f1 != f2) {
                    fa[f1] = f2;
                    ans.push_back(e); // 用e将两个颜色连起来
                    cntc--;
                }
            }
        }
    }

    if (cntc == 1) {
        cout << "YES\n";
        // 去除加入的双向边
        map<pair<ll, ll>, bool>mp;
        for (auto e : ans) {
            if (e.s < e.t) {
                mp[{e.s, e.t}] = true;
            }
            else {
                mp[{e.t, e.s}] = true;
            }
        }
        cout << mp.size() << "\n";
        for (auto [e, f] : mp) {
            cout << e.first << " " << e.second << "\n";
        }
    }
    else {
        cout << "NO\n";
    }
}
```

## H-Genshin Impact's Fault

### 题意

每次抽卡的结果是`3星`、`4星`、`5星非Up`、`5星Up`四种结果中的一种。同时也符合如下的要求：

- 连续10抽中不会全是`3星`。
- 连续90抽中至少有一个是`5星非Up`或`5星Up`
- 每两个连续的`5星`中至少有一个是`5星非Up`

给出一个抽卡结果序列，判断该抽卡结果是否符合上述规则。

#### 数据范围

- $1\leq T\leq 10^5$
- $1\leq |S|\leq 10^6$

### 思路

模拟。

### 代码

```cpp
void solve() {
    string s;cin >> s;
    bool hasup = true;
    int cnt10 = 0, cnt90 = 0;
    bool f = true;
    for (auto c : s) {
        if (c == '4' || c == '5' || c == 'U')cnt10 = 0;
        else cnt10++;
        if (cnt10 == 10) {
            f = false;break;
        }

        if (c == '5' && !hasup) {
            f = false;break;
        }

        if (c == '5' || c == 'U') {
            cnt90 = 0;
            if (c == 'U')
                hasup = true;
            else if (c == '5')
                hasup = false;
        }
        else {
            cnt90++;

        }
        if (cnt90 == 90) {
            f = false;break;
        }
    }

    f ? cout << "valid\n" : cout << "invalid\n";
}
```

## F-Challenge NPC 2

### 题意

在一个森林的补图中寻找哈密顿路径。

注：哈密顿路径指经过图中所有顶点一次且仅经过一次。

#### 数据范围

- $n\leq 5\times 10^5$

### 思路

森林中有且只有一棵菊花是无解的。剩余情况中，假如树是一棵菊花，则将其分为花瓣和花心两部分，花瓣可以连成一条路径，花心单独成为一条路径，假如不是一棵菊花，则寻找树的一个叶子结点，再从叶子结点进行BFS，按照246...135...的顺序将点穿起来，加入答案。

最后将不能相连的一组花瓣花心分别接在答案的两边，输出答案即可。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const int maxn = 5e5 + 50;
const ll mo998 = 998244353;

struct edge {
    int s, t;
};

vector<vector<edge>>tree;
int fa[maxn];
int rk[maxn];
int deg[maxn];
bool vis[maxn];

int findfa(int x) {
    if (fa[x] == x)return x;
    return fa[x] = findfa(fa[x]);
}

vector<int>ans;
vector<pair<vector<int>, vector<int>>>tmp; // 不能相邻的两条路

int tail, c;

void getpath(vector<int>v) {
    if (v.size() == 1) {
        vis[v.front()] = true;
        ans.push_back(v.front());
        return;
    }
    if (v.size() == 2) {
        tmp.push_back({ {v.front()},{v.back()} });
        return;
    }
    // 判断菊花
    int n = v.size();
    vector<int>wi, wj;
    for (int i = 0;i < n;i++) {
        int p = v[i];
        if (deg[p] == n - 1) {
            wj.push_back(p);
        }
        else if (deg[p] == 1) {
            wi.push_back(p);
        }
    }

    if (wj.size() == 1) {
        tmp.push_back({ wi,wj });
        return;
    }

    // 寻找叶子结点
    for (auto i : v) {
        if (tree[i].size() == 1) {
            tail = i;
            break;
        }
    }

    // 分层bfs
    c = 0;
    wi.clear();
    vector<int>x;
    x.push_back(tail);
    while (!x.empty()) {
        vector<int>y;
        for (auto p : x) {
            vis[p] = true;
            for (int i = 0;i < tree[p].size();i++) {
                struct edge e = tree[p][i];
                if (vis[e.t])continue;
                y.push_back(e.t);
            }
            if (c)ans.push_back(p);
            else wi.push_back(p);
        }
        c = 1 - c;
        x = y;
    }
    for (auto i : wi) {
        ans.push_back(i);
    }
}

void solve() {
    int n, m;cin >> n >> m;

    tree.assign(n + 1, vector<edge>());
    for (int i = 1;i <= n;i++) {
        fa[i] = i;
        deg[i] = 0;
        vis[i] = false;
        rk[i] = 1;
    }

    for (int i = 0;i < m;i++) {
        int u, v;cin >> u >> v;
        deg[u]++, deg[v]++;
        tree[u].push_back({ u,v });
        tree[v].push_back({ v,u });

        int fu = findfa(u), fv = findfa(v);
        if (rk[fu] > rk[fv])fa[fv] = fu;
        else {
            if (rk[fu] == rk[fv])rk[fv]++;
            fa[fu] = fv;
        }
    }


    map<int, vector<int>>mp;
    for (int i = 1;i <= n;i++) {
        int f = findfa(i);
        mp[f].push_back(i);
    }

    ans.clear(), tmp.clear();

    for (auto i : mp) {
        getpath(i.second);
    }

    if (ans.empty() && tmp.size() == 1) {
        cout << -1 << "\n";
        return;
    }

    if (tmp.size() >= 2) { // 只有两个菊花时要交叉放
        auto [v1, v2] = tmp[0];
        auto [w1, w2] = tmp[1];
        for (int i = 0;i < v1.size();i++) {
            ans.push_back(v1[i]);
        }
        for (int i = 0;i < w1.size();i++) {
            ans.push_back(w1[i]);
        }
        for (int i = 0;i < v2.size();i++) {
            ans.push_back(v2[i]);
        }
        for (int i = 0;i < w2.size();i++) {
            ans.push_back(w2[i]);
        }
        tmp.erase(tmp.begin());
        tmp.erase(tmp.begin());
    }

    vector<int>x, y;
    for (auto [w, v] : tmp) {
        for (auto i : w) {
            x.push_back(i);
        }
        for (auto i : v) {
            y.push_back(i);
        }
    }


    for (auto i : x) {
        cout << i << " ";
    }

    for (auto i : ans) {
        cout << i << " ";
    }

    for (auto i : y) {
        cout << i << " ";
    }

    cout << "\n";
}

int main() {
    ll t;
    cin >> t;
    while (t--)
        solve();

    return 0;
}
```
