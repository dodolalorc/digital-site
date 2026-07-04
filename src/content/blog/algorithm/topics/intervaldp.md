---
title: "刷题记录||区间动态规划"
description: "区间动态规划刷题记录，整理石子合并、248G 等典型题的状态设计、转移思路与代码。"
date: "2024-09-11T21:50:26+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 动态规划
  - 区间DP
  - 刷题记录
categories:
  - 算法
series:
  - 动态规划专题
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

**区间动态规划一般以区间作为动态规划的阶段。**

## [P1880]石子合并

### 题目描述

在一个圆形操场的四周摆放 $N$ 堆石子，现要将石子有次序地合并成一堆，规定每次只能选相邻的 $2$ 堆合并成新的一堆，并将新的一堆的石子数，记为该次合并的得分。

试设计出一个算法,计算出将 $N$ 堆石子合并成 $1$ 堆的最小得分和最大得分。

**输入格式**

数据的第 $1$ 行是正整数 $N$，表示有 $N$ 堆石子。

第 $2$ 行有 $N$ 个整数，第 $i$ 个整数 $a_i$ 表示第 $i$ 堆石子的个数。

**输出格式**

输出共 $2$ 行，第 $1$ 行为最小得分，第 $2$ 行为最大得分。

**样例 #1**

样例输入 #1

```plaintext
4
4 5 9 4
```

样例输出 #1

```plaintext
43
54
```

**提示**

$1\leq N\leq 100$，$0\leq a_i\leq 20$​。

### 思路

考虑状态转移：

每次合并区间$[l,r]$时，可以由区间$[l,k]$和$[k+1,r]$的状态转移过来，记$f(i,j)$是合并区间$[i,j]$的最大得分，$sum(i,j)$是合并$[i,j]$的得分，则有：

$$
f(i,j)=max(f(i,j),f(i,k)+f(k+1,j)+sum(i,j))
$$

此题考虑到是环形数组，可以将数组复制一倍，枚举区间长度是$n$的最优值。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int, int> pii;
const int maxn = 250;
const int mo109 = 1000000007;

ll a[maxn];
ll f1[maxn][maxn], f2[maxn][maxn];

ll pre[maxn];

ll sum(int l, int r) {
    return pre[r] - pre[l - 1];
}

void solve() {
    int n;cin >> n;
    pre[0] = 0;
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
        pre[i] = a[i] + pre[i - 1];
    }
    for (int i = n + 1;i <= 2 * n;i++) {
        pre[i] = a[i - n] + pre[i - 1];
    }

    for (int i = 0;i <= 2 * n;i++) {
        for (int j = 0;j <= 2 * n;j++) {
            f2[i][j] = f1[i][j] = 0;
        }
    }
    for (int len = 1;len <= n;len++) {
        for (int i = 1;i + len <= 2 * n;i++) {
            int j = len + i - 1;
            for (int k = i;k < j;k++) {
                if (!f1[i][j])f1[i][j] = f1[i][k] + f1[k + 1][j] + sum(i, j);
                else f1[i][j] = min(f1[i][j], f1[i][k] + f1[k + 1][j] + sum(i, j));
                f2[i][j] = max(f2[i][j], f2[i][k] + f2[k + 1][j] + sum(i, j));
            }
        }
    }
    ll mx = 0, mn = 1e18;
    for (int i = 1;i <= n;i++) {
        int j = i + n - 1;
        mx = max(mx, f2[i][j]);
        mn = min(mn, f1[i][j]);
    }
    cout << mn << '\n' << mx << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```

## [P3146]248G

### 题面翻译

给定一个 $1\ \times n$ 的地图，在里面玩 $2048$，每次可以合并相邻两个（数值范围 $1\sim 40$），问序列中出现的最大数字的值最大是多少。注意合并后的数值并非加倍而是 $+1$，例如 $2$ 与 $2$ 合并后的数值为 $3$。

### 题目描述

Bessie likes downloading games to play on her cell phone, even though she doesfind the small touch screen rather cumbersome to use with her large hooves.

She is particularly intrigued by the current game she is playing.The game starts with a sequence of $N$ positive integers ($2 \leq N\leq 248$), each in the range $1 \ldots 40$. In one move, Bessie cantake two adjacent numbers with equal values and replace them a singlenumber of value one greater (e.g., she might replace two adjacent 7swith an 8). The goal is to maximize the value of the largest numberpresent in the sequence at the end of the game. Please help Bessiescore as highly as possible!

**输入格式**

The first line of input contains $N$, and the next $N$ lines give the sequence

of $N$ numbers at the start of the game.

**输出格式**

Please output the largest integer Bessie can generate.

**样例 #1**

样例输入 #1

```plaintext
4
1
1
1
2
```

样例输出 #1

```plaintext
3
```

**提示**

In this example shown here, Bessie first merges the second and third 1s to

obtain the sequence 1 2 2, and then she merges the 2s into a 3. Note that it is

not optimal to join the first two 1s.

### 思路

区间dp，考虑转移：

$$
f(i,j)=f(i,k)+1\quad when:f(i,k)=f(k+1,j)
$$

同时要保证$f(i,k)$和$f(k+1,j)$在向$f(i,j)$转移之前，已经进行了"合并"。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int, int> pii;
const int maxn = 550;
const int mo109 = 1000000007;

int a[maxn];
int f[maxn][maxn];
void solve() {
    int n;cin >> n;
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
    }
    for (int i = 0;i <= n;i++) {
        for (int j = 0;j <= n;j++) {
            f[i][j] = 0;
        }
        if (i)
            f[i][i] = a[i];
    }
    for (int len = 1;len <= n;len++) {
        for (int i = 1;i + len - 1 <= n;i++) {
            int j = i + len - 1;
            for (int k = i;k + 1 <= j;k++) {
                if (f[i][k] == f[k + 1][j] && f[i][k]) {
                    f[i][j] = max(f[i][j], f[i][k] + 1);
                }
            }
        }
    }
    int ans = a[1];
    for (int i = 1;i <= n;i++) {
        for (int j = i;j <= n;j++) {
            ans = max(ans, f[i][j]);
        }
    }
    cout << ans << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```

## [NOIP2006 提高组] 能量项链

### 题目描述

在 Mars 星球上，每个 Mars 人都随身佩带着一串能量项链。在项链上有 $N$ 颗能量珠。能量珠是一颗有头标记与尾标记的珠子，这些标记对应着某个正整数。并且，对于相邻的两颗珠子，前一颗珠子的尾标记一定等于后一颗珠子的头标记。因为只有这样，通过吸盘（吸盘是 Mars 人吸收能量的一种器官）的作用，这两颗珠子才能聚合成一颗珠子，同时释放出可以被吸盘吸收的能量。如果前一颗能量珠的头标记为 $m$，尾标记为 $r$，后一颗能量珠的头标记为 $r$，尾标记为 $n$，则聚合后释放的能量为 $m \times r \times n$（Mars 单位），新产生的珠子的头标记为 $m$，尾标记为 $n$。

需要时，Mars 人就用吸盘夹住相邻的两颗珠子，通过聚合得到能量，直到项链上只剩下一颗珠子为止。显然，不同的聚合顺序得到的总能量是不同的，请你设计一个聚合顺序，使一串项链释放出的总能量最大。

例如：设 $N=4$，$4$ 颗珠子的头标记与尾标记依次为 $(2,3)(3,5)(5,10)(10,2)$。我们用记号 $\oplus$ 表示两颗珠子的聚合操作，$(j \oplus k)$ 表示第 $j,k$ 两颗珠子聚合后所释放的能量。则第 $4$，$1$ 两颗珠子聚合后释放的能量为：

$(4 \oplus 1)=10 \times 2 \times 3=60$。

这一串项链可以得到最优值的一个聚合顺序所释放的总能量为：

$(((4 \oplus 1) \oplus 2) \oplus 3)=10 \times 2 \times 3+10 \times 3 \times 5+10 \times 5 \times 10=710$。

**输入格式**

第一行是一个正整数 $N$（$4 \le N \le 100$），表示项链上珠子的个数。第二行是 $N$ 个用空格隔开的正整数，所有的数均不超过 $1000$。第 $i$ 个数为第 $i$ 颗珠子的头标记（$1 \le i \le N$），当 $i<N$ 时，第 $i$ 颗珠子的尾标记应该等于第 $i+1$ 颗珠子的头标记。第 $N$ 颗珠子的尾标记应该等于第 $1$ 颗珠子的头标记。

至于珠子的顺序，你可以这样确定：将项链放到桌面上，不要出现交叉，随意指定第一颗珠子，然后按顺时针方向确定其他珠子的顺序。

**输出格式**

一个正整数 $E$（$E\le 2.1 \times 10^9$），为一个最优聚合顺序所释放的总能量。

**样例 #1**

样例输入 #1

```
4
2 3 5 10
```

样例输出 #1

```
710
```

**提示**

NOIP 2006 提高组 第一题

### 思路

将数组处理成环形数组，考虑转移：

$$
f(i,j)=max(f(i,j),f(i,k)+f(k+1,j)+head[i]\times tail[k]\times tail[j])
$$

枚举长度为$n$的区间，获得最大值。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int, int> pii;
const int maxn = 550;
const int mo109 = 1000000007;

ll h[maxn], t[maxn];
ll f[maxn][maxn];
void solve() {
    int n;cin >> n;
    for (int i = 1;i <= n;i++) {
        cin >> h[i];
        t[i - 1] = h[i];
    }
    for (int i = n + 1;i <= 2 * n;i++) {
        h[i] = h[i - n];
        t[i - 1] = t[i - 1 - n];
    }
    t[2 * n] = t[n];

    for (int i = 0;i <= 2 * n;i++) {
        for (int j = 0;j <= 2 * n;j++) {
            f[i][j] = 0;
        }
    }

    for (int len = 1;len <= n;len++) {
        for (int i = 1;i + len - 1 <= 2 * n;i++) {
            int j = i + len - 1;
            for (int k = i;k + 1 <= j;k++) {
                f[i][j] = max(f[i][j], f[i][k] + f[k + 1][j] + h[i] * t[k] * t[j]);
            }
        }
    }
    ll ans = 0;
    for (int i = 1;i <= n;i++) {
        int j = i + n - 1;
        ans = max(ans, f[i][j]);
    }
    cout << ans << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```

## [NOIP2007 提高组] 矩阵取数游戏

### 题目描述

帅帅经常跟同学玩一个矩阵取数游戏：对于一个给定的 $n \times m$ 的矩阵，矩阵中的每个元素 $a_{i,j}$ 均为非负整数。游戏规则如下：

1. 每次取数时须从每行各取走一个元素，共 $n$ 个。经过 $m$ 次后取完矩阵内所有元素；
2. 每次取走的各个元素只能是该元素所在行的行首或行尾；
3. 每次取数都有一个得分值，为每行取数的得分之和，每行取数的得分 = 被取走的元素值 $\times 2^i$，其中 $i$ 表示第 $i$ 次取数（从 $1$ 开始编号）；
4. 游戏结束总得分为 $m$ 次取数得分之和。

帅帅想请你帮忙写一个程序，对于任意矩阵，可以求出取数后的最大得分。

**输入格式**

输入文件包括 $n+1$ 行：

第一行为两个用空格隔开的整数 $n$ 和 $m$。

第 $2\sim n+1$ 行为 $n \times m$ 矩阵，其中每行有 $m$ 个用单个空格隔开的非负整数。

**输出格式**

输出文件仅包含 $1$ 行，为一个整数，即输入矩阵取数后的最大得分。

**样例 #1**

样例输入 #1

```
2 3
1 2 3
3 4 2
```

样例输出 #1

```
82
```

**提示**

**【数据范围】**

对于 $60\%$ 的数据，满足 $1\le n,m\le 30$，答案不超过 $10^{16}$。  
对于 $100\%$ 的数据，满足 $1\le n,m\le 80$，$0\le a_{i,j}\le1000$。

**【题目来源】**

NOIP 2007 提高第三题。

### 思路

设置$f(i,j)$表示取区间$[i,j]$获得的最大得分，根据题意可知，每行的最大值之间并不相关，可以分别计算每行取数得分的最大值再相加，注意此题涉及到高精度。

考虑转移：

$f(i,j)$可以由两种状态转移而来，一种是先取$a[i]$，再取$f(i+1,j)$，这时的得分是$f(i+1,j)\times 2 + a[i]\times 2$；另一种是先取$a[j]$，再取$f(i,j-1)$，这时的得分是$f(i,j-1)\times 2+a[j]\times 2$。两者取较大值即可。

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int, int> pii;
const int maxn = 550;
const int mo109 = 1000000007;
const ll mo118 = 1e18;

struct int128 {
    ll hig, low;
    int128 operator+(const int128& b)const {
        int128 k = { 0ll,0ll };
        k.low = low + b.low;
        k.hig = k.low / mo118 + hig + b.hig;
        k.low %= mo118;
        return k;
    }
    int128 operator*(const int& b)const {
        int128 k = { 0ll,0ll };
        k.low = b * low;
        k.hig = k.low / mo118 + hig * b;
        k.low %= mo118;
        return k;
    }
    void output() {
        if (!hig)cout << low;
        else cout << hig << setw(18) << setfill('0') << low;
    }
};

bool leq(int128 a, int128 b) {
    if (a.hig != b.hig)return a.hig < b.hig;
    return a.low < b.low;
}

int128 a[maxn][maxn];
int128 f[maxn][maxn];
void solve() {
    int n, m;cin >> n >> m;
    for (int i = 1;i <= n;i++) {
        for (int j = 1;j <= m;j++) {
            cin >> a[i][j].low;
            a[i][j].hig = 0ll;
        }
    }

    int128 ans = { 0ll,0ll };
    for (int ni = 1;ni <= n;ni++) {
        for (int i = 1;i <= m;i++) {
            for (int j = 1;j <= m;j++) {
                f[i][j] = { 0ll,0ll };
            }
        }

        for (int len = 1;len <= m;len++) {
            for (int i = 1;i + len - 1 <= m;i++) {
                int j = i + len - 1;
                int128 na = (f[i + 1][j] + a[ni][i]) * 2;
                int128 nb = (f[i][j - 1] + a[ni][j]) * 2;
                f[i][j] = max(na, nb, leq);
            }
        }
        ans = ans + f[1][m];
    }
    ans.output();
}

int main() {
    // ios::sync_with_stdio(false);
    // cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```

## [CQOI2007] 涂色

### 题目描述

假设你有一条长度为 $5$ 的木板，初始时没有涂过任何颜色。你希望把它的 $5$ 个单位长度分别涂上红、绿、蓝、绿、红色，用一个长度为 $5$ 的字符串表示这个目标：$\texttt{RGBGR}$。

每次你可以把一段连续的木板涂成一个给定的颜色，后涂的颜色覆盖先涂的颜色。例如第一次把木板涂成 $\texttt{RRRRR}$，第二次涂成 $\texttt{RGGGR}$，第三次涂成 $\texttt{RGBGR}$，达到目标。

用尽量少的涂色次数达到目标。

**输入格式**

输入仅一行，包含一个长度为 $n$ 的字符串，即涂色目标。字符串中的每个字符都是一个大写字母，不同的字母代表不同颜色，相同的字母代表相同颜色。

**输出格式**

仅一行，包含一个数，即最少的涂色次数。

**样例 #1**

样例输入 #1

```
AAAAA
```

样例输出 #1

```
1
```

**样例 #2**

样例输入 #2

```
RGBGR
```

样例输出 #2

```
3
```

**提示**

$40\%$ 的数据满足 $1\le n\le 10$。

$100\%$ 的数据满足 $1\le n\le 50$。

### 思路

设$f(i,j)$表示完成区间$[i,j]$的最小涂色次数。取$i\leq k\lt j$则$f(i,j)$可以由$f(i,k)$和$f(k+1,j)$合并转移而来，转移时，若$s[k]=s[k+1]$，显然在区间$[i,k]$中涂位置$k$和涂位置$k+1$可以是同一步操作；若$s[i]=s[j]$，则涂位置$i$和$j$也可以是同一步操作，则转移方程如下：

$$
f(i,j)=f(i,k)+f(k+1,j)-(s[i]==s[j] \or s[k]==s[k+1])
$$

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int, int> pii;
const int maxn = 550;
const int mo109 = 1000000007;
const ll mo118 = 1e18;

ll f[maxn][maxn];
void solve() {
    string s;cin >> s;
    int n = s.size();
    s = " " + s;
    for (int i = 1;i <= n;i++) {
        for (int j = 1;j <= n;j++) {
            f[i][j] = 1e18;
        }
        f[i][i] = 1;
    }
    for (int len = 1;len <= n;len++) {
        for (int i = 1;i + len - 1 <= n;i++) {
            int j = i + len - 1;
            // f[i][j]:完成[i,j]区间涂色的最小涂色次数
            for (int k = i;k + 1 <= j;k++) {
                if (s[k] == s[k + 1] || s[i] == s[j])
                    f[i][j] = min(f[i][j], f[i][k] + f[k + 1][j] - 1);
                else
                    f[i][j] = min(f[i][j], f[i][k] + f[k + 1][j]);
            }
        }
    }
    cout << f[1][n] << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```

## [SCOI2003] 字符串折叠

### 题目描述

折叠的定义如下：

1. 一个字符串可以看成它自身的折叠。记作 `S = S`

2. `X(S)` 是 $X$ 个 `S` 连接在一起的串的折叠。记作 `X(S) = SSSS…S`。

3. 如果 `A = A’`, `B = B’`，则 `AB = A’B’ `。例如：因为 `3(A) = AAA`, `2(B) = BB`，所以 `3(A)C2(B) = AAACBB`，而 `2(3(A)C)2(B) = AAACAAACBB`

给一个字符串，求它的最短折叠。

例如 `AAAAAAAAAABABABCCD` 的最短折叠为：`9(A)3(AB)CCD`。

**输入格式**

仅一行，即字符串 `S`，长度保证不超过 $100$。

**输出格式**

仅一行，即最短的折叠长度。

**样例 #1**

样例输入 #1

```
NEERCYESYESYESNEERCYESYESYES
```

样例输出 #1

```
14
```

**提示**

一个最短的折叠为：`2(NEERC3(YES))`

### 思路

设$f(i,j)$是区间$[i,j]$折叠之后的最短长度，如果区间$[i,j]$可以被折叠，则状态转移：

$$
f(i,j)=max(f(i,j),f(i,k)+2+Len((j-i+1)/(k-i+1)))
$$

### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int, int> pii;
const int maxn = 550;
const int mo109 = 1000000007;
const ll mo118 = 1e18;

string s;
int n;
ll f[maxn][maxn];
ll ff[maxn][maxn];

int Len(int x) {
    if (x == 1)return -2;
    int res = 0;
    while (x) {
        res++;
        x /= 10;
    }
    return res;
}

bool check(int l, int r, int p) {
    for (int i = l + p;i <= r;i++) {
        if (s[i] == s[(i - l) % p + l])continue;
        return false;
    }
    return true;
}

void solve() {
    cin >> s;
    n = s.size();
    s = " " + s;
    for (int i = 1;i <= n;i++) {
        for (int j = 1;j <= n;j++) {
            f[i][j] = max(0, j - i + 1); // S=S'
        }
        f[i][i] = 1;
    }

    for (int len = 2;len <= n;len++) { // 区间长度是len
        for (int i = 1;i + len - 1 <= n;i++) {
            int j = i + len - 1;
            for (int k = i;k + 1 <= j;k++) {
                f[i][j] = min(f[i][j], f[i][k] + f[k + 1][j]);
            }
            for (int d = 1;d + i - 1 < j;d++) {
                if (len % d)continue;
                // [i,j]按照长度d进行折叠
                int k = d + i - 1;
                if (check(i, j, d)) {
                    f[i][j] = min(f[i][j], f[i][k] + 2 + Len(len / d));
                }
            }
        }
    }

    cout << f[1][n] << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```
