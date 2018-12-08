
> 一、准备工作

*Vue-cli脚手架安装*
准备 `webpack` / `node.js`
下面说说 准备 `vue-cli` 的安装
进入 `cmd` 在全局环境下 `npm install --global vue-cli`
安装好了还是在 `cmd` 情况下，`vue -V` 如果有版本号，就说明安装成功了！恭喜你小源
回到桌面，`git bash` 一下 `vue init webpack vue-music`
会让你判断作者/描述/要不要安装这些那些的东西 
安装`vue-cli`并不是唯一的方式，但是它可以帮助我们，搭建好基本的框架，帮助我们初始化了 `webpack`
OK，进度条跑完，我们在总的文件夹下 `npm run dev` 调出 `localhost8080`

*项目目录介绍及图标字体丶公共样式等资源准备*
`src/api`：放的是和后端请求相关的代码，比如 `Ajax` 和 `JSONP`
`src/common`：目录里面就是一些通用性的资源 字体啊图片啊样式啊
`src/components`：通用组件
`src/router`：路由相关的文件
`src/store`：存放 `vue` 相关的代码
`main.js` 是入口

![](https://i.imgur.com/XkE7AAG.png)

一定要在 `package.json` 里面加入 `"stylus":"^0.54.5"`  和 `"stylus-loader":"^2.1.1"`,

经过了一段离奇的报错，我也不知道怎么就走上了正轨，页面可以正常显示了

在 `build/webpack.base.conf.js` 里面搜索 `alias`，把下面的规则补全，就可以不用 `../` 了

> 二、骨架开发

使用 `vue-router` 实现组件间的动态切换
如果你想装很多依赖，那就先在 `package.json` 里面写入它的版本号，再 `npm i`
（试了一下，好像必须要 `npm install babel-runtime` 这样啊，有没有简洁的办法呢）

`babel-runtime` ： 对 `ES6` 的语法进行转义
`fastclick`： 消除移动端点击的 `300ms` 的延迟
`babel-polyfill`：对 `ES6` 的 `api` 的转译

-----------

**【写头部（带炸鸡图标的bar）】**

我们在 `m-header.vue` 里面把骨架和样式都写好
这个头部很简单的一个框架和样式）重点是右上角的一个 `<router-link> `

（`<router-link> `组件支持用户在具有路由功能的应用中 (点击) 导航。 通过 `to` 属性指定目标地址，默认渲染成带有正确链接的 `<a>` 标签，可以通过配置 `tag` 属性生成别的标签。另外，当目标路由成功激活时，链接元素自动设置一个表示激活的 `CSS` 类名。）

进入 `App.vue` ，倒入 `import MHeader from 'components/m-header/m-header'`

接着 `export default MHeader` 等

（使用 `export default` 命令，为模块指定默认输出，这样就不需要知道所要加载模块的变量名）

然后把 `<div id="app">替换部分</div>` 改成 `<div id="app"><m-header></m-header></div>`
激动人心的时刻到了！！ 页面上就会出现一只鸡仔！！


再按照上面的三步，把 `m-header.vue` 这个写好的文件展现在页面里哈哈

同理我们倒入了 `Player` 和 `Tab`
（呵呵呵哒失败了，不能手贱倒入）

下面开始顶部导航栏组件开发（就是动态组件切换啊！）所以重头戏就是 `router/index.js` 的配置

-----------

**【引入顶部导航栏】**

在 `App.vue` 里，直接引入了 `tab.vue` ，所以在页面上就成功展示了 顶部导航栏的四个部分
```
<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <tab></tab>
  </div>
</template>

<script type="text/ecmascript-6">

import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'

export default {
  components: {
    MHeader,
    Tab
  }
}
</script>
```

-----------


**【实现动态组件切换】**

按照上面的讨论（三步骤）
我们可以在 `router/index.js` 写成（仅以 `rank` 为例）
```
import Rank from 'components/recommend/recommend'

Vue.use(Router)
//注册一下router

export default new Router({
	routes: [
	  {
		path:'/rank',
		compoment: Rank
	  }
	]
})
```
非常神奇的是，我们需要在 `src` 下面专门建立一个 `router` 文件夹，而这个文件夹是专门存放组件切换的！目前为止就是这个导航栏的切换。（所以要是我还有别的需求，比如的 [推荐] 下面还有 [hiphop] [摇滚] [民族风]之类的怎么办呢？）

> 三、推荐页面

两个部分：
1、首页：轮播图和歌单列表
2、歌单详情页

数据来自 QQ音乐，现在要开始学怎么抓数据了！！幸福来得太突然！！

-----------

**【抓数据】**

我们要通过 `JSONP` 来拿到我们想要的数据
看到这个鬼东西就知道是 跨域 啊啊啊
它就是利用动态创建一个 `<script>` 标签，里面的 `src` 指向想要请求的服务端地址

下面开始在 `src/js/jsonp.js` 里面开始写了
写好了就用 `JSONP` 来真实查询我们的数据
获取数据时我们会封装一些方法，一般存放在 `src/api` 里
（ `recommend.js `是纯手写的）
首先把这个页面的 `Network` 里的 `JS` 里的 `p.fcg` 双击打开，弹出来的网址，舍弃问号及问号以后的内容

（插入一句： `api/config.js` 配置一些公共的参数）

调用了 `_getRecommend()` 这个方法，`_getRecommend()` 方法又调用了 `api/recommend.js`
`api/recommend.js` 里面当然是 `JSONP` 方法获取数据
`JSONP` 通过 `url` 拼接参数形成地址获取数据
所以在 `localhost8080` 我们可以在 `Network` 里的 `JS` 看到 `fcg` (也就是拿到的 `data`)
有了 `data`，就是一些 `DOM` 和交互上面的事情

-----------

**【轮播图】**

套路：有父组件 `div`，里面有一个可以滑动的列表

建立 `src/base/slider/slider.vue`

在 `components/recommand/recommand.vue` 里
`import silder`; `components slider` (注册一下); 最后写一个 `slider` 标签 
哈哈上面不就是写了新的 `vue` 文件之后的经典三步走吗

写一个 `data` 方法，在里面定义 `recommends` 为空数组
写一个 `_getRecommend` 方法
将 `_getRecommend` 方法里的 `recommends` 赋值给 `data` 方法
在 `<slider>` 里用 `v-for` 遍历轮播图的数据 `recommends`

回到 `slider.vue` 
`export default/props` 里面写上外部可以控制的属性：
(循环、自动轮播、间隔啊）

什么时候初始化 `better-scroll` 比较好呢？
没有初始化好（报错或不能滚动）是因为组件没有渲染好，或者高度没有写好
为了保证渲染时机是正确的，需要在 `slider.vue` 里用到 `mounted` 钩子
`mounted` 钩子里面有一个 `setTimeout` 保证 20ms 会刷新一次浏览器

下面我们需要用到 `better-scroll` 来实现 `slider`,看到这里肯定要 `npm install` 一下啦
非常神奇的是，我的 `better-scroll` 总是在报错

为了保证 `dom` 成功渲染，我们一般用 `setTimeout 20ms`（因为浏览器一般刷新间隔是17ms
这些初始化操作（比如说`_setSliderWidth()`、`_initDots()`、`_initSlider()`）都需要封装在 `methods` 方法里
简单来说，我们在 `method` 里详细的写下这些方法，再在 `setTimeout` 调用就行了 

下面这两个加上引用
```
<div class="slider" ref="slider">
  <div class="slider-group" ref="sliderGroup">
  </div>
</div>
```
像 `Vue` 这样的 `JavaScript` 框架的主要目的之一就是让开发人员不必去处理 `DOM`。在 `Vue` 中，可以通过在 `$refs` 对象上访问 `ref` 的名称来访问 `DOM` 元素。
我们也可以通过使用查询选择器来访问 `DOM` 元素来实现这样的效果，但是使用 `ref` 属性更简洁，而且这也是 `Vue` 中的方法。它也将更安全，因为你不会依赖于 `class` 和 `id` 。因此，几乎不会因为更改了 `HTML` 的标签或者 `CSS` 样式受到影响。

*开始写 `_setSliderWidth()`*
统计 `sliderGroup` 列表里有多少子元素；拿到父容器 `slider` 的宽度；每个元素的宽度都与 `slider` 的宽度相同，所以可以拿到 `sliderGroup` 的宽度；给 `child` 元素自动添加样式，`slider-item` 是下面已经写好的 `css` 样式，我们现在要把这个写好的样式加到 `child` 身上，所以怎么定义 “加” 这个动作很重要，`addClass` 方法在 `common/js/dom.js`。

*开始写 `common/js/dom.js`里面的 `hasClass` 和 `addClass`*

为了确保 `slot` 里面的值在我们调用 `mounted` 时是有的，我们需要在 `recommand.vue` 里加上 `v-if`。
`<div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">`
只有上面一句执行完了，下面的 `<slider>` 才会执行

在 `slider.vue` 里初始化 `slider`： 当调用了 `BScroll` 时，我们就把下面的配置都传进去。

*下面开始写 dots*（也就是图片上的小圆点）

图片只有五张，但是 `div` 有七个，是因为 `loop` 为 `ture` 时，左右会克隆两个 `dom` ,保证循环切换，也就是说，在初始化 `slider` 之前，就要初始化好 `dom`。

把 `_initDots()` 写在 `_initSlider()` 之前

在 `data` 里定义了 `dots` : 一个长度为 5 的空数组
在 `data` 里定义了 `currentPageIndex`，当前是第 0 页，当 `currentPageIndex === index` 时，处于 `active` 状态

 `<span class="dot" :class="{active: currentPageIndex === index }" v-for="(item,index) in dots"></span>`
注意绑定的 `class` 和 `v-for` 循环的方式

如何把滚动时的样式 和 `currentPageIndex` 结合起来？
其实 `better-scroll` 在滚动的时候，会派发一个事件，所以我们在 `_initSlider()` 里面绑定一个事件 `scrollEnd` ，当我们滚动完毕的时候, `currentPageIndex` 就为列表第一个（？？？

*开始写自动播放功能*
在 `mounted` 里面写一个判断，如果是 `props` 里的 `autoPlay`，就执行`_play()`
在 `methods` 里面写 `_play()` 方法
发现还是不能自动轮播
我们在 `methods` 里的` _initSlider()` 也写上 `autoPlay` 判断
万事OK

和 `mounted` 与 `methods` 平行的还有三个方法！！
`activated()`、`deactivated()`、`beforeDestroy()`
这三个方法在 `slider.vue` 里面都只出现了一次

呵呵以为这样就可以了吗？错错错！
改变窗口大小的时候，滚动起来长度就出现了 bug！！

*开始自适应窗口*
监听 `window` 的 `resize` 事件
在 `_setSliderWidth()` 里面添加标识符 `isResize`
如果有 `isResize`： `width += sliderWidth`
如果没有 `isResize`： `width += 2 * sliderWidth`

最后 宽度重新计算完之后要刷新 `slider` ：`this.slider.refresh()`

*开始优化*
1、如果在导航栏之间切换，回到轮播图的时候，会发现，又回到了第一张图片，其实这是没有必要的，因为整个 `dom` 重新渲染了啊。
解决方法：在 `App.vue` 里添加 `<keep-alive>`，缓存就会添加到内存中
```
<keep-alive>
    <router-view> </router-view>
</keep-alive>
```
2、销毁计时器
 `clearTimeout(this.timer)`

-----------

**【歌单数据接口分析】**
肯定也是去 QQ 音乐里抓的啊

网址是：`https://y.qq.com/portal/playlist.html`
控制台打开 `network`，看到歌单数据的 `jsonp`

惊喜不已对不对！就像获取 轮播图数据一样，我们现在也要抓歌单数据啦！

在 `api/recommend.js` 里 `export function getDiscList()`
  里面写的 `url` 是 `https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg`
   `data` 里写的是 `Query String Parameters` 里的数据
在 `recommend.vue` 的 `methods` 里添加 `_getDiscList()` 方法
在 `recommend.vue` 的 `created()` 里调用 `_getDiscList()`

然后发现 `recommend.js` 里的 `url` 不能按照原来的套路写了！！！
写上面的 `url` 被服务端（500）了啊，`host` 和 `referer` 给了我们限制，前端又不能修改 `request header`，只能通过 后端代理 的方式解决这个问题

安装 `axios` 库
在 `build/dev-server.js` 里定义一个路由，它的作用是通过一个真实的 qq 服务器地址，通过 `axios` 发送一个 `http` 请求
在这个请求里修改 `headers`（伪装成 qq 音乐里的 `host` 和 `referer`）,同时把浏览器端发来的请求参数（`recommend.js`里的 `const data` 里的数据）
原封不动的传给 qq 的服务端，qq 服务端收到请求后会给我们正确的响应

`app.use('/api', apiRoutes)`之后

我们离开后台（`build/dev-server.js`），前往前端（`api/recommand.js`）
修改 `url`:  `const url = '/api/getDiscList'`
改了以后，我们就不是 `jsonp` 了，需要 `import` 和 `return`（所以现在是什么）

**【开发歌单组件】**
在 `recommend.vue` 的 `data` 里定义一下 `discList`
在 `_getDiscList()` 里面给 `discList` 赋值
完了就去写 `<ul>`

*突发事件：迁移 dev-server.js*
这个时候！！！我发现一个大大大bug！！

最新版本的 `vue-cli` 已经放弃 `dev-server.js` 而改在 `webpack.dev.conf.js` 了
所以要做一下迁移
迁移前：
![](https://i.imgur.com/rnypsj2.png)
迁移后：
![](https://i.imgur.com/gUIlTRx.png)

哈哈哈终于!!!出现了歌单列表！！老天待我不薄啊！！

复杂方法：用 `better-scroll` 实现滚动
因为 `better-scroll` 是父子层级，子级的第一个元素才会滚动，所以需要添加 `<div>`把榜单列表包进去，再在父级元素上引用一下，就可以滚动起来了
实际上不可能所有的滚动列表都行这种命令式代码

*抽象一个 scroll 组件，实现下半部分的滚动*

简单代码：仿造小程序里的 `scroll-vue` ，套一个 `dom` 就能被滚动（在`<slot>`里）
我们只有抽象一个 `scroll` 组件就行了
创建 `src/base/scroll.vue`
然后开始在里面写写写
你就会发现 `scroll.vue` 里的所有内容都是为了实现 `scroll` 而存在的，它们只干了这一件事
详情请参考改文件的注释（此处省略一万字）

*需要处理一个细节 4-11*

先获取的是横向滚动的数据，`dom` 已经被撑开，接着才获取的是竖向歌单列表的高度，这样很完美

但是如果我们先获取了 竖向的数据，接着 `dom` 才被撑开，此时向下滚动的时候是滚不到底部的，我们大约差了一个 `slider` 的高度，渲染的时候 `refresh` 的时机不对

实际情况是我并不清楚上下两个部分出现的先后顺序

（图片也是异步获取到的，是按照屏幕的尺寸决定的，在这之前我们还是不能知道高度的值）

所以就要去监听 `img@onload` 事件啊（`recommend.vue` 里）

一旦有一个图片触发 `load` ，我们就调用 `loadImage` 方法

当 `better-scroll` 调用 `refresh` 的时候就会拿到上面横着的高度

`better-scroll`根据 `refresh` 时 父元素和子元素之差做一个计算，所以实例化的时候一定要保证 `dom` 是渲染好的，如果有数据变化的场景一定要重新 `refresh` 一下！！！自己监听到了就自己变化一下

【懒加载 4-11】
第一次刷新的时候只有首屏的图片，滚动的时候才出现新的图片
呵呵呵呵呵 安装第三方的插件 `vue-lazyload` 
在 `main.js` 安装 引入 `use`

懒加载 把 `:src` 换成 `v-lazy`
`<img width="60" height="60" v-lazy="item.imgurl">`

在 `recommand.vue`
一旦有一个图片触发 `load` ，我们就调用 `loadImage` 方法：
`<img class="needsclick" @load="loadImage" :src="item.picUrl">`


此时点上面的 `slider` 点不动了。。。
`fastclick` 和 `better-scroll` 又又又又冲突了

在 `recommand.vue` 添加 `class="needsclick"`
 `<img class="needsclick" @load="loadImage" :src="item.picUrl">`
`fastclick` 发现 `img` 的 `dom` 上有 `needsclick`，就知道你需要点击事件，就不会去拦截你的点击事件，这样就不会阻止点击了

【小菊花 4-12】
哈哈哈我刚刚还在迷思，难道小菊花要用 `CSS` 动画画出来吗？？？
`base/loading/loading.vue` 里面有 `loading.gif`，引用一下就行了

接着要让小菊花转起来啊，还是回到`recommand.vue`个它一个容器
 `<div class="loading-container" v-show="!discList.length"> <loading></loading> </div>`
如果下面的列表还没有加载出来长度，就显示小菊花.gif

> 五、歌手列表

构造也非常简单，左边是歌手，右边是字母，（联系人列表布局非常重要，难点难点啊）

【抓取歌手数据】
创建 `src/api/singer.js` 和 `base/components/singer/singer.vue`
通过上面两个文件抓取的数据并不符合我们所需要的数据结构

5-3 写了 js/singer.js 抓取了歌手的数据，但还是没有按照顺序生成
