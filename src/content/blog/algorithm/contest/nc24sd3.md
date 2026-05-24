---
title: "🫟2024牛客暑假多校训练营Day3||补题"
description: "2024 牛客暑假多校训练营 Day3 的补题记录，包含 Bridging the Gap、Crash Test 和 Dominoes 等题的题解。"
date: "2024-07-23T18:37:58+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-Bridging the Gap 2

### 题意

在河岸的一侧有$n$个人，每个人有一个体力值$h_i$，有一艘船可以将人从一侧载到另一侧，每次航行需要至少$L$个人掌舵，每次掌舵会花费每个掌舵人的一点体力，当体力不足一点时，这个人不能再掌舵，船的容量最大是$R$，提问是否能够将这些人都运送到对岸。

#### 数据范围

- $1\leq L\lt R\leq n\leq 5\times 10^5$​
- $1\leq h_i\leq 5\times 10^5$

### 思路

贪心的运输，从左岸运输的最小次数是$k=\lceil \frac{n-R}{R-L} \rceil$，计算每个人最多的来回次数$a_i$，假如满足$\sum_{i-1}^{n} min(k,a_i)\geq k\times L$，则可以将所有人都运输到对岸。

### 代码

```cpp
ll h[maxn], a[maxn];
void solve() {
    int n, L, R;cin >> n >> L >> R;
    ll sum = 0, k = (n - L - 1) / (R - L);
    for (int i = 0;i < n;i++) {
        cin >> h[i];
        a[i] = (h[i] - 1) / 2;
        sum += min(k, a[i]);
    }
    if (sum >= k * L)cout << "Yes\n";
    else cout << "No\n";
}
```

## B-Crash Test

### 题意

小车有$n$个引擎，第$i$个引擎可以让车前进$h[i]$米。在小车起点正前方距离为$D$处有一反弹墙面，小车如果撞在墙上将会被回弹与当前剩余的前进米数相同的距离，并保持车头朝向墙面。小车可以使用任意引擎任意次，询问距离墙面最近的距离是多少。

#### 数据范围

- $1\leq n\leq 100$
- $1\leq D \leq 10^{18}$
- $1\leq h[i]\leq 10^{18}$

### 思路

假设当前选择了某个引擎，并只使用这个引擎，易知，我们可以将距离$d$减小到$\min(d\bmod h[i],h[i]-d\bmod h[i])$。

接下来选择另一种引擎，在刚才的基础上，我们可以将距离减小到$\min(d\bmod h[i+1],h[i+1]-d\bmod h[i+1])$。

设$gcd(h[i],h[i+1])=k$，$h[i]=ak,h[i+1]=bk$，则$d$的变化其实是这样的：

$$
\begin{align*}
d_1=\&\min(d_0\bmod ak,d_0-d_0\bmod ak)\\
=\&\min(d_0\bmod k,d_0-d_0\bmod k)\\
d_2=\&\min(d_1\bmod bk,d_1-d_1\bmod bk)\\
=\&\min(d_1\bmod k,d_1-d_1\bmod k)\\
=\&d_1\\
=\&\min(d_0\bmod k,d_0-d_0\bmod k)\\
\&.......
\end{align*}
$$

观察结果，可以发现最小的$|dis-d|$之和所有引擎的$gcd$有关，计算$h[]$数组的$gcd$即可。

### 代码

```cpp
void solve() {
    ll n, d;cin >> n >> d;
    vector<ll>h(n + 1);
    for (ll i = 1;i <= n;i++) {
        cin >> h[i];
    }
    sort(h.begin() + 1, h.end());
    ll x = h[n];
    for (ll i = n;i >= 1;i--) {
        x = gcd(x, h[i]);
    }
    cout << min(d % x, x - d % x) << endl;
}
```

## D-Dominoes!

### 题意

一张多米诺骨牌的左右两端各有一个数字，给出$n$张这样的多米诺骨牌，是否存在一个可以另所有相邻且不在同一张牌上的两个数字不一样的序列。

#### 数据范围

- $1\leq n\leq 2\times 10^5$
- $1\leq x_i,y_i\leq 10^9$

### 思路

首先注意到当 某个数字的数量大于等于$n+2$时，一定没有合法的排列。

而如果符合$\lt n+2$，一定有合法序列。

如果所有骨牌都满足$x_i\neq y_i$，则只要满足每次从两侧加入的牌相邻没有相同数字即可，一定有合法序列。

优先考虑排列$x_i=y_i$的骨牌。将$x_i = y_i$的骨牌按照数量从大到小排序，每次选择一张牌，假设这张牌的数字是$p$，之后选择现存数量最多的且符合$x_j = y_j\neq p$的一张牌，放在右侧，接下来继续取两侧相同骨牌中数目最多的，若两侧相同骨牌数目不足$2$种，则加入任意两侧不同的牌，注意接触端的条件

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll maxn = 2e5 + 50;

struct Domi {
    ll x, y;

    bool operator==(const Domi& d)const {
        return tie(x, y) == tie(d.x, d.y);
    }
    bool operator!=(const Domi& d)const {
        return tie(x, y) != tie(d.x, d.y);
    }
    bool operator<(const Domi& d)const {
        return tie(x, y) < tie(d.x, d.y);
    }
};

bool compare(const pair<ll, Domi>& a, const pair<ll, Domi>& b) {
    if (a.first == b.first)return a.second < b.second;
    return a.first > b.first;
}

void solve() {
    ll n;cin >> n;
    vector<Domi>v, w;
    map<ll, ll>cnt;
    for (ll i = 1;i <= n;i++) {
        ll x, y;cin >> x >> y;
        if (x > y) { x = x ^ y, y = x ^ y, x = x ^ y; }
        cnt[x]++, cnt[y]++;
        if (x == y)
            v.push_back({ x,y });
        else
            w.push_back({ x,y });
    }
    ll lv = v.size();
    ll lw = w.size();


    for (auto i : cnt) {
        if (i.second >= n + 2) {
            cout << "No\n";
            return;
        }
    }
    cout << "Yes\n";

    if (n == 1) {
        struct Domi d;
        if (v.empty()) {
            d = w.back();
        }
        else {
            d = v.back();
        }
        cout << d.x << " " << d.y << "\n";
        return;
    }

    sort(v.begin(), v.end());
    ll c = 1;
    priority_queue<pair<ll, Domi>>pris;
    for (ll i = 1;i < lv;i++) {
        if (v[i] != v[i - 1]) {
            pris.push({ c,v[i - 1] });
            c = 1;
        }
        else {
            c++;
        }
    }
    if (lv) {
        pris.push({ c,v.back() });
    }

    vector<Domi>ans;
    ll pw = 0;
    ll las = -1;
    while (!pris.empty() || pw < lw) {
        if (pris.empty()) {
            struct Domi x = w[pw++];
            if (x.x == las) {
                x = { x.y,x.x };
            }
            ans.push_back(x);
            las = x.y;
            continue;
        }

        auto [cntx, x] = pris.top();pris.pop();
        if (las != x.x) {
            cntx--;
            if (cntx) {
                pris.push({ cntx,x });
            }
            ans.push_back(x);
            las = x.y;
            continue;
        }

        if (pris.empty()) {
            pris.push({ cntx,x });
            x = w[pw++];
            if (x.x == las) {
                x = { x.y,x.x };
            }
            ans.push_back(x);
            las = x.y;
            continue;
        }

        auto [cnty, y] = pris.top();pris.pop();
        pris.push({ cntx,x });
        cnty--;
        if (cnty) {
            pris.push({ cnty,y });
        }
        ans.push_back(y);
        las = y.y;
    }

    for (auto i : ans) {
        cout << i.x << " " << i.y << "\n";
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)solve();

    return 0;
}
```

## E-Malfunctioning Typewriter

### 题意

有一台打字机，对于每次键入的字符（只有`0`或`1`），每次有`p`的概率正确键入，有$n$句长度为$m$的不会重复的诗句，这些诗句可以以任意顺序组合成一首长度为$n$的诗。询问在打字这首诗的时候，有多大的概率成果打出。

#### 数据范围

- $1\leq n,m\leq 1000$
- $0.5\leq q\leq 1$

### 思路

将$n$句诗建立字典树，对每个节点统计以该结点为前缀的字符串数目。

考虑到只有`01`，每个节点下最多只有`0`或`1`的子节点。记某个节点为$u$，将节点$u$前缀打对的概率可以预处理（$f(x,y)$表示打对$x$个$1$，$y$个$0$的概率），打对一整首诗歌是遍历完字典树上的每个字符串$1$次，对于字典树上的某个非叶子节点，在遍历时，经过该结点的数目是它的子树中有多少个叶子结点决定的，假设有$x$是从该节点（表示一个前缀）往后以`1`为根节点的子树中的叶子结点数目，$y$是以`0`为根节点的子树中叶子结点的数目，那么在决策当前是否正确输出了`0/1`的概率是$f(x,y)$（相当于在当前节点输出正确的$x$个`1`和$y$个`0`的概率代表这一步打字输出了$x+y$个合法下行子串的概率），故总概率是$\prod_u f(sz(lp),sz(rp))$。

对$f(x,y)$的预处理：

$$
f(x,y)=\max(p\times f(x-1,y)+(1-p)\times f(x,y),p\times f(x,y-1)+(1-p)\times f(x-1,y))
$$

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const ll maxn = 1010;

int node = 0;
int nxt[maxn * maxn][2];
int sz[maxn * maxn];
void triInsert(string s) {
    int n = s.size();
    int p = 0;
    for (int i = 0;i < n;i++) {
        int c = s[i] - '0';
        if (!nxt[p][c])nxt[p][c] = ++node;
        sz[nxt[p][c]]++; // 以这个点为前缀的字符串数目
        p = nxt[p][c];
    }
}


ld f[maxn][maxn];
void solve() {
    int n, m;ld p;
    cin >> n >> m >> p;
    vector<string>st(n);
    for (int i = 0;i < n;i++) {
        string s;cin >> s;
        triInsert(s);
    }
    f[0][0] = 1.0; // 打出0个1,0个0概率为1
    for (int x = 0;x <= n;x++) {
        // f(x,y):恰好正确打出x个1,y个0
        for (int y = 0;y <= n;y++) {
            if (!x && !y)continue;
            ld w = x ? f[x - 1][y] : 0.0;
            ld v = y ? f[x][y - 1] : 0.0;
            f[x][y] = max(
                p * w + (1 - p) * v,
                p * v + (1 - p) * w
            );
        }
    }
    ld ans = 1.0;
    for (int i = 0;i <= node;i++) {
        ans *= f[sz[nxt[i][0]]][sz[nxt[i][1]]];
    }
    printf("%.12lf", ans);
}

int main() {
    int _ = 1;
    // cin >> _;cin.get();
    while (_--)
        solve();

    return 0;
}
```

## J-Rigged Games

### 题意

比赛由大分比和小分比一同决定最终的胜负，小分比`Bo2a-1`：先胜出`a`场为胜。大分比`Bo2b-1`：先胜出`b`场为胜。记1次小分比胜负为大分比的一场。

现在有一个长度为$n$的`01`字符串，字符串是无限循环重复的，用于记录每一次比赛的胜负，从`01`字符串的每个位置开始比赛，询问谁会赢得整个比赛。

#### 数据范围

- $1\leq n,a,b\leq 10^5$

### 思路

倍增思想，在`01`循环串中，记录每个位置开始后进行`Bo2a-1`小局的胜负，以及下一步从哪个位置开始。数组`f[i][j]`表示从$i$开始进行$2^j$轮后到达的位置、对应的$0$、$1$​的胜利次数。

在统计`Bo2b-1`时，我们要找到第一次0或1胜利`b`次以上的位置，将`j`倒序处理，$2b-1$是最多获得终局的次数，$b$是最少获得终局的次数。假设$b=5$，需要至少$5$局，至多$9$局定胜负，注意到$9=2^3+2^0$，在计数恰好$9$局时，应当只统计先$2^3=8$局，然后往后再统计$2^0=1$局（这里先1后8也不会影响结果，只要保证不超过9局即可）。在计算`Bo2b-1`的结果时，每次统计恰好$2b-1$。

### 代码

```cpp
struct status {
    int n0, n1;
    int overpos;
}f[maxn][20]; // 从位置i开始结束j小局后的状态

void solve() {
    ll n, a, b;cin >> n >> a >> b;
    string s;cin >> s;
    // 更新Bo2a-1的状态
    int w0 = 0, w1 = 0; // 统计0/1胜利多少次
    int pos = 0;
    for (int i = 0;i < n;i++) {
        // 位置i开始
        while (w0 < a && w1 < a) { // 未出小局结果
            if (s[pos] == '1')w1++;
            else w0++;
            pos = (pos + 1) % n;
        }
        if (w0 >= a) {
            f[i][0] = { 1,0,pos };
        }
        else {
            f[i][0] = { 0,1,pos };
        }
        if (s[i] == '1')w1--;
        else w0--; // 下一次循环会从i+1开始,减去i位置的分
    }
    // 倍增结果
    for (int j = 1;j < 20;j++) {
        // 枚举进行了2^j局
        for (int i = 0;i < n;i++) {
            // 枚举开始位置
            // 第i位置开始进行2^j局=第i开始进行2^(j-1)局+第i开始进行2^(j-1)局后的位置pos开始进行2^(j-1)局
            int pos = f[i][j - 1].overpos;
            f[i][j].overpos = f[pos][j - 1].overpos;
            f[i][j].n0 = f[i][j - 1].n0 + f[pos][j - 1].n0;
            f[i][j].n1 = f[i][j - 1].n1 + f[pos][j - 1].n1;
        }
    }
    // 进行Bo2b-1的结果统计
    for (int i = 0;i < n;i++) {
        int w0 = 0, w1 = 0;
        int tot = 0;
        int pos = i;
        for (int j = 0;j < 20;j++) {
            // 从pos开始进行2^j次比赛,累计0/1的胜利次数
            if ((2 * b - 1) >> j & 1) {
                w0 += f[pos][j].n0;
                w1 += f[pos][j].n1;
                pos = f[pos][j].overpos;
            }
        }
        // cout << w0 << " " << w1 << endl; // 出现第一个胜利b次时正确
        if (w0 >= b)cout << '0';
        else cout << '1';
    }
    cout << "\n";
}
```

## L-Sudoku and Minesweeper

### 题意

给出一个$9\times 9$的数独，在这个数独的基础上构造一个扫雷地图，将数独上的一些数字替换为`*`，但是不能将所有数字都替换为`*`，使得整个扫雷地图合法。

### 思路

在铺满地雷的地图上保留一些数字，数字`8`表明该格周围都是`*`，所以选择保留所有的`8`，并再次遍历一遍所有的地图（注意边界），删掉不符合要求的`8`。

或者另一个想法：中间$3\times 3$的格子中中一定有一个数字`8`，在去掉除了这个`8`以外的所有数字之后，这个`8`一定是符合要求的。

### 代码

```cpp
char mp[10][10];

void solve() {
    for (int i = 1;i <= 9;i++) {
        for (int j = 1;j <= 9;j++) {
            cin >> mp[i][j];
            if (mp[i][j] != '8')mp[i][j] = '*';
        }
    }
    vector<pair<int, int>>dxy = {
        {-1,-1},{-1,0},{-1 ,1},
        {0,-1},{0 ,1},
        {1,-1},{1,0},{1 ,1},
    };
    for (int i = 1;i <= 9;i++) {
        for (int j = 1;j <= 9;j++) {
            if (mp[i][j] == '*')continue;
            int x = mp[i][j] - '0';
            int y = 0;
            for (int k = 0;k < 8;k++) {
                int ii = i + dxy[k].first, jj = j + dxy[k].second;
                if (ii >= 1 && ii <= 9 && jj >= 1 && jj <= 9)
                    if (mp[ii][jj] == '*') { y++; }
            }
            if (x != y)mp[i][j] = '*';
        }
    }
    for (int i = 1;i <= 9;i++) {
        for (int j = 1;j <= 9;j++) {
            cout << mp[i][j];
        }
        cout << "\n";
    }
}
```
