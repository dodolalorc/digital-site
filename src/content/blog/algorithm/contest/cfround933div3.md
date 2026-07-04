---
title: "💭Codeforces Round 933(div3)"
description: "Codeforces Round 933 Div.3 的补题记录，整理 Rudolf 系列题目的计数、模拟和字符串处理思路。"
date: "2024-03-13T12:25:46+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 竞赛编程
  - Codeforces
  - 补题记录
categories:
  - 算法
series:
  - Codeforces 补题记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# A-Rudolf and the Ticket

## 题意

左边口袋有一些面值为$b_1,b_2,b_3,...,b_n$的硬币，右边有一些面值为$c_1,c_2,c_3,...,c_m$的硬币，问有多少个$(f,s)$可以使得$b_f+c_s\le k$成立

#### 数据范围

$t(1≤t≤100)$

$n,m(1≤n,m≤100)$

$k(1\le k\le 2000)$

$b_i,c_i(1\le b_i,c_i\le 1000)$

## 思路

双层循环遍历

## 参考代码

```cpp
void solve() {
    ll n, m, k;cin >> n >> m >> k;
    vector<ll>b(n), c(m);
    for (ll i = 0; i < n; i++) cin >> b[i];
    for (ll i = 0; i < m; i++) cin >> c[i];
    ll ans = 0;
    sort(b.begin(), b.end());
    sort(c.begin(), c.end());
    for (ll i = 0;i < n;i++) {
        for (ll j = 0;j < m;j++) {
            if (b[i] + c[j] <= k) {
                ans++;
            }
            else { break; }
        }
    }
    cout<<ans<<endl;
}
```

# B-Rudolf and 121

## 题意

可以对一个数组执行如下操作：

选中一个索引$i(2\le i\le n-1)$：

- $a_{i-1}=a_{i-1}-1$
- $a_i=a_i-2$
- $a_{i+1}=a_{i+1}-1$​

询问是否可以通过这个运算使得所有元素变为0

#### 数据范围

$t(1≤t≤10^4)$

$n(3≤n≤2\times 10^5)$​

$a_i(0\leq a_i\le 10^9)$

## 思路

从左向右遍历，若有大于0的数则对其进行置零，且更新其后一位和两位的数值，直到出现负数或无法执行为止。检查操作后的$a$数组是否符合要求

## 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    vector<ll>a(n);
    for (ll i = 0;i < n;i++) {
        cin >> a[i];
    }
    for (ll i = 0;i < n;i++) {
        if (a[i] < 0) {
            cout << "NO\n"; return;
        }
        if (a[i] > 0) {
            if(i+2<n){
                a[i + 1] -= 2 * a[i];
                a[i + 2] -= a[i];
                a[i] = 0;
            }
            else {
                cout << "NO\n";return;
            }
        }
    }
    cout << "YES\n";
}
```

# C-Rudolf and the Ugly String

## 题意

对字符串$s$，询问至少需要多少次删除字符的操作可以使得字符串中没有子段$map$和$pie$。

#### 数据范围

$t(1≤t≤10^4)$

$n(1≤n≤10^6)$​

## 思路

先查询子段$mapie$的数量，并删去字符$p$，再对剩下的字符串中存在的$map$和$pie$进行计数。

## 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    string s;cin >> s;
    int p = s.find("mapie");
    ll cnt = 0;
    while (p != -1) {
        s[p + 2] = 'x';
        p = s.find("mapie", p + 1);
        cnt++;
    }
    p = s.find("map");
    while (p != -1) {
        s[p + 2] = 'x';
        p = s.find("map", p + 1);
        cnt++;
    }
    p = s.find("pie");
    while (p != -1) {
        s[p] = 'x';
        p = s.find("pie", p + 1);
        cnt++;
    }
    cout << cnt << endl;
}
```

# D-Rudolf and the Ball Game

## 题意

扔球游戏，$n$个人围成一圈，每次球可以选择顺时针或逆时针传球$r_i(1\le r_i \le n-1)$个单位，已知起始球的位置和每次传递的距离，以及部分时刻传球的方向。询问最后球到了谁的手上。

#### 数据范围

$t(1≤t≤10^4)$

$n,m(1≤n≤1000,1\le m\le 1000)$

$x(1\le x\le n)$​

$r_i(1\le r_i\le n-1)$

## 思路

按题意模拟即可，每次记录球的所有可能位置，并更新。

## 参考代码

```cpp
void solve() {
    ll n, m, x;cin >> n >> m >> x;
    set<ll>xi;
    xi.insert(x);
    for (ll i = 0;i < m;i++) {
        ll r;string c;cin >> r >> c;
        if (c == "?") {
            set<ll>yi;
            for (auto j : xi) {
                ll b1 = (j + r) % n, b2 = (j - r + n) % n;
                if (b1 == 0) b1 = n;
                if (b2 == 0) b2 = n;
                yi.insert(b1);yi.insert(b2);
            }
            xi = yi;
        }
        else if (c == "1") {
            set<ll>yi;
            for (auto j : xi) {
                ll b1 = (j - r + n) % n;
                if (b1 == 0) b1 = n;
                yi.insert(b1);
            }
            xi = yi;
        }
        else {
            set<ll>yi;
            for (auto j : xi) {
                ll b2 = (j + r) % n;
                if (b2 == 0) b2 = n;
                yi.insert(b2);
            }
            xi = yi;
        }
    }
    cout << xi.size() << endl;
    for (auto i : xi) {
        cout << i << " ";
    }cout << '\n';
}
```

# E-Rudolf and k Bridges

## 题意

需要在一条河上建桥，每个位置建立桥墩的花费是$a_{i,j}+1$，$a_{i+j}$是到水面的深度。桥要求宽为$k$，任意两个桥墩的距离不能超过$d$，桥的首尾都需要有支架。

#### 数据范围

$t(1≤t≤1000)$

$n,k(1≤k\le n≤100)$​

$m(3\le m\le 2\times 10^5)$

## 思路

对每一行进行DP，可以获得每一行建桥的最小花费。再对其求前缀和，找到总花费最小的连续$k$段。

进行DP状态转移时，需要优先选中距离不大于$d$的桥墩点中，花费最小的桥墩。

## 参考代码

```cpp
void solve() {
    ll n, m, k, d;
    cin >> n >> m >> k >> d;
    vector<vector<ll>>a(n, vector<ll>(m));
    for (ll i = 0;i < n;i++) {
        for (ll j = 0;j < m;j++) {
            cin >> a[i][j];
            a[i][j] += 1;
        }
    }
    // 每行dp
    vector<ll>spd(n, 0);
    for (ll ni = 0;ni < n;ni++) {
        vector<ll>dp(m, 0);
        for (ll i = 0;i < m;i++) {
            dp[i] = a[ni][i];
        }
        // 维护前d个值中的最小值
        queue<ll>q1;
        deque<ll>qmin;
        q1.push(dp[0]);
        qmin.push_back(dp[0]);

        for (ll i = 1;i < m;i++) {
            if (i == 1)
                dp[i] += dp[0];
            else {
                ll mn = qmin.front();
                dp[i] = mn + dp[i];
            }

            if (q1.size() == d + 1) {
                if (q1.front() == qmin.front()) {
                    qmin.pop_front();
                }
                q1.pop();
            }
            q1.push(dp[i]);
            while (!qmin.empty() && dp[i] < qmin.back()) {
                qmin.pop_back();
            }
            qmin.push_back(dp[i]);
        }
        spd[ni] = dp[m - 1];
    }

    vector<ll>sum(n + 1, 0);
    sum[0] = 0;
    for (ll i = 1;i <= n;i++) {
        sum[i] = sum[i - 1] + spd[i - 1];
    }
    ll ans = sum[k];
    for (ll i = k;i <= n;i++) {
        ans = min(ans, sum[i] - sum[i - k]);
    }
    cout << ans << endl;
}
```
