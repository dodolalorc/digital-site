---
title: "购物车页面制作教程（包含分页设计）"
description: "购物车页面制作教程，围绕需求分析、整体布局、购物车列表和分页设计整理实现思路。"
date: "2024-07-06T19:16:27+08:00"
draft: false
showHeroImage: false
tags: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> [!abstract]- 为什么有这篇低质量文章
> 这篇文章用于2024年蓝旭暑期项目前的培训作业教学，目的是从零开始构建一个购物车页面，以此来熟悉原生前端三件套。o((>ω< ))o

# 需求分析

**功能要求**：

- 全选、单选联动逻辑（包括依次选中所有物品时自动勾选全选按钮、勾选全选时勾选所
  有单选、取消全选后取消所有选中等）、结算小项总价以及整体总价。

- 展示商品图片、名称、价格、数量等基础信息。

- 体现分页展示购物车内商品内容。

- 可以对购物车内商品进行增删改，即改变数量、结算商品、删除商品（结合分页显示数
  目合理调整）等。

- 美观的页面效果。

**加分功能**

- 实现在购物车页面查找商品的功能。

- 自己写一个弹出提示框，在删除商品、结算商品等行为后与用户进行确认交互。

# 页面布局

## 整体布局

整个购物车页面有三个主要功能：`列表`、`结算`、`分页`。

购物车页面的布局主要分为两部分：**购物车列表**和**结算栏**。

购物车列表是购物车页面的主体部分，用于展示用户购物车中的商品信息，我们将整个列表设计在整个页面的中部，在顶部设计一个`nav`用于展示购物车的标题，以及作为之后的路由跳转的位置，这个nav设计成吸顶。

中间主体部分是购物车列表，用于展示用户购物车中的商品信息。

底部我设计为结算栏，用于展示用户当前选中的总价，以及结算按钮。

分页的位置我设计在购物车列表之上，并且把它设计成向下滑动时吸顶的设计，这样用户在浏览商品时可以随时翻页。

于是整体的设计如下：

```html
<body>
  <div class="shell">
    <nav>
      {/* 用来设计路由栏 */}
      <img
        class="nav-item"
        src="https://www.coca-cola.com/content/dam/onexp/cn/zh/logos/coke-header.png"
        alt=""
      />
      <div class="nav-item">购物车</div>
      <div class="nav-item">订单</div>
      <div class="nav-item">我的</div>
    </nav>

    <main>
      <div class="title-div">
        <div class="title">当前选中1样商品</div>
        <div class="pagination">
          <div class="page">1</div>
          {/* 页码 */}
          <div class="page">n</div>
        </div>
      </div>
      <div class="container">
        <div class="cart-item">{/* 详细的购物车内商品信息 */}</div>
        <div class="cart-item">{/* 详细的购物车内商品信息 */}</div>
        {/* .... */}
      </div>
    </main>

    <footer>
      <div class="sum-foot">{/* 展示全选按钮和结算信息 */}</div>
    </footer>
  </div>
</body>
```

> [!tip]- 关于吸顶和吸底的设计
> 设计吸顶和吸底的时候，我们可以使用`position: sticky`属性，这个属性可以让元素在滚动到特定位置时固定在页面上，这样可以让用户在浏览页面时更加方便。

### 购物车列表设计

购物车列表的设计主要是展示购物车内的商品信息，我们需要展示商品的图片、名称、价格、数量等基础信息，我们把每个商品信息设计成一个卡片，之后我们可以通过js动态生成这些卡片。

这是我设计的一个商品卡片的结构：

```html
<div class="cart-item">
  <input type="radio" /> {/* 单选按钮 */} <img src="" alt="" /> {/* 商品图片 */}
  <div class="item-info">
    <h2>{/* 商品名称 */}</h2>
    <div class="info">
      <div class="desp">{/* 商品描述 */}</div>
      <div class="detail">
        <div class="price">{/* 价格 */}</div>
        <div class="quantity">{/* 数量 */}</div>
      </div>
    </div>
  </div>
  <button class="del-btn">删除</button>
</div>
```

这是我的CSS样式：

```css
.cart-item {
  height: fit-content;
  width: 80%;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 0.666667px solid rgba(255, 255, 255, 0.18);
  box-shadow: rgba(142, 142, 142, 0.19) 0px 6px 15px 0px;
  -webkit-box-shadow: rgba(142, 142, 142, 0.19) 0px 6px 15px 0px;
  border-radius: 12px;
  -webkit-border-radius: 12px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.cart-item input[type="radio"] {
  margin-top: 1rem;
  margin-right: 1rem;
  cursor: pointer;
  width: 1.5rem;
}

.cart-item img {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  -webkit-border-radius: 12px;
  box-shadow: rgba(142, 142, 142, 0.19) 0px 6px 15px 0px;
}

.cart-item .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* align-items: center; */
  margin-left: 1rem;
}

.cart-item .info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .desp {
    flex: 3;
  }

  .detail {
    flex: 1;
    margin: 0 1rem;
    background-color: #dddddd94;
    border-radius: 12px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 0.5rem;

    .price {
      font-size: large;
      font-weight: bold;
      display: flex;

      span {
        flex: 1;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }

    .quantity {
      font-size: medium;
      font-weight: bold;
      display: flex;

      span {
        flex: 1;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
  }
}

.cart-item .del-btn {
  background-color: #f8f9fa;
  border: none;
  color: red;
  font-size: large;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.cart-item .del-btn:hover {
  color: #007bff;
}
```

#### CSS解释

像上面这样直接甩出一堆代码，感觉会看起来有点懵，不过一条条的讲CSS会有点枯燥，这里稍微解释一下整体的设计想法。

我比较习惯使用flex布局，所以整个卡片的设计都是基于flex布局的，首先整个卡片是一个`flex`容器，里面有四个部分：`单选按钮`、`商品图片`、`商品信息`、`删除按钮`。按照这个顺序，我将他们横向排列，分别占据不同的比例。

> [!tip]- 在flex布局中让内部元素水平垂直居中，并且间隔合适的技巧
> 在flex布局中，我们可以通过`justify-content`和`align-items`来控制元素的水平和垂直居中，通过`margin`来控制元素之间的间隔。
>
> 其中`justify-content`用于控制元素在主轴上的排列方式，`align-items`用于控制元素在交叉轴上的排列方式。
>
> ```css
> .div {
>   display: flex;
>   justify-content: center;
>   align-items: center;
> }
> ```
>
> `justify-content`除了`center`之外还有`flex-start`、`flex-end`、`space-between`、`space-around`等属性，`align-items`除了`center`之外还有`flex-start`、`flex-end`、`baseline`、`stretch`等属性，是很方便的布局方式，可以节省大量之前需要通过不断调整`margin`来实现的布局。具体区别可以在[justify-content](https://developer.mozilla.org/zh-CN/docs/Web/CSS/justify-content)和[align-items](https://developer.mozilla.org/zh-CN/docs/Web/CSS/align-items)在线演示。

我固定了单选按钮、商品图片、删除按钮的大小，商品信息部分占据了剩下的空间。

商品信息部分又分为两个部分：`商品描述`和`商品价格`，我将他们分别占据了不同的比例，使得整个卡片看起来比较美观。

> [!tip]- 在flex布局中让内部元素占据不同的比例
> 上面的`justify-content`和`align-items`更倾向于把元素均匀排列，有时候我们也需要让元素分别占据不同的比例，这时候我们可以试试通过`flex`属性来控制元素。
>
> 例如上面的代码中，我通过`flex: 3`和`flex: 1`来控制商品描述和商品价格分别占据了3:1的比例。这样的写法相比较于`width`属性更加灵活，可以根据不同的屏幕大小自动调整。就像下面这样：
>
> ```css
> .cart-item .info {
>   display: flex;
>   flex-direction: row;
>   justify-content: space-between;
>
>   .desp {
>     flex: 3;
>   }
>
>   .detail {
>     flex: 1;
>     display: flex;
>     flex-direction: column;
>     justify-content: space-around;
>
>     .price {
>       span {
>         flex: 1;
>       }
>     }
>
>     .quantity {
>       span {
>         flex: 1;
>       }
>     }
>   }
> }
> ```

#### 图标库

相信大家看完图片之后发现，我在价格和数量的部分的加号减号按钮，以及`￥`符号看起来不像原生的按钮和字符，这里我使用了`font-awesome`图标库，这是一个很好用的图标库，在美化页面的时候我们其实会尝试使用很多图标，我比较喜欢的两个图标库是[Font awesome](https://fontawesome.com/)和[iconfont](https://www.iconfont.cn/)，大家可以尝试使用，使用方法大家可以自行学习，这里我就不再赘述了。

#### 在线工具推荐

有些同学可能不太擅长调整出好看的盒子，这里我推荐一个好用的前端工具在线网站：{{<link "https://lingdaima.com/">}} ，可以帮助你快速调整出好看的CSS样式。

当然了，在线工具只是起到一个辅助作用，调整CSS的时候还是需要自己多尝试，多调整，多看看效果。大家不要过分依赖哦(‾◡◝)

这里是整体设计完Html结构和CSS之后的效果：

![购物车整体页面](https://img.dodolalorc.cn/i/2024/07/07/66897122a1a47.png)

这个页面的效果是我自己设计的，大家可以根据自己的喜好进行调整，这里只是提供一个参考，相应的源码我也会公开放在我的gitee上，大家可以自行下载，仓库的地址在文末。

# JavaScript逻辑

我比较习惯在设计完页面之后再写JavaScript逻辑，这样可以更好的理清思路，而且不需要总是再次调整Html和CSS。在设计完页面之后，我们通过让这个页面不再是一个静态的页面，而是一个可以动态交互的页面。

> [!tip]- 通过本地json来获得数据和渲染数据"
> 由于这个只是用于前端学习的小项目，我们没有接口，不过在生成应用中，页面的数据是来自后端传递而来的（往往是一个json），所以在这个项目中，我们可以通过本地的json文件来模拟后端返回的数据，这样可以更好的模拟真实的购物车页面，同时也可以更好的理解前后端的交互。
>
> 引入json文件的方法是通过`fetch`方法，这是一个异步方法，我们可以通过这个方法来获取json文件，然后通过`json()`方法来解析json文件。
>
> 就像这样：
>
> ```javascript
> fetch("data.json")
>   .then((response) => response.json())
>   .then((data) => console.log(data));
> ```

## JS逻辑

为了方便管理数据，我将数据保存在一个全局变量中，这样可以更好的操作数据，下文的代码中，我会使用这些全局变量来操作数据。

```javascript
var goods = []; // 当前页的商品列表
var totItems = 0; // 总商品数
var curPage = 1; // 当前页码
var totPages = 1; // 总页数

var selectTotal = 0; // 选中商品总数
var curSelectGoods = []; // 选中的商品列表
var selectAllStatus = false; // 是否全选
```

### 数据获取与渲染

首先我们需要通过`fetch`方法来获取json文件，然后通过`json()`方法来解析json文件，这样我们就可以得到一个json对象，这个对象就是我们的商品信息。

```javascript
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    render(data);
  });
```

获取数据之后，我们设置全局变量来保存当前的数据状态，然后将数据渲染到页面上，就像这样：

```javascript
const renderCartList = () => {
  const goodsContainer = document.querySelector("#container");
  goodsContainer.innerHTML = "";
  if (goods.length === 0 && totItems !== 0) {
    // 如果购物车本页没有商品（通过删除删空的情况或意外情况），应该重新请求数据，初始化购物车
    initGoods();
  } else if (totItems === 0) {
    // 如果购物车没有商品，应该显示空购物车
    goodsContainer.innerHTML =
      '<div class="empty-cart">购物车为空`(*>﹏<*)′</div>';
    return;
  }
  for (let i = 0; i < goods.length; i++) {
    const good = goods[i];
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.setAttribute("id", "item-" + good["id"]);
    cartItem.innerHTML = `<input type="checkbox" onClick="selectGood(${good["id"]})">
          <img src="${good["image"]}" alt="">
          <div class="item-info">
            <h2>商品名称：${good["name"]}</h2>
            <div class="info">
              <div class="desp">
                商品描述：<span>${good["description"]}</span>
              </div>
              <div class="detail">
                <div class="price">单价：<span><i class="fa-solid fa-yen-sign"></i>
                  <span>${good["price"].toFixed(2)}</span>
                </span></div>
                <div class="price">小计：<span><i class="fa-solid fa-yen-sign"></i>
                  <span class="tot-price">${(good["price"] * good["quantity"]).toFixed(2)}</span>
                </span></div>
                <div class="quantity">
                  数量：
                  <span class="count">
                    <i class="fa-solid fa-circle-minus" onClick="changeQuantity(${good["id"]}, -1)"></i>
                    <span>${good["quantity"]}</span>
                    <i class="fa-solid fa-circle-plus" onClick="changeQuantity(${good["id"]}, 1)"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button class="del-btn" onClick="delItem(${good["id"]})">删除</button>`;
    goodsContainer.appendChild(cartItem);
  }
};
```

注意到，在上述代码中，我为每一个`cart-item`添加了一个唯一的`id`属性，这个属性是用于标识每一个商品的，这样我们在之后的操作中可以通过这个`id`属性来找到对应的商品。

> [!tip]- 关于唯一标识符
> 在实际的项目中，我们往往需要为每一个商品添加一个唯一的标识符，这个标识符可以是商品的`id`，也可以是其他的唯一标识符，这样可以更好的操作商品，例如删除商品、修改商品数量等。

> [!attention]+ 过滤错误数据"
> 在实际的项目中，我们往往会遇到一些错误的数据，例如商品数量为负数或者小数、商品价格为负数等，这些数据是不符合实际的，我们需要在获取数据之后对这些数据进行过滤，这样可以保证数据的正确性。
>
> 如果数据量比较大，我们也会选择使用`filter`方法来过滤数据。

> [!bug]+ 图片加载失败时
> 在实际的项目中，我们往往会遇到一些图片加载失败的情况，这时候我们可以通过`onerror`事件来监听图片加载失败的情况，然后通过一些方法来处理这种情况，例如显示一个默认图片、显示一个提示信息等。

### 改变商品数量

修改商品数量是通过点击`+`和`-`按钮来实现的，我们可以通过`onClick`事件来监听这两个按钮的点击事件，然后通过`changeQuantity`函数来改变商品的数量。

在修改商品数量的时候，我们需要注意一些边界条件，例如商品数量不能为负数，商品数量不能超过库存（本篇的demo没有考虑这个库存上限）等，考虑到加操作和减操作的逻辑是一样的，我们可以通过传入一个参数来判断是加还是减，以减少代码的重复。

以下是我的`changeQuantity`函数：

```javascript
const changeQuantity = (id, cnt) => {
  const item = document.querySelector("#item-" + id);
  const count = item.querySelector(".count span");
  const price = item.querySelector(".tot-price");
  const quantity = parseInt(count.innerHTML);
  if (quantity + cnt <= 0) {
    delItem(id);
    return;
  }
  count.innerHTML = quantity + cnt;
  price.innerHTML = (
    parseFloat(price.innerHTML) +
    cnt * goods.find((good) => good["id"] === id)["price"]
  ).toFixed(2);
  // 这里应该发送请求修改数据，这里只是模拟，直接修改
  goods = goods.map((good) => {
    if (good["id"] === id) {
      good["quantity"] = quantity + cnt;
    }
    return good;
  });
  if (curSelectGoods.find((good) => good["id"] === id)) {
    selectTotal += cnt;
    curSelectGoods = curSelectGoods.map((good) => {
      if (good["id"] === id) {
        good["price"] = parseFloat(price.innerHTML);
      }
      return good;
    });
    updateTotalCount(); // 更新总价
  }
};
```

### 删除商品

删除商品是通过点击删除按钮来实现的，我们可以通过`onClick`事件来监听删除按钮的点击事件，然后通过`delItem`函数来删除商品。

在删除商品的时候，我们需要注意一些边界条件，例如删除商品后本页购物车为空，或者删除商品后购物车的商品数量减少等。

以下是我的`delItem`函数：

```javascript
const delItem = (id) => {
  const item = document.querySelector("#item-" + id);
  item.remove();
  // 这里应该发送请求删除数据，这里只是模拟，直接删除
  goods = goods.filter((good) => good["id"] !== id);
  renderCartList();
  if (curSelectGoods.find((good) => good["id"] === id)) {
    selectTotal -= parseInt(item.querySelector(".count span").innerHTML);
    curSelectGoods = curSelectGoods.filter((good) => good["id"] !== id);
    updateTotalCount();
  }
};
```

### 选中商品

选中商品可以分为两种情况：全选和单选。全选的状态会影响到单选的状态，单选的状态也会影响到全选的状态，在考虑全选和单选的逻辑的时候，我们需要多角度考虑。

在对单个商品进行选中的时候，我们可以通过`onClick`事件来监听单选按钮的点击事件，然后通过`selectGood`函数来选中商品，选中商品时，我们要考虑的有：选中商品的总价、选中商品的数量、全选按钮的状态等。

以下是我的`selectGood`函数：

```javascript
const selectGood = (id) => {
  const item = document.querySelector("#item-" + id);
  const checkbox = item.querySelector('input[type="checkbox"]');
  const price = item.querySelector(".tot-price");
  const quantity = item.querySelector(".count span");
  if (checkbox.checked) {
    selectTotal += parseInt(quantity.innerHTML);
    curSelectGoods.push({ id: id, price: parseFloat(price.innerHTML) });
    updateTotalCount();
  } else {
    selectTotal -= parseInt(quantity.innerHTML);
    curSelectGoods = curSelectGoods.filter((good) => good["id"] !== id);
    updateTotalCount();
  }
  if (curSelectGoods.length === goods.length) {
    selectAllStatus = true;
    const selectAll = document.querySelector("#select-all");
    const icon = selectAll.querySelector("i");
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
  } else {
    selectAllStatus = false;
    const selectAll = document.querySelector("#select-all");
    const icon = selectAll.querySelector("i");
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
  }
};
```

在全选的时候，我们可以通过通过`selectAll`函数来全选商品，全选商品时，我们要考虑的有：选中商品的总价、选中商品的数量、单选按钮的状态等。

以下是我的`selectAll`函数：

```javascript
const setSelectAll = () => {
  const selectAll = document.querySelector("#select-all");
  selectAll.addEventListener("click", () => {
    const items = document.querySelectorAll(".cart-item");
    if (!selectAllStatus) {
      selectTotal = 0;
      curSelectGoods = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.querySelector('input[type="checkbox"]').checked = true;
        selectTotal += parseInt(item.querySelector(".count span").innerHTML);
        curSelectGoods.push({
          id: parseInt(item.getAttribute("id").split("-")[1]),
          price: parseFloat(item.querySelector(".tot-price").innerHTML),
        });
      }
      const icon = selectAll.querySelector("i");
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
    } else {
      for (let i = 0; i < items.length; i++) {
        items[i].querySelector('input[type="checkbox"]').checked = false;
      }
      selectTotal = 0;
      curSelectGoods = [];
      const icon = selectAll.querySelector("i");
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
    }
    updateTotalCount();
    selectAllStatus = !selectAllStatus;
  });
};
```

### 更新总价

我们在结算的时候需要计算当前选中的商品的总价，这个总价依赖于选中的商品数量和价格，我们可以通过`updateTotalCount`函数来更新总价，并在需要的时候调用这个函数。

以下是我的`updateTotalCount`函数：

```javascript
const updateTotalCount = () => {
  const curSelectBox = document.querySelector("#cur-select");
  if (selectTotal) {
    curSelectBox.innerHTML = selectTotal;
  } else {
    curSelectBox.innerHTML = 0;
  }
  const totPriceBox = document.querySelector("#sum");
  if (curSelectGoods.length) {
    totPriceBox.innerHTML = curSelectGoods
      .reduce((acc, cur) => acc + cur["price"], 0)
      .toFixed(2);
  } else {
    totPriceBox.innerHTML = 0;
  }
};
```

### 分页设计

分页是通过点击页码来切换商品列表的，我们可以通过`onClick`事件来监听页码的点击事件，然后通过`changePage`函数来切换商品列表。

标准的分页设计中，每次点击页码时，我们都会重新请求数据，然后重新渲染页面，这样可以保证数据的实时性，这里我只是模拟了这个过程，实际的项目中，我们会通过后端来获取数据。

由于总页数是不确定的，所以我们依然是通过全局变量来保存当前的页码和总页数，并且在切换页码的时候，我们需要考虑一些边界条件，例如页码不能为负数，页码不能超过总页数等。

以下是我的`initPagnation`和`changePagnation`函数：

```javascript
const changePage = (e) => {
  changePagnation(e.target.innerHTML);
  // 按照正常的分页逻辑，这里应该重新请求数据，这里只是模拟，所以直接取数据
  changeCartList();
};

const initPagnation = () => {
  const pagination = document.querySelector("#pagination");
  pagination.innerHTML = "";
  for (let i = 0; i <= totPages + 1; i++) {
    if (i === 0) {
      const prev = document.createElement("i");
      prev.classList.add("fa-solid", "fa-chevron-left", "page-prev");
      if (curPage === 1) {
        prev.disabled = true;
      }
      prev.addEventListener("click", () => {
        if (curPage > 1) {
          changePagnation(curPage - 1);
        }
      });
      pagination.appendChild(prev);
      continue;
    } else if (i === totPages + 1) {
      const next = document.createElement("i");
      next.classList.add("fa-solid", "fa-chevron-right", "page-next");
      if (curPage === totPages) {
        next.disabled = true;
      }
      next.addEventListener("click", () => {
        if (curPage < totPages) {
          changePagnation(curPage + 1);
        }
      });
      pagination.appendChild(next);
      continue;
    }
    const page = document.createElement("div");
    page.innerHTML = i;
    page.classList.add("page");
    if (i === curPage) {
      page.classList.add("active-page");
    }
    page.addEventListener("click", changePage);
    pagination.appendChild(page);
  }
};

const changePagnation = (pageNo) => {
  const page = document.querySelector(".active-page");
  page.classList.remove("active-page");
  const pageArr = document.querySelectorAll(".page");
  curPage = parseInt(pageNo);
  pageArr[curPage - 1].classList.add("active-page");
  changeCartList();
};
```

我这里的分页设计的比较简单，一共只根据json数据设计了5页，在实际项目中，分页的数目是不确定，而且有可能非常多，在设计分页功能的时候，最好的方法是增加一个`...`按钮，点击这个按钮可以展开更多的页码，以及增加一个`跳转`按钮，可以跳转到指定的页码，方便用户查找。

### 结算

结算逻辑比较简单，依然是考虑为空等边界条件。

以下是我的`setPay`函数：

```javascript
const setPay = () => {
  const payBtn = document.querySelector("#pay");
  payBtn.addEventListener("click", () => {
    if (curSelectGoods.length === 0) {
      alert("请选择商品后结算");
      return;
    }
    // 这里应该发送请求支付，这里只是模拟，直接删除
    goods = goods.filter(
      (good) => !curSelectGoods.find((select) => select["id"] === good["id"]),
    );
    curSelectGoods = [];
    selectTotal = 0;
    updateTotalCount();
    if (goods.length === 0) {
      initGoods();
    } else {
      renderCartList();
    }
    alert("支付成功");
  });
};
```

## 消息提示框

在删除商品、结算商品等行为后，我们可以通过一个弹出提示框来与用户进行确认交互，并且可以自定义消息弹出框的类型，这样可以提高用户体验。

以下是我的`alert`函数：

```javascript
const alert = (msg, type) => {
  const alertBox = document.createElement("div");
  alertBox.classList.add("alert-box");
  alertBox.innerHTML = msg;
  if (type === "success") {
    alertBox.classList.add("alert-success");
  } else if (type === "error") {
    alertBox.classList.add("alert-error");
  }
  document.body.appendChild(alertBox);
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 2000);
};

{
  /* 结合上面的支付函数就可以写成下面这样 */
}
const setPay = () => {
  const payBtn = document.querySelector("#pay");
  payBtn.addEventListener("click", () => {
    if (curSelectGoods.length === 0) {
      alert("请选择商品后结算", "error");
      return;
    }
    // 这里应该发送请求支付，这里只是模拟，直接删除
    goods = goods.filter(
      (good) => !curSelectGoods.find((select) => select["id"] === good["id"]),
    );
    curSelectGoods = [];
    selectTotal = 0;
    updateTotalCount();
    if (goods.length === 0) {
      initGoods();
    } else {
      renderCartList();
    }
    alert("支付成功", "success");
  });
};
```

## 查找功能

在本项目中，一页只有6个商品，感觉查找功能不是很必要，不过假如在一些项目中，一页有很多商品，比如不是基于分页获取数据，而是一次性获取所有数据或者是利用瀑布流加载数据，这时候查找功能就显得很重要了。

查找功能的实现其实就是一个filter，我们设计一个简单的搜索功能：

```javascript
const setSearch = () => {
  // 回车搜索
  const searchInput = document.querySelector("#search-input");
  searchInput.addEventListener("keydown", (e) => {
    if (e.keyCode === 13) {
      search();
    }
  });
};

const search = () => {
  const searchInput = document.querySelector("#search-input");
  const keyword = searchInput.value;
  fetch("cart.json")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      goods = data.pages[curPage - 1]["items"].filter((good) =>
        good["name"].includes(keyword),
      );
      renderCartList();
    });
};
```

搜索框的设计

```html
<div class="search-bar">
  <input type="text" placeholder="Search" id="search-input" />
</div>
```

```css
.search-bar {
  height: 40px;
  display: flex;
  width: 100%;
  max-width: 400px;
  padding-left: 16px;

  input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background-color: var(--search-bg);
    border-radius: 4px;
    font-family: var(--body-font);
    font-size: 15px;
    font-weight: 500;

    &::placeholder {
      font-family: var(--body-font);
      color: var(--inactive-color);
      font-size: 15px;
      font-weight: 500;
    }
  }
}
```

这样我们就可以通过输入关键字来查找商品了。
