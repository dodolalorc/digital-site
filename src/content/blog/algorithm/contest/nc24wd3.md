---
title: "🎉2024牛客寒假营3||补题"
description: "2024 牛客寒假营第 3 场补题记录，整理智乃主题题、最大子段和与比较函数等问题。"
date: "2024-02-13T20:21:21+08:00"
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

## A-智乃与瞩目狸猫、幸运水母、月宫龙虾

### 题意

在不考虑单词词性的前提下，只要求两个单词的首字母忽略大小写相同时就认为它们可能是一组ubuntu代号，请你编写程序判断给定的两个单词是否可能是一个ubuntu代号。

#### 数据范围

$T(1\leq T \leq 10^5)$

$S,T(1\leq |S|,|T|\leq 50)$

### 思路

按题意判断即可

### 参考代码

```cpp
void solve() {
    string s, t;cin >> s >> t;
    if (s[0] == t[0] || abs(s[0] - t[0]) == abs('a' - 'A')) {
        cout << "Yes\n";
    }
    else cout << "No\n";
}
```

## B-智乃的数字手串

### 题意

一个首尾相连的数组，若相邻的两个数之和为偶数选择拿走一个然后可以随意交换一对数，轮流操作，不能再操作的一方输。清楚姐姐先手。

#### 数据范围

$T(1\leq T \leq 10^4)$

$N(1\leq N\leq 26)$

$a_i(0\leq a_i \leq 10^9)$

### 思路

只有1个数时直接取走，先手赢。

2个数时：奇偶/奇奇/偶偶，都是后手赢。

3个数时：奇偶奇/偶奇偶/奇奇奇/偶偶偶，都是先手赢。

...

结束时候的状态是`奇偶奇偶...奇偶`，如果数量是奇数个，一定存在奇奇/偶偶，操作后可能直接结束游戏或继续，如果数量是偶数个且可操作，则转移为奇数时的状态且此时下一位操作者一定可以再操作。双方的操作不会改变他面对该数字串时数字的个数的奇偶性。也就是说，只有一直面对奇数个数的一方才能赢。

故判断原始长度，看先手是否在奇数位。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    for (int i = 0;i < n;i++) {
        cin >> a[i];
    }
    if (n & 1)cout << "qcjj\n";
    else cout << "zn\n";
}
```

## D-chino's bubble sort and maximum subarray sum(easy version)

### 题意

对一个数组内的元素进行恰好$K$次相邻元素交换后，求整个数组的最大子段和。

#### 数据范围

$N,K(2\leq N\leq 10^3,0\leq K \leq 1)$

$a_i(-10^9\leq a_i \leq 10^9)$

### 思路

easy版本的K只有两种取值（0和1），N的范围不大，分类处理，进行dp即可。

### 参考代码

```cpp
ll maxsum(vector<ll>a) {
    int n = a.size();
    ll sum = a[0];
    ll b = 0;
    for (int i = 0;i < n;i++) {
        if (b > 0)b += a[i];
        else b = a[i];
        if (b > sum)sum = b;
    }
    return sum;
}

void solve() {
    int n, k;cin >> n >> k;
    vector<ll>a(n);
    for (int i = 0;i < n;i++)cin >> a[i];
    ll ans;
    if (k == 0) {
        ans = maxsum(a);
    }
    else {
        for (int i = 0;i < n - 1;i++) {
            a[i] = a[i] ^ a[i + 1];
            a[i + 1] = a[i] ^ a[i + 1];
            a[i] = a[i] ^ a[i + 1];
            if (i != 0) ans = max(ans, maxsum(a));
            else ans = maxsum(a);
            a[i] = a[i] ^ a[i + 1];
            a[i + 1] = a[i] ^ a[i + 1];
            a[i] = a[i] ^ a[i + 1];
        }
    }
    cout << ans << endl;
}
```

## G-智乃的比较函数(easy version)

### 题意

给出一些cmp函数的规定，判断他们之间是否存在逻辑矛盾。

cmp的排序规则是这样的：

$cmp(x,y)=1$表示规定$x>y$，即$x$的顺序**严格**先于$y$

#### 数据范围

$T(1\leq T\leq 2\times 10^4)$

$N(1\leq N\leq 2)$

$x,y,z(x,y\in \{1,2,3\},z\in\{0,1\})$，表示第$i$个约束关系为$cmp(a_x,a_y)=z$。

### 思路

只有3个数、两个约束关系时，不能构成$a_x<a_y$且$a_y<a_z$且$a_x>a_z$，只需判断最多存在2中约束关系时的逻辑是否合法。

对于两个数$x$、$y$，不合法的约束关系只有：$cmp(x,y)=1$且$cmp(y,x)=1$

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<vector<int>>rules(4, vector<int>(4, -1));
    bool f = true;
    for (int i = 0;i < n;i++) {
        int x, y, z;cin >> x >> y >> z;
        if (!f)continue;
        if (x == y && z == 1)f = false;
        if (z == 1 && rules[y][x] == 1) {
            f = false;
        }
        if (rules[x][y] == -1) {
            rules[x][y] = z;
            if (z == 1)
                rules[y][x] = 0;
        }
        else if (rules[x][y] != z)
            f = false;
    }
    if (f)cout << "Yes\n";
    else cout << "No\n";
}
```

## H-智乃的比较函数(normal version)

### 题意

同G

#### 数据范围

$T(1\leq T\leq 2\times 10^4)$

$N(1\leq N\leq 50)$

$x,y,z(x,y\in \{1,2,3\},z\in\{0,1\})$，表示第$i$个约束关系为$cmp(a_x,a_y)=z$。

### 思路

和G相比，N的范围大于2，不合法的情况增加了，但是依然只是3个数据之间判断合法性。

新增的三个关系不合法的情况有：

1. $x<y,x<z,z<x$
2. $x\leq y,y\leq z,z<x$

分别特判即可。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    vector<vector<int>>rules(4, vector<int>(4, -1));
    bool f = true;
    for (int i = 0;i < n;i++) {
        int x, y, z;cin >> x >> y >> z;
        if (!f)continue;
        if (x == y && z == 1)f = false;
        if (z == 1 && rules[y][x] == 1) {
            f = false;
        }
        if (rules[x][y] == -1) {
            rules[x][y] = z;
            if (z == 1)
                rules[y][x] = 0;
        }
        else if (rules[x][y] != z)
            f = false;
    }
    if (rules[1][2] == 1 && rules[2][3] == 1 && rules[3][1] == 1)
        f = false;
    if (rules[1][3] == 1 && rules[3][2] == 1 && rules[2][1] == 1)
        f = false;
    for (int x = 1;x <= 3;x++) {
        for (int y = 1;y <= 3;y++) {
            if (y == x)continue;
            int z = 6 - x - y;
            if (rules[x][y] == 0 && rules[y][z] == 0 && rules[x][z] == 1)
                f = false;
        }
    }
    if (f)cout << "Yes\n";
    else cout << "No\n";
}
```

## L&M-智乃的36倍数(easy/hard version)

### 题意

定义一种运算$f$，可以将正整数按照字面值从左到右拼接，如：$f(123,569)=1234569$。

一个正整数数组，其中有多少对有序对$i,j(i\ne j)$满足$f(a_i,a_j)$是36的倍数。

#### 数据范围

`easy`:

$N(1\leq N\leq 1000)$

$a_i(1\leq a_i \leq 10)$

`hard`：

$N(1\leq N\leq 10^5)$

$a_i(1\leq a_i \leq 10^{18})$

### 思路

easy版本的数据较小，直接双层循环暴力即可。

hard版本可以考虑同余，k是y的位数。

$$
f(x,y)=x\times 10^{k}+y
$$

$$
f(x,y)\% 36=0
$$

$$
(x\times 10^{k}+y)\%36=0
$$

$$
(x\%36\times 10^{k}\%36+y\%36)\%36=0
$$

对数组预处理后，枚举以$y$结尾。

### 参考代码

```cpp
// 暴力easy version
void solve() {
    int n;cin >> n;
    vector<int>a(n);
    for (int i = 0;i < n;i++) {
        cin >> a[i];
    }
    int cnt = 0;
    for (int i = 0;i < n;i++) {
        for (int j = i + 1;j < n;j++) {
            int n1 = a[i] * 10 + a[j];
            int n2 = a[j] * 10 + a[i];
            if (n1 % 36 == 0)cnt++;
            if (n2 % 36 == 0)cnt++;
        }
    }
    cout << cnt << '\n';
}
// hard version
void solve() {
    int n;cin >> n;
    vector<ll>a(n);
    map<int, int>cnt;
    for (int i = 0;i < n;i++) {
        cin >> a[i];
        cnt[a[i] % 36]++;
    }
    ll k = 1;
    vector<int>dk(19);
    for (int i = 1;i < 19;i++) {
        k *= 10;
        dk[i] = k % 36;
    }
    auto getlen = [](ll x) {
        int i = 0;
        while (x) {
            i++;x /= 10;
        }
        return i;
        };
    ll ans = 0;
    for (int i = 0;i < n;i++) {
        int x = a[i] % 36;
        int z = getlen(a[i]);
        for (int j = 0;j < 36;j++) {
            if ((j * dk[z] + x) % 36 == 0) {
                ans += cnt[j];
                if (j == x)ans -= 1;
            }
        }
    }
    cout << ans << '\n';
}
```
