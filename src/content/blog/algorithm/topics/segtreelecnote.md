---
title: "线段树讲义||寒假"
description: "线段树寒假讲义笔记，介绍建树、区间查询、区间修改和懒标记等核心操作。"
date: "2024-03-13T13:29:07+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 数据结构
  - 线段树
  - 讲义
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## 线段树介绍

- 线段树是一棵二叉树，每个节点维护一个区间内$[l,r]$的信息
- 左子树区间维护$[l,\lfloor \frac{l+r}{2} \rfloor]$的信息，右子树维护$[\lfloor \frac{l+r}{2} \rfloor+1,r]$的信息
- 节点信息可以由两个子节点合并得到
- 任意一个区间会被分为线段树上$O(\log n)$个节点

线段树可以在$O(\log N)$的时间复杂度内实现**单点修改**、**区间修改**、**区间查询（区间求和/区间最大值/区间最小值）**等操作。

线段树一般解决类似这样的问题：

> 已知一个数列，你需要进行下面几种操作：
>
> 1. 将某区间每一个数加上 $k$。（修改）
> 2. 求出某区间每一个数的和。（查询）
> 3. 将某区间的每个数修改为$x$。（修改）
> 4. 求某区间的最大值/最小值。（查询）

### 建树

![img](https://cdn.jsdelivr.net/gh/dodolalorc/dodolaPicBed/segt1.svg)

#### 实现

递归实现

```cpp
struct segTreeNode {
    ll d = 0ll, lazy = 0ll;     // 数据&懒标记
    bool used;  // 标记是否修改过
};

vector<ll>a(maxn);  // 原数据
vector<segTreeNode>tree(maxn * 4);

void build(int l, int r, int p) {
    if (l == r) {
        tree[p].d = a[l];
        return;
    }
    int m = l + ((r - l) >> 1);

    build(l, m, p << 1);	// 左边
    build(m + 1, r, (p << 1) | 1);	// 右边

    tree[p].d = tree[p << 1].d + tree[(p << 1) | 1].d;
}
```

## 查询&修改&求值

### 区间查询

进行区间查询的时候，区间和节点区间的关系有三种可能：

1. 当前要查询的区间与正在询问的区间没有交集，返回空
2. 当前要查询的区间被某个节点的区间完全包含，直接取该点记录的值
3. 当前要查询的区间被某个节点部分包含，则将这个节点往下传递一层，直到符合上面两种情况

#### 实现

```cpp
ll getsum(int l, int r, int cl, int cr, int p) {
    // if (cr<l || cl>r)return 0ll;     // 操作正确的话不可能会出现这种情况
    if (cl >= l && cr <= r)return tree[p].d;

    int m = cl + ((cr - cl) >> 1);
    ll sum = 0ll;
    if (m >= l)
        sum += getsum(l, r, cl, m, p << 1);
    if (m < r)
        sum += getsum(l, r, m + 1, cr, (p << 1) | 1);
    return sum;
}
```

### 区间修改（懒标记）

区间修改和区间查询的思路是一样的，判断当前节点区间与被修改的区间的关系，对其数据进行修改。

假如我们在修改区间$[l,r]$时，把所有与$[l,r]$有交集的节点都遍历并修改一边，时间复杂度将过高，所以我们引入**懒标记**。

思考：

当我们要修改$[l,r]$，有一个节点（或者是一些节点的并集）恰好是$[l,r]$，我们选择节点数最少的那个集合进行修改，并对这些集合进行标记，只有当某次访问需要这些节点的子节点时，才把变化传递下去，这样可以大大减少对更深处的节点的修改次数，降低时间复杂度。

#### 实现

```cpp
void update(int l, int r, int cl, int cr, int p, ll x) {
    // 给区间[l,r]的每个数都加上x
    // if (cr<l || cl>r)return;
    if (cl >= l && cr <= r) {
        tree[p].d += (cr - cl + 1) * x;
        tree[p].lazy += x;
        return;
    }
    int m = cl + ((cr - cl) >> 1);
    if (tree[p].lazy) {
        tree[p << 1].d += tree[p].lazy * (m - cl + 1);
        tree[(p << 1) | 1].d += tree[p].lazy * (cr - m);
        tree[p << 1].lazy += tree[p].lazy;
        tree[(p << 1) | 1].lazy += tree[p].lazy;
        tree[p].lazy = 0ll;
    }
    if (m >= l)update(l, r, cl, m, p << 1, x);
    if (m < r)update(l, r, m + 1, cr, (p << 1) | 1, x);

    tree[p].d = tree[p << 1].d + tree[(p << 1) | 1].d;
}
```

相应的，引入懒区间之后，我们在区间查询的时候要考虑懒标记是否下达，如果没有下达则要将懒标记传递下去。

```cpp
ll getsum(int l, int r, int cl, int cr, int p) {
    // if (cr<l || cl>r)return 0ll;     // 操作正确的话不可能会出现这种情况
    if (cl >= l && cr <= r)return tree[p].d;

    int m = cl + ((cr - cl) >> 1);

    if (tree[p].lazy) {
        tree[p << 1].lazy += tree[p].lazy, tree[(p << 1) | 1].lazy += tree[p].lazy;
        tree[p << 1].d += tree[p].lazy * (m + 1 - cl), tree[(p << 1) | 1].d += tree[p].lazy * (cr - m);
        tree[p].lazy = 0;
    }

    ll sum = 0ll;
    if (m >= l)
        sum += getsum(l, r, cl, m, p << 1);
    if (m < r)
        sum += getsum(l, r, m + 1, cr, (p << 1) | 1);
    return sum;
}
```

例题指路：

区间求和：[P3372 【模板】线段树 1 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3372)

#### 参考

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn = 1e5 + 10;
/*
线段树模板1：实现区间加/求和的模板
洛谷P3372
*/
struct segTreeNode {
    ll d, lazy;     // 数据&懒标记
    bool used;  // 标记是否修改过
};

vector<ll>a(maxn);  // 原数据
vector<segTreeNode>tree(maxn * 4);

void build(int l, int r, int p) {
    if (l == r) {
        tree[p].d = a[l];
        return;
    }
    int m = l + ((r - l) >> 1);

    build(l, m, p << 1);
    build(m + 1, r, (p << 1) | 1);

    tree[p].d = tree[p << 1].d + tree[(p << 1) | 1].d;
}

void update(int l, int r, int cl, int cr, int p, ll x) {
    // 给区间[l,r]的每个数都加上x
    // if (cr<l || cl>r)return;
    if (cl >= l && cr <= r) {
        tree[p].d += (cr - cl + 1) * x;
        tree[p].lazy += x;
        return;
    }
    int m = cl + ((cr - cl) >> 1);
    if (tree[p].lazy) {
        tree[p << 1].d += tree[p].lazy * (m - cl + 1);
        tree[(p << 1) | 1].d += tree[p].lazy * (cr - m);
        tree[p << 1].lazy += tree[p].lazy;
        tree[(p << 1) | 1].lazy += tree[p].lazy;
        tree[p].lazy = 0ll;
    }
    if (m >= l)update(l, r, cl, m, p << 1, x);
    if (m < r)update(l, r, m + 1, cr, (p << 1) | 1, x);

    tree[p].d = tree[p << 1].d + tree[(p << 1) | 1].d;
}

ll getsum(int l, int r, int cl, int cr, int p) {
    // if (cr<l || cl>r)return 0ll;     // 操作正确的话不可能会出现这种情况
    if (cl >= l && cr <= r)return tree[p].d;

    int m = cl + ((cr - cl) >> 1);
    if (tree[p].lazy) {
        tree[p << 1].lazy += tree[p].lazy, tree[(p << 1) | 1].lazy += tree[p].lazy;
        tree[p << 1].d += tree[p].lazy * (m + 1 - cl), tree[(p << 1) | 1].d += tree[p].lazy * (cr - m);
        tree[p].lazy = 0;
    }
    ll sum = 0ll;
    if (m >= l)
        sum += getsum(l, r, cl, m, p << 1);
    if (m < r)
        sum += getsum(l, r, m + 1, cr, (p << 1) | 1);
    return sum;
}

void solve() {
    int n, m;cin >> n >> m;
    for (int i = 1;i <= n;i++)
        cin >> a[i];
    build(1, n, 1);
    while (m--) {
        int op;cin >> op;
        if (op == 1) {
            int x, y;ll k;
            cin >> x >> y >> k;
            update(x, y, 1, n, 1, k);
        }
        else {
            int x, y;cin >> x >> y;
            cout << getsum(x, y, 1, n, 1) << '\n';
        }
    }
}

int main() {
    int _ = 1;
    // cin >> _;cin.get();
    while (_--)
        solve();
}
```

#### 思考

相似的，如果是将某个区间内的值都修改为某个值，应该如何操作？

### 例题 1（两种懒标记）

[P3373 【模板】线段树 2 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3373)

> 操作 1： 格式：`1 x y k` 含义：将区间$[x,y]$内每个数乘上 k
>
> 操作 2： 格式：`2 x y k` 含义：将区间$[x,y]$ 内每个数加上 k
>
> 操作 3： 格式：`3 x y` 含义：输出区间 $[x,y]$ 内每个数的和对 m 取模所得的结果
>
> 这题需要考虑两种修改值的操作之间的相互影响。
>
> - 每次对节点加/乘之前，要判断是否需要将当前节点的两种懒标记向下传递
> - 判断时应该先乘后加

#### 参考

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn = 1e5 + 10;
/*
线段树模板2：实现区间加+乘、求和的模板
洛谷P3372
*/
struct segTreeNode {
    ll d, lazyPlus, lazyTime;
    /*TIP:在开结构体vector时已有初始值会使所有初始值塞入程序，会导致编译时间过长+内存溢出*/
    bool used;  // 标记是否修改过
};

ll mo;
vector<ll>a(maxn);  // 原数据
vector<segTreeNode>tree(maxn * 4);

void build(int l, int r, int p) {
    tree[p].lazyTime = 1ll;
    if (l == r) {
        tree[p].d = a[l] % mo;
        return;
    }
    int mid = l + ((r - l) >> 1);

    build(l, mid, p << 1);
    build(mid + 1, r, (p << 1) | 1);

    tree[p].d = (tree[p << 1].d + tree[(p << 1) | 1].d) % mo;
}

void pd(int cl, int cr, int p) {
    int l = p << 1;
    int r = (p << 1) | 1;
    // 先乘后加
    if (tree[p].lazyTime != 1ll) {
        tree[l].lazyTime *= tree[p].lazyTime;
        tree[r].lazyTime *= tree[p].lazyTime;
        tree[l].lazyTime %= mo;
        tree[r].lazyTime %= mo;

        // 对子节点懒标记乘
        tree[l].lazyPlus *= tree[p].lazyTime;
        tree[r].lazyPlus *= tree[p].lazyTime;
        tree[l].lazyPlus %= mo;
        tree[r].lazyPlus %= mo;
        // 对子节点数值乘
        tree[l].d *= tree[p].lazyTime;
        tree[r].d *= tree[p].lazyTime;
        tree[l].d %= mo;
        tree[r].d %= mo;

        tree[p].lazyTime = 1ll;
    }

    int mid = cl + ((cr - cl) >> 1);

    if (tree[p].lazyPlus) {
        tree[l].d += tree[p].lazyPlus * (mid - cl + 1);
        tree[l].d %= mo;
        tree[r].d += tree[p].lazyPlus * (cr - mid);
        tree[r].d %= mo;
        tree[l].lazyPlus += tree[p].lazyPlus;
        tree[l].lazyPlus %= mo;
        tree[r].lazyPlus += tree[p].lazyPlus;
        tree[r].lazyPlus %= mo;
        tree[p].lazyPlus = 0ll;
    }
}

void updateTime(int l, int r, int cl, int cr, int p, ll x) {
    // 给区间[l,r]的每个数都乘上x
    if (cl >= l && cr <= r) {
        tree[p].lazyTime *= x;
        tree[p].lazyTime %= mo;
        tree[p].lazyPlus *= x;
        tree[p].lazyPlus %= mo;
        tree[p].d *= x;
        tree[p].d %= mo;
        return;
    }

    pd(cl, cr, p);

    int mid = cl + ((cr - cl) >> 1);
    if (mid >= l)updateTime(l, r, cl, mid, p << 1, x);
    if (mid < r)updateTime(l, r, mid + 1, cr, (p << 1) | 1, x);

    tree[p].d = (tree[p << 1].d + tree[(p << 1) | 1].d) % mo;
}

void updatePlus(int l, int r, int cl, int cr, int p, ll x) {
    // 给区间[l,r]的每个数都加上x
    if (cl >= l && cr <= r) {
        tree[p].d += (cr - cl + 1) * x;
        tree[p].d %= mo;
        tree[p].lazyPlus += x;
        tree[p].lazyPlus %= mo;
        return;
    }

    pd(cl, cr, p);

    int mid = cl + ((cr - cl) >> 1);
    if (mid >= l)updatePlus(l, r, cl, mid, p << 1, x);
    if (mid < r)updatePlus(l, r, mid + 1, cr, (p << 1) | 1, x);

    tree[p].d = (tree[p << 1].d + tree[(p << 1) | 1].d) % mo;
}

ll getsum(int l, int r, int cl, int cr, int p) {
    if (cl >= l && cr <= r)return tree[p].d;

    int mid = cl + ((cr - cl) >> 1);

    pd(cl, cr, p);

    ll sum = 0ll;
    if (mid >= l)
        sum += getsum(l, r, cl, mid, p << 1);
    sum %= mo;
    if (mid < r)
        sum += getsum(l, r, mid + 1, cr, (p << 1) | 1);
    return sum % mo;
}

void solve() {
    int n, q;cin >> n >> q >> mo;
    for (int i = 1;i <= n;i++)
        cin >> a[i];
    build(1, n, 1);
    while (q--) {
        int op;cin >> op;
        if (op == 1) {
            int x, y;ll k;
            cin >> x >> y >> k;
            updateTime(x, y, 1, n, 1, k);
        }
        else if (op == 2) {
            int x, y;ll k;
            cin >> x >> y >> k;
            updatePlus(x, y, 1, n, 1, k);
        }
        else {
            int x, y;cin >> x >> y;
            cout << getsum(x, y, 1, n, 1) << '\n';
        }
    }
}

int main() {
    int _ = 1;
    // cin >> _;cin.get();
    while (_--)
        solve();
}
```

## 动态开点

一般来说，线段树处理的范围在$[1,n]$，$n$一般是$1e5$的大小。

如果我们想处理负数的范围，或者是$n$达到$1e9$的数量级时，我们就需要可以动态开点的线段树。

线段树我们一般开到$4n$的大小是充足的，为了节省空间以及直接建立全树的时间，我们也可以对线段树动态开点，也就是只有当我们需要用到某些节点的时候，才去创造它。

比如，我们已经一个节点表示$[11,16]$的相关数据，我们需要修改$[13,15]$上的信息，我们就创造$[11,13]$和$[14,16]$的节点，并继续递归创建节点，直到这个线段树可以完全表示到已被修改的信息。

### 实现

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxv = 8e6;  // 一般有多大开多大

/*
线段树模板3：动态开点技巧
*/
struct segTreeNode {
    ll d, lazy;
    int lson, rson; // 记录左右子的下标
};

vector<segTreeNode>tree(maxv);
int tot = 1;    // 总节点数

void update(int cl, int cr, int& p, ll addnum) {
    if (!p)p = ++tot;
    tree[p].d += addnum * (cr - cl + 1);
    tree[p].lazy += addnum;
}

void pushdown(int p, int cl, int cr) {  // 节点p没有左右子时给它开点。
    if (cr - cl + 1 <= 1)return;
    int mid = (cr + cl - 1) >> 1;
    update(cl, mid, tree[p].lson, tree[p].lazy);
    update(mid + 1, cr, tree[p].rson, tree[p].lazy);
    tree[p].lazy = 0;
}

void updatePlus(int l, int r, int cl, int cr, int p, ll x) {
    // 给区间[l,r]里每个数加x
    if (cl >= l && cr <= r) {
        tree[p].d += x * (cr - cl + 1);
        tree[p].lazy += x;
        return;
    }
    pushdown(p, cl, cr);
    int mid = (cl + cr - 1) >> 1;
    if (mid >= l)updatePlus(l, r, cl, mid, tree[p].lson, x);
    if (mid < r)updatePlus(l, r, mid + 1, cr, tree[p].rson, x);

    int ls = tree[p].lson, rs = tree[p].rs;
    tree[p].d = tree[ls].d + tree[rs].d;
}

ll getsum(int l, int r, int cl, int cr, int p) {
    if (cl >= l && cr <= r)return tree[p].d;

    pushdown(p, cl, cr);
    int mid = (cl + cr - 1) / 2;  // 可以处理区间两端是负数的情况
    ll sum = 0ll;
    sum += getsum(l, r, cl, mid, tree[p].lson);
    sum += getsum(l, r, mid + 1, cr, tree[p].rson);
    return sum;
}

void solve() {
    ll n, q;cin >> n >> q;
    while (q--) {
        ll l, r, k;cin >> l >> r >> k;
        if(k==1){}
    }
}

int main() {
    int _ = 1;
    // cin >> _;cin.get();
    while (_--)
        solve();
}
```

## 线段树合并与分裂

### 线段树合并

线段树合并通过递归实现，需要有合并操作的线段树需要使用动态开点的技巧。

将线段树 a 和 b 合并，从 1 号点开始递归，若递归到某个节点为空，直接返回另一个树上的对应节点；若递归到叶子节点，我们合并两棵树上的对应节点。

```cpp
void pushup(int a) {
    int ls = tree[a].lson, rs = tree[a].rson;
    tree[a].d = tree[ls].d + tree[rs].d;
}

int merge(int a, int b, int l, int r) {
    if (!a)return b;
    if (!b)return a;
    if (l == r) {
        // do sth
        return a;
    }

    int mid = (l + r) >> 1;
    tree[a].lson = merge(tree[a].lson, tree[b].lson, l, mid);
    tree[a].rson = merge(tree[a].rson, tree[b].rson, mid + 1, r);

    pushup(a);
    return a;
}
```

模板题：[P4556 [Vani 有约会\] 雨天的尾巴 /【模板】线段树合并 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P4556)

### 线段树分裂

线段树分裂是线段树合并的逆过程。

线段树分裂只适用于有序的序列，无序的序列是没有意义的，常用在动态开点的权值线段树上。

当分裂和合并都存在时，要注意回收节点，以免分裂时会出现节点重复/占用的问题。

1. 当$[s,t]$与$[l,r]$有交集时开新节点
2. 当$[s,t]$包含于$[l,r]$时，直接将当前节点接到新的树下面，把旧边断开。

```cpp
void pushup(int a) {
    int ls = tree[a].lson, rs = tree[a].rson;
    tree[a].d = tree[ls].d + tree[rs].d;
}

void split(int& p, int& q, int s, int t, int l, int r) {
    // 从[s,t]的线段树中分裂出区间是[l,r]的线段树
    if (t < l || r < s) return;
    if (!p) return;
    if (l <= s && t <= r) {
        q = p;
        p = 0;
        return;
    }
    if (!q) q = ++tot;
    int m = s + t >> 1;
    if (l <= m) split(tree[p].lson, tree[p].rson, s, m, l, r);
    if (m < r) split(tree[p].lson, tree[p].rson, m + 1, t, l, r);
    pushup(p);
    pushup(q);
}
```

模板题：[P5494 【模板】线段树分裂 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P5494)

## 练习题一览

一些模板题/测测你的板子(!

[P3372 【模板】线段树 1 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3372)

[P3373 【模板】线段树 2 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3373)

[Problem - 5306 (hdu.edu.cn)](https://acm.hdu.edu.cn/showproblem.php?pid=5306)

[P4556 [Vani 有约会\] 雨天的尾巴 /【模板】线段树合并 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P4556)

[P5494 【模板】线段树分裂 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P5494)

[P4097 【模板】李超线段树 / [HEOI2013\] Segment - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P4097)

[P3369 【模板】普通平衡树 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3369)

[P3391 【模板】文艺平衡树 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3391)
