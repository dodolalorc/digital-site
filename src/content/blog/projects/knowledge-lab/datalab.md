---
title: "🧪CS-APP Datalab"
description: "CS:APP Data Lab 实验记录，整理环境测评、单元测试命令和各个 bit-level 函数的实现。"
date: "2024-07-04T20:49:31+08:00"
draft: false
showHeroImage: false
tags:
  - 项目实践
  - CSAPP
  - 计算机系统
  - 实验记录
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

## 0. before start

实验需要的材料在这里：[CSAPP Datalab](https://csapp.cs.cmu.edu/3e/labs.html)

CSAPP原书[在线阅读](https://reader-service.fcdn.sk/?source=a1a8b38b00a02eca2efb546312b8cf476ebd82a877fb9ae49fb47e3a8953b309&download_location=https%3A%2F%2Fz-lib.gs%2Fdl%2F5644998%2Face0a0)

将`datalab-handout.tar`下载复制到计划用来实验的目录下，解压：

```shell
tar xvf datalab-handout.tar
```

解压之后，文件中`bit.c`是包含13个编程题中每个题的骨架。实验要求是使用没有任何循环或条件语句，以及有限的c算术和逻辑运算符来完成其中每个函数的内容，只能使用如下8个运算符：

```c
! ~ & ^ | + << >>
```

### 测评

在`btest`文件夹中，包含了一个测试程序，可以用来测试我们的实现是否正确。我们可以通过`make`命令编译`btest`，然后运行：

```bash
# 编译并运行
make && ./btest
# 对某个函数进行单元测试
make && ./btest -f bitXnor
# 对某个函数进行单元测试，且指定测试用例，以 -1 指定第一个参数，依次类推
make && ./btest -f bitXnor -1 7 -2 0xf
```

`dlc`：用于检查我们的实现是否符合实验要求：

```bash
./dlc bits.c
```

接下来，按照难度从易到难，我们依次完成实验

## 1. bitXor

异或等价于**不是同0且不是同1**。

### 代码

```c
//1
/*
 * bitXor - x^y using only ~ and &
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 *   Rating: 1
 */
int bitXor(int x, int y) {
  return ~(~x&~y)&~(x&y);
}
```

## 2. tmin

获得对2补码的最小int值。在C中，`int`是32位的，所以补码的最小值就是符号位为1，其余位为0的值，对0x1左移31位即可。

### 代码

```c
/*
 * tmin - return minimum two's complement integer
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {
  return 1 << 31;
}
```

## 3. isTmax

判断$x$是否是`int`的最大整数。最大整数`tmax`应该为`0x7fffffff`。

题目提示不允许使用移位操作。

注意到：

$$
\begin{aligned}
Tmax=0x7fffffff,Tmin=0x80000000\\
so,that:Tmax=\sim Tmin,Tmax+1 = Tmin\\
-Tmin = \sim Tmin + 1 = Tmax + 1 = Tmin\\
so,that:\\
-(\sim Tmax) = Tmax + 1 = \sim Tmax\\
\end{aligned}
$$

也就是说，假如`~x`的相反数与`~x`相等，则满足`x=Tmax`。

注意除了`Tmax`拥有这个性质，当`x=-1`时：

$$
\begin{aligned}
x=0xffffffff\\
\sim x=0x00000000\\
-(\sim x)=\sim (\sim x)+1 = x+1 = 0x00000000
\end{aligned}
$$

也满足这个上述特点，需要排除。

### 代码

```c
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  return !!(~x)&!((~x)^(x+1));
}
```

> [!tip]+ 提示
> 注意返回值是`int`型的，所以需要使用`!!`将结果转换为0或1。

## 4. allOddBits

当$x$中所有奇数位都为$1$时返回`true`。

奇数位都为$1$的数形如：

$$
x=0b1x_{30}1x_{28}1...1x_{2}1x_{0}
$$

思路是构造偶数位都为$1$的掩码`0x55555555`，再与$x$按位取或，若能构造出`0xffffffff`则复合要求。

由于实验要求不允许使用长度超过8位的常量，所以通过移位操作来构造掩码。

### 代码

```c
/*
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
  int mask = 0x55 + (0x55 << 8);
  mask = mask + (mask << 16);
  return !(~(mask | x));
}
```

## 5. negate

返回$x$的相反数。

这个操作在第三个实验里其实已经使用过了。

$$
-x=\sim x + 1
$$

### 代码

```c
/*
 * negate - return -x
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return ~x + 1;
}
```

## 6. isAsciDigit

判断$x$是否是ASCII码0~9中的某一个，即判断$0x30\leq x\leq 0x39$。

注意到$0x30\sim 0x39$的低4位从$0000\sim 1001$，低5~8位为$0011$，可以分别判断。

在满足低5~8位为$0011$的前提下，若倒数第4位为0则符合要求，若倒数第4位为1则需判断是否为$1000$或$1001$，即中间2位是否是0。

### 代码

```c
/*
 * isAsciiDigit - return 1 if 0x30 <= x <= 0x39 (ASCII codes for characters '0' to '9')
 *   Example: isAsciiDigit(0x35) = 1.
 *            isAsciiDigit(0x3a) = 0.
 *            isAsciiDigit(0x05) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 3
 */
int isAsciiDigit(int x) {
  int f3 = !((x >> 4) ^ 3);
  int f0t9 =!! (!(x & 8) + !(x & 6));
  return f3 & f0t9;
}
```

## 7. conditional

实现出`w =( x ? y : z)`的条件判断。

感觉在上个题就实现了，上题相当于对一个二进制数$x=x_4 x_3 x_2 x_1$，是否满足$(x_4 == 1)?(x \& 6 == 0):1$。

判断$x$通过`!!x`获得`0/1`，再通过按位取反+1分别获得`0x00000000`和`0xffffffff`，再与$y$和$z$按位或并相加，获得结果。

### 代码

```c
/*
 * conditional - same as x ? y : z
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  int f = !!x;
  int mask = ~f + 1;
  return (y & mask) + (z & ~mask);
}
```

## 8. isLessOrEqual

判断是否符合$x\leq y$的关系。

首先比较符号位，若符号位相同，则判断$x-y\leq 0$是否成立。减号可以由按位取反+1获得相反数，再相加实现。

### 代码

```c
/*
 * isLessOrEqual - if x <= y  then return 1, else return 0
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  int fx = x >> 31;
  int fy = y >> 31;
  int f = fx ^ fy;
  int z = x + ~y + 1;
  return !!((f & fx) | ((!f) & ((!z) | z >> 31)));
}
```

## 9. logicalNeg

实现逻辑取反，$x$非0返回0，$x$为0返回1。

通过取反+1获得相反数，如果x是0，其相反数与x拥有相同的符号位0，否则在x和其相反数两个数之间一定会有至少一个符号位为1。

在`Tmin = 0x80000000`中也一致，`-Tmin = ~Tmin + 1 = 0x7fffffff + 1 = 0x80000000`。

### 代码

```c
/*
 * logicalNeg - implement the ! operator, using all of
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int logicalNeg(int x) {
  return (((~x + 1) | x) >> 31) + 1;
}
```

## 10. howManyBits

计算出表示$x$​需要的最少补码位数。

$$
\begin{aligned}
0=0b0,1bit\\
1=0b01,2bits\\
-1=0b1,1bit\\
2=0b010,3bits\\
-2=0b10,2bits\\
3=0b011,3bits\\
-3=0b101,3bits
\end{aligned}
$$

如果是正数的话`x`补码形如：`0x00001...`，所需补码位数是从左向右第一个1的位置在+1（符号位），负数的话`x`补码形如：`0x11110...`，取反之后是`0x00001...`，所需位数是从左向右第一个1的位置+1。

不能通过循环来从左向右找，尝试二分找第一个1的位置。

`int`型有32位，逐渐二分为16、8、4、2、1位。

$$
\begin{aligned}
&x = 0b0001,1...,....,....,....,....,....,....\\
loop1:& !!(x>>16)=1,b16=16\\
&\text{高16位存在1，则可以舍去低16位，将x右移16位}\\
&x = x>>16=0b0001,1...,...,...\\
loop2:&...
\end{aligned}
$$

最后统计完毕之后要+1符号位。

### 代码

```c
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  int f = !!(x >> 31);
  f = ~f + 1;
  x = (x & ~f) + (~x & f);
  int b16 = (!!(x >> 16)) << 4;
  x = x >> b16;
  int b8 = (!!(x >> 8)) << 3;
  x = x >> b8;
  int b4 = (!!(x >> 4)) << 2;
  x = x >> b4;
  int b2 = (!!(x >> 2)) << 1;
  x = x >> b2;
  int b1 = !!(x >> 1);
  x = x >> b1;
  return b16 + b8 + b4 + b2 + b1 + x + 1;
}
```

## 11. floatScale2

求一个float浮点数乘2之后的值。

`float`的各位：

| 符号  |   指数(exp)    |   尾数   |
| :---: | :------------: | :------: |
|   1   |       8        |    23    |
| `0/1` | `0x01111111+e` | 小数部分 |

通过定义先按指数是否为`0x00000000`或`0x11111111`、`≠0 & ≠255`分类。

- 对规格化数进行指数+1（若+1后为255则返回无穷大）

- 非规格化数保持符号位不变，左移一位（注意：若尾数最左边一位为1时，乘2后恰好是规格化数，故保留符号位整体左移即可）
- 无穷大保持不变
- NaN保持不变。

### 代码

```c
/*
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
  unsigned s = uf & 0x80000000;
  unsigned exp = uf & 0x7f800000;
  unsigned f = uf & 0x007fffff;
  if(!exp){
    return s | (uf << 1);
  }
  if(!(exp ^ 0x7f800000)){
    return uf;
  }
  exp = exp + 0x00800000;
  if(exp == 0x7f800000){
    return 0x7f800000 | s;
  }

  return s | (exp & 0x7f800000) | f;
}
```

## 12. floatFloat2Int

将`float`浮点数转化为`int`类型。

算出真实的`Exp`：`Exp + 0b0111111 = e`，

再给尾数最左侧补一位1，整体右移`|Exp-23|`位（舍位），再通过正负性取补码。

注意，若溢出或是NaN返回`0x80000000u`

### 代码

```c
/*
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
  unsigned s = uf & 0x80000000,
           e = uf & 0x7f800000,
           f = uf & 0x007fffff;
  int exp = (e >> 23) - 0x7f;
  unsigned res = f | 0x00800000;
  if(exp < 0) return 0;
  if(exp >= 31) return 0x80000000;
  if(exp < 23)exp = 23 - exp;
  else exp = exp - 23;
  res = res >> exp;
  if(s)return -res;
  else return res;
}
```

## 13. floatPower2

求浮点表示下的$2.0$的$x$次。

emmm其实就是`exp + x`，那就处理好$0b000000$和$0b11111111$的情况就好了。

### 代码

```c
/*
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 *
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatPower2(int x) {
  int exp = 0x7f + x;
  if(exp < 0x00)return 0;
  if(exp >= 0xff)return 0x7f800000;
  if(exp == 0x00)return 1;
  return exp << 23;
}
```

写完哩~最后一个样例似乎跑了好久（。

## 总结碎碎念

做完实验第一次感觉到`!f`和`~f`的区别（迫真。

下个实验再见(∪.∪ )...zzz
