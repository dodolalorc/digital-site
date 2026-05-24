---
title: "🎉2024牛客寒假营1||补题"
description: "2024 牛客寒假营第 1 场补题记录，整理 DFS 搜索、贪心、分配与模拟等题目的解法。"
date: "2024-02-02T20:30:40+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## A-DFS搜索

### 题意

给一个字符串，判断其中是否包含`dfs`子序列和`DFS`子序列。

#### 数据范围

$T(1≤T≤100)$

$n(1≤n≤50)$

### 思路

直接搜。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    string s;cin >> s;
    int f1 = 1, f2 = 1;
    int p = s.find('D');
    if (p != -1) {
        p = s.find('F', p);
        if (p != -1) {
            p = s.find('S', p);
            if (p == -1) { f1 = 0; }
        } else { f1 = 0; }
    }
    else { f1 = 0; }
    p = s.find('d');
    if (p != -1) {
        p = s.find('f', p);
        if (p != -1) {
            p = s.find('s', p);
            if (p == -1) { f2 = 0; }
        } else { f2 = 0; }
    }
    else { f2 = 0; }
    cout << f1 << " " << f2 << endl;
}
```

## B-关鸡

### 题意

![img](https://uploadfiles.nowcoder.com/images/20240121/0_1705849989132/3C73FD698696250B894A2646C4440896)

从点(1, 0)出发，在宽为22、长为2×10^9^+12×10^9^+1的管道中有一些不可跨越的坐标点，判断最少添加几个着火点，使得无法走到左右端点。

#### 数据范围

$T(1≤T≤1e4)$

$0≤n≤1e5$

$r,c(1≤r≤2,−1e9≤c≤1e9)$

### 思路

分别堵住两端的管道即可，堵住有三种情况：

```plaintext
   x		  1 2 3
 1 2 3  或者     x
```

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    map<pair<ll, ll>, bool>fires;   // 记录是否有某个点
    int fl = 2, fr = 2, fn = 0; // 空白，左2右2
    for (int i = 0;i < n;i++) {
        ll r, c;cin >> r >> c;
        fires[{c, r}] = true;
        if ((c == -1 && r == 1) || (c == 0 && r == 2) || (c == 1 && r == 1))fn++;   // 环绕
        if (c <= 0)fl = 1;
        if (c >= 0)fr = 1;
    }
    for (auto i = fires.begin(); i != fires.end();i++) {
        auto pr = i->first;bool hs = i->second;
        ll c = pr.first, r = pr.second;
        for (int j = -1;j < 2;j++) {
            if (fires.find({ c + j, (3 - r) }) != fires.end()) {
                if (c < 0) { fl = 0; }  // 左边不用再加
                if (c > 0) { fr = 0; }  // 右边不用再加
            }
        }
    }
    int ans = 3 - fn;
    cout << min(ans, fl + fr) << endl;
}
```

## C-按闹分配

### 题意

有n个人要排队办理业务，每个人的不满意度`Di`按照办完本人业务后的那一刻一共花费了多少时间来算，办事人员合理安排排队顺序，使得总不满意度$S_{min}=\sum_{i=1}^{n}D_i$最小，记为$S_{min}$。

然后急急鸡带着需要花费tc时间的业务想插队，办事人员对其的容忍度M如果不小于急急鸡插队后的不满意度$S_{c}$与$S_{min}$的差值，则会允许急急鸡插队。

有q组询问，每组询问给出容忍度M，求出在该容忍度下急急鸡最快能办完业务的时间。

#### 数据范围

$n,Q,t_c(1≤n,Q≤105,1≤t_c≤1e9)$

$t_i(1≤t_i≤1e6)$

$M(0≤M≤1e18)$

### 思路

初始从小到大排，求每个客户的不满意度Di（做前缀和）

### 参考代码

```cpp
void solve() {
    ll n, q, tc;cin >> n >> q >> tc;
    vector<ll>t(n+1);
    for (int i = 0;i < n;i++) {
        cin >> t[i];
    }
    t[n] = 0;
    sort(t.begin(), t.end());
    ll tn = 0ll;
    vector<ll>d(n+1);
    for (int i = 0;i <= n;i++) {
        d[i] = tn + t[i];   // 第i个人的不满意度
        tn += t[i]; // 时间线
    }
    while (q--) {
        ll m;cin >> m;
        ll l = 0, r = n;
        while (l < r) {
            ll x = (l + r) >> 1;    // 插在x号客户前面
            if ((n - x) * tc <= m) {
                // 可以
                r = x;
            }
            else {
                l = x + 1;
            }
        }
        // 最早：插在l的前面
        cout << d[l] + tc << endl;
    }
}
```

## D-本题又主要考察了贪心

### 题意

<del>大骗子！</del>

n个人的比赛，还剩m局，每局的结果有：

1. 胜方加3分，败方不得分
2. 平局各加一分

求一号选手最好的名次（并列的取并列的排名）

#### 数据范围

$T(1≤T≤100)$

$n,m(2≤n≤10,1\leq m\leq 10)$

$0\leq a_i\leq 100$

$u_i,v_i,1\leq u_i,v_i\leq n,u_i≠v_i$

### 思路

不会贪，数据范围小可以直接dfs暴力每种情况取最优，$O(3^m)$

### 参考代码

```cpp
int dfs(vector<int>a, vector<pair<int, int>>tb, int now) {
    if (now == tb.size()) {     // 最后一局
        int rk = 1;
        for (int i = 1;i < a.size();i++) {
            if (a[i] > a[1])rk++;
        }
        return rk;
    }
    int ret = a.size() - 1;
    int u = tb[now].first, v = tb[now].second;
    // u赢
    a[u] += 3;
    ret = min(ret, dfs(a, tb, now + 1));
    a[u] -= 3;
    // v赢
    a[v] += 3;
    ret = min(ret, dfs(a, tb, now + 1));
    a[v] -= 3;
    // 平局
    a[v] += 1;a[u] += 1;
    ret = min(ret, dfs(a, tb, now + 1));
    a[v] -= 1;a[u] -= 1;

    return ret;
}
void solve() {
    int n, m;cin >> n >> m;
    vector<int>a(n + 1);
    for (int i = 1;i <= n;i++)cin >> a[i];
    vector<pair<int, int>>tb;
    for (int i = 0;i < m;i++) {
        int u, v;cin >> u >> v;
        tb.push_back({ u,v });
    }
    int ans = dfs(a, tb, 0);
    cout << ans << '\n';
}
```

## F-鸡数题

### 题意

求有多少个长为m的数组a同时满足以下条件：

1. 对任意i，都有$a_i>0$
2. 数组a严格递增
3. $a_1|a_2|...|a_{m-1}|a_m=2^n-1$（其中|为按位或操作）
4. 对任意$i≠j$有$a_i\&a_j=0$（其中&为按位与操作）

答案要对$10^9+7$取模

#### 数据范围

$1\leq n,m\leq 10^5$

### 思路

条件3说明，在2进制下的$2^n-1$（也就是数$(\overbrace{11\dots111}^n)_2$）每一位1都至少在$a_1~a_m$中出现一次，数组a的大小为m，联合条件4说明每个数位上的1最多只能出现1次，所以问题转化为，将n个不同位置上1分配给m个数，且每个数至少有1个1。可知$n\geq m$。

也就是一个第二类斯特林数$n\brace m$。

递推式：

$$
{n\brace k}={n-1\brace k-1}+k{n-1\brace k}
$$

边界是：${n\brace m}=[n=0]$。

**通项**：

$$
{n\brace m}=\sum_{i=0}^m \frac{(-1)^{m-i}\times i^n}{i!\times (m-i)!}
$$

### 参考代码

```cpp
void solve() {
    ll n, m;cin >> n >> m;
    if (n < m) { cout << "0\n"; return; }
    // 阶乘
    vector<ll>fac;
    fac.push_back(1);fac.push_back(1);
    for (ll i = 2;i <= n;i++) {
        ll faci = (fac.back() * i) % mod;
        fac.push_back(faci);
    }
    vector<ll>finv(n + 1); // 阶乘的逆元
    finv[n] = powerMod(fac[n], mod - 2, mod);
    for (int i = n - 1;i >= 0;i--) {
        finv[i] = finv[i + 1] * (i + 1) % mod;
    }

    ll ans = 0ll;
    for (ll i = 0;i <= m;i++) {
        ll ansi = 1ll;
        if ((m - i) & 1)ansi = -1;

        ansi *= powerMod(i, n, mod);
        ansi *= finv[i] * finv[m - i] % mod;
        ans = (ans + ansi) % mod + mod;     // 加一个mod取正数
        ans %= mod;
    }
    cout << ans << '\n';
}
```

## G-why买外卖

### 题意

一些可以叠加的满ai减bi的券，现在有m元，提问可以买到食物的原价最大值是多少。

#### 数据范围

$T(1≤T≤1e4)$

$n,m(1≤n≤1e5,1≤m≤1e9)$

$a_i,b_i(1≤a_i,b_i≤1e9)$

### 思路

前缀和，按照ai升序排列，能用ai的券的食物一定也能使用原价小于等于ai的所有的券，最后枚举原价即可。

### 参考代码

```cpp
void solve() {
    ll n, m;cin >> n >> m;
    map<ll, ll>discnt;
    for (int i = 0;i < n;i++) {
        ll a, b;cin >> a >> b;
        discnt[a] += b;    // 一次前缀和，合并相同ai的券
    }
    for (auto i = discnt.begin(); i != discnt.end();i++) {
        ll price = i->first, discount = i->second;
        auto j = i;j++;
        if (j != discnt.end()) {
            (j->second) += discount;    // 第二次前缀和，合并小于等于ai的券
        }
    }
    ll x = m;
    for (auto i = discnt.begin();i != discnt.end();i++) {
        ll price = i->first, discount = i->second;
        if (m + discount >= price)x = m + discount;    // 枚举，取最大原价
    }
    cout << x << endl;
}
```

## I-It's bertrand paradox. Again!

### 题意

有两种生成平面上的圆的方式，给已生成的数据判断是哪种方式生成的。

bit-noob的方法：

1. 随机等概率地从开区间$(−100,100)$生成两个整数$x,y$。
2. 随机等概率地从闭区间$[1,100]$中生成一个$r$。
3. 判断$(x,y)$为圆心、$r$为半径的圆是否满足要求，若不满足，返回步骤2重新生成$r$，若满足，则将该圆加入到结果中。

buaa-noob的方法：

1. 随机等概率地从开区间$(−100,100)$生成两个整数$x,y$，随机等概率地从闭区间$[1,100]$中生成一个$r$。
2. 判断$(x,y)$为圆心、$r$为半径的圆是否满足要求，若不满足，返回步骤1重新生成$x,y,r$，若满足，则将该圆加入到结果中。

#### 数据范围

$n=10^5$

$0< x_i,y_i< 100,0< r_i\leq100$

### 思路

两种方法中，第一种的x和y的取值更容易受到r的限制，在r均匀分布在$[1,100]$的情况下，bit-noob的方法相对于buaa-noob的方法，x,y会更偏向集中在原点附近。

### 参考代码

```cpp
void solve() {
    int n;cin >> n;
    int cnt = 0;
    for (int i = 0;i < n;i++) {
        int x, y, r;cin >> x >> y >> r;
        if (abs(x) <= 50 && abs(y) <= 50)cnt++;
    }
    if (cnt < n - cnt)cout << "bit-noob\n";
    else cout << "buaa-noob\n";
}
```

## H-01背包，但是bit

### 题意

$n$个物品，每个物品有价值$v_i$和重量$w_i$，所选物品的总重量是所选物品重量的**按位或运算**的结果，求总重量不超过$m$的最大价值和

#### 数据范围

$T(1≤T≤10^4)$

$n,m(1≤n≤10^5,0\leq m\leq 10^8)$

$v_i,w_i(0\leq v_i,w_i\leq 10^8)$

### 思路

枚举m右移位后的数字，能被这个位数低于m、数位上全是1的新m覆盖的都能拿

状态转换：拿新筛出来的可选与原来的比较，取价值较大的那个

### 参考代码

```cpp
void solve() {
    ll n, m;cin >> n >> m;
    vector<ll>v(n), w(n);
    ll ans = 0;
    for (int i = 0;i < n;i++) {
        cin >> v[i] >> w[i];
        if ((w[i] | m) == m)ans += v[i];
    }

    for (ll i = m;i > 0;i -= i & -i) {
        // i每次抹去最后一位1，再重新取全1
        ll xi = i - 1;
        ll ansi = 0;
        for (int j = 0;j < n;j++) {
            if ((w[j] | xi) == xi)
                ansi += v[j];
        }
        ans = max(ans, ansi);
    }

    cout << ans << '\n';
}
```

## L-要有光

### 题意

![img](https://uploadfiles.nowcoder.com/images/20240121/0_1705841503979/D2B5CA33BD970F64A6301FA75AE2EB22)

如图，有一点光源在轨迹L($x=c,y=0,0\leq z\leq d$)上移动，存在一宽为$2w$，高为$h$的绿墙W，和一无限大的白墙S，求投影在地面上的阴影的面积。

#### 数据范围

$1\leq T\leq 10^4$

$1\leq c,d,h,w\leq 10^4$

输出浮点数误差小于$10^{-4}$

### 思路

当点光源放在地面上时投影最大(z=0时)，这个投影是一个等腰梯形（大三角形截去一个小三角形）。

### 参考代码

```cpp
void solve() {
    double c, d, h, w;cin >> c >> d >> h >> w;
    double ans = 3.0 * c * w;
    cout << ans << endl;
}
```

## M-牛客老粉才知道的秘密

### 题意

![img](https://uploadfiles.nowcoder.com/images/20240128/0_1706427663076/67C4F8301D7C0AE62368329F52B4CF84)

就像上图一样，当可见范围移动时固定位移为6格，当移动碰到末端时会以末端为最远到达处。给出比赛总题数，判断像这样移动可能的位置数目。

#### 数据范围

$1\leq T\leq 10^5$

$6\leq n\leq 10^9$

### 思路

判断n是否是6的倍数即可，如果正好是6的倍数，那么返回时并不产生新的位置。

### 参考代码

```cpp
void solve() {
    ll n;cin >> n;
    if (n % 6)cout << n / 6 + n / 6 << '\n';
    else cout << n / 6 << '\n';
}
```
