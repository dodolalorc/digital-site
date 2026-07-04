---
title: "🎉2024牛客寒假营5||补题"
description: "2024 牛客寒假营第 5 场补题记录，整理质数合数、数组操作和排列构造等题目的解法。"
date: "2024-02-21T20:07:25+08:00"
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
  - 2024 牛客寒假营
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-mutsumi的质数合数

### 题意

一个由$n$个正整数组成的数组，求其中质数和合数共有几个。

#### 数据范围

$n(1\leq n\leq 100)$

$a_i(1\leq a_i\leq 100)$

### 思路

1不是质数也不是合数。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    int ans = 0;
    for (int i = 0;i < n;i++) {
        int x;cin >> x;
        if (x>1)ans++;
    }
    cout << ans << '\n';
}
```

## C-anon的私货

### 题意

给一个数组中一些位置插入$0$，要求插入后任意不是全$0$子段的平均值大于等于$1$，询问最多插入多少个$0$

#### 数据范围

$n(1\leq n\leq 10^5)$

$a_i(1\leq a_i\leq 10^9)$

### 思路

从第一位开始贪，统计在每一位前最多可以插入多少个0，考虑两数之间的0的数目不能大于这2位之间允许的最大值。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n + 2);
    vector<ll>b(n + 2);
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
        b[i] = a[i] - 1;
    }
    b[0] = 1e9 + 50;
    b[n + 1] = 1e9 + 50;
    ll ans = 0;

    for (int i = 0;i <= n;i++) {
        // for (int j = 0;j <= n + 1;j++)cout << b[j] << ' ';cout << endl;
        if (b[i] >= b[i + 1]) {
            ans += b[i + 1];
            ll tmp = b[i + 1];
            b[i + 1] = 0;
            b[i] -= tmp;
        }
        else {
            ans += b[i];
            ll tmp = b[i];
            b[i] = 0;
            b[i + 1] -= tmp;
        }
    }

    cout << ans << endl;
}
```

## E-soyorin的数组操作（easy）

### 题意

有一个长为$n$的数组$a$

操作：选择一个不超过$n$的偶数$k$，$a_i=a_i+i(1\leq i\leq k)$

询问是否能在任意操作后使得数组非降序。

#### 数据范围

$T(1≤T≤10^6)$

$n(1≤n≤10^5)$

$a_i(1\leq a_i\leq 10^{12})$

### 思路

操作的效果是使得$a_{i+1}-a{i}$的值增大1，从后往前遍历，将靠后的部分先操作为非降序（操作的效果会影响到前段）

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n + 1);
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
    }
    if (n % 2 == 0 || n == 1) {
        // 加個無窮次總能彌補不合適的地方
        cout << "YES\n";return;
    }

    // a(n-1)上限是a(n)，在這個上限下能不能把它變成需要的
    ll d = 0;   // 操作次數(對應相鄰兩個數之間的差距減少d(越靠後增加的越多
    for (int i = n - 1;i >= 1;i--) {
        if (a[i] > a[i + 1] + d) {
            cout << "NO\n";return;
        }
        if (i % 2 == 0)
            d += (a[i + 1] - a[i] + d) / i;
    }
    cout << "YES\n";
}
```

## G&H-sakiko的排列构造（easy/hard）

### 题意

构造一个长为$n$的排列，使得排列中每个$p_i+i(1\leq i\leq n)$都是质数。

输出符合要求的排列，若无解输出-1。

#### 数据范围

$n(1\leq n\leq 10^6)$

### 思路

排列是$1\sim n$的，下标也是$1\sim n$的，从$p_i=n$开始给寻找匹配的下标(在可选范围内从小到大)，也就是寻找使得$p_i+i$是质数的最小$i$，即比$p_i$大的最小质数。如果该符合要求的质数可以被找到就缩小范围，直到所有的数都可以被确定。(从ac结果看似乎并不存在无法被构造出的排列耶)

### 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    if (n == 1) {
        cout << "1\n";
        return;
    }
    else if (n == 2) {
        cout << "2 1\n";
        return;
    }

    vector<ll>primes(n * 2 + 1);
    vector<bool>isprime(n * 2 + 1, true);

    isprime[0] = isprime[1] = false;
    for (int i = 2;i <= 2 * n;i++) {
        if (isprime[i]) {
            primes.push_back(i);
            for (int j = i + i;j <= 2 * n;j += i) {
                isprime[j] = false;
            }
        }
    }

    ll x = n;
    ll pos = n;
    vector<ll>a(n + 1);
    while (pos >= 1) {
        bool f = false;
        for (int i = pos + 1;i <= pos * 2;i++) {
            if (isprime[i]) {
                f = true;
                x = i;break;
            }
        }

        // 从ac结果看似乎并不存在-1的情况(好神奇！)
//         if (!f) {
//             cout << -1 << '\n';return;
//         }
//         if (x > pos * 2) {
//             cout << -1 << '\n';return;
//         }

        // ai+i=x
        for (int i = pos;i >= x - pos;i--) {
            a[i] = x - i;
        }
        pos = x - pos - 1;
    }
    for (int i = 1;i <= n;i++) {
        cout << a[i] << ' ';
    }cout << '\n';
}
```

## I-rikki的最短路

### 题意

给出一位轴上的3个坐标，$rikki$需要把$A$带到$T$的坐标，初始$rikki$在原点，且只知道$T$的坐标，到达$T$之后可以知道$A$的坐标。

$rikki$有一个范围为$k$的视野，在$[u-k,u+k]$视野内的$A$可以被发现。

#### 数据范围

$t,a(-10^9\leq t,a\leq 10^9),k(1\leq k\leq 10^9)$

### 思路

签到模拟(怎么会有人签到交7发才过啊(小声))

视野只有在出发点的时候看A有用，其他情况按规则来qwq

### 参考代码

```cpp
void solve() {
    ll t, a, k;cin >> t >> a >> k;
    if (a >= -k && a <= k) {
        if (a * t > 0) {
            cout << t << '\n';return;
        }
        else {
            cout << abs(2 * a - t) << '\n';return;
        }
    }
    else if (a * t > 0) {
        if (abs(a) < abs(t)) {
            cout << abs(t) << '\n';return;
        }
        else {
            cout << abs(a) + abs(a - t) << '\n';return;
        }
    }
    else {
        cout << 3 * abs(t) + 2 * abs(a) << '\n';return;
    }
}
```

## J-rikki的数组陡峭值

### 题意

数组的陡峭值：数组相邻元素之差的绝对值之和。

给出数组$a$中每个元素$a_i$的范围$[l_i,r_i]$，求最小的陡峭值。

#### 数据范围

$n(1\leq n\leq 10^5)$

$l_i,r_i(1\leq l_i,r_i\leq 10^9)$

### 思路

贪心，从前往后遍历，如果$a_i$和$a_{i+1}$的范围有重合，则直接将$a_i$和$a_{i+1}$的值取成同一个数，陡峭值不增加，更新$a_{i+1}$的范围为两数重合的范围。如果范围不重合，两数分别取靠近的两个端点，并将$a_{i+1}$的范围缩成1个点。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>l(n + 1), r(n + 1);
    for (int i = 1;i <= n;i++) {
        cin >> l[i] >> r[i];
    }
    // 這題該不會能貪吧(破防
    ll ans = 0;
    for (int i = 1;i < n;i++) {
        ll x = max(l[i], l[i + 1]);
        ll y = min(r[i], r[i + 1]);
        if (x <= y) {
            // 貪貪貪
            l[i + 1] = x;r[i + 1] = y;
        }
        else {
            ans += abs(x - y);
            if (r[i + 1] < l[i])
                l[i + 1] = r[i + 1];
            else
                r[i + 1] = l[i + 1];
        }
    }
    cout << ans << endl;
}
```

## K-soyorin的通知

### 题意

$soyorin$要把消息传递给$n$个人，每个知道消息的可以将消息传递给其他人。

第$i$个人可以花费$a_i$将消息通知给最多$b_i$个人，前提是第$i$个人已知消息，消息源通知一个人花费为$p$。求最小花费。

#### 数据范围

$n(1\leq n\leq 1000)$

$p(1\leq p\leq 10^6)$

$a_i,b_i(1\leq a_i,b_i\leq 10^6)$

### 思路

dp，更新通知$i$个人的最小花费。每当第$i$个人知道消息时更新使得$j$人知道消息的花费。

### 参考代码

```cpp
void solve() {
    ll n, p;cin >> n >> p;
    vector<ll>a(n + 1), b(n + 1);
    for (int i = 1;i <= n;i++) {
        cin >> a[i] >> b[i];
    }
    // dp：通知i個人的最小花費j,dp[i]=j
    vector<ll>dp(n + 1);
    for (int i = 1;i <= n;i++)
        dp[i] = p * i;

    for (int i = 1;i <= n;i++) {
        for (int j = 1;j <= n;j++) {
            // 第i個人已經被通知的情況下，通知j個人，花費a[i]
            if (j - b[i] > 0)
                dp[j] = min(dp[j], dp[j - b[i]] + a[i]);
            else
                dp[j] = min(dp[j], dp[1] + a[i]);
        }
    }

    cout << dp[n] << '\n';
}
```

## L-anon的星星

### 题意

赢一局可以收到1颗星星，输一局失去1颗星星，没有平局。

已知一共玩了$n$局，共获得了$x$颗星星，求胜利了几局失败了几局。

如果无法知道胜利的局数和失败的局数输出-1。

#### 数据范围

$n(1\leq n\leq 1000)$

$x(-n\leq x\leq n)$

### 思路

赢$k$局就是失败$n-k$局，星星数是$k-(n-k)$。如果$k$有合法值就是合法的。

### 参考代码

```cpp
void solve() {
    ll n, x;cin >> n >> x;
    if ((n + x) & 1) {
        cout << -1 << '\n';
    }
    else {
        ll k = (n + x) / 2;
        cout << k << ' ' << n - k << '\n';
    }
}
```

## M-mutsumi的排列连通

### 题意

有两个长度为$n$的排列上下组成$2\times n$的矩形。

有操作：选择数字$x$，将矩形中的$x$删去。

询问至少多少次操作后，可以将矩形分成至少2个连通块（连通块不一定是矩形）。

如果无法实现，输出-1。

#### 数据范围

$T(1\leq T\leq 10^5)$

$n(1\leq n\leq 10^5)$

排列$a(1\leq a_i\leq n)$

排列$b(1\leq b_i\leq n)$

$n$总和不超过$10_5$

### 思路

特判$n=1,2$。

$n\ge 3$的最多删2个即可实现需求。

遍历寻找是否存在$a_i=b_i$或者$a_i=b_{i+1}$或者$a_i=b_{i-1}$的情况，注意边界判断。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n + 1), b(n + 1);
    for (int i = 1;i <= n;i++) {
        cin >> a[i];
    }
    for (int i = 1;i <= n;i++) {
        cin >> b[i];
    }
    if (n == 1) {
        cout << "-1\n";return;
    }
    if (n == 2) {
        if (a[1] == b[1]) {
            cout << "-1\n";
        }
        else {
            cout << "1\n";
        }
        return;
    }
    for (int i = 1;i <= n;i++) {
        if ((i != 1 && i != n && a[i] == b[i]) || (i > 1 && a[i] == b[i - 1]) || (i < n && a[i] == b[i + 1])) {
            cout << "1\n";return;
        }
    }
    cout << "2\n";return;

}
```
