---
title: "线段树专题练习"
description: "线段树专题练习记录，围绕扫描线、区间维护等题目整理题意、思路和代码。"
date: "2024-08-16T22:43:59+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 数据结构
  - 线段树
  - 刷题记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> [!abstract]+ 反思中
> 痛定思痛练习线段树QAQ。

此篇包含尚未写完的题，事实上是一个**TODO List**。

### TODO List

- [x] [Atlantis](https://acm.hdu.edu.cn/showproblem.php?pid=1542)
- [x] [P5490 【模板】扫描线 & 矩形面积并 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P5490)
- [x] [I Hate It](https://acm.hdu.edu.cn/showproblem.php?pid=1754)
- [x] [覆盖的面积](https://acm.hdu.edu.cn/showproblem.php?pid=1255)
- [x] [敌兵布阵](https://acm.hdu.edu.cn/showproblem.php?pid=1166)
- [ ] [P4588 TJOI2018 数学计算 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P4588)
- [x] [单峰数列](https://acm.hdu.edu.cn/showproblem.php?pid=7463) ✅ 2024-09-26
- [ ] [树上询问](https://acm.hdu.edu.cn/showproblem.php?pid=7530)
- [ ] [P1502 窗口的星星 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P1502)
- [ ] [P2471 SCOI2007 降雨量 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P2471)

## Atlantis & P5490 扫描线矩形面积并

[Problem - 1542 (hdu.edu.cn)](https://acm.hdu.edu.cn/showproblem.php?pid=1542)

### 题意

给出$x_1,y_1,x_2,y_2$，标志平面内的矩形的左上角坐标$(x_1,y_1)$和右下角坐标$(x_2,y_2)$​​，求这些矩形覆盖的总面积。

输出格式参照样例。

#### 数据范围

- $0\leq n\leq 100$
- $0\leq x_1\lt x_2\leq 10^5$
- $0\leq y_1\lt y_2\leq 10^5$

### 思路

记录每个矩阵的上下边，并给下边沿标记$1$，上边沿标记$-1$，扫描线从下向上扫描。

记录每条线的左右端点的$x$坐标，去重后进行离散化，用$X[]$数组记录出现过的$x$坐标，并做去重。

在去重之后的$X[]$数组上建立线段树（不包含最右侧端点），线段树中的每个节点记录该段节点代表的线段的左右端点在$X[]$中的下标，之后若该线段被覆盖，该节点代表的长度就是$X[posr+1]- X[posl]$，初始时每个节点记录的长度都是$0$（初始时均未被覆盖）。

扫描线从下到上扫描，每次都是先遇到某个矩阵的下边沿（标记为$1$的边），然后再遇到上边沿（标记为$-1$的边）。对于每次加边，更新线段树上的节点，当前被覆盖的长度$\times$当前扫描线与下一条扫描线的高度差即为这一部分的面积。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const int maxn = 2050;

struct line {
    int typ;
    double s, t, y;
    bool operator<(const line& l)const {
        return y < l.y; // 按照横坐标升序排序
    }
}line[maxn * 2];

struct node {
    int l, r;
    int cnt;
    double len;
}tree[maxn * 4];

double X[maxn * 2];

void build(int p, int l, int r) {
    tree[p] = { l,r,0,0 };
    if (l == r)return;
    int mid = l + (r - l) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
}

void pushup(int p) {
    int l = tree[p].l, r = tree[p].r;
    if (tree[p].cnt) { // 有覆盖
        tree[p].len = X[r + 1] - X[l];
    }
    else {
        tree[p].len = tree[p * 2].len + tree[p * 2 + 1].len;
    }
}

void editTree(int p, double l, double r, int c) {
    // 要修改的x区间:[l,r]
    int pl = tree[p].l, pr = tree[p].r; // 当前节点对应的左右坐标
    if (X[pl] >= l && X[pr + 1] <= r) { // 包含
        tree[p].cnt += c;
        pushup(p);
        return;
    }
    if (l >= X[pr + 1] || r <= X[pl])
        return;
    editTree(p * 2, l, r, c);
    editTree(p * 2 + 1, l, r, c);
    pushup(p);
}

int n;
int cas;
void solve() {
    cout << "Test case #" << ++cas << "\n";
    set<double>Xs;
    for (int i = 1;i <= n;i++) {
        double x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        line[i] = { 1,x1,x2,y1 }; // 下边
        line[i + n] = { -1,x1,x2,y2 }; // 上边
        Xs.insert(x1), Xs.insert(x2); // 离散化
    }
    sort(line + 1, line + 1 + 2 * n);
    int t = 0;
    for (auto p : Xs) {
        X[++t] = p;
    }
    build(1, 1, t - 1); // 对离散化的X轴建树
    double ans = 0.0;
    for (int i = 1;i < 2 * n;i++) { // 最后一条扫描线不用计入统计
        editTree(1, line[i].s, line[i].t, line[i].typ);
        ans += tree[1].len * (line[i + 1].y - line[i].y);
    }

    cout << "Total explored area: " << fixed << setprecision(2) << ans << "\n";
}

int main() {
    // ios::sync_with_stdio(false);
    // cin.tie(0);
    while (cin >> n && n)
        solve();

    return 0;
}
```

稍微修改一下上一题的代码就能过这个题：[P5490 【模板】扫描线 & 矩形面积并 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P5490)

代码：

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const int maxn = 1e6 + 50;

struct line {
    int typ;
    ll s, t, y;
    bool operator<(const line& l)const {
        return y < l.y; // 按照横坐标升序排序
    }
}line[maxn * 2];

struct node {
    int l, r;
    int cnt;
    ll len;
}tree[maxn * 4];

ll X[maxn * 2];

void build(int p, int l, int r) {
    tree[p] = { l,r,0,0 };
    if (l == r)return;
    int mid = l + (r - l) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
}

void pushup(int p) {
    int l = tree[p].l, r = tree[p].r;
    if (tree[p].cnt) { // 有覆盖
        tree[p].len = X[r + 1] - X[l];
    }
    else {
        tree[p].len = tree[p * 2].len + tree[p * 2 + 1].len;
    }
}

void editTree(int p, ll l, ll r, int c) {
    // 要修改的x区间:[l,r]
    int pl = tree[p].l, pr = tree[p].r; // 当前节点对应的左右坐标
    if (X[pl] >= l && X[pr + 1] <= r) { // 包含
        tree[p].cnt += c;
        pushup(p);
        return;
    }
    if (l >= X[pr + 1] || r <= X[pl])
        return;
    editTree(p * 2, l, r, c);
    editTree(p * 2 + 1, l, r, c);
    pushup(p);
}


void solve() {
    int n;cin >> n;
    set<ll>Xs;
    for (int i = 1;i <= n;i++) {
        ll x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        line[i] = { 1,x1,x2,y1 }; // 下边
        line[i + n] = { -1,x1,x2,y2 }; // 上边
        Xs.insert(x1), Xs.insert(x2); // 离散化
    }
    sort(line + 1, line + 1 + 2 * n);
    int t = 0;
    for (auto p : Xs) {
        X[++t] = p;
    }
    build(1, 1, t - 1); // 对离散化的X轴建树
    ll ans = 0ll;
    for (int i = 1;i < 2 * n;i++) { // 最后一条扫描线不用计入统计
        editTree(1, line[i].s, line[i].t, line[i].typ);
        ans += tree[1].len * (line[i + 1].y - line[i].y);
    }

    cout << ans << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.tie(0);
    while (t--)
        solve();

    return 0;
}
```

## I Hate It

[I Hate It](https://acm.hdu.edu.cn/showproblem.php?pid=1754)

### 题意

老师想询问学生中从某某到某某分数最高的是多少，并支持修改单个学生的成绩。

#### 数据范围

$0\lt n\leq 200000$

$0\lt m\leq 5000$

### 思路

建树，节点记录最大值，单点修改。注意多组读入

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn = 2e5 + 50;
const int mo109 = 1000000007;
const int mo998 = 998244353;

struct node {
    int mxval;
}tree[maxn << 2];

int n, m;
int a[maxn];

void build(int l, int r, int p) {
    if (l == r) {
        tree[p] = { a[l] };
        return;
    }
    int mid = l + (r - l) / 2;
    build(l, mid, p * 2);
    build(mid + 1, r, p * 2 + 1);
    tree[p].mxval = max(tree[p * 2].mxval, tree[p * 2 + 1].mxval);
}

void pushdown(int p) {
    tree[p].mxval = max(tree[p * 2].mxval, tree[p * 2 + 1].mxval);
}

void update(int cl, int cr, int p, int lr, int newval) {
    if (cl == cr && cl == lr) {
        a[cl] = newval;
        tree[p] = { newval };
        return;
    }
    int mid = cl + (cr - cl) / 2;
    if (lr <= mid) {
        update(cl, mid, p * 2, lr, newval);
    }
    else {
        update(mid + 1, cr, p * 2 + 1, lr, newval);
    }
    pushdown(p);
}

int query(int cl, int cr, int p, int l, int r) {
    if (cl >= l && cr <= r) {
        return tree[p].mxval;
    }
    int mid = cl + (cr - cl) / 2;
    int mx = -1;
    if (mid >= l) {
        int x = query(cl, mid, p * 2, l, r);
        mx = max(x, mx);
    }
    if (mid + 1 <= r) {
        int x = query(mid + 1, cr, p * 2 + 1, l, r);
        mx = max(mx, x);
    }
    return mx;
}

void solve() {
    // cin >> n >> m;
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
    }
    build(1, n, 1);
    while (m--) {
        char c;cin >> c;
        int a, b;cin >> a >> b;
        if (c == 'Q') {
            cout << query(1, n, 1, a, b) << '\n';
        }
        else {
            update(1, n, 1, a, b);
        }
    }
}

int main() {
    ios::sync_with_stdio(0);
    cin.tie(0);
    int _ = 1;
    // cin >> _;cin.get();
    while (cin >> n >> m)
        solve();

    return 0;
}
```

## 覆盖的面积

[覆盖的面积](https://acm.hdu.edu.cn/showproblem.php?pid=1255)

### 题意

给定平面上的矩阵，求出被这些矩阵覆盖至少两次的区域面积。

#### 数据范围

$1\leq N\leq 1000$

$0\leq x_i,y_i\leq 100000$

### 思路

扫描线求矩形并，在求并时统计更新被覆盖的次数，在`pushup`的时候，当父节点已有一次覆盖，而子区间已经被包含一次，则子区间已经被包含了2次。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const int maxn = 2050;

struct line {
    int typ;
    ld s, t, y;
    bool operator<(const line& l)const {
        return y < l.y; // 按照横坐标升序排序
    }
}line[maxn * 2];

struct node {
    int l, r;
    int cnt;
    ld len, len2;
}tree[maxn * 4];

ld X[maxn * 2];

void build(int p, int l, int r) {
    tree[p] = { l,r,0,0,0 };
    if (l == r)return;
    int mid = l + (r - l) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
}

void pushup(int p) {
    int l = tree[p].l, r = tree[p].r;

    if (tree[p].cnt) { // 有覆盖
        tree[p].len = X[r + 1] - X[l];
    }
    else if (l != r) {
        tree[p].len = tree[p * 2].len + tree[p * 2 + 1].len;
    }
    else {
        tree[p].len = 0;
    }

    if (tree[p].cnt >= 2) {
        tree[p].len2 = X[r + 1] - X[l];
    }
    else if (l != r && tree[p].cnt == 1) {
        // cnt=1时,子区间已经被包含过一次，再加上父节点p的一次则子区间被包含了2次
        tree[p].len2 = tree[p * 2].len + tree[p * 2 + 1].len;
    }
    else if (l != r) {
        tree[p].len2 = tree[p * 2].len2 + tree[p * 2 + 1].len2;
    }
    else {
        tree[p].len2 = 0;
    }
}

void editTree(int p, ld l, ld r, int c) {
    // 要修改的x区间:[l,r]
    int pl = tree[p].l, pr = tree[p].r; // 当前节点对应的左右坐标

    if (l >= X[pr + 1] || r <= X[pl]) {
        // pushup(p);
        return;
    }

    if (X[pl] >= l && X[pr + 1] <= r) { // 包含
        tree[p].cnt += c;
        pushup(p);
        return;
    }


    editTree(p * 2, l, r, c);
    editTree(p * 2 + 1, l, r, c);
    pushup(p);
}


void solve() {
    int n;cin >> n;
    set<ld>Xs;
    for (int i = 1;i <= n;i++) {
        ld x1, y1, x2, y2; // 左下右上
        cin >> x1 >> y1 >> x2 >> y2;
        line[i] = { 1,x1,x2,y1 }; // 下边
        line[i + n] = { -1,x1,x2,y2 }; // 上边
        Xs.insert(x1), Xs.insert(x2); // 离散化
    }
    sort(line + 1, line + 1 + 2 * n);
    int t = 0;
    for (auto p : Xs) {
        X[++t] = p;
    }

    build(1, 1, t - 1); // 对离散化的X轴建树

    ld ans = 0;
    for (int i = 1;i < 2 * n;i++) { // 最后一条扫描线不用计入统计
        editTree(1, line[i].s, line[i].t, line[i].typ);
        ans += tree[1].len2 * (line[i + 1].y - line[i].y);
    }
    ans += 0.001; // 样例好像有石
    cout << fixed << setprecision(2) << ans << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    cin >> t;cin.tie(0);
    while (t--)
        solve();

    return 0;
}
```

## 敌兵布阵

[敌兵布阵](https://acm.hdu.edu.cn/showproblem.php?pid=1166)

### 题意

有$N$个营地，初始第$i$个营地有$a_i$个人，有$4$种命令。

1. `Add i j`，表示第$i$个营地增加$j$人。
2. `Sub i j`，表示第$i$个营地减少$j$人。
3. `Query i j`，查询第$i$到第$j$个营地一共有多少人。
4. `End`，表示结束。

#### 数据范围

- $N\leq 50000$
- $1\leq a_i\leq 50$​

### 思路

很模板的一个题。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef double ld;
const int maxn = 5e4 + 50;

struct node {
    int val;
}tree[maxn * 4];

int a[maxn];

void build(int p, int l, int r) {
    if (l == r) {
        tree[p].val = a[l];
        return;
    }
    int mid = l + (r - l) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    tree[p].val = tree[p * 2].val + tree[p * 2 + 1].val;
}

void pushup(int p,int l,int r) {
    if (l == r)return;
    tree[p].val = tree[p * 2].val + tree[p * 2 + 1].val;
}

void update(int p, int cl, int cr, int goal,int x) {
    if (cl > goal || cr < goal)return;
    if (cl == cr) {
        tree[p].val += x;
        pushup(p, cl, cr);
        return;
    }
    int mid = cl + (cr - cl) / 2;
    update(p * 2, cl, mid, goal, x);
    update(p * 2 + 1, mid + 1, cr, goal, x);
    pushup(p, cl, cr);
}

int query(int p, int cl, int cr, int l, int r) {
    if (cl > r || cr < l)
        return 0;
    if (cl >= l && cr <= r) {
        return tree[p].val;
    }
    int mid = cl + (cr - cl) / 2;
    int tot = 0;
    tot += query(p * 2, cl, mid, l, r);
    tot += query(p * 2 + 1, mid + 1, cr, l, r);
    return tot;
}

int ccnt;
void solve() {
    int n;cin >> n;
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
    }
    build(1, 1, n);
    string s;
    cout << "Case " << ++ccnt << ":\n";
    while (cin >> s) {
        if (s == "End")break;
        if (s == "Query") {
            int l, r;cin >> l >> r;
            cout << query(1, 1, n, l, r) << '\n';
        }
        else if (s == "Add") {
            int i, j;cin >> i >> j;
            update(1, 1, n, i, j);
        }
        else if (s == "Sub") {
            int i, j;cin >> i >> j;
            update(1, 1, n, i, -j);
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    cin >> t;cin.tie(0);
    ccnt = 0;
    while (t--)
        solve();

    return 0;
}
```

## 单峰数列

[单峰数列](https://acm.hdu.edu.cn/showproblem.php?pid=7463)

### 题意

给定长度为$n$的数列$a$，支持以下操作：

1. `1 l r x`：给区间$[l,r]$的所有数加上$x$
2. `2 l r`：查询区间$[l,r]$中的元素是否全都相同
3. `3 l r`：查询区间$[l,r]$中的元素是否严格上升，当$l==r$时认为是严格上升的
4. `4 l r`：查询区间$[l,r]$中的元素是否严格下降，当$l==r$时认为是严格下降的
5. `5 l r`：查询区间$[l,r]$是否是单峰数列，单峰数列符合右侧严格递增，左侧严格递减，并且左右侧的区间不为空，保证$r-l+1\geq 3$。

#### 数据范围

- $3\leq n \leq 10^5$
- $0\leq a_i\leq 10^9$
- $1\leq q \leq 2\times 10^5$

对于第一类操作，保证$-10^9\leq x\leq 10^9$

### 思路

用三个变量记录区间左值、右值和懒标记。

用三个布尔值变量记录当前区间是否是相同、上升、下降、单峰。在判断合并后是否是单峰时，主要满足单峰的区间必须大于等于3，当左右两个区间分别是上升、下降，且某个区间只有一个数时，要注意比较左右值。

### 代码

```cpp
#include <bits/stdc++.h>

using namespace std;

#define lson(p) tree[p * 2]
#define rson(p) tree[p * 2 + 1]

typedef long long ll;
typedef unsigned long long ull;

const int maxn = 4e5 + 50;

struct node {
  int l, r;
  ll lval, rval, lazy;
  bool isup, isdown, issame, isheap;
} tree[maxn << 2];

ll a[maxn];

node merge(node ret1, node ret2) {
  node ret;

  ret = {
    ret1.l,
    ret2.r,
    ret1.lval,
    ret2.rval,
    0ll,
    true,
    true,
    true,
    false
  };

  ret.issame = ret1.issame && ret2.issame && ret1.rval == ret2.lval;
  ret.isup = ret1.isup && ret2.isup && ret1.rval < ret2.lval;
  ret.isdown = ret1.isdown && ret2.isdown && ret1.rval > ret2.lval;

  if (ret1.isup && ret2.isdown) {
    if (ret1.l == ret1.r && ret1.rval < ret2.lval && ret2.l != ret2.r)
      ret.isheap = true;
    else if (ret2.l == ret2.r && ret1.rval > ret2.lval && ret1.l != ret1.r)
      ret.isheap = true;
    else if (ret1.l != ret1.r && ret2.l != ret2.r)
      ret.isheap = true;
  }

  if (ret1.isup && ret2.isheap && ret1.rval < ret2.lval)
    ret.isheap = true;
  if (ret1.isheap && ret2.isdown && ret1.rval > ret2.lval)
    ret.isheap = true;

  return ret;
}

void build(int p, int l, int r) {
  if (l == r) {
    tree[p] = {l, r, a[l], a[r], 0ll, true, true, true, false};
    return;
  }
  int mid = l + (r - l) / 2;
  build(p * 2, l, mid);
  build(p * 2 + 1, mid + 1, r);
  tree[p] = merge(lson(p), rson(p));
}

void pushdown(int p) {
  int l = tree[p].l, r = tree[p].r;
  if (l == r) {
    return;
  }
  if (tree[p].lazy) {
    ll x = tree[p].lazy;
    lson(p).lazy += x, rson(p).lazy += x;
    lson(p).lval += x, rson(p).lval += x;
    lson(p).rval += x, rson(p).rval += x;
    tree[p].lazy = 0ll;
  }
}

void pushup(int p) {
  int l = tree[p].l, r = tree[p].r;
  if (l == r) {
    return;
  }
  tree[p] = merge(lson(p), rson(p));
}

void update(int p, int cl, int cr, int l, int r, ll num) {
  if (cl >= l && cr <= r) {
    tree[p].lval += num, tree[p].rval += num;
    tree[p].lazy += num;
    pushdown(p);
    pushup(p);
    return;
  }
  pushdown(p);
  int mid = cl + (cr - cl) / 2;
  if (l <= mid)
    update(p * 2, cl, mid, l, r, num);
  if (mid + 1 <= r)
    update(p * 2 + 1, mid + 1, cr, l, r, num);
  pushup(p);
}

node query(int p, int cl, int cr, int l, int r) {
  if (cl >= l && cr <= r) {
    return tree[p];
  }

  pushdown(p);
  int mid = cl + (cr - cl) / 2;

  node ret, ret1, ret2;

  ret1.l = ret2.l = -1;
  ret.l = cl, ret.r = cr;

  if (l <= mid) {
    ret1 = query(p * 2, cl, mid, l, r);
  }
  if (mid + 1 <= r) {
    ret2 = query(p * 2 + 1, mid + 1, cr, l, r);
  }
  pushup(p);

  if (ret1.l == -1)
    return ret2;
  if (ret2.l == -1)
    return ret1;

  ret = merge(ret1, ret2);

  return ret;
}

void solve() {
  int n;
  cin >> n;
  for (int i = 1; i <= n; i++) {
    cin >> a[i];
  }
  build(1, 1, n);
  int q;
  cin >> q;
  while (q--) {
    int op, l, r;
    cin >> op >> l >> r;
    if (op == 1) {
      ll x;
      cin >> x;
      update(1,1,n,l,r,x);
    } else {
      node ret = query(1, 1, n, l, r);
      if (op == 2) {
        cout << ret.issame << '\n';
      } else if (op == 3) {
        cout << ret.isup << '\n';
      } else if (op == 4) {
        cout << ret.isdown << '\n';
      } else if (op == 5) {
        cout << ret.isheap << '\n';
      }
    }
  }
}

void init() {
}

int main(void) {
  ios::sync_with_stdio(false);
  cin.tie(0);
  init();
  int t = 1;
  // cin >> t;
  // cin.get();
  while (t--)
    solve();

  return 0;
}

```
