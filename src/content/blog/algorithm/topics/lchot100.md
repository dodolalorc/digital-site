---
title: "LeetCode Hot 100记录（19/100）"
description: "LeetCode Hot 100 刷题记录，按哈希、双指针等分类整理题意与代码实现。"
date: "2025-03-13T14:13:22+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# 哈希(3/3)

## 1. 两数之和

### 题意

给定一个整数数组  `nums`  和一个整数目标值  `target`，请你在该数组中找出  **和为目标值** *`target`*  的那  **两个**  整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。

### 代码

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            if (mp.count(target - nums[i])) {
                return {mp[target - nums[i]], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};
```

## 49. 字母异位词分组

### 题意

给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。

字母异位词 是由重新排列源单词的所有字母得到的一个新单词。

### 代码

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> mp;
        for (auto& s : strs) {
            string t = s;
            sort(t.begin(), t.end());
            mp[t].push_back(s);
        }
        vector<vector<string>> v;
        for (auto& i : mp) {
            v.push_back(move(i.second));
        }
        return v;
    }
};
```

## 128. 最长连续序列

### 题意

给定一个未排序的整数数组  `nums` ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

请你设计并实现时间复杂度为  `O(n)`  的算法解决此问题。

### 代码

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        if (nums.empty())
            return 0;
        if (nums.size() == 1)
            return 1;

        sort(nums.begin(), nums.end());
        int ans = 1, mx = 1;
        int n = nums.size();
        for (int i = 1; i < n; i++) {
            if (nums[i] == nums[i - 1])
                continue;
            if (nums[i] == nums[i - 1] + 1) {
                mx++;
            } else {
                mx = 1;
            }
            ans = max(mx, ans);
        }
        return ans;
    }
};
```

# 双指针(4/4)

## 283. 移动零

### 题意

给定一个数组  `nums`，编写一个函数将所有  `0`  移动到数组的末尾，同时保持非零元素的相对顺序。

**请注意** ，必须在不复制数组的情况下原地对数组进行操作。

### 代码

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int pre = 0, cur = 0;
        while (cur < nums.size()) {
            if (nums[cur]) {
                if (pre != cur)
                    swap(nums[pre], nums[cur]);
                pre++;
            }
            cur++;
        }
    }
};
```

## 11. 盛最多水的容器

### 题意

给定一个长度为  `n`  的整数数组  `height` 。有  `n`  条垂线，第  `i`  条线的两个端点是  `(i, 0)`  和  `(i, height[i])` 。

找出其中的两条线，使得它们与  `x`  轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

**说明：** 你不能倾斜容器。

### 代码

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1;
        int cur = (r - l) * min(height[l], height[r]);
        int ans = cur;
        while (l < r) {
            ans = max(ans, cur);
            if (height[l] < height[r]) {
                l++;
            } else {
                r--;
            }
            cur = (r - l) * min(height[l], height[r]);
        }
        return ans;
    }
};
```

## 15. 三数之和

### 题意

给你一个整数数组  `nums` ，判断是否存在三元组  `[nums[i], nums[j], nums[k]]`  满足  `i != j`、`i != k`  且  `j != k` ，同时还满足  `nums[i] + nums[j] + nums[k] == 0` 。请你返回所有和为  `0`  且不重复的三元组。

**注意：** 答案中不可以包含重复的三元组。

### 代码

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        int i = 0;
        while (i + 2 < n) {
            if (nums[i] > 0) {
                break;
            }
            if (i > 0 && nums[i] == nums[i - 1]) {
                i++;
                continue;
            }

            int l = i + 1, r = n - 1;
            while (l < r) {
                if (nums[i] + nums[l] + nums[r] < 0) {
                    l++;
                } else if (nums[i] + nums[l] + nums[r] > 0) {
                    r--;
                } else {
                    res.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) {
                        l++;
                    }
                    while (l < r && nums[r] == nums[r - 1]) {
                        r--;
                    }
                    l++, r--;
                }
            }
            i++;
        }
        return res;
    }
};
```

## 42. 接雨水

### 题意

给定  `n`  个非负整数表示每个宽度为  `1`  的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

### 代码

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        int lmx = 0, rmx = 0, mx = 0;
        int ans = 0;
        int l = 0, r = n - 1;
        while (l < r) {
            lmx = max(lmx, height[l]);
            rmx = max(rmx, height[r]);
            if (height[l] < height[r]) { // 低的存水上限已经定了
                ans += lmx - height[l];
                l++;
            } else {
                ans += rmx - height[r];
                r--;
            }
        }
        return ans;
    }
};
```

# 滑动窗口(2/2)

## 3. 无重复字符的最长子串

### 题意

给定一个字符串  `s` ，请你找出其中不含有重复字符的  **最长子串**  的长度。

### 代码

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.size();
        if (!n) {
            return 0;
        }
        unordered_map<char, int> cnt;
        int l = 0, r = 1;
        int ans = 1;
        cnt[s[0]]++;
        while (r < n) {
            while (r < n && cnt[s[r]] == 0) {
                cnt[s[r]]++;
                r++;
            }
            ans = max(r - l, ans);
            while (l < r && cnt[s[r]] != 0) {
                cnt[s[l]]--;
                l++;
            }
            if (r < n) {
                cnt[s[r]]++;
                r++;
            }
        }

        return ans;
    }
};
```

## 438. 找到字符串中所有字母异位词

### 题意

给定两个字符串  `s`  和  `p`，找到  `s`  中所有  `p`  的  **异位词**  的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

### 代码

```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        if (s.size() < p.size() || s.empty() || p.empty()) {
            return {};
        }
        vector<int> ts(26, 0), tp(26, 0);
        int n = s.size(), m = p.size();
        for (int i = 0; i < m; i++) {
            ts[s[i] - 'a']++, tp[p[i] - 'a']++;
        }
        int mc = 0;
        for (int i = 0; i < 26; i++) {
            mc += tp[i] == ts[i];
        }
        int l = 0, r = m;
        vector<int> pos;
        while (r <= n) {
            if (mc == 26) {
                pos.push_back(l);
            }
            if (r == n)
                break;
            mc -= tp[s[l] - 'a'] == ts[s[l] - 'a'];
            mc -= tp[s[r] - 'a'] == ts[s[r] - 'a'];
            ts[s[l] - 'a']--, ts[s[r] - 'a']++;
            mc += tp[s[l] - 'a'] == ts[s[l] - 'a'];
            mc += tp[s[r] - 'a'] == ts[s[r] - 'a'];
            l++, r++;
        }

        return pos;
    }
};
```

# 子串(3/3)

## 560. 和为 K 的子数组

### 题意

给你一个整数数组  `nums`  和一个整数  `k` ，请你统计并返回  *该数组中和为  `k`  的子数组的个数* 。

子数组是数组中元素的连续非空序列。

### 代码

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> pre(n + 1, 0);
        unordered_map<int, int> mp;
        int ans = 0;
        mp[0] = 1;
        for (int i = 0; i < n; i++) {
            pre[i + 1] = pre[i] + nums[i];
            ans += mp[pre[i + 1] - k];
            mp[pre[i + 1]]++;
        }
        return ans;
    }
};
```

## 239. 滑动窗口最大值

### 题意

给你一个整数数组  `nums`，有一个大小为  `k`  的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的  `k`  个数字。滑动窗口每次只向右移动一位。

返回  *滑动窗口中的最大值* 。

### 代码

```cpp
vector<int> maxSlidingWindow(vector<int> &nums, int k) {
  deque<int> q;
  int n = nums.size();
  for (int i = 0; i < k; i++) {
    while (!q.empty() && nums[q.back()] < nums[i]) {
      q.pop_back();
    }
    q.push_back(i);
  }
  vector<int> ans = {nums[q.front()]};
  for (int i = k; i < n; i++) {
    while (!q.empty() && q.front() <= i - k) {
      q.pop_front();
    }
    while (!q.empty() && nums[q.back()] < nums[i]) {
      q.pop_back();
    }
    q.push_back(i);
    ans.push_back(nums[q.front()]);
  }

  return ans;
}
```

## 76. 最小覆盖子串

### 题意

给你一个字符串  `s` 、一个字符串  `t` 。返回  `s`  中涵盖  `t`  所有字符的最小子串。如果  `s`  中不存在涵盖  `t`  所有字符的子串，则返回空字符串  `""` 。

### 代码

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        int n = s.size(), m = t.size();
        if (n < m) {
            return "";
        }
        vector<int> mc(128, 0), cur(128, 0);
        for (int i = 0; i < m; i++) {
            mc[t[i]]++, cur[s[i]]++;
        }

        int tot = 0;

        for (char c = 'A'; c <= 'Z'; c++) {
            if (mc[c] <= cur[c]) {
                tot++;
            }
        }
        for (char c = 'a'; c <= 'z'; c++) {
            if (mc[c] <= cur[c]) {
                tot++;
            }
        }

        int L = 0, R = 0;
        string ans = "";
        int l = 0, r = m;
        if (tot == 52) {
            if (R == 0 || r - l < R - L) {
                L = l, R = r;
            }
        }
        while (r < n) {
            while (tot != 52 && r < n) {
                tot -= cur[s[r]] >= mc[s[r]];
                cur[s[r]]++;
                tot += cur[s[r]] >= mc[s[r]];
                r++;
            }
            while (l < r && mc[s[l]] < cur[s[l]]) {
                tot -= cur[s[l]] >= mc[s[l]];
                cur[s[l]]--;
                tot += cur[s[l]] >= mc[s[l]];
                l++;
            }
            if (tot == 52) {
                if (R == 0 || r - l < R - L) {
                    L = l, R = r;
                }
            }
            tot -= cur[s[l]] >= mc[s[l]];
            cur[s[l]]--;
            tot += cur[s[l]] >= mc[s[l]];
            l++;
            while (l < r && mc[s[l]] == 0) {
                tot -= cur[s[l]] >= mc[s[l]];
                cur[s[l]]--;
                tot += cur[s[l]] >= mc[s[l]];
                l++;
            }
        }

        return s.substr(L, R - L);
    }
};
```

# 普通数组(5/5)

## 53. 最大子数组和

### 题意

给你一个整数数组  `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

**子数组**是数组中的一个连续部分。

### 代码

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int pre = 0;
        int mx = nums.front();
        for (int i : nums) {
            pre = max(pre + i, i);
            mx = max(mx, pre);
        }
        return mx;
    }
};
```

## 56. 合并区间

### 题意

以数组  `intervals`  表示若干个区间的集合，其中单个区间为  `intervals[i] = [starti, endi]` 。请你合并所有重叠的区间，并返回  *一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间* 。

### 代码

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> v;
        int l = -1, r = -1;
        for (auto& a : intervals) {
            if (l == -1) {
                l = a[0], r = a[1];
                continue;
            }
            if (a[0] > r) {
                v.push_back({l, r});
                l = a[0];
            }
            r = max(r, a[1]);
        }
        v.push_back({l, r});
        return v;
    }
};
```

## 57. 轮转数组

### 题意

给定一个整数数组  `nums`，将数组中的元素向右轮转  `k`  个位置，其中  `k`  是非负数。

### 代码

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```

## 58. 除自身以外数组的乘积

### 题意

给你一个整数数组  `nums`，返回 数组  `answer` ，其中  `answer[i]`  等于  `nums`  中除  `nums[i]`  之外其余各元素的乘积  。

题目数据  **保证**  数组  `nums`之中任意元素的全部前缀元素和后缀的乘积都在   **32 位**  整数范围内。

请  **不要使用除法，** 且在  `O(n)`  时间复杂度内完成此题。

### 代码

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> pre(n, 1), suf(n, 1);
        pre[0] = nums[0], suf[n - 1] = nums[n - 1];
        for (int i = 1; i < n; i++) {
            pre[i] = pre[i - 1] * nums[i];
            suf[n - i - 1] = suf[n - i] * nums[n - i - 1];
        }
        vector<int> arr;
        for (int i = 0; i < n; i++) {
            if (i - 1 >= 0 && i + 1 <= n - 1)
                arr.push_back(pre[i - 1] * suf[i + 1]);
            else if (i == 0)
                arr.push_back(suf[1]);
            else
                arr.push_back(pre[n - 2]);
        }
        return arr;
    }
};
```

## 59. 缺失的第一个正数

### 题意

给你一个未排序的整数数组  `nums` ，请你找出其中没有出现的最小的正整数。

请你实现时间复杂度为  `O(n)`  并且只使用常数级别额外空间的解决方案。

### 代码

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            if (nums[i] <= 0)
                continue;
            while (nums[i] <= n && nums[i] - 1 >= 0 &&
                   nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1)
                return i + 1;
        }
        return n + 1;
    }
};
```

# 矩阵(2/4)

## 73. 矩阵置零

### 题意

给定一个  $m \times n$  的矩阵，如果一个元素为  **0** ，则将其所在行和列的所有元素都设为  **0** 。请使用  **[原地](http://baike.baidu.com/item/%E5%8E%9F%E5%9C%B0%E7%AE%97%E6%B3%95)**  算法。

### 代码

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int n = matrix.size();
        if (!n)
            return;
        int m = matrix[0].size();
        vector<bool> row(n), col(m);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (matrix[i][j] == 0) {
                    row[i] = col[j] = true;
                }
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (row[i] || col[j])
                    matrix[i][j] = 0;
            }
        }
    }
};
```

## 54. 螺旋矩阵

### 题意

给你一个  `m`  行  `n`  列的矩阵  `matrix` ，请按照  **顺时针螺旋顺序** ，返回矩阵中的所有元素。

### 代码

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int n = matrix.size();
        if (!n)
            return {};
        if (n == 1)
            return matrix[0];
        int m = matrix[0].size();
        if (m == 1) {
            vector<int> v;
            for (int i = 0; i < n; i++)
                v.emplace_back(matrix[i][0]);
            return v;
        }
        int x = 0, y = 0, k = 0;
        vector<pair<int, int>> dxy = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
        vector<int> v = {matrix[x][y]};
        matrix[x][y] = -101;
        while (v.size() < n * m) {
            int px = x + dxy[k].first, py = y + dxy[k].second;
            if (px < 0 || px >= n || py < 0 || py >= m ||
                matrix[px][py] == -101) {
                k = (k + 1) % 4;
                px = x + dxy[k].first, py = y + dxy[k].second;
            }
            v.push_back(matrix[px][py]);
            matrix[px][py] = -101;
            x = px, y = py;
        }

        return v;
    }
};
```

## 48. 旋转图像

### 题意

给定一个  $n\times n$ 的二维矩阵  `matrix`  表示一个图像。请你将图像顺时针旋转 90 度。

你必须在  **[原地](https://baike.baidu.com/item/%E5%8E%9F%E5%9C%B0%E7%AE%97%E6%B3%95)**  旋转图像，这意味着你需要直接修改输入的二维矩阵。**请不要**  使用另一个矩阵来旋转图像。

## 240. 搜索二维矩阵 II

<!-- TODO

# 链表(0/14)

## 160. 相交链表

## 206. 反转链表

## 234. 回文链表

## 141. 环形链表

## 142. 环形链表 II

## 21. 合并两个有序链表

## 2. 两数相加

## 19. 删除链表的倒数第 N 个结点

## 24. 两两交换链表中的节点

## 25. K 个一组翻转链表

## 138. 随机链表的复制

## 148. 排序链表

## 23. 合并 K 个升序链表

## 146. LRU 缓存

# 二叉树(0/15)

## 94. 二叉树的中序遍历

## 104. 二叉树的最大深度

## 226. 翻转二叉树

## 101. 对称二叉树

## 543. 二叉树的直径

## 102. 二叉树的层序遍历

## 108. 将有序数组转换为二叉搜索树

## 98. 验证二叉搜索树

## 230. 二叉搜索树中第 K 小的元素

## 199. 二叉树的右视图

## 114. 二叉树展开为链表

## 105. 从前序与中序遍历序列构造二叉树

## 437. 路径总和 III

## 236. 二叉树的最近公共祖先

## 124. 二叉树中的最大路径和

# 图论(0/4)

## 200. 岛屿数量

## 994. 腐烂的橘子

## 207. 课程表

## 208. 实现 Trie (前缀树)

# 回溯

## 46. 全排列

## 78. 子集

## 17. 电话号码的字母组合

## 39. 组合总和

## 22. 括号生成

## 79. 单词搜索

## 131. 分割回文串

## 51. N 皇后

# 二分查找

## 35. 搜索插入位置

## 74. 搜索二维矩阵

## 34. 在排序数组中查找元素的第一个和最后一个位置

## 33. 搜索旋转排序数组

## 153. 寻找旋转排序数组中的最小值

## 4. 寻找两个正序数组的中位数

# 栈

## 20. 有效的括号

## 155. 最小栈

## 394. 字符串解码

## 739. 每日温度

## 84. 柱状图中最大的矩形

# 堆

## 215. 数组中的第 K 个最大元素

## 347. 前 K 个高频元素

## 295. 数据流的中位数

# 贪心算法

## 121. 买卖股票的最佳时机

## 55. 跳跃游戏

## 45. 跳跃游戏 II

## 763. 划分字母区间

# 动态规划

## 70. 爬楼梯

## 118. 杨辉三角

## 198. 打家劫舍

## 279. 完全平方数

## 322. 零钱兑换

## 139. 单词拆分

## 300. 最长递增子序列

## 152. 乘积最大子数组

## 416. 分割等和子集

## 32. 最长有效括号

# 多维动态规划

## 62. 不同路径

## 64. 最小路径和

## 5. 最长回文子串

## 1143. 最长公共子序列

## 72. 编辑距离

# 技巧

## 136. 只出现一次的数字

## 169. 多数元素

## 75. 颜色分类

## 31. 下一个排列

## 287. 寻找重复数

 -->
