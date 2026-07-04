---
title: "线段树模板"
description: "线段树模板笔记，整理线段树的基本结构、建树和常用查询修改实现。"
date: "2024-01-06T21:53:21+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 数据结构
  - 线段树
  - 模板
categories:
  - 算法
series:
  - 线段树专题
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

### 线段树(segment tree)

线段树主要用于维护区间信息，与传统的树状数组相比，可以实现`O(log n)`的区间修改，还可以同时支持多种操作(加、乘)，更具通用性。

还是一样，为了方便测试，我们引入一个例题中的数据来演示。

#### 【模板】线段树

题目链接：[线段树 1](#[P3372 【模板】线段树 1 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3372))

> ==题目描述==
>
> 如题，已知一个数列，你需要进行下面两种操作：
>
> 1. 将某区间每一个数加上 $k$。
> 2. 求出某区间每一个数的和。
>
> ==输入格式==
>
> 第一行包含两个整数 $n, m$，分别表示该数列数字的个数和操作的总个数。
>
> 第二行包含 $n$ 个用空格分隔的整数，其中第 $i$ 个数字表示数列第 $i$ 项的初始值。
>
> 接下来 $m$ 行每行包含 $3$ 或 $4$ 个整数，表示一个操作，具体如下：
>
> 1. `1 x y k`：将区间 $[x, y]$ 内每个数加上 $k$。
> 2. `2 x y`：输出区间 $[x, y]$ 内每个数的和。
>
> ==输出格式==
>
> 输出包含若干行整数，即为所有操作 2 的结果。
>
> ==样例 #1==
>
> <u>样例输入</u> #1
>
> ```plaintext
> 5 5
> 1 5 4 2 3
> 2 2 4
> 1 2 3 2
> 2 3 4
> 1 1 5 1
> 2 1 4
> ```
>
> <u>样例输出</u> #1
>
> ```plaintext
> 11
> 8
> 20
> ```
>
> ==提示==
>
> 对于 $30\%$ 的数据：$n \le 8$，$m \le 10$。
> 对于 $70\%$ 的数据：$n \le {10}^3$，$m \le {10}^4$。
> 对于 $100\%$ 的数据：$1 \le n, m \le {10}^5$。
>
> 保证任意时刻数列中所有元素的绝对值之和 $\le {10}^{18}$。
>
> **【样例解释】**
>
> ![](https://cdn.luogu.com.cn/upload/pic/2251.png)

#### 线段树的建立

线段树的每个节点对应一个区间，最小的区间(最底下的叶子)只包含1个数，从node=1(根节点)往下逐渐二分，且每一层的区间并不重合。

我们如此设置节点（简单概念）：

每个节点p的左右子节点分别是2p和2p+1，假如节点p储存的是[l, r]的和，我们取mid=(l+r)/2 （一般就是向下取整啦，数组从索引0开始）则其子节点恰是分别储存[l, mid]和[mid+1, r]的和，可以发现这样可以使得做节点对应的区间长度恰好与右节点对应的区间长度相同或恰好多1。

草履虫都会的递归建图：

```cpp
// 简单的建树过程
void buildtree(ll l, ll r, ll p) {
	if (l == r)
		// 二分到终点了，给线段树的叶子节点赋值为a[l]
		tree[p] = a[l];
	else {
		ll mid = (l + r) / 2;

		// 先创造左节点p*2
		buildtree(l, mid, p * 2);
		// 再创造右节点p*2+1
		buildtree(mid + 1, r, p * 2 + 1);

		// 左右节点创造完毕之后给他们的父节点，也就是本轮递归中的p节点赋值
		tree[p] = tree[p * 2] + tree[p * 2 + 1];
	}
}
```

#### 如何更新数据？

朴素的想法或许是在改变数组中的某值之后再次递归来同步线段树，就像建树过程一样，但可以预见的是，这样做的时间复杂度比较高，因为当数组中的某值改变，我们需要update的节点是叶子节点，修改一个点会需要连锁修改上方所有包含该点的父节点、祖节点...etc，所以我们引入==懒标记法==进行线段树的区间修改。

##### 懒标记（延迟标记）

这是线段树的精髓所在qwq，递归的复杂度主要在于一层套一层然后再一层一层出来，有没有一种可能，我们给我们要修改的区间(将会对应一个唯一的节点)做上标记，只需要在将来用到某个节点的时候将变化传递下去就行。这样将会大大减少我们的时间。

相当于啊，本来某个变化是变动整个树来更新的，现在我们懒一懒，把工作做到确定哪些区间是全部变化了的，给它标记上（带上变化的内容），只有等到需要找它的子区间的时候才把变化落实下去。

还是看代码来理解吧：

```cpp
void update(ll l, ll r, ll curl, ll curr, ll addnum, ll curpos) {
	// 从目标的区间(要更新的范围)[l, r]开始
	// 当前操作的区间是[curl, curr](对应curpos)
	// 要做的操作是加一个数addnum(显然同理也可以是其他操作)
	if (curl > r || curr < l)
		// 当前要操作的区间和大区间没有交集，剪枝
		return;
	else if (curl >= l && curr <= r) {
		// 当前区间完全包含在大区间里
		tree[curpos] += (curr - curl + 1) * addnum;

		if (curl != curr)
			// 不是叶子节点，则标记它
			mark[curpos] += addnum;

		// 这里就很懒标记了qwq
	}
	else {
		// 有交集但不包含，则需要再分出包含的部分和不包含的部分进行update

		// 因为当前区间点已经不能实现代表它下面的所有小弟啦，所以我们把原来有的标记往下传递一层，也就是分开，直到分到区间都是:要么都有变化，要么都不变化

		// 将标记点向下传递
		mark[curpos * 2] += mark[curpos];
		mark[curpos * 2 + 1] += mark[curpos];

		// 接下来往下更新一层
		ll mid = (curl + curr) / 2;
		tree[curpos * 2] += mark[curpos] * (mid - curl + 1);
		tree[curpos * 2 + 1] += mark[curpos] * (curr - mid);

		// 清除当前的区间点的标记（因为已经下达了）
		mark[curpos] = 0;	// 这里改成0是因为我们假设的操作变化是加法，如果是乘法呢做法相似

		// 将懒标记递归下去
		update(l, r, curl, mid, addnum, curpos * 2);	// 左
		update(l, r, mid + 1, curr, addnum, curpos * 2 + 1);	// 右

		// 传递结束之后更新当前节点的值(变化到这)
		tree[curpos] = tree[curpos * 2] + tree[curpos * 2 + 1];
	}
}
```

整个过程看着还是有递归，但是并不像建树时一样递归到底层才结束，我们在中间随时可以结束，只要找到一个可以代表它下面的所有小弟的大哥，然后告诉大哥要这样...那样...然后我们的任务就完成了，意思已经传达到了。

那么如何把我们的标记翻译下去呢，这个就更简单了，我们上面使用了一个`mark[]`数组记录变化，我们只需要吧mark里的指令传递到目标即可。

```cpp
// 将mark[]里要落实到底的指令落实下去
void impleMarks(ll pos, ll len) {
	// 实现目标：把mark[pos]里的指令向下传递一层
	// 方便起见我们把pos对应的区间长度也传入，在使用这个函数的时候直接将curr-curl+1传入len即可
	mark[pos * 2] += mark[pos];	// 左
	mark[pos * 2 + 1] += mark[pos];	// 右
	tree[pos * 2] += mark[pos] * (len - len / 2);
	tree[pos * 2 + 1] += mark[pos] * (len / 2);
	// 右边区间可能短一点，这会和最初生成线段树时结余出的地方一致，所以影响不大

	mark[pos] = 0;
}
```

接下来，我们如果想要更新到所有叶子结点，只要调用这个落实函数就好。

#### 查询区间

上面我们已经有了修改区间的方法，其实查询已经讲进去了吧，<del>不会查怎么做修改</del>

简单的写一个模板函数：

```cpp
// 查询区间里的数据（也就是查询节点里的数据）
ll ask(ll l, ll r, ll pos, ll curl, ll curr) {
	// 目标区间和已经在查的区间，以及对应在线段树里的坐标
	if (curl > r || curr < l)
		// 现在在查的不在大区间里
		return 0;
	else if (curl >= l && curr <= r)
		// 当前查的区间就在待查区间里，返回值
		return tree[pos];
	else {
		// 进行二分
		ll mid = (curl + curr) / 2;
		// 把当前节点的更新信息往下传递一层
		impleMarks(pos, curr - curl + 1);
		// 返回左右查询信息的和
		return ask(l, r, pos * 2, curl, mid) + ask(l, r, pos * 2 + 1, mid + 1, curr);
	}
}
```

最后给上例题的参考代码：

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn = 1e5 + 50, maxm = 1e5 + 50;
ll a[maxn];

ll tree[maxn * 4];	// 一般线段树的大小开到原数组范围的4倍应该差不多了

// 简单的建树过程
void buildtree(ll l, ll r, ll p) {
	if (l == r)
		// 二分到终点了，给线段树的叶子节点赋值为a[l]
		tree[p] = a[l];
	else {
		ll mid = (l + r) / 2;

		// 先创造左节点p*2
		buildtree(l, mid, p * 2);
		// 再创造右节点p*2+1
		buildtree(mid + 1, r, p * 2 + 1);

		// 左右节点创造完毕之后给他们的父节点，也就是本轮递归中的p节点赋值
		tree[p] = tree[p * 2] + tree[p * 2 + 1];
	}
}

ll mark[maxn * 4];

void update(ll l, ll r, ll curl, ll curr, ll addnum, ll curpos) {
	// 从目标的区间(要更新的范围)[l, r]开始
	// 当前操作的区间是[curl, curr](对应curpos)
	// 要做的操作是加一个数addnum(显然同理也可以是其他操作)
	if (curl > r || curr < l)
		// 当前要操作的区间和大区间没有交集，剪枝
		return;
	else if (curl >= l && curr <= r) {
		// 当前区间完全包含在大区间里
		tree[curpos] += (curr - curl + 1) * addnum;

		if (curl != curr)
			// 不是叶子节点，则标记它
			mark[curpos] += addnum;

		// 这里就很懒标记了qwq
	}
	else {
		// 有交集但不包含，则需要再分出包含的部分和不包含的部分进行update

		// 因为当前区间点已经不能实现代表它下面的所有小弟啦，所以我们把原来有的标记往下传递一层，也就是分开，直到分到区间都是:要么都有变化，要么都不变化

		// 将标记点向下传递
		mark[curpos * 2] += mark[curpos];
		mark[curpos * 2 + 1] += mark[curpos];

		// 接下来往下更新一层
		ll mid = (curl + curr) / 2;
		tree[curpos * 2] += mark[curpos] * (mid - curl + 1);
		tree[curpos * 2 + 1] += mark[curpos] * (curr - mid);

		// 清除当前的区间点的标记（因为已经下达了）
		mark[curpos] = 0;	// 这里改成0是因为我们假设的操作变化是加法，如果是乘法呢做法相似

		// 将懒标记递归下去
		update(l, r, curl, mid, addnum, curpos * 2);	// 左
		update(l, r, mid + 1, curr, addnum, curpos * 2 + 1);	// 右

		// 传递结束之后更新当前节点的值(变化到这)
		tree[curpos] = tree[curpos * 2] + tree[curpos * 2 + 1];
	}
}

// 将mark[]里要落实到底的指令落实下去
void impleMarks(ll pos, ll len) {
	// 实现目标：把mark[pos]里的指令向下传递一层
	// 方便起见我们把pos对应的区间长度也传入，在使用这个函数的时候直接将curr-curl+1传入len即可
	mark[pos * 2] += mark[pos];	// 左
	mark[pos * 2 + 1] += mark[pos];	// 右
	tree[pos * 2] += mark[pos] * (len - len / 2);
	tree[pos * 2 + 1] += mark[pos] * (len / 2);
	// 右边区间可能短一点，这会和最初生成线段树时结余出的地方一致，所以影响不大

	mark[pos] = 0;
}

// 查询区间里的数据（也就是查询节点里的数据）
ll ask(ll l, ll r, ll pos, ll curl, ll curr) {
	// 目标区间和已经在查的区间，以及对应在线段树里的坐标
	if (curl > r || curr < l)
		// 现在在查的不在大区间里
		return 0;
	else if (curl >= l && curr <= r)
		// 当前查的区间就在待查区间里，返回值
		return tree[pos];
	else {
		// 进行二分
		ll mid = (curl + curr) / 2;
		// 把当前节点的更新信息往下传递一层
		impleMarks(pos, curr - curl + 1);
		// 返回左右查询信息的和
		return ask(l, r, pos * 2, curl, mid) + ask(l, r, pos * 2 + 1, mid + 1, curr);
	}
}

int main() {
	// 读入数据
	ll n, m;cin >> n >> m;
	for (ll i = 1;i <= n;i++)cin >> a[i];

	// 用数据建树，从节点1（也就是根节点）开始递归
	buildtree(1, n, 1);

	while (m--) {

		int how;cin >> how;
		if (how == 1) {
			ll x, y, k;cin >> x >> y >> k;
			update(x, y, 1, n, k, 1);
		}
		else if (how == 2) {
			ll x, y;cin >> x >> y;
			cout << ask(x, y, 1, 1, n) << endl;
		}
	}

	return 0;
}
```
