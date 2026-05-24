---
title: "字符串匹配问题||前缀函数+KMP+字符串哈希"
description: "字符串匹配专题笔记，整理暴力匹配、前缀函数、KMP 和字符串哈希的原理与代码。"
date: "2024-01-05T14:11:58+08:00"
draft: false
showHeroImage: false
tags:
  - 算法
  - 字符串
  - KMP
  - 字符串哈希
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## 字符串匹配算法

### 暴力做法(BF)

简称BF(Brute Force)算法。

没什么好说的，就是看到描述直接能想到的朴素做法。

```cpp
vector<int> BF_match(string s, string p) {
    // s是主串，p是模式串
    int n = s.size(), m = p.size();
    vector<int> res;
    for (int i = 0; i <= n - m; i++) {
        int j = 0;
        for (; j < m; j++) {
            if (s[i + j] != p[j]) break;
        }
        if (j == m) res.push_back(i);
    }
    return res;
}
```

BF算法的时间复杂度不稳定。匹配成功时，最好为`O(n)`，最差为`O(mn)`；匹配失败时，最好为最好为`O(n)`，最差为`O(mn)`。平均时间复杂度为`O(n)`。

### 前缀函数

#### 定义

定义字符串$S$的前缀函数：$\pi [i]$为其子串$s[0...i]$的最长相等真前缀与真后缀的长度。例如对于`S=aabaaab`，它的前缀函数是`[0,1,0,1,2,2,3]`。

#### 计算

朴素算法枚举子串的长度（其中$\pi [0]=0$），然后从大到小尝试枚举子串中真前缀的长度，并与同样长度的真后缀进行匹配，直到找到符合相等条件的最大长度或者长度为$0$，时间复杂度是$O(n^3)$​。

```cpp
vector<ll> prefix(string s) {
    vector<ll>pi(s.size());
    for (int i = 0;i < s.size();i++) {
        for (int j = i;j >= 0;j--) {
            string t = s.substr(0, j);
            string tmp = s.substr(i - j + 1, j);
            if (t == tmp) {
                pi[i] = j;
                break;
            }
        }
    }
    return pi;
}
```

##### 考虑优化

容易考虑到，假设有一个长度为`i`的子串`t`的前缀函数是$\pi [i]=k$，则表示`t1 = t[0...k-1]`与`t2 = t[n-k...n-1]`是相同的，那么当他们同时去掉后一位字符，得到的`t1' = t[0....k-2]`与`t2' = t[n-k+1...n-2]`也是匹配的。换句话说，当$s[k-1]=s[i]$时，有$\pi[i-1]+1=\pi[i]$，并且当$s[k-1]≠s[i]$时，$\pi[i]$将变为$0$或保持一个不大于$s[i-1]$的数。前缀函数只能在前一个匹配的状态下进行拓展，每次拓展最多只能增加1，否则维持不变或减少。

其实这时候应该能发现，这是一个动态规划，每次向后拓展一位时，我们需要与拓展前的状态相对比，判断新加的一位是当前状态（当前匹配的前缀/后缀串）的后继（$s[\pi[i]]=s[i+1]$）或者是之前的状态$\pi[p]$的后继（空匹配$\pi[p]=0$也算一种状态）。

加入这个优化，我们就能优化掉每次匹配前后缀最大长度的枚举。

```cpp
vector<ll> prefix(string s) {
    vector<ll>pi(s.size());
    for (int i = 0;i < s.size();i++) {
        for (int j = pi[i - 1] + 1;j >= 0;j--) {
            // 注意j的最大值被限制在pi[i-1]+1
            string t = s.substr(0, j);
            string tmp = s.substr(i - j + 1, j);
            if (t == tmp) {
                pi[i] = j;
                break;
            }
        }
    }
    return pi;
}
```

###### 复杂度

考虑某一次匹配，在若$s[i+1]=s[\pi[i]]$，则只需要进行一次比较就能成功，而这次成功也是在$s[i]=s[\pi[i-1]]$的基础上的累加。考虑：在$i=n$时，从$j=\pi[n-1]+1$到$j=1$都是不匹配的，那么字符串比较累计了$\pi[n-1]+1$次（j=0时是空字符串比较）。若$\pi[n-1]$是最大的$n-2$，则在计算$\pi[n]$时进行了$n-1$次字符串比较。同时代表$\pi[n-1]=\pi[n-2]+1=\pi[n-3]+1+1=...=\pi[1]+n-2$都是成立的，这里进行了$n-2$次加1，也就是说从$\pi[1]$累计到$\pi[n-1]$每次都进行$1$次比较，总比较次数共是$n-2$次匹配。总的字符串比较次数为`n-1 + n-2`。再考虑字符串比较复杂度是$O(s.length)$。优化之后的时间复杂度为$O(n^2)$

##### 再次优化

上一步我们将整个计算前缀函数的字符串比较次数优化到$O(n)$的大小，在上一步的基础上，我们优化当$s[i+1]\neq s[\pi[i]]$时，如何转移到上一个符合$s[i+1]=s[\pi[k]]$的状态。

失配时，我们希望找到长度$j=\pi[k]$使得$s[i+1]=s[\pi[k]]$成立，也就是将$i+1$的状态直接从$k$​的状态进行继承。

当$s[j]\neq s[i]$时，若存在仅次于$j$的第二长度$k$，使得$s[0...k-1]=s[i-k+1...i]$成立，则$\pi[i]=k$，对于这样的子串，符合以下性质：

$$
s[0...k-1]=s[i-k+1...i]=s[\pi[i]-k...\pi[i]-1]=s[0...\pi[i]-1]
$$

$s[0...\pi[i]-1]$的长度$\pi[i]=k$，也就是说，$k$等价于$s[0...\pi[i]-1]$的前缀函数值，也就是$\pi[\pi[i]-1]$。

利用这个性质，每次失配之后，只需要将$j$更新为$\pi[j-1]$即可。

```cpp
vector<ll> prefix(string s) {
    int n = s.size();
    vector<ll>pi(n);
    int j = 0;
    for (int i = 1;i < n;i++) {
        while (j > 0 && s[i] != s[j])j = pi[j - 1];
        if (s[i] == s[j])j++;
        pi[i] = j;
    }
    return pi;
}
```

### KMP算法

观察朴素的BF算法，造成复杂度上升的主要原因在于模式串T中指针的回溯（即匹配失败时`j`再次从0开始匹配，KMP算法主要优化了回溯这一步，我们为减少回溯的距离，引入了`next`数组来指示匹配之后回溯的位置。`next`数组减少回溯的想法正好是结合上面关于生成前缀函数的想法，换句话说，`KMP`中的`next`数组就是一个前缀表。

前缀函数匹配的是前缀和后缀，当我们把待匹配串$t$拼接到模式串$s$的后面（用一个不在$s$和$t$中的字符分隔），即可按照相同的做法去生成前缀函数。考虑组合出的新字符串的前缀函数，前$n+1$个函数值是只和主串自身字符有关的一部分前缀函数。接下来，依次在前缀函数中加入$t$中的一个字符，计算当前位置的前缀函数值，若在某一位置有$\pi[i]=n$成立，则代表字符串$s$在字符串$t$中的位置$i-(n-1)-(n+1)=i-2*n$出现（在组合串的$i-(n-1)$的位置出现，减去前面$s$和分隔符的长度即为在$t$中的位置）。

```cpp
vector<ll> prefix(string s) {
    int n = s.size();
    vector<ll>pi(n);
    int j = 0;
    for (int i = 1;i < n;i++) {
        while (j > 0 && s[i] != s[j])j = pi[j - 1];
        if (s[i] == s[j])j++;
        pi[i] = j;
    }
    return pi;
}
vector<int>kmp(string s, string t) {
    ll n = s.size(), m = t.size();
    string cur = t + "#" + s; // 找s中t的位置
    prefix(cur);
    vector<ll>v;
    for (ll i = m + 1;i <= n + m + 1;i++) {
        if (pi[i] == m)
            v.push_back(i - (m + 1) - (m - 1));
    }
    return v;
}
```

#### KMP模板题

题面：[P3375 【模板】KMP - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P3375)

##### 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn = 1e7 + 50;

ll pi[maxn];

void prefix(string s) {
    ll n = s.size() - 1;
    ll j = 0;
    for (ll i = 1;i <= n;i++) {
        while (j > 0 && s[j] != s[i])j = pi[j - 1];
        if (s[i] == s[j])j++;
        pi[i] = j;
    }
}

vector<ll>kmp(string s, string t) {
    ll n = s.size(), m = t.size();
    string cur = t + "#" + s; // 找s中t的位置
    prefix(cur);
    vector<ll>v;
    for (ll i = m + 1;i <= n + m + 1;i++) {
        if (pi[i] == m)
            v.push_back(i - (m + 1) - (m - 1));
    }
    return v;
}

int main() {
    string s1, s2;
    cin >> s1 >> s2;
    vector<ll>v = kmp(s1, s2);
    for (auto i : v) cout << i + 1 << "\n";
    prefix(s2);
    for (ll i = 0;i < s2.size();i++) cout << pi[i] << " ";

    return 0;
}
```

另一个关于KMP的题：[P4824 [USACO15FEB\] Censoring S - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P4824)

##### 代码

```cpp
void solve() {
    string s, t;cin >> s >> t;
    ll n = t.size();
    t = " " + t;
    ll j = 0; // 前一步匹配的长度
    for (ll i = 2;i <= n;i++) {
        while(j && t[j + 1] != t[i])j = pi[j];
        if (t[j + 1] == t[i])j++;
        pi[i] = j;
    }
    ll m = s.size();
    s = " " + s;
    ll ans[m + 5];
    ll p = 0;j = 0;
    for (ll i = 1;i <= m;i++) {
        while(j && s[i] != t[j + 1])j = pi[j];
        if (s[i] == t[j + 1])j++;
        fi[i] = j;
        ans[++p] = i;
        if (j == n) {
            p -= n;
            j = fi[ans[p]]; // 跳转到匹配t之前的匹配长度
        }
    }
    for (ll i = 1;i <= p;i++) {
        cout << s[ans[i]];
    }
    cout << endl;
}
```

#### 自动机

在`KMP`中生成`s + '#' + t`前缀函数时，前`s + '#'`的状态于`t`没有关系，而`s + '#' + t`可以由`s + '#'`的状态转移而来，如果`t`中包含的字符是一定的，比如约定都是小写字母，则可以根据`s + '#'`来构建一个关于下一位字符的有限状态机，逐个添加字符就是逐建更新状态。

```cpp
ll pi[maxn];

void prefix(string s) {
    ll n = s.size();
    s = " " + s;
    ll j = 0;
    for (ll i = 2;i <= n;i++) {
        while (j && s[j + 1] != s[i])j = pi[j];
        if (s[i] == s[j + 1])j++;
        pi[i] = j;
    }
}

void cmp_auto(string s, vector<vector<ll>>& aut) {
    s = s + "#";
    prefix(s);
    ll n = s.size();
    aut.assign(n, vector<ll>(26));
    s = " " + s;
    for (ll i = 1;i <= n;i++) {
        for (ll c = 0;c < 26;c++) {
            if (i > 1 && 'a' + c != s[i])
                aut[i][c] = aut[pi[i - 1] + 1][c];
            else
                aut[i][c] = i + ('a' + c == s[i]);
        }
    }
}
```

数组`aut[i][c]`表示在前$i$个字符匹配上的情况下，第$i+1$的字符是`c`时要跳转的状态，这样的跳转是$O(1)$​的。

试手例题：[Problem - 808G - Codeforces](https://codeforces.com/problemset/problem/808/G)

参考代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn = 1e6 + 50;
const ll inf = 0x3f3f3f3f;

ll pi[maxn];

void prefix(string s) {
    ll n = s.size();
    s = " " + s;
    ll j = 0;
    for (ll i = 2;i <= n;i++) {
        while (j && s[j + 1] != s[i])j = pi[j];
        if (s[i] == s[j + 1])j++;
        pi[i] = j;
    }
}
ll aut[maxn][26];
ll dp[2][maxn];
void solve() {
    string s, t;cin >> s >> t;
    t = t + "#";
    ll n = t.size();
    ll m = s.size();
    prefix(t);
    // aut:前i-1位已经匹配,根据t[i]与c是否相同,更新接下来与c之后的长度
    s = " " + s;t = " " + t;
    for (ll i = 1;i <= n;i++) {
        for (ll c = 0;c < 26;c++) {
            if (i > 1 && 'a' + c != t[i])
                aut[i][c] = aut[pi[i - 1] + 1][c];
            else
                aut[i][c] = i + ('a' + c == t[i]);
        }
    }
    // 在t+'#'的状态机上在s上继续转移
    memset(dp, -inf, sizeof(dp));
    dp[0][1] = 0; // 表示到s的i位,与t匹配长度为j的次数
    for (ll i = 1;i <= m;i++) {
        if (s[i] == '?') {
            for (ll j = 1;j <= n;j++) {
                for (ll c = 0;c < 26;c++) {
                    dp[i & 1ll][aut[j][c]] = max(
                        dp[i & 1ll][aut[j][c]],
                        dp[(i + 1ll) & 1][j] + (aut[j][c] == n)
                    );
                }
            }
        }
        else {
            for (ll j = 1;j <= n;j++) {
                ll c = s[i] - 'a';
                dp[i & 1ll][aut[j][c]] = max(
                    dp[i & 1ll][aut[j][c]],
                    dp[(i + 1ll) & 1][j] + (aut[j][c] == n)
                );
            }
        }
        for (ll j = 1;j <= n;j++)
            dp[(i + 1ll) & 1][j] = -inf;
    }

    ll ans = *max_element(dp[m & 1ll] + 1, dp[m & 1ll] + n + 1);
    ans = max(0ll, ans);
    cout << ans << endl;
}
int main() {
    int t = 1;
    // cin >> t;cin.get();
    while (t--)
        solve();

    return 0;
}
```

### 统计所有前缀次数

统计待匹配串$s$的所有前缀在$t$中出现的次数。

考虑$\pi[i]$的生成，依然是参照[这里](#再次优化)的推导思路，对于位置$i$的前缀函数值$\pi[i]$，可知长度小于$\pi[i]$的最长的以$s[i]$结尾的前缀长度是$\pi[\pi[i]-1]$，之后是$\pi[\pi[\pi[i]-1]-1]$......，直到长度为$0$，因此$s[0...i]$的每个前缀在$t$中出现的次数可以统计这样的传递的次数。

```cpp
vector<int>cnt(n + 1); // 长度为i的前缀出现次数是cnt[i]
for (int i = 0;i < n;i++)cnt[pi[i]]++;
for (int i = n - 1;i > 0;i--)cnt[pi[i - 1]] += cnt[i];
// 长度为i的前缀出现了cnt[i]次，则长度为pi[i-1]的前缀要加上cnt[i]次，因为pi[i]是在长度为pi[i-1]的前缀基础上+1而来的
for (int i = 0;i <= n;i++)cnt[i]++;
```

### 不同本质子串计数

给长度为$n$的字符串$s$后添加一个新字符$c$，给原来的$s$的所有不同子串后加$c$后，会出现一些以这个字符$c$结尾的之前没出现过的子串，我们的目的是计数每次在末尾添加新字符之后的字符串的不同本质子串数目。

举例，原串$S$是`aba`，原来的子串集合是：$[S]=\\{a,b,ab,ba\\}$，添加字符`x`之后的新串是`abax`，由于添加`x`后没有再之前的子串集合里的任何两个子串$s_1,s_2$中出现$s_1+x=s_2$的情况，那么新出现的子串数目就是原集合$[S]$的元素数目。假如添加的字符是`b`，新串是`abab`，那么就会发现，在原子串集合添加含有新加的`b`出现的新增加的元素集合$[S']=\\{b,ab,bab\\}$​​中$\\{b,ab\\}$与原有元素出现了重复。

#### 思路

考虑原串`cbbcb`添加了新字符后是`cbbcbx`，考虑`x`加入后`cbx`是否与`cbb`相同，我们可以将字符串`cbbcbx`翻转为`xbcbbc`，对翻转后的字符串计算前缀函数，记该字符串前缀函数的最大值是$\pi_{max}$，假设$\pi_{max}=3$，则该最大值对应的前缀是`xbc`，也就是说`xbc=bbc`，这是包含`x`的最长的匹配长度，显然，`xbc`的子串`x`、`xb`、`xbc`在`bbc`中对应`b`、`bb`、`bbc`，复原为没有翻转前，正好就是添加新字符之后的包含新字符的元素集合中，与未加新字符前的字符串的子串集合中重复的元素。于是在添加新字符之后，新出现的子串数目即为$(|s_{\text{原} }|+1)-\pi_{max}$​。

### 字符串压缩

字符串压缩指的是找到最短的长度$k$使得所有$s[0...k-1]=s[k...2*k-1]=...=s[n-k...n-1]$成立（$n\bmod k=0$​）。

举例字符串`abcabc`可以被压缩为`abc`、`abababab`可以被压缩为`ab`。显然，假设字符串$s$可以被压缩至长度$k$，则该字符串的前缀函数的最后一个值$\pi[n]$一定是$n-k$，（注意前后缀是真子串），$\pi[n]$与$n$相差的长度应当正好是一个最短压缩串的长度。因此，由$n-\pi[n]$得到$k$，若$n\bmod k=0$成立，则$k$即为压缩后的长度。

### 字符串Hash

字符串哈希的主要难点是构造哈希函数。

哈希的性质：

- Hash函数值不一样的时候，两个字符串一定不一样。
- Hash函数值一样的时候，两个字符串大概率一样。

第二条主要是哈希碰撞引起的，可以尝试用双哈希降低哈希碰撞的概率。

#### 构造哈希函数

通常是多项式哈希，对于一个长度为$l$的字符串$s$，可以定义它的多项式哈希函数为这样：

$$
f(s)=\sum_{i=1}^ls[i]\times b^{l-i}(\bmod M)
$$

比如字符串$xyz$，它的哈希函数值就是$xb^2+yb+z$，就像一个$b$进制的数一样。当然也可以反过来，将哈希函数定义为：

$$
f(s)=\sum_{i=1}^l s[i]\times b^{i-1}(\bmod M)
$$

相应的，$xyz$的哈希函数值就是$x+yb+cb^2$​。实际使用的时候不要混淆。

<del>哈希碰撞不想算了我要咕咕咕。</del>

参考代码（及其朴素）：

```cpp
ll Hash(string s) {
    ll ret = 0;
    ll b = 1, n = s.size();
    for (ll i = n - 1;i >= 0;i--) {
        ret += b * (ll)s[i];
        b *= bas1;
        ret %= mo;
    }
    return ret;
}
```

考虑到更多时候需要配合字符串子串的哈希值，所以我们需要预处理出每个前缀的哈希值，这样就能快速求得子串的哈希值了。

```cpp
for (ll i = 0;i < ls;i++) {
    h[i + 1] = h[i] * bas1 + s[i] - 'a';
}
// 获得子串s[p - len +1...p]的哈希值
f(s[p - len + 1...p]) = h[p] - h[p - len] * pow(bas1, len);
```

还是这个题：[P4824 [USACO15FEB\] Censoring S - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P4824)

利用哈希解决：

##### 代码

```cpp
ll h[maxn];

void solve() {
    string s, t;cin >> s >> t;

    ll ls = s.size(), lt = t.size();
    ll hb = 0ll, b = 1ll;
    for (ll i = 0;i < lt;i++) {
        hb = hb * bas1 + t[i] - 'a';
        b *= bas1;
    }


    ll p = 0;
    ll ans[ls + 5];
    for (ll i = 0;i < ls;i++) {
        p++;
        h[p] = h[p - 1] * bas1 + s[i] - 'a';
        ans[p] = i;
        if (p - lt >= 0 && h[p] - h[p - lt] * b == hb) {
            p -= lt;
        }
    }
    for (ll i = 1;i <= p;i++) {
        cout << s[ans[i]];
    }
}
```
