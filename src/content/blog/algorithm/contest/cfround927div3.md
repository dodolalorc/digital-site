---
title: "💭Codeforces Round 927(div3)"
description: "Codeforces Round 927 Div.3 的补题记录，涵盖 Thorns and Coins、Chaya Calendar、LR-remainders 和 Card Game 的解法整理。"
date: "2024-02-29T14:47:05+08:00"
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

# A-Thorns and Coins

## 题意

长度为$n$的单元格路径，每个单元格有空、有金币、荆棘三种可能，人物从最左边开始向右移动，每次步长不多于2格，求能获得的最多金币数。

#### 数据范围

$t(1≤t≤1000)$

$n(1≤n≤50)$​

`.`代表空，`*`代表荆棘，`@`代表金币

## 思路

从左往右，寻找第一个含有2个以上`*`的`*`连通块，其前的金币都可以达到。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    string s;cin >> s;
    int cnt = 0;
    bool f = true;
    for (int i = 0;i < n;i++) {
        if (s[i] == '@')cnt++;
        if (i > 0 && s[i] == '*' && s[i - 1] == '*'){
            break;
        }
    }
    cout << cnt << '\n';
}
```

# B-Chaya Calendar

## 题意

查亚部落相信世界末日有$n$个征兆，第$i$个征兆每隔$a_i$年出现一次，当观测到第$i-1$个征兆后才会等待第$i$个征兆。给出每个征兆的出现间隔，询问观测到所有$n$个征兆所需要的年数。

ps:当第$i$个征兆在第$x$年被观测，部落会从第$x+1$年开始等待第$i+1$个征兆。

#### 数据范围

$t(1≤t≤1000)$

$n(1≤n≤100)$​

$a_i(1\le a_i\le 10^6)$

## 思路

第$i$个征兆间隔$a_i$年出现，若上一个征兆在第$x$年被观测，则下一个征兆将在第$y=k\times a_i$年出现（$x\lt y\le x+a_i$）。等待的时间是$y-x$，也就是$a_i-x\text{ }mod\text{ }a_i$年。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    ll sum = 0;
    for (int i = 0;i < n;i++) {
        cin >> a[i];
        ll lf = a[i] - sum % a[i];
        sum += lf;
    }
    cout << sum << '\n';
}
```

# C-LR-remainders

## 题意

有一个数组$a$，一个正整数$m$和长度为$n$的命令（由`L`和`R`组成的字符串），每次求数组中剩余数的积模$m$的余数并输出，然后按照命令删数（`L`删去最左边的数，`R`删去最右边的数）。

#### 数据范围

$t(1≤t≤10^4)$

$n,m(1≤n≤2\times 10^5,1\le m\le 10^4)$​

$a_i(1\le a_i\le 10^4)$

## 思路

反过来考虑，从最后一个删去的数开始，每次对积乘上上一次被删去的数，记录模m的值，逆序输出。

## 参考代码

```cpp
void solve() {
    int n, m;cin >> n >> m;
    vector<int>a(n);
    for (int i = 0;i < n;i++) { cin >> a[i]; }
    string s;cin >> s;
    vector<int>b;
    int l = 0, r = n - 1;
    for (int i = 0;i < n;i++) {
        if (s[i] == 'L')b.push_back(a[l++]);
        else b.push_back(a[r--]);
    }
    ll ans = 1;
    vector<int>res;
    reverse(b.begin(), b.end());
    for (int i = 0;i < n;i++) {
        ans *= b[i];
        res.push_back(ans % m);
        ans %= m;
    }
    reverse(res.begin(), res.end());
    for (int i = 0;i < n;i++) {
        cout << res[i] << " ";
    }cout << '\n';
}
```

# D-Card Game

## 题意

纸牌比大小游戏，有四种花色`C`、`D`、`H`、`S`，同一种花色之间比较数字，数字大的胜出。同时，每局有一个王牌花色，该花色的牌可以比剩余三种花色的牌都大，王牌花色和王牌花色之间比较数字大小。

给出所有已经打出的牌，尝试复现对局情况（第二位玩家击败第一位玩家）；如果不能复现，输出`IMPOSSIBLE`。

#### 数据范围

$t(1≤t≤100)$

$n(1\le n \le 16)$​

## 思路

模拟。

先对不同花色的牌分类，然后遍历同花色的牌，排序后，将非王牌花色放入一个序列，王牌花色单独一个序列。

从非王牌花色序列开始遍历，如果当前牌和其后一牌是同一种花色，凑成一对局；如果不是，用一张王牌花色和它凑成一个对局。假如可以凑成所有的对局，输出这些对局，否则不能构成对局。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    string w;cin >> w;

    int f = 0;
    switch (w[0]) {
    case 'S':f = 3;break;
    case 'H':f = 2;break;
    case 'D':f = 1;break;
    case 'C':f = 0;break;
    default:break;
    }

    vector<vector<string>>sp(4);
    for (int i = 0;i < 2 * n;i++) {
        string s;cin >> s;
        if (s[1] == 'C')sp[0].push_back(s);
        else if (s[1] == 'D')sp[1].push_back(s);
        else if (s[1] == 'H')sp[2].push_back(s);
        else sp[3].push_back(s);
    }
    vector<string>rk;
    for (int i = 0;i < 4;i++) {
        if (i == f)continue;
        sort(sp[i].begin(), sp[i].end());
        for (int j = 0;j < sp[i].size();j++)
            rk.push_back(sp[i][j]);
    }
    sort(sp[f].begin(), sp[f].end());
    for (int j = 0;j < sp[f].size();j++)
        rk.push_back(sp[f][j]);

    vector<pair<string, string>>ans;
    int cnt = 0;int p = rk.size() - 1;
    for (int i = 0;i < p;i++) {
        if (rk[i][1] == rk[i + 1][1]) {
            ans.push_back({ rk[i],rk[i + 1] });i++;
            cnt++;
        }
        else {
            if (f == 0 && rk[p][1] == 'C') {
                ans.push_back({ rk[i],rk[p] });p--;
            }
            else if (f == 1 && rk[p][1] == 'D') {
                ans.push_back({ rk[i],rk[p] });p--;
            }
            else if (f == 2 && rk[p][1] == 'H') {
                ans.push_back({ rk[i],rk[p] });p--;
            }
            else if (f == 3 && rk[p][1] == 'S') {
                ans.push_back({ rk[i],rk[p] });p--;
            }
            else {
                cout << "IMPOSSIBLE\n";return;
            }
        }
    }
    for (int i = 0;i < n;i++) {
        cout << ans[i].first << " " << ans[i].second << '\n';
    }
}
```

# E-Final Countdown

## 题意

倒计时，但是每次变化数所需要的秒数等于要变化的数位的数量。

求实际上需要多少秒完成倒计时。

#### 数据范围

$t(1≤t≤10^4)$

$n(1≤n≤4\times 10^5)$​

$a_i(1\le a_i\le 10^4)$

## 思路

计数模拟：

```plaintext
12345
 1234
  123
   12
    1
-----+
13715
```

则对从第一位开始做前缀和，对(前缀和+进位)倒着取模，最后输出即可。

## 参考代码

```cpp
void solve() {
    int n;cin >> n;
    string s;cin >> s;
    int x = 0;
    while (s[x] == '0') {
        x++;
    }
    s = s.substr(x);
    vector<ll>v;
    for (int i = 0;i < s.size();i++) {
        if (i != 0)
            v.push_back(v.back() + s[i] - '0');
        else {
            v.push_back(s[i] - '0');
        }
    }
    reverse(v.begin(), v.end());
    ll k = 0;
    vector<int>res;
    for (int i = 0;i < v.size();i++) {
        res.emplace_back((v[i] + k) % 10);
        k = (v[i] + k) / 10;
    }
    while(k > 0) {
        res.emplace_back(k % 10);
        k /= 10;
    }
    reverse(res.begin(), res.end());
    for (int i = 0;i < res.size();i++) {
        cout << res[i];
    }cout << '\n';
}
```
